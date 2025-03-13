import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MaterialCategory } from '../enums/material-category.enum';
import { MaterialUnit } from '../enums/material-unit.enum';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  weightPerUnit: number;

  @IsNumber()
  @IsOptional()
  environmentalImpact: number;

  @IsEnum(MaterialCategory)
  category: MaterialCategory;

  @IsEnum(MaterialUnit)
  unit: MaterialUnit;
}
