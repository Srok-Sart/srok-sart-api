import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostMaterialsService } from 'src/services/post-material.service';
import { In, Repository } from 'typeorm';
import { Material } from '../materials/entities/material.entity';
import { User } from '../users/entities/user.entity';
import { PostCompletion } from './entities/post-completion.entity';
import { PostMaterial } from './entities/post-material.entity';
import { Post } from './entities/post.entity';

export enum MaterialUnit {
  KG = 'KG',
  G = 'G',
  L = 'L',
  ML = 'ML',
  PIECE = 'PIECE',
  PACK = 'PACK',
  BOTTLE = 'BOTTLE',
  SPOON = 'SPOON',
}

export interface MaterialBreakdownItem {
  id: number;
  name: string;
  amount: number;
  unit: MaterialUnit;
  category: string;
  environmentalImpact: number;
  savedCount: number;
}

export interface MaterialSavedSummary {
  totalWeight: number;
  totalMaterialCount: number;
  totalPostsCompleted: number;
  materialBreakdown: MaterialBreakdownItem[];
}

@Injectable()
export class MaterialTrackingService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(PostCompletion)
    private postCompletionRepository: Repository<PostCompletion>,
    @InjectRepository(PostMaterial)
    private postMaterialRepository: Repository<PostMaterial>,
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
    private readonly postMaterialsService: PostMaterialsService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async markPostAsCompleted(postId: number, userId: number): Promise<Post> {
    // Find the post with all its materials and their details
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['postMaterials', 'postMaterials.material'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if the user has already completed this post
    const existingCompletion = await this.postCompletionRepository.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });

    if (!existingCompletion) {
      // Create a new completion record
      const completion = this.postCompletionRepository.create({
        post,
        user,
        completedAt: new Date(),
      });
      await this.postCompletionRepository.save(completion);

      // Increment the completion count on the post
      await this.postRepository.increment({ id: postId }, 'completionCount', 1);
    }

    // Return the updated post with the latest completion count
    return await this.postRepository.findOne({
      where: { id: postId },
      relations: ['postMaterials', 'postMaterials.material'],
    });
  }

  async getMaterialsSavedByUser(userId: number): Promise<MaterialSavedSummary> {
    // Find all completed posts by the user with their completion timestamps
    const completions = await this.postCompletionRepository.find({
      where: { user: { id: userId } },
      relations: ['post'],
      order: { completedAt: 'DESC' },
    });

    // Get all the post IDs from completions
    const postIds = completions.map((completion) => completion.post.id);

    if (postIds.length === 0) {
      return {
        totalWeight: 0,
        totalMaterialCount: 0,
        totalPostsCompleted: 0,
        materialBreakdown: [],
      };
    }

    // Get all post materials for these posts in one query to avoid N+1 problem
    const postMaterials = await this.postMaterialRepository.find({
      where: { post: { id: In(postIds) } },
      relations: ['material', 'post'],
    });

    // Group materials by post
    const materialsByPost = postMaterials.reduce(
      (acc, pm) => {
        if (!acc[pm.post.id]) {
          acc[pm.post.id] = [];
        }
        acc[pm.post.id].push(pm);
        return acc;
      },
      {} as Record<number, PostMaterial[]>,
    );

    // Attach materials to each completion
    const completionsWithMaterials = completions.map((completion) => ({
      ...completion,
      post: {
        ...completion.post,
        postMaterials: materialsByPost[completion.post.id] || [],
      },
    }));

    // Calculate the total weight of materials saved
    let totalWeight = 0;
    let totalMaterialCount = 0;
    const materialMap = new Map<number, MaterialBreakdownItem>();

    for (const completion of completionsWithMaterials) {
      if (completion.post?.postMaterials) {
        for (const postMaterial of completion.post.postMaterials) {
          const material = postMaterial.material;
          const quantity = postMaterial.quantity || 0;

          totalMaterialCount += quantity;

          const weightSaved = this.calculateWeight(
            material.weightPerUnit?.toString() || '0',
            quantity,
          );

          totalWeight += weightSaved;

          // Update the material breakdown
          if (materialMap.has(material.id)) {
            const existingMaterial = materialMap.get(material.id)!;
            existingMaterial.amount += weightSaved;
            existingMaterial.savedCount += quantity;
          } else {
            materialMap.set(material.id, {
              id: material.id,
              name: material.name,
              amount: weightSaved,
              unit: material.unit as MaterialUnit,
              category: material.category,
              environmentalImpact: material.environmentalImpact,
              savedCount: quantity,
            });
          }
        }
      }
    }

    return {
      totalWeight,
      totalMaterialCount,
      totalPostsCompleted: completions.length,
      materialBreakdown: Array.from(materialMap.values()),
    };
  }

  async getTotalMaterialsSaved(): Promise<MaterialSavedSummary> {
    // Get all completion records
    const completions = await this.postCompletionRepository.find({
      relations: ['post', 'user'],
    });

    if (completions.length === 0) {
      return {
        totalWeight: 0,
        totalMaterialCount: 0,
        totalPostsCompleted: 0,
        materialBreakdown: [],
      };
    }

    // Get all post IDs from completions
    const postIds = completions.map((completion) => completion.post.id);

    // Get all post materials for these posts in one efficient query
    const postMaterials = await this.postMaterialRepository.find({
      where: { post: { id: In(postIds) } },
      relations: ['material', 'post'],
    });

    // Group materials by post
    const materialsByPost = postMaterials.reduce(
      (acc, pm) => {
        if (!acc[pm.post.id]) {
          acc[pm.post.id] = [];
        }
        acc[pm.post.id].push(pm);
        return acc;
      },
      {} as Record<number, PostMaterial[]>,
    );

    // Count unique completions per post to avoid double-counting materials
    const uniqueCompletionsByPost = completions.reduce(
      (acc, completion) => {
        if (!acc[completion.post.id]) {
          acc[completion.post.id] = 0;
        }
        acc[completion.post.id]++;
        return acc;
      },
      {} as Record<number, number>,
    );

    // Calculate the total weight of materials saved
    let totalWeight = 0;
    let totalMaterialCount = 0;
    const materialMap = new Map<number, MaterialBreakdownItem>();

    // Process each unique post and its materials
    for (const postId of Object.keys(uniqueCompletionsByPost)) {
      const postIdNum = parseInt(postId);
      const completionCount = uniqueCompletionsByPost[postIdNum];
      const postMaterialsList = materialsByPost[postIdNum] || [];

      for (const postMaterial of postMaterialsList) {
        const material = postMaterial.material;
        const quantity = postMaterial.quantity || 0;

        // Multiply by completion count since each completion represents saving these materials
        const totalQuantity = quantity * completionCount;
        totalMaterialCount += totalQuantity;

        const weightSaved = this.calculateWeight(
          material.weightPerUnit?.toString() || '0',
          totalQuantity,
        );

        totalWeight += weightSaved;

        // Update the material breakdown
        if (materialMap.has(material.id)) {
          const existingMaterial = materialMap.get(material.id)!;
          existingMaterial.amount += weightSaved;
          existingMaterial.savedCount += totalQuantity;
        } else {
          materialMap.set(material.id, {
            id: material.id,
            name: material.name,
            amount: weightSaved,
            unit: material.unit as MaterialUnit,
            category: material.category,
            environmentalImpact: material.environmentalImpact,
            savedCount: totalQuantity,
          });
        }
      }
    }

    return {
      totalWeight,
      totalMaterialCount,
      totalPostsCompleted: completions.length,
      materialBreakdown: Array.from(materialMap.values()),
    };
  }

  private convertToKg(weight: number, unit: string): number {
    switch (unit) {
      case 'G':
        return weight / 1000;
      case 'ML':
        return weight / 1000; // Assuming 1ml = 1g
      case 'L':
        return weight; // Assuming 1L = 1kg
      default:
        return weight; // KG, PIECE, etc.
    }
  }

  private calculateWeight(weightPerUnit: string, quantity: number): number {
    // Convert weightPerUnit from string to number
    const weightValue = parseFloat(weightPerUnit);

    // Check for invalid values
    if (isNaN(weightValue) || isNaN(quantity)) {
      return 0;
    }

    // Basic calculation: weight per unit * quantity
    return weightValue * quantity;
  }
}
