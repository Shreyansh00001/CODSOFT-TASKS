import { Product } from '../config/db.js';

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword
      ? { name: new RegExp(req.query.keyword, 'i') }
      : {};

    const category = req.query.category && req.query.category !== 'All'
      ? { category: req.query.category }
      : {};

    // Merge queries
    const query = { ...keyword, ...category };
    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, image, category, countInStock } = req.body;

    const product = await Product.create({
      name: name || 'Sample Name',
      price: price || 0,
      user: req.user._id,
      image: image || '/images/sample.jpg',
      category: category || 'Sample Category',
      countInStock: countInStock || 0,
      numReviews: 0,
      description: description || 'Sample Description',
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  const { name, price, description, image, category, countInStock } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          name: name || product.name,
          price: price !== undefined ? price : product.price,
          description: description || product.description,
          image: image || product.image,
          category: category || product.category,
          countInStock: countInStock !== undefined ? countInStock : product.countInStock,
        },
        { new: true }
      );
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
