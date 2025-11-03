# E-Commerce Frontend

React + Vite frontend application for the e-commerce platform.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

The `.env` file should contain:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

The app will start on `http://localhost:5173`

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📁 Project Structure

```
client/
├── src/
│   ├── components/    # Reusable UI components
│   ├── context/       # React Context (Auth, Cart)
│   ├── pages/         # Page components
│   ├── utils/         # Utility functions
│   ├── App.jsx        # Main app component with routing
│   └── main.jsx       # Entry point
├── public/            # Static assets
└── package.json
```

## 🎨 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

## 🔐 Authentication

The app uses JWT-based authentication. Users can:
- Register new accounts
- Login with existing accounts
- Access protected routes based on role (user/admin)

## 📦 Features

- Product listing and details
- Shopping cart management
- Order placement and history
- Admin dashboard (admin only)
- Responsive design

## 🎯 Pages

- `/` - Home (product grid)
- `/products/:id` - Product details
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/orders` - Order history (protected)
- `/admin` - Admin dashboard (admin only)
- `/login` - Login page
- `/signup` - Registration page

