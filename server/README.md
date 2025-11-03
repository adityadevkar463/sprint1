# E-Commerce Backend Server

Node.js + Express backend server for the e-commerce application.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- SQLite (included with Node.js - no separate installation needed!)

### Installation

1. Install dependencies:
```bash
npm install
```

2. The `.env` file is already created with SQLite configuration:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET=ecommerce-super-secret-jwt-key-2024-production
```

**Note:** SQLite is file-based and requires no server setup. The database file (`dev.db`) will be created automatically in the `prisma` folder.

4. Generate Prisma Client:
```bash
npm run prisma:generate
```

5. Run database migrations:
```bash
npm run prisma:migrate
```

6. Seed the database with initial data:
```bash
npm run prisma:seed
```

7. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user cart (protected)
- `POST /api/cart` - Add item to cart (protected)
- `PUT /api/cart/:id` - Update cart item quantity (protected)
- `DELETE /api/cart/:id` - Remove item from cart (protected)
- `DELETE /api/cart` - Clear cart (protected)

### Orders
- `POST /api/orders` - Create new order (protected)
- `GET /api/orders/my-orders` - Get user orders (protected)
- `GET /api/orders` - Get all orders (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)
- `GET /api/orders/stats` - Get order statistics (admin only)

## 🔐 Default Users (from seed)

After running the seed script:

- **Admin User:**
  - Email: `admin@example.com`
  - Password: `admin123`

- **Regular User:**
  - Email: `user@example.com`
  - Password: `user123`

## 📁 Project Structure

```
server/
├── controllers/     # Request handlers
├── middleware/      # Custom middleware (auth, validation, errors)
├── routes/          # API route definitions
├── prisma/          # Database schema and migrations
│   ├── schema.prisma
│   └── seed.js
├── server.js         # Express app entry point
└── package.json
```

## 🛠️ Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed the database
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation with express-validator
- CORS configuration
- Role-based access control (user/admin)

## 📝 Notes

- **SQLite Database**: Uses file-based SQLite (`dev.db` in `prisma` folder) - no server setup required!
- The database is automatically created and seeded on first setup
- Use Prisma Studio for easy database management: `npm run prisma:studio`
- To reset the database: Delete `prisma/dev.db` and run `npm run prisma:migrate` + `npm run prisma:seed`

