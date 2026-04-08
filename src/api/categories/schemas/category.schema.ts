import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true, collection: 'categories' })
export class Category {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  codeName!: string;

  @Prop({ type: String, default: null })
  image!: string | null;
}

export const CategorySchema = SchemaFactory.createForClass(Category);