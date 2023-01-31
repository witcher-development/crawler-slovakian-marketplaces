import * as mongoose from 'mongoose';

const uri: string = 'mongodb://127.0.0.1:27017/local?authSource=admin';

mongoose.connect(uri, { user: 'root', pass: 'root' }, (err: any) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log('Successfully Connected!');
  }
});

export interface IProduct extends mongoose.Document {
  name: string;
  views: number;
  category: string;
  subCategory: string;
}

export const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  views: { type: Number, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
