import { Column, Entity, ManyToMany } from 'typeorm';
import { MaterialCategory } from '../enums/material-category.enum';
import { MaterialUnit } from '../enums/material-unit.enum';
import { Base } from 'src/core/base.entity';
import { Post } from 'src/posts/entities/post.entity';

@Entity('materials')
export class Material extends Base {
  @Column()
  name: string;

  @Column()
  weightPerUnit: string;

  @Column({ default: 0 })
  environmentalImpact: number;

  @Column({
    type: 'enum',
    enum: MaterialCategory,
    default: MaterialCategory.OTHER,
  })
  category: MaterialCategory;

  @Column({
    type: 'enum',
    enum: MaterialUnit,
    default: MaterialUnit.G,
  })
  unit: MaterialUnit;

  @ManyToMany(() => Post, (post) => post.materials)
  posts: Post[];
}
