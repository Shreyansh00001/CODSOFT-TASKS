import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB, User, Product, Order, getDbType } from '../config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const products = [
  {
    name: 'AeroGlass Cyber Keyboard',
    image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?q=80&w=600&auto=format&fit=crop',
    description: 'Experience typing perfection with a custom acrylic glass housing, hot-swappable mechanical switches, and customizable dynamic HSL underglow. Perfect for creators, developers, and gamers looking to elevate their desk setup.',
    category: 'Keyboards',
    price: 189.99,
    countInStock: 12,
    rating: 4.8,
    numReviews: 24,
  },
  {
    name: 'Vortex ANC Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
    description: 'Immerse yourself in pure sound. Featuring hybrid active noise cancellation, high-fidelity 40mm drivers, and up to 45 hours of battery life on a single charge. Engineered for extreme comfort and sonic clarity.',
    category: 'Audio',
    price: 299.99,
    countInStock: 8,
    rating: 4.6,
    numReviews: 18,
  },
  {
    name: 'Nova Smartwatch Series X',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
    description: 'A minimalist masterpiece. Features an always-on curved AMOLED display, advanced biometric tracking (heart rate, SpO2, sleep analytics), and built-in GPS. Housed in a lightweight aerospace aluminum frame.',
    category: 'Wearables',
    price: 249.99,
    countInStock: 15,
    rating: 4.5,
    numReviews: 32,
  },
  {
    name: 'Lumina Ambient Lightbar',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop',
    description: 'Transform your room with smart ambient lighting. Features high-density RGBIC LEDs, built-in sound-reactive microphone for sync, and full app control. Mounts easily to the back of monitors or walls.',
    category: 'Lighting',
    price: 69.99,
    countInStock: 25,
    rating: 4.7,
    numReviews: 56,
  },
  {
    name: 'PixelPro Studio Desk Pad',
    image: 'https://images.unsplash.com/photo-1632292224971-0d45778b3002?q=80&w=600&auto=format&fit=crop',
    description: 'Premium wool felt desk mat designed to protect your desk and provide an ultra-smooth glide for your mouse. Crafted with natural materials and an anti-slip cork base to stay firmly in place.',
    category: 'Desk Accessories',
    price: 45.00,
    countInStock: 40,
    rating: 4.9,
    numReviews: 42,
  },
  {
    name: 'Hyperion Ergo Mouse',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=600&auto=format&fit=crop',
    description: 'Reduce wrist strain with our scientific vertical layout. Offers dual Bluetooth/2.4G wireless connectivity, an adjustable high-precision optical sensor (up to 4000 DPI), and fully programmable macro buttons.',
    category: 'Mice',
    price: 89.99,
    countInStock: 20,
    rating: 4.4,
    numReviews: 19,
  },
  {
    name: 'Eclipse Wireless Charger',
    image: 'https://images.unsplash.com/photo-1622445262465-2481c4574875?q=80&w=600&auto=format&fit=crop',
    description: 'Sleek, dual-device 15W Qi-certified fast-charging station wrapped in premium leather and matte black aluminum. Features intelligent power delivery and temperature safeguards.',
    category: 'Charging',
    price: 59.99,
    countInStock: 30,
    rating: 4.5,
    numReviews: 28,
  },
  {
    name: 'Apex 4K USB-C Monitor',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop',
    description: 'Designed for ultimate creativity. This 32-inch IPS display features stunning 4K UHD resolution, 99% sRGB color coverage, USB-C power delivery up to 90W, and an ultra-thin bezel design.',
    category: 'Monitors',
    price: 549.99,
    countInStock: 5,
    rating: 4.8,
    numReviews: 15,
  }
];

const seedData = async () => {
  await connectDB();

  const isJson = getDbType() === 'json';

  try {
    if (isJson) {
      // Clear data files manually
      const localdbDir = path.join(__dirname, '../data/localdb');
      
      // Seed users
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      const userPassword = await bcrypt.hash('user123', salt);

      const seededUsers = [
        {
          _id: 'user_admin_id_999',
          name: 'Admin User',
          email: 'admin@example.com',
          password: adminPassword,
          isAdmin: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: 'user_regular_id_888',
          name: 'Regular Customer',
          email: 'user@example.com',
          password: userPassword,
          isAdmin: false,
          createdAt: new Date().toISOString()
        }
      ];
      fs.writeFileSync(path.join(localdbDir, 'users.json'), JSON.stringify(seededUsers, null, 2));

      // Seed products
      const seededProducts = products.map((p, idx) => ({
        _id: `prod_id_00${idx + 1}`,
        ...p,
        createdAt: new Date().toISOString()
      }));
      fs.writeFileSync(path.join(localdbDir, 'products.json'), JSON.stringify(seededProducts, null, 2));

      // Clear orders
      fs.writeFileSync(path.join(localdbDir, 'orders.json'), JSON.stringify([], null, 2));

      console.log('\x1b[32m%s\x1b[0m', '🎉 Seeded Local JSON Database Successfully.');
    } else {
      // MongoDB Seeding using our wrappers (which will pass through to Mongoose models)
      // Since it's MongoDB, we can drop collections via mongoose connection
      await mongoose.connection.db.dropDatabase();

      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      const userPassword = await bcrypt.hash('user123', salt);

      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        isAdmin: true
      });

      await User.create({
        name: 'Regular Customer',
        email: 'user@example.com',
        password: userPassword,
        isAdmin: false
      });

      for (let p of products) {
        await Product.create(p);
      }

      console.log('\x1b[32m%s\x1b[0m', '🎉 Seeded MongoDB Database Successfully.');
    }
  } catch (error) {
    console.error(`❌ Error seeding database: ${error.message}`);
  } finally {
    if (!isJson) {
      await mongoose.connection.close();
    }
    process.exit();
  }
};

seedData();
