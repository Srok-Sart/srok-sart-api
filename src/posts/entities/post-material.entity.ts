import { Base } from 'src/core/base.entity';
import { Material } from 'src/materials/entities/material.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Post } from './post.entity';

@Entity('post_material')
export class PostMaterial extends Base {
  @Column()
  quantity: string;

  @ManyToOne(() => Post, (post) => post.materials)
  post: Post;

  @ManyToOne(() => Material)
  material: Material;
}
