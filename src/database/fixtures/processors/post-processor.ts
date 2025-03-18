import { IProcessor } from 'typeorm-fixtures-cli/dist';
import { Post } from '../../../posts/entities/post.entity';
import { PostType } from '../../../posts/enums/post-type.enum';
import { PostDifficulty } from '../../../posts/enums/post-difficulty.enum';
import { PostStatus } from '../../../posts/enums/post-status.enum';
import { faker } from '@faker-js/faker';

export default class PostProcessor implements IProcessor<Post> {
  private defaultImagePath = '/uploads/default/default-post.jpg';

  preProcess(name: string, object: any): any {
    // Generate random post data based on entities used in controller/service
    const postTypes = Object.values(PostType);
    const postDifficulties = Object.values(PostDifficulty);
    const postStatuses = Object.values(PostStatus);
    
    // Create a basic post object matching your service expectations
    const post = {
      title: faker.commerce.productName(),
      description: faker.lorem.paragraphs(3),
      estimatedTime: `${faker.number.int({ min: 5, max: 120 })} minutes`,
      viewCount: faker.number.int({ min: 0, max: 1000 }),
      completionCount: faker.number.int({ min: 0, max: 200 }),
      likeCount: faker.number.int({ min: 0, max: 500 }),
      postType: postTypes[Math.floor(Math.random() * postTypes.length)],
      postDifficulty: postDifficulties[Math.floor(Math.random() * postDifficulties.length)],
      postStatus: postStatuses[Math.floor(Math.random() * postStatuses.length)],
      thumbnailUrl: this.defaultImagePath,
      imageUrls: [
        this.defaultImagePath,
        this.generateRandomImagePath(),
        this.generateRandomImagePath()
      ],
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      // The user reference will be handled by references in the fixture file
    };

    // Merge with any provided object properties
    return { ...post, ...(object || {}) };
  }

  postProcess(name: string, object: Post): void {
    if (!object) return;
    
    // Ensure the object has valid image data
    if (!object.thumbnailUrl) {
      object.thumbnailUrl = this.defaultImagePath;
    }
    
    if (!Array.isArray(object.imageUrls) || object.imageUrls.length === 0) {
      object.imageUrls = [this.defaultImagePath];
    }
    
    // Ensure these fields are never undefined, matching what's expected in the service
    if (!object.title) object.title = 'Untitled Post';
    if (!object.description) object.description = '';
    
    // Ensure enum fields have valid values that match your controller's expectations
    if (!object.postType || !Object.values(PostType).includes(object.postType)) {
      object.postType = PostType.IMAGE;
    }
    
    if (!object.postDifficulty || !Object.values(PostDifficulty).includes(object.postDifficulty)) {
      object.postDifficulty = PostDifficulty.EASY;
    }
    
    if (!object.postStatus || !Object.values(PostStatus).includes(object.postStatus)) {
      object.postStatus = PostStatus.PUBLISH; // Default to published
    }
    
    // Ensure counter fields are valid numbers
    if (typeof object.viewCount !== 'number' || isNaN(object.viewCount)) {
      object.viewCount = 0;
    }
    
    if (typeof object.completionCount !== 'number' || isNaN(object.completionCount)) {
      object.completionCount = 0;
    }
    
    if (typeof object.likeCount !== 'number' || isNaN(object.likeCount)) {
      object.likeCount = 0;
    }
    
    // Ensure dates are proper Date objects
    if (!object.createdAt) {
      object.createdAt = new Date();
    }
    
    if (!object.updatedAt) {
      object.updatedAt = new Date();
    }
  }

  // Helper method to generate random image paths that match your file upload patterns
  private generateRandomImagePath(): string {
    const id = faker.string.uuid();
    return `/uploads/posts/${id.substring(0, 8)}.jpg`;
  }
}