import { IProcessor } from 'typeorm-fixtures-cli/dist';
import { Material } from '../../../materials/entities/material.entity';
import { MaterialCategory } from '../../../materials/enums/material-category.enum';
import { MaterialUnit } from '../../../materials/enums/material-unit.enum';
import { faker } from '@faker-js/faker';

export default class MaterialProcessor implements IProcessor<Material> {
  preProcess(name: string, object: any): any {
    // Create a random material entry
    const categories = Object.values(MaterialCategory);
    const units = Object.values(MaterialUnit);
    
    return {
      name: `${faker.commerce.productMaterial()} ${faker.commerce.productName()}`,
      weightPerUnit: parseFloat((Math.random() * 9.9 + 0.1).toFixed(2)), // Random between 0.1 and 10
      environmentalImpact: Math.floor(Math.random() * 10) + 1, // Random between 1 and 10
      category: categories[Math.floor(Math.random() * categories.length)],
      unit: units[Math.floor(Math.random() * units.length)]
    };
  }

  postProcess(name: string, object: Material): void {
    if (!object) return;
    
    // Ensure all required properties have valid values
    if (object.name === undefined || object.name === null) {
      object.name = 'Unnamed Material';
    }
    
    if (object.weightPerUnit === undefined || object.weightPerUnit === null || isNaN(Number(object.weightPerUnit))) {
      object.weightPerUnit = 1.0;
    }
    
    if (object.environmentalImpact === undefined || object.environmentalImpact === null || isNaN(Number(object.environmentalImpact))) {
      object.environmentalImpact = 1;
    }
    
    if (!object.category) {
      object.category = MaterialCategory.OTHER;
    }
    
    if (!object.unit) {
      object.unit = MaterialUnit.PIECE;
    }
  }
}