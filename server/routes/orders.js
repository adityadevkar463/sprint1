import express from 'express';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderStats,
} from '../controllers/orderController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createOrder);
router.get('/my-orders', authenticateToken, getUserOrders);
router.get('/stats', authenticateToken, requireAdmin, getOrderStats);
router.get('/', authenticateToken, requireAdmin, getAllOrders);
router.put('/:id/status', authenticateToken, requireAdmin, updateOrderStatus);

export default router;

