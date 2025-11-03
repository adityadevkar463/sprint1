import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Calculate total
    const totalPrice = cartItems.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    // Check stock availability
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${item.product.name}`,
        });
      }
    }

    // Create order with transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          totalPrice,
          status: 'pending',
        },
      });

      // Create order items and update stock
      const orderItems = await Promise.all(
        cartItems.map(async (cartItem) => {
          // Update product stock
          await tx.product.update({
            where: { id: cartItem.productId },
            data: {
              stock: {
                decrement: cartItem.quantity,
              },
            },
          });

          // Create order item
          return tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: cartItem.productId,
              quantity: cartItem.quantity,
              price: cartItem.product.price,
            },
            include: { product: true },
          });
        })
      );

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return {
        ...newOrder,
        orderItems,
      };
    });

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      message: 'Order status updated',
      order,
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderStats = async (req, res, next) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalSales = await prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      stats: {
        totalOrders,
        totalSales: totalSales._sum.totalPrice || 0,
      },
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

