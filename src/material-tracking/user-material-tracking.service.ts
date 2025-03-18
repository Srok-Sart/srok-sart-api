import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostCompletion } from '../posts/entities/post-completion.entity';
import { User } from '../users/entities/user.entity';
import {
  MaterialSavedSummary,
  MaterialTrackingService,
} from './material-tracking.service';

@Injectable()
export class UserMaterialTrackingService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(PostCompletion)
    private postCompletionRepository: Repository<PostCompletion>,
    private readonly materialTrackingService: MaterialTrackingService,
  ) {}

  /**
   * Gets material savings summary for the currently logged-in user
   * @param userId - The ID of the currently logged-in user
   * @returns MaterialSavedSummary for the user
   */
  async getCurrentUserMaterialSummary(
    userId: number,
  ): Promise<MaterialSavedSummary> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return this.materialTrackingService.getMaterialsSavedByUser(userId);
  }

  /**
   * Gets detailed completion history for the current user
   * @param userId - The ID of the currently logged-in user
   * @returns List of post completions with material details
   */
  async getCurrentUserCompletionHistory(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Find all completed posts by the user with their completion timestamps
    const completions = await this.postCompletionRepository.find({
      where: { user: { id: userId } },
      relations: ['post', 'post.postMaterials', 'post.postMaterials.material'],
      order: { completedAt: 'DESC' },
    });

    return completions.map((completion) => ({
      completionId: completion.id,
      completedAt: completion.completedAt,
      post: {
        id: completion.post.id,
        title: completion.post.title,
        materials: completion.post.postMaterials.map((pm) => ({
          id: pm.material.id,
          name: pm.material.name,
          quantity: pm.quantity,
          unit: pm.material.unit,
          category: pm.material.category,
          environmentalImpact:
            (pm.material.environmentalImpact || 0) * pm.quantity,
        })),
      },
    }));
  }

  /**
   * Gets user progress statistics
   * @param userId - The ID of the currently logged-in user
   * @returns User progress statistics
   */
  async getCurrentUserProgress(userId: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get user's material summary
    const materialSummary = await this.getCurrentUserMaterialSummary(userId);

    // Get global material summary for comparison
    const globalSummary =
      await this.materialTrackingService.getTotalMaterialsSaved();

    // Get user's completion count by month
    const completionsByMonth = await this.getCompletionsByMonth(userId);

    return {
      userStats: {
        totalPostsCompleted: materialSummary.totalPostsCompleted,
        totalSavedWeight: materialSummary.totalSavedWeight,
        totalSavedVolume: materialSummary.totalSavedVolume,
        totalSavedItems: materialSummary.totalSavedItems,
        totalEnvironmentalImpact: materialSummary.totalEnvironmentalImpact,
      },
      globalComparison: {
        postsCompletedPercentage:
          globalSummary.totalPostsCompleted > 0
            ? (materialSummary.totalPostsCompleted /
                globalSummary.totalPostsCompleted) *
              100
            : 0,
        environmentalImpactPercentage:
          globalSummary.totalEnvironmentalImpact > 0
            ? (materialSummary.totalEnvironmentalImpact /
                globalSummary.totalEnvironmentalImpact) *
              100
            : 0,
      },
      completionTrend: completionsByMonth,
    };
  }

  /**
   * Gets the number of completions by month for the current user
   * @param userId - The ID of the currently logged-in user
   * @returns Monthly completion counts
   */
  private async getCompletionsByMonth(userId: number) {
    // Get all completions for the user
    const completions = await this.postCompletionRepository.find({
      where: { user: { id: userId } },
      order: { completedAt: 'ASC' },
    });

    // Group completions by month
    const monthlyCompletions = completions.reduce((acc, completion) => {
      const date = completion.completedAt;
      const monthYear =
        date != null
          ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          : null;

      if (!acc[monthYear]) {
        acc[monthYear] = {
          month: monthYear,
          count: 0,
        };
      }

      acc[monthYear].count++;
      return acc;
    }, {});

    // Convert to array and sort by month
    return Object.values(monthlyCompletions).sort((a: any, b: any) =>
      a.month.localeCompare(b.month),
    );
  }

  /**
   * Gets the top materials saved by the current user
   * @param userId - The ID of the currently logged-in user
   * @param limit - Maximum number of materials to return
   * @returns Top materials by environmental impact
   */
  async getCurrentUserTopMaterials(userId: number, limit: number = 5) {
    const materialSummary = await this.getCurrentUserMaterialSummary(userId);

    // Return top materials by environmental impact
    return materialSummary.materialBreakdown
      .slice(0, limit)
      .map((material) => ({
        id: material.id,
        name: material.name,
        category: material.category,
        savedCount: material.savedCount,
        displayUnit: material.displayUnit,
        standardAmount: material.standardAmount,
        environmentalImpact: material.totalEnvironmentalImpact,
      }));
  }
}
