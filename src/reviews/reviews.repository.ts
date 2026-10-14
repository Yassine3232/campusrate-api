import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}

  async create(data: Partial<Review>): Promise<ReviewDocument> {
    return this.reviewModel.create(data);
  }

  async findByPlaceId(placeId: string): Promise<ReviewDocument[]> {
    return this.reviewModel.find({ placeId }).exec();
  }

  async countByPlaceId(placeId: string): Promise<number> {
    return this.reviewModel.countDocuments({ placeId }).exec();
  }

  async findById(id: string): Promise<ReviewDocument | null> {
    try {
      return await this.reviewModel.findById(id).exec();
    } catch {
      return null;
    }
  }

  async updateById(
    id: string,
    data: Partial<Review>,
  ): Promise<ReviewDocument | null> {
    try {
      return await this.reviewModel
        .findByIdAndUpdate(id, data, { new: true, runValidators: true })
        .exec();
    } catch {
      return null;
    }
  }

  async deleteById(id: string): Promise<ReviewDocument | null> {
    try {
      return await this.reviewModel.findByIdAndDelete(id).exec();
    } catch {
      return null;
    }
  }

  // Agregation MongoDB (Option M2) pour calculer averageRating et reviewCount
  async calculateStats(
    placeId: string,
  ): Promise<{ averageRating: number | null; reviewCount: number }> {
    const stats = await this.reviewModel.aggregate<{
      _id: string;
      averageRating: number;
      reviewCount: number;
    }>([
      { $match: { placeId } },
      {
        $group: {
          _id: '$placeId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (!stats || stats.length === 0) {
      return { averageRating: null, reviewCount: 0 };
    }

    return {
      averageRating: Math.round(stats[0].averageRating * 100) / 100,
      reviewCount: stats[0].reviewCount,
    };
  }
}
