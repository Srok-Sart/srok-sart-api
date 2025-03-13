import { Base } from 'src/core/base.entity';
import { Material } from 'src/materials/entities/material.entity';
import { Post } from 'src/posts/entities/post.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('post_materials')
export class PostMaterial extends Base {
  @ManyToOne(() => Post, (post) => post.postMaterials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Material, (material) => material.postMaterials, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @Column('int', { nullable: false })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalWeight: number;
}
