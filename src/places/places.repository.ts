import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Place, PlaceDocument } from './schemas/place.schema';

@Injectable()
export class PlacesRepository {
  constructor(
    @InjectModel(Place.name) private readonly placeModel: Model<PlaceDocument>,
  ) {}

  async create(data: Partial<Place>): Promise<PlaceDocument> {
    return this.placeModel.create(data);
  }

  async findAll(
    filter: Record<string, any> = {},
    skip = 0,
    limit = 10,
  ): Promise<{ data: PlaceDocument[]; totalItems: number }> {
    const [data, totalItems] = await Promise.all([
      this.placeModel.find(filter).skip(skip).limit(limit).exec(),
      this.placeModel.countDocuments(filter).exec(),
    ]);
    return { data, totalItems };
  }

  async findById(id: string): Promise<PlaceDocument | null> {
    try {
      return await this.placeModel.findById(id).exec();
    } catch {
      return null;
    }
  }

  async updateById(
    id: string,
    data: Partial<Place>,
  ): Promise<PlaceDocument | null> {
    try {
      return await this.placeModel
        .findByIdAndUpdate(id, data, { new: true, runValidators: true })
        .exec();
    } catch {
      return null;
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const res = await this.placeModel.findByIdAndDelete(id).exec();
      return !!res;
    } catch {
      return false;
    }
  }
}
