import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const categoryRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 1) {
      // Filter products by search term and exclude products without images
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().startsWith(searchTerm.toLowerCase()) &&
          product.image &&
          product.image.trim() !== ''
      );
      setFilteredProducts(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredProducts([]);
      setShowDropdown(false);
    }
  }, [searchTerm, products]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get unique categories from products (only products with images)
  const categories = [...new Set(
    products
      .filter(p => p.image && p.image.trim() !== '')
      .map(p => p.category)
      .filter(Boolean)
  )].sort();
  
  const categoryNames = {
    electronics: 'Electronics',
    clothing: 'Clothing & Apparel',
    home: 'Home & Kitchen',
    books: 'Books',
    sports: 'Sports & Fitness',
  };

  const handleCategoryClick = (category) => {
    setShowCategoryDropdown(false);
    navigate(`/?category=${category}`);
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleProductClick = (productId) => {
    setSearchTerm('');
    setShowDropdown(false);
    navigate(`/products/${productId}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Left: Logo and Navigation */}
          <div className="flex items-center space-x-8 flex-shrink-0">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              shopO
            </Link>
            <div className="hidden md:flex space-x-4 items-center">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Products
              </Link>
              
              {/* Category Dropdown */}
              <div className="relative" ref={categoryRef}>
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  Categories
                  <svg
                    className={`ml-1 h-4 w-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 min-w-[180px]">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 first:rounded-t-md last:rounded-b-md"
                      >
                        {categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user && (
                <>
                  <Link
                    to="/orders"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    My Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 flex justify-center px-4 max-w-2xl">
            <div className="relative w-full" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full px-5 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
                <svg
                  className="absolute left-4 top-3.5 h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Dropdown Results */}
              {showDropdown && filteredProducts.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                >
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-blue-600 font-semibold">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showDropdown && searchTerm.length >= 1 && filteredProducts.length === 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4"
                >
                  <p className="text-sm text-gray-500 text-center">
                    No products found starting with "{searchTerm}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Cart and User Actions */}
          <div className="flex items-center space-x-4 flex-shrink-0">

            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-blue-600 p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 text-sm">Hello, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

