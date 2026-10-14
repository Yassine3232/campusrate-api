import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ required: true })
  placeId: string;

  @Prop({ required: true })
  authorName: string;

  @Prop({ required: true })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: null })
  createdAt?: Date;

  @Prop({ default: null })
  updatedAt?: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
