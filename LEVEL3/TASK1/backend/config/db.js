import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data/localdb');

// Ensure local db directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let dbType = 'json';

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  No MONGODB_URI found in environment variables. Falling back to local JSON database.');
    dbType = 'json';
    return;
  }

  try {
    // Set connection timeout to 3 seconds so we don't hang if Mongo isn't running
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('\x1b[32m%s\x1b[0m', '✅ MongoDB Connected Successfully.');
    dbType = 'mongodb';
  } catch (err) {
    console.log('\x1b[33m%s\x1b[0m', `⚠️  MongoDB connection failed: ${err.message}. Falling back to local JSON database.`);
    dbType = 'json';
  }
};

export const getDbType = () => dbType;

// --- JSON Mock Database Helper Class ---
class JsonModel {
  constructor(modelName, defaultData = []) {
    this.filePath = path.join(DATA_DIR, `${modelName.toLowerCase()}s.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  _write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(query = {}) {
    let items = this._read();
    
    // Simple filter matching
    if (Object.keys(query).length > 0) {
      items = items.filter(item => {
        for (let key in query) {
          // Support basic regex or string match for search
          if (query[key] instanceof RegExp) {
            if (!query[key].test(item[key])) return false;
          } else if (typeof query[key] === 'object' && query[key] !== null) {
            // Support $ne, $in, etc. if needed, or nested structures
            if (query[key].$ne !== undefined && item[key] === query[key].$ne) return false;
          } else {
            // Standard direct match
            if (item[key] !== query[key]) return false;
          }
        }
        return true;
      });
    }
    return items;
  }

  async findOne(query = {}) {
    const items = await this.find(query);
    return items[0] || null;
  }

  async findById(id) {
    const items = this._read();
    const found = items.find(item => item._id === id.toString());
    if (found) {
      // Add a mock save method
      found.save = async () => {
        const currentItems = this._read();
        const idx = currentItems.findIndex(i => i._id === found._id);
        if (idx !== -1) {
          currentItems[idx] = found;
          this._write(currentItems);
        }
        return found;
      };
    }
    return found || null;
  }

  async create(data) {
    const items = this._read();
    const newItem = {
      _id: Math.random().toString(36).substring(2, 11) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      ...data,
    };
    
    // Add mock save method
    newItem.save = async () => {
      const currentItems = this._read();
      const idx = currentItems.findIndex(i => i._id === newItem._id);
      if (idx !== -1) {
        currentItems[idx] = newItem;
      } else {
        currentItems.push(newItem);
      }
      this._write(currentItems);
      return newItem;
    };

    items.push(newItem);
    this._write(items);
    return newItem;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const items = this._read();
    const index = items.findIndex(item => item._id === id.toString());
    if (index === -1) return null;

    // Handle Mongoose style atomic updates like $push
    if (updateData.$push) {
      for (let key in updateData.$push) {
        if (!items[index][key]) items[index][key] = [];
        items[index][key].push(updateData.$push[key]);
      }
      delete updateData.$push;
    }

    items[index] = { ...items[index], ...updateData, updatedAt: new Date().toISOString() };
    this._write(items);
    return items[index];
  }

  async findByIdAndDelete(id) {
    const items = this._read();
    const index = items.findIndex(item => item._id === id.toString());
    if (index === -1) return null;
    const deleted = items.splice(index, 1)[0];
    this._write(items);
    return deleted;
  }

  async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }
}

// Instantiate JSON DB Models
const jsonUser = new JsonModel('User');
const jsonProduct = new JsonModel('Product');
const jsonOrder = new JsonModel('Order');

// --- Mongoose Models (Standard Schema) ---
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  image: { type: String, required: true },
  countInStock: { type: Number, required: true, default: 0 },
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // optional in fallback or standard
  orderItems: [{
    name: { type: String, required: true },
    qty: { type: Number, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    product: { type: String, required: true },
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  paymentMethod: { type: String, required: true },
  itemsPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  taxPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
}, { timestamps: true });

const MongoUser = mongoose.models.User || mongoose.model('User', userSchema);
const MongoProduct = mongoose.models.Product || mongoose.model('Product', productSchema);
const MongoOrder = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Export dynamic proxy wrappers
export const User = {
  findOne: (query) => dbType === 'mongodb' ? MongoUser.findOne(query) : jsonUser.findOne(query),
  create: (data) => dbType === 'mongodb' ? MongoUser.create(data) : jsonUser.create(data),
  findById: (id) => dbType === 'mongodb' ? MongoUser.findById(id) : jsonUser.findById(id),
  find: (query) => dbType === 'mongodb' ? MongoUser.find(query) : jsonUser.find(query),
};

export const Product = {
  find: (query) => dbType === 'mongodb' ? MongoProduct.find(query) : jsonProduct.find(query),
  findOne: (query) => dbType === 'mongodb' ? MongoProduct.findOne(query) : jsonProduct.findOne(query),
  findById: (id) => dbType === 'mongodb' ? MongoProduct.findById(id) : jsonProduct.findById(id),
  create: (data) => dbType === 'mongodb' ? MongoProduct.create(data) : jsonProduct.create(data),
  findByIdAndUpdate: (id, update, options) => dbType === 'mongodb' ? MongoProduct.findByIdAndUpdate(id, update, options) : jsonProduct.findByIdAndUpdate(id, update, options),
  findByIdAndDelete: (id) => dbType === 'mongodb' ? MongoProduct.findByIdAndDelete(id) : jsonProduct.findByIdAndDelete(id),
  countDocuments: (query) => dbType === 'mongodb' ? MongoProduct.countDocuments(query) : jsonProduct.countDocuments(query),
};

export const Order = {
  create: (data) => dbType === 'mongodb' ? MongoOrder.create(data) : jsonOrder.create(data),
  find: (query) => dbType === 'mongodb' ? MongoOrder.find(query) : jsonOrder.find(query),
  findById: (id) => dbType === 'mongodb' ? MongoOrder.findById(id) : jsonOrder.findById(id),
  findByIdAndUpdate: (id, update, options) => dbType === 'mongodb' ? MongoOrder.findByIdAndUpdate(id, update, options) : jsonOrder.findByIdAndUpdate(id, update, options),
};
