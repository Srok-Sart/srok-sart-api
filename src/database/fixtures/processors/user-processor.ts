import { IProcessor } from 'typeorm-fixtures-cli/dist';
import { User } from '../../../users/entities/user.entity';

export default class UserProcessor implements IProcessor<User> {
  preProcess(name: string, object: any): any {
    // Create a fresh object if input is undefined or null
    if (!object) {
      object = {};
    }
    
    // Ensure all required fields exist with valid string values
    if (!object.username || typeof object.username !== 'string') {
      object.username = `user_${Date.now()}`;
    }
    
    if (!object.email || typeof object.email !== 'string') {
      object.email = `${object.username}@example.com`;
    }
    
    if (!object.password || typeof object.password !== 'string') {
      object.password = 'password123';
    }
    
    // Set default values for optional fields if missing or not strings
    object.firstName = (object.firstName && typeof object.firstName === 'string') ? object.firstName : '';
    object.lastName = (object.lastName && typeof object.lastName === 'string') ? object.lastName : '';
    object.bio = (object.bio && typeof object.bio === 'string') ? object.bio : '';
    object.profileImageUrl = (object.profileImageUrl && typeof object.profileImageUrl === 'string') 
      ? object.profileImageUrl 
      : 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/icons/person-fill.svg';
    
    // Ensure role is a valid string
    object.role = (object.role && typeof object.role === 'string' && ['ADMIN', 'USER'].includes(object.role)) 
      ? object.role 
      : 'USER';
    
    return object;
  }

  postProcess(name: string, object: User): void {
    if (!object) return;
    
    // Additional safety checks for required fields
    if (!object.username || typeof object.username !== 'string') {
      object.username = `user_${Date.now()}`;
    }
    
    if (!object.email || typeof object.email !== 'string') {
      object.email = `${object.username}@example.com`;
    }
    
    // Ensure password is a string before database insertion
    if (!object.password || typeof object.password !== 'string') {
      object.password = 'password123';
    }
  }
}