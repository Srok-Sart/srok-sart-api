import { Controller, Get, Query, Req } from '@nestjs/common';
import {
  MaterialSavedSummary,
  MaterialTrackingService,
} from './material-tracking.service';
import { UserMaterialTrackingService } from './user-material-tracking.service';

@Controller('material-tracking')
export class MaterialTrackingController {
  constructor(
    private readonly materialTrackingService: MaterialTrackingService,
    private readonly userMaterialTrackingService: UserMaterialTrackingService,
  ) {}

  /**
   * Get total materials saved by all users
   * @returns Overall material saved summary
   */
  @Get('all')
  async getTotalMaterialsSaved(): Promise<MaterialSavedSummary> {
    return this.materialTrackingService.getTotalMaterialsSaved();
  }

  /**
   * Get comprehensive material summary for the currently logged-in user
   * @param req - Request object containing user information from JWT
   * @param includeHistory - Whether to include completion history (default: false)
   * @param includeTopMaterials - Whether to include top materials (default: true)
   * @param topMaterialsLimit - Maximum number of top materials to return (default: 5)
   * @returns Comprehensive user material summary
   */
  @Get('user')
  async getCurrentUserMaterialData(
    @Req() req,
    @Query('includeHistory') includeHistory: boolean = true,
    @Query('includeTopMaterials') includeTopMaterials: boolean = true,
    @Query('topMaterialsLimit') topMaterialsLimit: number = 5,
  ) {
    const userId = req.user.id;

    // Get basic material summary
    const summary =
      await this.userMaterialTrackingService.getCurrentUserMaterialSummary(
        userId,
      );

    // Get user progress stats
    const progress =
      await this.userMaterialTrackingService.getCurrentUserProgress(userId);

    // Build the response
    const response = {
      summary,
      progress,
    };

    // Conditionally include top materials
    if (includeTopMaterials) {
      response['topMaterials'] =
        await this.userMaterialTrackingService.getCurrentUserTopMaterials(
          userId,
          topMaterialsLimit,
        );
    }

    // Conditionally include completion history
    if (includeHistory) {
      response['completionHistory'] =
        await this.userMaterialTrackingService.getCurrentUserCompletionHistory(
          userId,
        );
    }

    return response;
  }
}
