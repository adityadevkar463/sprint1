import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  // Create regular user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@example.com',
      password: userPassword,
      role: 'user',
    },
  });

  // Create products with categories
  const products = [
    // Electronics
    {
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
      category: 'electronics',
      stock: 50,
    },
    {
      name: 'Smart Watch',
      description: 'Feature-rich smartwatch with fitness tracking',
      price: 299.99,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500',
      category: 'electronics',
      stock: 30,
    },
    {
      name: 'Mechanical Keyboard',
      description: 'RGB mechanical keyboard with blue switches',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500',
      category: 'electronics',
      stock: 75,
    },
    {
      name: 'Gaming Mouse',
      description: 'Precision gaming mouse with customizable buttons',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500',
      category: 'electronics',
      stock: 60,
    },
    {
      name: 'USB-C Hub',
      description: 'Multi-port USB-C hub with HDMI and SD card reader',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500',
      category: 'electronics',
      stock: 80,
    },
    {
      name: 'Bluetooth Speaker',
      description: 'Portable wireless speaker with 360° sound',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
      category: 'electronics',
      stock: 45,
    },
    {
      name: 'Tablet Stand',
      description: 'Adjustable aluminum stand for tablets',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
      category: 'electronics',
      stock: 90,
    },
    
    // Clothing
    {
      name: 'Cotton T-Shirt',
      description: 'Comfortable 100% cotton t-shirt in multiple colors',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
      category: 'clothing',
      stock: 150,
    },
    {
      name: 'Denim Jeans',
      description: 'Classic fit denim jeans, durable and stylish',
      price: 59.99,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
      category: 'clothing',
      stock: 80,
    },
    {
      name: 'Running Shoes',
      description: 'Lightweight running shoes with cushioned sole',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
      category: 'clothing',
      stock: 65,
    },
    {
      name: 'Winter Jacket',
      description: 'Warm and waterproof winter jacket',
      price: 149.99,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
      category: 'clothing',
      stock: 40,
    },
    {
      name: 'Baseball Cap',
      description: 'Adjustable baseball cap with embroidered logo',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500',
      category: 'clothing',
      stock: 120,
    },
    
    // Home & Kitchen
    {
      name: 'Coffee Maker',
      description: 'Programmable coffee maker with auto shut-off',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1517668808823-f9d89c26df5b?w=500',
      category: 'home',
      stock: 55,
    },
    {
      name: 'Laptop Stand',
      description: 'Ergonomic aluminum laptop stand',
      price: 49.99,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
      category: 'home',
      stock: 100,
    },
    {
      name: 'Desk Lamp',
      description: 'LED desk lamp with adjustable brightness',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f7820?w=500',
      category: 'home',
      stock: 70,
    },
    {
      name: 'Water Bottle',
      description: 'Stainless steel insulated water bottle',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
      category: 'home',
      stock: 95,
    },
    {
      name: 'Cutting Board Set',
      description: 'Bamboo cutting board set with multiple sizes',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
      category: 'home',
      stock: 85,
    },
    
    // Books
    {
      name: 'Web Development Guide',
      description: 'Complete guide to modern web development',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
      category: 'books',
      stock: 200,
    },
    {
      name: 'Cooking Recipe Book',
      description: 'Collection of 500+ delicious recipes',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
      category: 'books',
      stock: 150,
    },
    {
      name: 'Fiction Novel',
      description: 'Bestselling fiction novel with captivating storyline',
      price: 16.99,
      image: 'https://images.unsplash.com/photo-1512820790803-83ca750da815?w=500',
      category: 'books',
      stock: 300,
    },
    
    // Sports
    {
      name: 'Yoga Mat',
      description: 'Non-slip yoga mat with carrying strap',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500',
      category: 'sports',
      stock: 75,
    },
    {
      name: 'Dumbbell Set',
      description: 'Adjustable dumbbell set (5-50 lbs)',
      price: 199.99,
      image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=500',
      category: 'sports',
      stock: 35,
    },
    {
      name: 'Basketball',
      description: 'Official size basketball with premium grip',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500',
      category: 'sports',
      stock: 60,
    },
    {
      name: 'Tennis Racket',
      description: 'Professional tennis racket with carbon fiber frame',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1622163642999-958474e1c06c?w=500',
      category: 'sports',
      stock: 45,
    },
  ];

  for (const product of products) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (!existingProduct) {
      await prisma.product.create({
        data: product,
      });
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('👤 Admin: admin@example.com / admin123');
  console.log('👤 User: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

