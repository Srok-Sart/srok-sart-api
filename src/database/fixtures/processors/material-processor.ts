import { IProcessor } from 'typeorm-fixtures-cli/dist';
import { Material } from '../../../materials/entities/material.entity';
import { MaterialCategory } from '../../../materials/enums/material-category.enum';
import { MaterialUnit } from '../../../materials/enums/material-unit.enum';

export default class MaterialProcessor implements IProcessor<Material> {
  preProcess(name: string, object: any): any {
    // Generate realistic names based on category
    const categoryNames = {
      [MaterialCategory.PLASTIC]: ['Plastic Bottle', 'Plastic Container', 'Plastic Bag', 'Plastic Sheet', 'Plastic Cup'],
      [MaterialCategory.PAPER]: ['Cardboard Box', 'Newspaper', 'Magazine', 'Paper Bag', 'Wrapping Paper'],
      [MaterialCategory.METAL]: ['Aluminum Can', 'Steel Container', 'Metal Wire', 'Metal Scrap', 'Copper Tubing'],
      [MaterialCategory.GLASS]: ['Glass Bottle', 'Glass Jar', 'Glass Fragment', 'Window Glass', 'Mirror Piece'],
      [MaterialCategory.TEXTILE]: ['Cotton Fabric', 'Old T-shirt', 'Denim Jeans', 'Wool Sweater', 'Polyester Cloth'],
      [MaterialCategory.ORGANIC]: ['Food Waste', 'Garden Trimmings', 'Coffee Grounds', 'Fruit Peels', 'Vegetable Scraps'],
      [MaterialCategory.ELECTRONIC]: ['Old Phone', 'Circuit Board', 'Computer Part', 'Cable', 'Battery'],
      [MaterialCategory.BATTERY]: ['AA Battery', 'AAA Battery', 'Lithium Battery', 'Button Cell', 'Car Battery'],
      [MaterialCategory.OTHER]: ['Miscellaneous Item', 'Mixed Materials', 'Unknown Material', 'Composite Material', 'Recycled Item']
    };
    
    // If category is set, use it to set a more realistic name
    if (object.category && categoryNames[object.category]) {
      const namesForCategory = categoryNames[object.category];
      object.name = namesForCategory[Math.floor(Math.random() * namesForCategory.length)];
    }
    
    // Adjust weightPerUnit based on unit and category for more realistic values
    if (object.unit === MaterialUnit.KG) {
      object.weightPerUnit = parseFloat((Math.random() * 5 + 0.5).toFixed(2));
    } else if (object.unit === MaterialUnit.G) {
      object.weightPerUnit = parseFloat((Math.random() * 500 + 1).toFixed(2));
    } else if (object.unit === MaterialUnit.L) {
      object.weightPerUnit = parseFloat((Math.random() * 2 + 0.1).toFixed(2));
    } else if (object.unit === MaterialUnit.ML) {
      object.weightPerUnit = parseFloat((Math.random() * 500 + 1).toFixed(2));
    } else {
      // For non-weight/volume units like PIECE, PACK, etc.
      object.weightPerUnit = parseFloat((Math.random() * 1 + 0.01).toFixed(2));
    }
    
    // Set environmental impact based on category
    const impactByCategory = {
      [MaterialCategory.PLASTIC]: Math.floor(Math.random() * 5) + 6, // 6-10 (high impact)
      [MaterialCategory.ELECTRONIC]: Math.floor(Math.random() * 5) + 6, // 6-10 (high impact)
      [MaterialCategory.BATTERY]: Math.floor(Math.random() * 5) + 6, // 6-10 (high impact)
      [MaterialCategory.METAL]: Math.floor(Math.random() * 3) + 4, // 4-6 (medium impact)
      [MaterialCategory.GLASS]: Math.floor(Math.random() * 3) + 4, // 4-6 (medium impact)
      [MaterialCategory.TEXTILE]: Math.floor(Math.random() * 3) + 3, // 3-5 (medium impact)
      [MaterialCategory.PAPER]: Math.floor(Math.random() * 3) + 1, // 1-3 (low impact)
      [MaterialCategory.ORGANIC]: Math.floor(Math.random() * 2) + 1, // 1-2 (low impact)
      [MaterialCategory.OTHER]: Math.floor(Math.random() * 10) + 1, // 1-10 (variable impact)
    };
    
    if (object.category && impactByCategory[object.category]) {
      object.environmentalImpact = impactByCategory[object.category];
    }
    
    return object;
  }

  postProcess(name: string, object: Material): void {
    // Any additional post-processing needed
  }
} 