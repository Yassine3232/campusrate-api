import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Place } from './schemas/place.schema';

@Injectable()
export class PlacesRepository {
  constructor(
    @InjectModel(Place.name) private readonly placeModel: Model<Place>,
  ) {}

  async create(data: Partial<Place>): Promise<Place> {
    return this.placeModel.create(data);
  }

  async findAll(
    filter: Record<string, any> = {},
    skip = 0,
    limit = 10,
  ): Promise<{ data: Place[]; totalItems: number }> {
    const [data, totalItems] = await Promise.all([
      this.placeModel.find(filter).skip(skip).limit(limit).exec(),
      this.placeModel.countDocuments(filter).exec(),
    ]);
    return { data, totalItems };
  }

  async findById(id: string): Promise<Place | null> {
    try {
      return await this.placeModel.findById(id).exec();
    } catch {
      return null;
    }
  }

  async updateById(
    id: string,
    data: Partial<Place>,
  ): Promise<Place | null> {
    try {
      return await this.placeModel
        .findByIdAndUpdate(id, data, { new: true, runValidators: true })
        .exec();
    } catch {
      return null;
    }
  }

  async deleteById(id: string): Promise<void> {
    await this.placeModel.findByIdAndDelete(id).exec();
  }
}
