import { IProcessor } from 'typeorm-fixtures-cli/dist';
import { PostMaterial } from '../../../posts/entities/post-material.entity';

export default class PostMaterialProcessor implements IProcessor<PostMaterial> {
  preProcess(name: string, object: any): any {
    // Set a random quantity between 1 and 10
    object.quantity = Math.floor(Math.random() * 10) + 1;
    
    return object;
  }

  postProcess(name: string, object: PostMaterial): void {
    // Calculate total weight based on quantity and material weight
    if (object.material && object.material.weightPerUnit) {
      object.totalWeight = object.quantity * object.material.weightPerUnit;
    }
  }
} 