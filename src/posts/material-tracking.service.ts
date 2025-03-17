import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MaterialCategory } from 'src/materials/enums/material-category.enum';
import { MaterialUnit } from 'src/materials/enums/material-unit.enum';
import { PostMaterialsService } from 'src/services/post-material.service';
import { In, Repository } from 'typeorm';
import { Material } from '../materials/entities/material.entity';
import { User } from '../users/entities/user.entity';
import { PostCompletion } from './entities/post-completion.entity';
import { PostMaterial } from './entities/post-material.entity';
import { Post } from './entities/post.entity';

export interface MaterialBreakdownItem {
  id: number;
  name: string;
  originalAmount: number; // Original amount in the material's unit
  standardAmount: number; // Standardized amount (kg for weight, L for volume)
  originalUnit: MaterialUnit;
  displayUnit: string; // Standardized unit for display ('kg', 'L', or original unit)
  category: MaterialCategory;
  environmentalImpact: number; // Environmental impact per unit
  totalEnvironmentalImpact: number; // Total environmental impact (impact * quantity)
  savedCount: number; // Number of items saved
}

export interface MaterialSavedSummary {
  totalSavedWeight: number; // Total weight in kg
  totalSavedVolume: number; // Total volume in L
  totalSavedItems: number; // Total count of items that aren't weight or volume
  totalMaterialCount: number; // Total count of all materials
  totalPostsCompleted: number;
  totalEnvironmentalImpact: number;
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
      return this.getEmptySummary();
    }

    // Get all post materials for these posts in one query
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

    return this.calculateSummary(completions, materialsByPost);
  }

  async getTotalMaterialsSaved(): Promise<MaterialSavedSummary> {
    // Get all completion records
    const completions = await this.postCompletionRepository.find({
      relations: ['post', 'user'],
    });

    if (completions.length === 0) {
      return this.getEmptySummary();
    }

    // Get all post IDs from completions
    const postIds = [
      ...new Set(completions.map((completion) => completion.post.id)),
    ];

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

    // Group completions by post to count how many times each post was completed
    const completionsByPost = completions.reduce(
      (acc, completion) => {
        if (!acc[completion.post.id]) {
          acc[completion.post.id] = [];
        }
        acc[completion.post.id].push(completion);
        return acc;
      },
      {} as Record<number, PostCompletion[]>,
    );

    // Create a modified completions array that accounts for multiple completions per post
    const processedCompletions = [];
    for (const [postId, postCompletions] of Object.entries(completionsByPost)) {
      const completionCount = postCompletions.length;
      processedCompletions.push({
        post: { id: parseInt(postId) },
        completionCount,
      });
    }

    return this.calculateSummary(processedCompletions, materialsByPost, true);
  }

  private getEmptySummary(): MaterialSavedSummary {
    return {
      totalSavedWeight: 0,
      totalSavedVolume: 0,
      totalSavedItems: 0,
      totalMaterialCount: 0,
      totalPostsCompleted: 0,
      totalEnvironmentalImpact: 0,
      materialBreakdown: [],
    };
  }

  private calculateSummary(
    completions: any[],
    materialsByPost: Record<number, PostMaterial[]>,
    isTotalSummary = false,
  ): MaterialSavedSummary {
    let totalSavedWeight = 0;
    let totalSavedVolume = 0;
    let totalSavedItems = 0;
    let totalMaterialCount = 0;
    let totalEnvironmentalImpact = 0;
    const materialMap = new Map<number, MaterialBreakdownItem>();

    for (const completion of completions) {
      const postId = completion.post.id;
      const completionCount = isTotalSummary ? completion.completionCount : 1;
      const postMaterialsList = materialsByPost[postId] || [];

      for (const postMaterial of postMaterialsList) {
        const material = postMaterial.material;
        const quantity = (postMaterial.quantity || 0) * completionCount;

        if (quantity <= 0) continue;

        // Add quantity to totalSavedItems directly regardless of unit type
        totalSavedItems += quantity;
        
        totalMaterialCount += quantity;

        const weightPerUnit = parseFloat(
          material.weightPerUnit?.toString() || '0',
        );
        const originalAmount = weightPerUnit * quantity;
        const environmentalImpactValue =
          (material.environmentalImpact || 0) * quantity;
        totalEnvironmentalImpact += environmentalImpactValue;

        // Standardize measurements
        const { standardAmount, displayUnit, isWeight, isVolume } =
          this.standardizeMeasurement(originalAmount, material.unit);

        // Update totals based on unit type
        if (isWeight) {
          totalSavedWeight += standardAmount;
        } else if (isVolume) {
          totalSavedVolume += standardAmount;
        }

        // Update material breakdown
        if (materialMap.has(material.id)) {
          const existingMaterial = materialMap.get(material.id)!;
          existingMaterial.originalAmount += originalAmount;
          existingMaterial.standardAmount += standardAmount;
          existingMaterial.savedCount += quantity;
          existingMaterial.totalEnvironmentalImpact += environmentalImpactValue;
        } else {
          materialMap.set(material.id, {
            id: material.id,
            name: material.name,
            originalAmount,
            standardAmount,
            originalUnit: material.unit,
            displayUnit,
            category: material.category,
            environmentalImpact: material.environmentalImpact || 0,
            totalEnvironmentalImpact: environmentalImpactValue,
            savedCount: quantity,
          });
        }
      }
    }

    // Round values to 2 decimal places for cleaner display
    totalSavedWeight = parseFloat(totalSavedWeight.toFixed(2));
    totalSavedVolume = parseFloat(totalSavedVolume.toFixed(2));
    totalEnvironmentalImpact = parseFloat(totalEnvironmentalImpact.toFixed(2));

    // Sort materials by environmental impact
    const sortedMaterials = Array.from(materialMap.values())
      .map((item) => ({
        ...item,
        standardAmount: parseFloat(item.standardAmount.toFixed(2)),
        totalEnvironmentalImpact: parseFloat(
          item.totalEnvironmentalImpact.toFixed(2),
        ),
      }))
      .sort((a, b) => b.totalEnvironmentalImpact - a.totalEnvironmentalImpact);

    return {
      totalSavedWeight,
      totalSavedVolume,
      totalSavedItems,
      totalMaterialCount,
      totalPostsCompleted: isTotalSummary
        ? completions.reduce((sum, c) => sum + c.completionCount, 0)
        : completions.length,
      totalEnvironmentalImpact,
      materialBreakdown: sortedMaterials,
    };
  }

  private standardizeMeasurement(
    amount: number,
    unit: MaterialUnit,
  ): {
    standardAmount: number;
    displayUnit: string;
    isWeight: boolean;
    isVolume: boolean;
  } {
    let standardAmount = amount;
    let displayUnit = unit;
    let isWeight = false;
    let isVolume = false;

    switch (unit) {
      // Weight units
      case MaterialUnit.KG:
        standardAmount = amount;
        displayUnit = MaterialUnit.KG;
        isWeight = true;
        break;
      case MaterialUnit.G:
        standardAmount = amount / 1000;
        displayUnit = MaterialUnit.KG;
        isWeight = true;
        break;

      // Volume units
      case MaterialUnit.L:
        standardAmount = amount;
        displayUnit = MaterialUnit.L;
        isVolume = true;
        break;
      case MaterialUnit.ML:
        standardAmount = amount / 1000;
        displayUnit = MaterialUnit.L;
        isVolume = true;
        break;

      // Count units
      default:
        displayUnit = unit;
        break;
    }

    return {
      standardAmount,
      displayUnit,
      isWeight,
      isVolume,
    };
  }
}
