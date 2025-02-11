import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MaterialCategory } from '../enums/material-category.enum';
import { MaterialUnit } from '../enums/material-unit.enum';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  weightPerUnit: string;

  @IsNumber()
  @IsOptional()
  environmentalImpact: number;

  @IsEnum(MaterialCategory)
  category: MaterialCategory;

  @IsEnum(MaterialUnit)
  unit: MaterialUnit;
}
