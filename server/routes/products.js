import express from 'express';
import { body } from 'express-validator';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('stock').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
  body('category').optional().isIn(['electronics', 'clothing', 'home', 'books', 'sports', 'other']).withMessage('Invalid category'),
  handleValidationErrors,
];

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authenticateToken, requireAdmin, validateProduct, createProduct);
router.put('/:id', authenticateToken, requireAdmin, validateProduct, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

export default router;

