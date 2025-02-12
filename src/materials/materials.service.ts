import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Material } from './entities/material.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}

  async create(createMaterialDto: CreateMaterialDto) {
    const material = this.materialRepository.create(createMaterialDto);

    return await this.materialRepository.save(material);
  }

  async findAll() {
    return await this.materialRepository.find();
  }

  async findOne(id: number) {
    const material = await this.materialRepository.findOneBy({ id });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    return material;
  }

  async update(id: number, updateMaterialDto: UpdateMaterialDto) {
    const material = await this.materialRepository.preload({
      id,
      ...updateMaterialDto,
    });

    if (!material) {
      throw new NotFoundException(`Material with ID ${id} not found`);
    }

    return this.materialRepository.save(material);
  }

  async remove(id: number) {
    const material = await this.findOne(id);

    await this.materialRepository.remove(material);
  }
}
