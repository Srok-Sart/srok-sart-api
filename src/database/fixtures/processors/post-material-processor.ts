import { IProcessor } from 'typeorm-fixtures-cli/dist';
import { PostMaterial } from '../../../posts/entities/post-material.entity';
import { Post } from '../../../posts/entities/post.entity';
import { Material } from '../../../materials/entities/material.entity';
import { DataSource } from 'typeorm';

export default class PostMaterialProcessor implements IProcessor<PostMaterial> {
  private dataSource: DataSource;
  private maxRetries = 10; // Limit retries to avoid infinite loops

  // The fixture loader will inject the DataSource
  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  async preProcess(name: string, object: any, retryCount = 0): Promise<any> {
    if (!object) {
      object = {};
    }
    
    // Always ensure quantity has a default value
    object.quantity = object.quantity || Math.floor(Math.random() * 10) + 1;
    
    try {
      // Use repository from DataSource instead of getRepository
      const postRepository = this.dataSource.getRepository(Post);
      const materialRepository = this.dataSource.getRepository(Material);
      
      const posts = await postRepository.find();
      const materials = await materialRepository.find();
      
      if (!posts || posts.length === 0 || !materials || materials.length === 0) {
        console.warn('No posts or materials found in database. Cannot create post materials.');
        // Return a valid object with default values instead of null
        return {
          quantity: 1,
          totalWeight: 1.0
        };
      }
      
      // Randomly select a post and material
      const randomPost = posts[Math.floor(Math.random() * posts.length)];
      const randomMaterial = materials[Math.floor(Math.random() * materials.length)];

      if (!randomPost || !randomMaterial) {
        console.warn('Failed to get valid post or material. Using default values.');
        return {
          quantity: object.quantity,
          totalWeight: object.quantity
        };
      }
      
      // Check if combination already exists to prevent duplicates
      const existingPostMaterial = await this.dataSource.getRepository(PostMaterial).findOne({
        where: {
          post: { id: randomPost.id },
          material: { id: randomMaterial.id }
        }
      });
      
      if (existingPostMaterial && retryCount < this.maxRetries) {
        // Try to find another combination
        console.log(`Post material combination already exists, trying another one... (attempt ${retryCount + 1})`);
        return this.preProcess(name, object, retryCount + 1);
      } else if (retryCount >= this.maxRetries) {
        console.warn(`Reached maximum retry attempts (${this.maxRetries}). Using existing combination.`);
      }
      
      // Set relationships with explicit IDs
      object.post = { id: randomPost.id };
      object.material = { id: randomMaterial.id };
      
      // Get the material's weight per unit for calculation
      const weightPerUnit = randomMaterial.weightPerUnit;
      
      if (typeof weightPerUnit === 'number' && !isNaN(weightPerUnit)) {
        object.totalWeight = Number((object.quantity * weightPerUnit).toFixed(2));
      } else {
        object.totalWeight = object.quantity;
      }
      
      console.log(`Created PostMaterial: Post ID ${randomPost.id}, Material ID ${randomMaterial.id}, Quantity ${object.quantity}`);
      
    } catch (error) {
      console.error('Error in PostMaterialProcessor.preProcess:', error);
      // Even with an error, ensure we have valid defaults
      object.quantity = object.quantity || 1;
      object.totalWeight = object.quantity;
    }
    
    return object;
  }

  postProcess(name: string, object: PostMaterial): void {
    if (!object) return;
    
    // Double-check quantity is properly set
    if (object.quantity === null || object.quantity === undefined) {
      object.quantity = 1;
    }
    
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
          object.totalWeight = Number((object.quantity * weightPerUnit).toFixed(2)); // Format to 2 decimal places
        } else {
          object.totalWeight = object.quantity;
        }
      } catch (error) {
        console.error('Error calculating total weight:', error);
        object.totalWeight = object.quantity;
      }
    } else {
      // If material or weightPerUnit is undefined, set a default value
      object.totalWeight = object.quantity;
    }

    // Final safety check for required fields
    if (object.quantity === undefined || object.quantity === null) {
      object.quantity = 1;
    }
    if (object.totalWeight === undefined || object.totalWeight === null) {
      object.totalWeight = object.quantity;
    }
  }
}