import * as mongoose from 'mongoose';

const uri: string = 'mongodb://127.0.0.1:27017/local?authSource=admin';

let db: mongoose.Mongoose;
export const connect = async () => {
  try {
    db = await mongoose.connect(uri, { user: 'root', pass: 'root' });
    console.log("DB connection successful")
  } catch (e) {
    console.log("DB connection failed", e)
  }
}
export const disconnect = () => {
  setTimeout(db.disconnect, 2000)
}

export interface IProduct {
  name: string;
  price: string;
  views: number;
  category: string;
  subCategory: string;
  id: string;
  isPromoted: boolean;
  location: string;
  productDate: string;
  crawlerDate: string;
}

export const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  views: { type: Number, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  id: { type: String, required: true },
  isPromoted: { type: Boolean, required: true },
  location: { type: String, required: true },
  productDate: { type: String, required: true },
  crawlerDate: { type: String, required: true },
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
export const Stats = mongoose.model('Stats', new mongoose.Schema({
  crawlerDate: { type: String, required: true },
  allProducts: { type: Number, required: true },
  newPerDay: { type: Number, required: true },
  subCategories: { type: Object, required: true }
}))
