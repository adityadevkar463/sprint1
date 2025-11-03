import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticateToken, getProfile);

export default router;

