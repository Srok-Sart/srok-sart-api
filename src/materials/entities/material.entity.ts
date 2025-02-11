import { Column, Entity } from 'typeorm';
import { MaterialCategory } from '../enums/material-category.enum';
import { MaterialUnit } from '../enums/material-unit.enum';
import { Base } from 'src/core/base.entity';

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
}
