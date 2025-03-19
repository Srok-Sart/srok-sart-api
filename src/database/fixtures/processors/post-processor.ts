import { IProcessor } from 'typeorm-fixtures-cli/dist';
import { Post } from '../../../posts/entities/post.entity';
import { PostType } from '../../../posts/enums/post-type.enum';
import { PostDifficulty } from '../../../posts/enums/post-difficulty.enum';
import { PostStatus } from '../../../posts/enums/post-status.enum';
import { faker } from '@faker-js/faker';
import { MaterialUnit } from '../../../materials/enums/material-unit.enum';
import MaterialProcessor from './material-processor';

export default class PostProcessor implements IProcessor<Post> {
  private defaultImagePath = '/uploads/default/default-post.jpg';
  private materialProcessor = new MaterialProcessor();
  
  // Existing thumbnail paths from your code
  private thumbnailPaths = [
    '/uploads/thumbnails/painting-thumbnail-1.jpg',
    '/uploads/thumbnails/painting-thumbnail-2.jpg',
    '/uploads/thumbnails/painting-thumbnail-3.jpg',
    '/uploads/thumbnails/painting-thumbnail-4.jpg',
    '/uploads/thumbnails/painting-thumbnail-5.jpg',
    '/uploads/thumbnails/gardening-thumbnail-1.jpg',
    '/uploads/thumbnails/gardening-thumbnail-2.jpg',
    '/uploads/thumbnails/gardening-thumbnail-3.jpg',
    '/uploads/thumbnails/gardening-thumbnail-4.jpg',
    '/uploads/thumbnails/gardening-thumbnail-5.jpg',
    '/uploads/thumbnails/craft-thumbnail-1.jpg',
    '/uploads/thumbnails/craft-thumbnail-2.jpg',
    '/uploads/thumbnails/craft-thumbnail-3.jpg',
    '/uploads/thumbnails/craft-thumbnail-4.jpg',
    '/uploads/thumbnails/craft-thumbnail-5.jpg',
    '/uploads/thumbnails/woodwork-thumbnail-1.jpg',
    '/uploads/thumbnails/woodwork-thumbnail-2.jpg',
    '/uploads/thumbnails/woodwork-thumbnail-3.jpg',
    '/uploads/thumbnails/woodwork-thumbnail-4.jpg',
    '/uploads/thumbnails/woodwork-thumbnail-5.jpg',
    '/uploads/thumbnails/jewelry-thumbnail-1.jpg',
    '/uploads/thumbnails/jewelry-thumbnail-2.jpg',
    '/uploads/thumbnails/jewelry-thumbnail-3.jpg',
    '/uploads/thumbnails/jewelry-thumbnail-4.jpg',
    '/uploads/thumbnails/jewelry-thumbnail-5.jpg',
    '/uploads/thumbnails/fashion-thumbnail-1.jpg',
    '/uploads/thumbnails/fashion-thumbnail-2.jpg',
    '/uploads/thumbnails/decor-thumbnail-1.jpg',
    '/uploads/thumbnails/decor-thumbnail-2.jpg',
    '/uploads/thumbnails/decor-thumbnail-1.jpg',
  ];

  // Existing image paths
  private imagePaths = [
    '/uploads/thumbnails/painting-thumbnail-1.jpg',
    '/uploads/thumbnails/painting-thumbnail-2.jpg',
    '/uploads/thumbnails/painting-thumbnail-3.jpg',
    '/uploads/thumbnails/painting-thumbnail-4.jpg',
    '/uploads/thumbnails/painting-thumbnail-5.jpg',
    '/uploads/thumbnails/gardening-thumbnail-1.jpg',
    '/uploads/thumbnails/gardening-thumbnail-2.jpg',
    '/uploads/thumbnails/gardening-thumbnail-3.jpg',
    '/uploads/thumbnails/gardening-thumbnail-4.jpg',
    '/uploads/thumbnails/gardening-thumbnail-5.jpg',
    '/uploads/thumbnails/craft-thumbnail-1.jpg',
    '/uploads/thumbnails/craft-thumbnail-2.jpg',
    '/uploads/thumbnails/craft-thumbnail-3.jpg',
    '/uploads/thumbnails/craft-thumbnail-4.jpg',
    '/uploads/thumbnails/craft-thumbnail-5.jpg',
    '/uploads/thumbnails/woodwork-thumbnail-1.jpg',
    '/uploads/thumbnails/woodwork-thumbnail-2.jpg',
    '/uploads/thumbnails/woodwork-thumbnail-3.jpg',
    '/uploads/thumbnails/woodwork-thumbnail-4.jpg',
    '/uploads/thumbnails/woodwork-thumbnail-5.jpg',
    '/uploads/thumbnails/jewelry-thumbnail-1.jpg',
    '/uploads/thumbnails/jewelry-thumbnail-2.jpg',
    '/uploads/thumbnails/jewelry-thumbnail-3.jpg',
    '/uploads/thumbnails/jewelry-thumbnail-4.jpg',
    '/uploads/thumbnails/jewelry-thumbnail-5.jpg',
    '/uploads/thumbnails/fashion-thumbnail-1.jpg',
    '/uploads/thumbnails/fashion-thumbnail-2.jpg',
    '/uploads/thumbnails/decor-thumbnail-1.jpg',
    '/uploads/thumbnails/decor-thumbnail-2.jpg',
    '/uploads/thumbnails/decor-thumbnail-1.jpg',
  ];
  
  // Existing video paths
  private videoPaths = [
    '/uploads/videos/tutorial-1.mp4',
    '/uploads/videos/tutorial-2.mp4',
    '/uploads/videos/tutorial-3.mp4',
    '/uploads/videos/tutorial-4.mp4',
    '/uploads/videos/demo-1.mp4',
    '/uploads/videos/demo-2.mp4',
    '/uploads/videos/howto-1.mp4',
    '/uploads/videos/howto-2.mp4',
  ];

  // Map thumbnail path patterns to categories
  private getPostCategory(thumbnailUrl: string): string {
    if (thumbnailUrl.includes('painting')) return 'PAINTING';
    if (thumbnailUrl.includes('gardening')) return 'GARDENING';
    if (thumbnailUrl.includes('craft')) return 'CRAFT';
    if (thumbnailUrl.includes('woodwork')) return 'WOODWORK';
    if (thumbnailUrl.includes('jewelry')) return 'JEWELRY';
    if (thumbnailUrl.includes('fashion')) return 'FASHION';
    if (thumbnailUrl.includes('decor')) return 'DECOR';
    return 'DEFAULT';
  }

  // Generate titles that match the category
  private getTitleForCategory(category: string): string {
    const titles = {
      'PAINTING': [
        'Upcycled Canvas Art', 
        'Recycled Newspaper Painting', 
        'Bottle Cap Art Piece',
        'Magazine Collage Artwork',
        'Eco-Friendly Art Using Old Materials'
      ],
      'GARDENING': [
        'DIY Plastic Bottle Planters', 
        'Upcycled Garden Containers', 
        'Tire Garden DIY',
        'Vertical Garden from Recycled Materials',
        'Sustainable Herb Garden'
      ],
      'CRAFT': [
        'Recycled Paper Beads', 
        'Cardboard Storage Box', 
        'Bottle Cap Art Project',
        'Upcycled Gift Boxes',
        'Eco-friendly Paper Ornaments'
      ],
      'WOODWORK': [
        'Reclaimed Wood Table Project', 
        'Upcycled Wooden Shelf', 
        'DIY Wooden Crate Furniture',
        'Repurposed Wood Art',
        'Scrap Wood Wall Art'
      ],
      'JEWELRY': [
        'Recycled Button Jewelry', 
        'Paper Bead Necklace', 
        'Bottle Cap Earrings',
        'Wire Wrap Pendant',
        'Upcycled Materials Bracelet'
      ],
      'FASHION': [
        'T-shirt Upcycling Project', 
        'Denim Transformation DIY', 
        'Old Clothing Remake',
        'Fabric Scrap Headband',
        'Eco-Friendly Clothing Accessories'
      ],
      'DECOR': [
        'Jar Light Fixtures', 
        'Tin Can Decorations', 
        'Glass Bottle Vases',
        'Recycled Material Wall Art',
        'Upcycled Home Decor'
      ],
      'DEFAULT': [
        'Recycling Art Project', 
        'Eco-Friendly DIY', 
        'Sustainable Craft Tutorial',
        'Upcycled Materials Art',
        'Green Crafting Project'
      ]
    };

    const categoryTitles = titles[category] || titles.DEFAULT;
    return categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
  }

  // Get descriptions that match the category
  private getDescriptionForCategory(category: string): string {
    const intros = {
      'PAINTING': 'Create beautiful art using recycled materials. This eco-friendly painting project helps reduce waste while letting you express your creativity.',
      'GARDENING': 'Transform waste materials into beautiful garden containers. This sustainable gardening project is perfect for growing herbs and flowers at home.',
      'CRAFT': 'Turn recyclable materials into beautiful crafts. This project reduces waste while creating something useful and decorative.',
      'WOODWORK': 'Give new life to old wood with this upcycling project. Creating items from reclaimed wood reduces waste and adds character to your home.',
      'JEWELRY': 'Craft beautiful accessories from materials that would otherwise be thrown away. This sustainable jewelry project turns waste into wearable art.',
      'FASHION': 'Transform old clothing into new fashion pieces. This upcycling project breathes new life into garments that would otherwise end up in landfills.',
      'DECOR': 'Create stunning home decor from everyday recyclables. This project shows how beauty can come from repurposing waste materials.',
      'DEFAULT': 'Turn recyclable materials into something beautiful and functional. This sustainable DIY project helps reduce waste while creating something unique.'
    };

    const baseDescription = intros[category] || intros.DEFAULT;
    return `${baseDescription}\n\n${faker.lorem.paragraphs(2)}\n\nMaterials needed are mostly recycled items that you might otherwise discard. The environmental impact is low, and you'll be helping reduce waste while creating something beautiful and useful.`;
  }

  // Get materials based on the post category
  getMaterialsForPost(postCategory: string, count: number = 3): any[] {
    const materials = this.materialProcessor.getMaterialsByCategory(postCategory);
    
    // Select a random subset of materials
    const shuffled = [...materials].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, materials.length));
  }

  preProcess(name: string, object: any): any {
    // Extract post number from the name (e.g., "post5" => 5)
    const postNumber = parseInt(name.replace(/\D/g, ''), 10) || 0;
    
    // Use the post number to select a unique thumbnail
    const thumbnailIndex = postNumber % this.thumbnailPaths.length;
    const thumbnailUrl = this.thumbnailPaths[thumbnailIndex];
    
    // Determine post category based on thumbnail
    const postCategory = this.getPostCategory(thumbnailUrl);
    
    // Generate random post data based on entities used in controller/service
    const postTypes = Object.values(PostType);
    const postDifficulties = Object.values(PostDifficulty);
    const postStatuses = Object.values(PostStatus);
    
    const postType = postTypes[Math.floor(Math.random() * postTypes.length)];
    
    // Select unique images using a different pattern than thumbnails
    const imageIndex1 = (postNumber * 2) % this.imagePaths.length;
    const imageIndex2 = (postNumber * 2 + 1) % this.imagePaths.length;
    let imageUrls = [this.imagePaths[imageIndex1], this.imagePaths[imageIndex2]];
    
    // If it's a video post, add a video path
    if (postType === PostType.VIDEO) {
      const videoIndex = postNumber % this.videoPaths.length;
      imageUrls.push(this.videoPaths[videoIndex]);
    }
    
    // Get contextual materials for this post category
    const materialCount = Math.floor(Math.random() * 2) + 2; // 2-3 materials per post
    const postMaterials = this.getMaterialsForPost(postCategory, materialCount).map(material => {
      const isKilogram = material.unit === MaterialUnit.KG;
      return {
        material: {
          name: material.name,
          category: material.category,
          unit: material.unit,
          // Weight is in kg (0.1-1kg) or g (10-100g) depending on unit
          weightPerUnit: isKilogram 
            ? parseFloat((Math.random() * 0.9 + 0.1).toFixed(2)) 
            : parseFloat((Math.random() * 90 + 10).toFixed(0)),
          environmentalImpact: Math.floor(Math.random() * 5) + 1
        },
        quantity: Math.floor(Math.random() * 3) + 1 // 1-3 units
      };
    });
    
    // Create a contextually appropriate post object
    const post = {
      title: this.getTitleForCategory(postCategory),
      description: this.getDescriptionForCategory(postCategory),
      estimatedTime: `${faker.number.int({ min: 15, max: 90 })} minutes`,
      viewCount: faker.number.int({ min: 0, max: 1000 }),
      completionCount: faker.number.int({ min: 0, max: 200 }),
      likeCount: faker.number.int({ min: 0, max: 500 }),
      postType,
      postDifficulty: postDifficulties[Math.floor(Math.random() * postDifficulties.length)],
      postStatus: postStatuses[Math.floor(Math.random() * postStatuses.length)],
      thumbnailUrl,
      imageUrls,
      materials: postMaterials,
      userId: `@user${faker.number.int({ min: 1, max: 10 })}`,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    };

    // Merge with any provided object properties
    return { ...post, ...(object || {}) };
  }

postProcess(name: string, object: Post): void {
  if (!object) return;
  
  // Extract post number from name
  const postNumber = parseInt(name.replace(/\D/g, ''), 10) || 0;
  
  // Ensure the object has valid image data
  if (!object.thumbnailUrl) {
    const thumbnailIndex = postNumber % this.thumbnailPaths.length;
    object.thumbnailUrl = this.thumbnailPaths[thumbnailIndex];
  }
  
  if (!Array.isArray(object.imageUrls) || object.imageUrls.length === 0) {
    const imageIndex1 = (postNumber * 2) % this.imagePaths.length;
    const imageIndex2 = (postNumber * 2 + 1) % this.imagePaths.length;
    object.imageUrls = [this.imagePaths[imageIndex1], this.imagePaths[imageIndex2]];
  }
  
  // Determine post category based on thumbnail
  const postCategory = this.getPostCategory(object.thumbnailUrl);
  
  // Ensure these fields are never undefined
  if (!object.title) {
    object.title = this.getTitleForCategory(postCategory);
  }
  
  if (!object.description) {
    object.description = this.getDescriptionForCategory(postCategory);
  }
  
  // Ensure enum fields have valid values
  if (!object.postType || !Object.values(PostType).includes(object.postType)) {
    object.postType = PostType.IMAGE;
  }
  
  if (!object.postDifficulty || !Object.values(PostDifficulty).includes(object.postDifficulty)) {
    object.postDifficulty = PostDifficulty.EASY;
  }
  
  if (!object.postStatus || !Object.values(PostStatus).includes(object.postStatus)) {
    object.postStatus = PostStatus.PUBLISH;
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
}