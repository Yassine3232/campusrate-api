import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PlaceCategory } from '../../common/enums/category.enum';
import { PlaceStatus } from '../../common/enums/status.enum';

export type PlaceDocument = Place & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id ? ret._id.toString() : ret.id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Place {
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, enum: PlaceCategory })
  category: PlaceCategory;

  @Prop({ required: true, trim: true })
  address: string;

  @Prop({ type: [String], default: [] })
  services: string[];

  @Prop({ enum: PlaceStatus, default: PlaceStatus.ACTIVE })
  status: PlaceStatus;

  @Prop({ type: Number, default: null })
  averageRating: number | null;

  @Prop({ type: Number, default: 0 })
  reviewCount: number;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PlaceSchema = SchemaFactory.createForClass(Place);
