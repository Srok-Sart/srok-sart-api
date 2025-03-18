import { IProcessor } from 'typeorm-fixtures-cli/dist';
import { PostMaterial } from '../../../posts/entities/post-material.entity';

export default class PostMaterialProcessor implements IProcessor<PostMaterial> {
  preProcess(name: string, object: any): any {
    if (!object) {
      return {
        quantity: 1,
        totalWeight: 1.0
      };
    }
    
    // Set a random quantity between 1 and 10
    object.quantity = object.quantity || Math.floor(Math.random() * 10) + 1;
    object.totalWeight = object.totalWeight || 1.0; // Default value
    
    return object;
  }

  postProcess(name: string, object: PostMaterial): void {
    if (!object) return;
    
    // Check if material exists and has weightPerUnit property
    if (object.material && object.material.weightPerUnit !== undefined && object.material.weightPerUnit !== null) {
      try {
        // Convert to string only if not already a string or number
        const weightValue = typeof object.material.weightPerUnit === 'object' 
          ? JSON.stringify(object.material.weightPerUnit) 
          : object.material.weightPerUnit;
          
        const weightPerUnit = parseFloat(String(weightValue));
        
        // Only calculate if we successfully parsed a number
        if (!isNaN(weightPerUnit)) {
          const quantity = object.quantity || 1;
          object.totalWeight = quantity * weightPerUnit;
        } else {
          object.totalWeight = object.quantity || 1; // Fallback
        }
      } catch (error) {
        console.error('Error calculating total weight:', error);
        object.totalWeight = object.quantity || 1; // Fallback
      }
    } else {
      // If material or weightPerUnit is undefined, set a default value
      object.totalWeight = object.quantity || 1;
    }
  }
}