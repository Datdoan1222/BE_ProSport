import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HeaderBannerDocument = HeaderBanner & Document;

@Schema({ timestamps: true, collection: 'header_banners' })
export class HeaderBanner {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true, lowercase: true, unique: true })
  codeName!: string;

  @Prop({ type: String, default: null })
  image!: string | null;
}

export const HeaderBannerSchema = SchemaFactory.createForClass(HeaderBanner);