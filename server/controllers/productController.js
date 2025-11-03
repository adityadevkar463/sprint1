import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllProducts = async (req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, image, stock, category } = req.body;

    // Default images by category
    const defaultImages = {
      electronics: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500',
      clothing: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
      home: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500',
      books: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
      sports: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
    };

    const productCategory = category || 'electronics';
    const productImage = (image && image.trim() !== '') 
      ? image 
      : (defaultImages[productCategory] || defaultImages.electronics);

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        image: productImage,
        stock: parseInt(stock),
        category: productCategory,
      },
    });

    res.status(201).json({
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, stock, category } = req.body;

    // Get current product to check category if image needs default
    const currentProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!currentProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Default images by category
    const defaultImages = {
      electronics: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=500',
      clothing: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
      home: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=500',
      books: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
      sports: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500',
    };

    // Handle image update - use default if empty
    let updatedImage = image;
    if (image !== undefined) {
      const productCategory = category || currentProduct.category || 'electronics';
      updatedImage = (image && image.trim() !== '')
        ? image
        : (defaultImages[productCategory] || defaultImages.electronics);
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(updatedImage !== undefined && { image: updatedImage }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(category && { category }),
      },
    });

    res.json({
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

