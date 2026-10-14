import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PlaceCategory } from '../../common/enums/category.enum';
import { PlaceStatus } from '../../common/enums/status.enum';

@Schema({ timestamps: true })
export class Place extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: PlaceCategory })
  category: PlaceCategory;

  @Prop({ required: true })
  address: string;

  @Prop({ type: [String], default: [] })
  services: string[];

  @Prop({ enum: PlaceStatus, default: PlaceStatus.ACTIVE })
  status: PlaceStatus;

  @Prop({ default: null })
  averageRating: number | null;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ default: null })
  createdAt?: Date;

  @Prop({ default: null })
  updatedAt?: Date;
}

export const PlaceSchema = SchemaFactory.createForClass(Place);
