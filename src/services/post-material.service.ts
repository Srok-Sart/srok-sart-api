import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from 'src/materials/entities/material.entity';
import { PostMaterial } from 'src/posts/entities/post-material.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Repository } from 'typeorm';

interface MaterialDto {
  materialId: number;
  quantityRequired?: number;
}

@Injectable()
export class PostMaterialsService {
  constructor(
    @InjectRepository(PostMaterial)
    private postMaterialRepository: Repository<PostMaterial>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}

  async addMaterialsToPost(
    postId: number,
    materialData: MaterialDto[],
  ): Promise<PostMaterial[]> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Remove existing post materials
    await this.postMaterialRepository.delete({ post: { id: postId } });

    const savedPostMaterials = [];

    for (const data of materialData) {
      const savedMaterial = await this.addSingleMaterialToPost(
        postId,
        data.materialId,
        data.quantityRequired,
      );
      savedPostMaterials.push(savedMaterial);
    }

    return savedPostMaterials;
  }

  async addSingleMaterialToPost(
    postId: number,
    materialId: number,
    quantity: number = 1,
  ): Promise<PostMaterial> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const material = await this.materialRepository.findOne({
      where: { id: materialId },
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${materialId} not found`);
    }

    // Calculate total weight
    const totalWeight = Number((material.weightPerUnit * quantity).toFixed(2));

    const postMaterial = this.postMaterialRepository.create({
      post: { id: postId },
      material: { id: material.id },
      quantity,
      totalWeight,
    });

    return this.postMaterialRepository.save(postMaterial);
  }

  async getMaterialsByPost(postId: number): Promise<PostMaterial[]> {
    return this.postMaterialRepository.find({
      where: { post: { id: postId } },
      relations: ['material'],
      select: {
        id: true,
        quantity: true,
        totalWeight: true,
        material: {
          id: true,
          name: true,
          weightPerUnit: true,
          category: true,
          unit: true,
        },
      },
    });
  }

  async updatePostMaterials(
    postId: number,
    materialData: MaterialDto[],
  ): Promise<PostMaterial[]> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Get existing post materials
    const existingPostMaterials = await this.postMaterialRepository.find({
      where: { post: { id: postId } },
      relations: ['material'],
    });

    // Create a map for quick lookups by material ID
    const existingMaterialMap = new Map(
      existingPostMaterials.map((pm) => [pm.material.id, pm]),
    );

    const updatedPostMaterials = [];
    const processedMaterialIds = new Set();

    // Process each material in the update data
    for (const material of materialData) {
      processedMaterialIds.add(material.materialId);

      // Check if this material already exists for the post
      const existingPostMaterial = existingMaterialMap.get(material.materialId);

      if (existingPostMaterial) {
        // Update existing material
        const updatedMaterial = await this.updateSinglePostMaterial(
          existingPostMaterial.id,
          material.materialId,
          material.quantityRequired ?? existingPostMaterial.quantity,
        );
        updatedPostMaterials.push(updatedMaterial);
      } else {
        // Add new material
        const newMaterial = await this.addSingleMaterialToPost(
          postId,
          material.materialId,
          material.quantityRequired ?? 1,
        );
        updatedPostMaterials.push(newMaterial);
      }
    }

    // Remove materials that aren't in the update list if replace mode is on

    for (const existingMaterial of existingPostMaterials) {
      if (!processedMaterialIds.has(existingMaterial.material.id)) {
        await this.postMaterialRepository.remove(existingMaterial);
      }
    }

    return updatedPostMaterials;
  }

  async updateSinglePostMaterial(
    postMaterialId: number,
    materialId?: number,
    quantity?: number,
  ): Promise<PostMaterial> {
    const postMaterial = await this.postMaterialRepository.findOne({
      where: { id: postMaterialId },
      relations: ['material'],
    });

    if (!postMaterial) {
      throw new NotFoundException(
        `PostMaterial with ID ${postMaterialId} not found`,
      );
    }

    // Only update material if materialId is provided and different
    if (materialId && materialId !== postMaterial.material.id) {
      const newMaterial = await this.materialRepository.findOne({
        where: { id: materialId },
      });

      if (!newMaterial) {
        throw new NotFoundException(`Material with ID ${materialId} not found`);
      }

      postMaterial.material = newMaterial;
    }

    // Update quantity if provided
    if (quantity !== undefined) {
      postMaterial.quantity = quantity;
    }

    // Recalculate total weight
    postMaterial.totalWeight = Number(
      (postMaterial.material.weightPerUnit * postMaterial.quantity).toFixed(2),
    );

    return this.postMaterialRepository.save(postMaterial);
  }

  async removePostMaterial(postMaterialId: number): Promise<void> {
    const postMaterial = await this.postMaterialRepository.findOne({
      where: { id: postMaterialId },
    });

    if (!postMaterial) {
      throw new NotFoundException(
        `PostMaterial with ID ${postMaterialId} not found`,
      );
    }

    await this.postMaterialRepository.remove(postMaterial);
  }

  async removePostMaterials(postId: number): Promise<void> {
    await this.postMaterialRepository.delete({ post: { id: postId } });
  }
}
