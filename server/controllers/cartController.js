import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCart = async (req, res, next) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = cartItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    res.json({
      cartItems,
      total: parseFloat(total.toFixed(2)),
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    let cartItem;
    if (existingItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity,
        },
        include: { product: true },
      });
    }

    res.status(201).json({
      message: 'Item added to cart',
      cartItem,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (quantity > cartItem.product.stock) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity: parseInt(quantity) },
      include: { product: true },
    });

    res.json({
      message: 'Cart item updated',
      cartItem: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id },
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    if (cartItem.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.cartItem.delete({
      where: { id },
    });

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { userId: req.user.userId },
    });

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
};

