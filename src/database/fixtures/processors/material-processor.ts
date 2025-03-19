import { IProcessor } from 'typeorm-fixtures-cli/dist';
import { Material } from '../../../materials/entities/material.entity';
import { MaterialCategory } from '../../../materials/enums/material-category.enum';
import { MaterialUnit } from '../../../materials/enums/material-unit.enum';
import { faker } from '@faker-js/faker';

export default class MaterialProcessor implements IProcessor<Material> {
  // Predefined materials organized by category
  private predefinedMaterials = {
    PAINTING: [
      { name: 'Used Canvas', category: MaterialCategory.TEXTILE, unit: MaterialUnit.KG },
      { name: 'Acrylic Paint', category: MaterialCategory.OTHER, unit: MaterialUnit.G },
      { name: 'Recycled Paper', category: MaterialCategory.PAPER, unit: MaterialUnit.G },
      { name: 'Old Newspaper', category: MaterialCategory.PAPER, unit: MaterialUnit.KG },
      { name: 'Used Picture Frame', category: MaterialCategory.OTHER, unit: MaterialUnit.KG }
    ],
    GARDENING: [
      { name: 'Plastic Bottles', category: MaterialCategory.PLASTIC, unit: MaterialUnit.KG },
      { name: 'Compost', category: MaterialCategory.ORGANIC, unit: MaterialUnit.KG },
      { name: 'Plant Seeds', category: MaterialCategory.ORGANIC, unit: MaterialUnit.G },
      { name: 'Plant Pot Scraps', category: MaterialCategory.OTHER, unit: MaterialUnit.KG },
      { name: 'Old Tires', category: MaterialCategory.OTHER, unit: MaterialUnit.KG }
    ],
    CRAFT: [
      { name: 'Old Magazines', category: MaterialCategory.PAPER, unit: MaterialUnit.KG },
      { name: 'Cardboard', category: MaterialCategory.PAPER, unit: MaterialUnit.KG },
      { name: 'Bottle Caps', category: MaterialCategory.METAL, unit: MaterialUnit.G },
      { name: 'Glue', category: MaterialCategory.OTHER, unit: MaterialUnit.G },
      { name: 'Colored Paper', category: MaterialCategory.PAPER, unit: MaterialUnit.G }
    ],
    WOODWORK: [
      { name: 'Reclaimed Wood', category: MaterialCategory.OTHER, unit: MaterialUnit.KG },
      { name: 'Wood Glue', category: MaterialCategory.OTHER, unit: MaterialUnit.G },
      { name: 'Old Wooden Furniture', category: MaterialCategory.OTHER, unit: MaterialUnit.KG },
      { name: 'Sandpaper', category: MaterialCategory.OTHER, unit: MaterialUnit.G },
      { name: 'Used Nails', category: MaterialCategory.METAL, unit: MaterialUnit.G }
    ],
    JEWELRY: [
      { name: 'Old Jewelry Pieces', category: MaterialCategory.METAL, unit: MaterialUnit.G },
      { name: 'Metal Wire', category: MaterialCategory.METAL, unit: MaterialUnit.G },
      { name: 'Glass Beads', category: MaterialCategory.GLASS, unit: MaterialUnit.G },
      { name: 'Thread', category: MaterialCategory.TEXTILE, unit: MaterialUnit.G },
      { name: 'Metal Clasps', category: MaterialCategory.METAL, unit: MaterialUnit.G }
    ],
    FASHION: [
      { name: 'Used Clothing', category: MaterialCategory.TEXTILE, unit: MaterialUnit.KG },
      { name: 'Sewing Thread', category: MaterialCategory.TEXTILE, unit: MaterialUnit.G },
      { name: 'Plastic Buttons', category: MaterialCategory.PLASTIC, unit: MaterialUnit.G },
      { name: 'Fabric Scraps', category: MaterialCategory.TEXTILE, unit: MaterialUnit.KG },
      { name: 'Zipper Parts', category: MaterialCategory.OTHER, unit: MaterialUnit.G }
    ],
    DECOR: [
      { name: 'Glass Jars', category: MaterialCategory.GLASS, unit: MaterialUnit.KG },
      { name: 'Tin Cans', category: MaterialCategory.METAL, unit: MaterialUnit.KG },
      { name: 'Photo Frame Parts', category: MaterialCategory.OTHER, unit: MaterialUnit.G },
      { name: 'Rope Scraps', category: MaterialCategory.TEXTILE, unit: MaterialUnit.G },
      { name: 'Dried Plant Material', category: MaterialCategory.ORGANIC, unit: MaterialUnit.G }
    ],
    DEFAULT: [
      { name: 'Recycled Paper', category: MaterialCategory.PAPER, unit: MaterialUnit.KG },
      { name: 'Plastic Containers', category: MaterialCategory.PLASTIC, unit: MaterialUnit.KG },
      { name: 'Fabric Scraps', category: MaterialCategory.TEXTILE, unit: MaterialUnit.KG },
      { name: 'Old Newspaper', category: MaterialCategory.PAPER, unit: MaterialUnit.KG },
      { name: 'Cardboard Pieces', category: MaterialCategory.PAPER, unit: MaterialUnit.KG }
    ]
  };

  // Method to get materials by name
  getMaterialByName(name: string): any {
    for (const category in this.predefinedMaterials) {
      const materials = this.predefinedMaterials[category];
      const found = materials.find(m => m.name === name);
      if (found) return found;
    }
    return null;
  }

  // Get all available materials flattened into one array
  getAllMaterials(): any[] {
    return Object.values(this.predefinedMaterials).flat();
  }

  // Get materials for a specific category
  getMaterialsByCategory(category: string): any[] {
    return this.predefinedMaterials[category] || this.predefinedMaterials.DEFAULT;
  }

  preProcess(name: string, object: any): any {
    // Extract material number if it exists in the name (e.g., "material1")
    const materialNumber = parseInt(name.replace(/\D/g, ''), 10) || 0;
    
    // Get all materials in a flat array
    const allMaterials = this.getAllMaterials();
    
    // Select material based on the material number (ensures consistent selection)
    const materialIndex = materialNumber % allMaterials.length;
    const selectedMaterial = allMaterials[materialIndex];
    
    // Create a material with realistic values
    const material = {
      name: selectedMaterial.name,
      // Weights in kg or g depending on the unit
      weightPerUnit: selectedMaterial.unit === MaterialUnit.KG
        ? parseFloat((Math.random() * 0.9 + 0.1).toFixed(2)) // 0.1-1 kg
        : parseFloat((Math.random() * 90 + 10).toFixed(0)),  // 10-100 g
      environmentalImpact: Math.floor(Math.random() * 5) + 1, // Lower impact (1-5) since these are recycled
      category: selectedMaterial.category,
      unit: selectedMaterial.unit
    };

    // Override with any specific properties from the fixture
    return { ...material, ...(object || {}) };
  }

  postProcess(name: string, object: Material): void {
    if (!object) return;
    
    // Ensure all required properties have valid values
    if (object.name === undefined || object.name === null) {
      object.name = 'Unnamed Material';
    }
    
    if (object.weightPerUnit === undefined || object.weightPerUnit === null || isNaN(Number(object.weightPerUnit))) {
      object.weightPerUnit = object.unit === MaterialUnit.KG ? 0.5 : 50;
    }
    
    if (object.environmentalImpact === undefined || object.environmentalImpact === null || isNaN(Number(object.environmentalImpact))) {
      object.environmentalImpact = 2; // Lower environmental impact for recycled materials
    }
    
    if (!object.category) {
      object.category = MaterialCategory.OTHER;
    }
    
    // Ensure we only use KG or G units
    if (!object.unit || (object.unit !== MaterialUnit.KG && object.unit !== MaterialUnit.G)) {
      object.unit = MaterialUnit.KG;
    }
  }
}