import { IProcessor } from 'typeorm-fixtures-cli/dist';
import { Post } from '../../../posts/entities/post.entity';

export default class PostProcessor implements IProcessor<Post> {
  private defaultImagePath = '/uploads/default/default-post-image.jpg';

  preProcess(name: string, object: any): any {
    try {
      if (!object) {
        throw new Error('Object is undefined');
      }

      // Always use the default image for now
      object.imageUrls = [this.defaultImagePath];
      object.thumbnailUrl = this.defaultImagePath;
      
      return object;
    } catch (error) {
      console.error('Error in PostProcessor:', error);
      return {
        ...object,
        thumbnailUrl: this.defaultImagePath,
        imageUrls: [this.defaultImagePath]
      };
    }
  }

  postProcess(name: string, object: Post): void {
    // Ensure the object has valid image data
    if (!object.thumbnailUrl || !Array.isArray(object.imageUrls)) {
      object.thumbnailUrl = this.defaultImagePath;
      object.imageUrls = [this.defaultImagePath];
    }
  }
}

