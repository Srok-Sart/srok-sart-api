import { Base } from 'src/core/base.entity';
import { PostMaterial } from 'src/posts/entities/post-material.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { MaterialCategory } from '../enums/material-category.enum';
import { MaterialUnit } from '../enums/material-unit.enum';

@Entity('materials')
export class Material extends Base {
  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  weightPerUnit: number;

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

  @OneToMany(() => PostMaterial, (postMaterial) => postMaterial.material)
  postMaterials: PostMaterial[];
}
