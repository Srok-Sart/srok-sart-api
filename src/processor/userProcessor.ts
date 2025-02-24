import { User } from '../users/entities/user.entity';
import { IProcessor } from 'typeorm-fixtures-cli';
import * as argon2 from 'argon2';

export default class UserProcessor implements IProcessor<User> {
  async postProcess(name: string, object: { [key: string]: any }): Promise<void> {
    try {
      if (object.password) {
        object.password = await argon2.hash(object.password);
      }

      if (!object.username) {
        object.username = `${object.firstName.toLowerCase()}_${object.lastName.toLowerCase()}`;
      }
    } catch (error) {
      throw new Error(`Error processing user: ${error.message}`);
    }
  }
}