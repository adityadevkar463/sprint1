import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      // Filter out products without images
      const productsWithImages = response.data.products.filter(
        (product) => product.image && product.image.trim() !== ''
      );
      setProducts(productsWithImages);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group products by category and filter by selected category
  const productsByCategory = useMemo(() => {
    const grouped = {};
    let filteredProducts = products;

    // Filter by selected category if one is chosen
    if (selectedCategory) {
      filteredProducts = products.filter(
        (product) => product.category === selectedCategory
      );
    }

    filteredProducts.forEach((product) => {
      const category = product.category || 'other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(product);
    });
    return grouped;
  }, [products, selectedCategory]);

  // Category display names
  const categoryNames = {
    electronics: 'Electronics',
    clothing: 'Clothing & Apparel',
    home: 'Home & Kitchen',
    books: 'Books',
    sports: 'Sports & Fitness',
    other: 'Other',
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      alert('Product added to cart!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  const categories = Object.keys(productsByCategory).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {selectedCategory 
            ? `${categoryNames[selectedCategory] || selectedCategory} Products`
            : 'Our Products'}
        </h1>
        {selectedCategory && (
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All Products →
          </Link>
        )}
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products available</p>
        </div>
      ) : (
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b-2 border-blue-500 pb-2">
                {categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsByCategory[category].map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    <div className="p-4">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-blue-600">
                          ${product.price.toFixed(2)}
                        </span>
                        <span
                          className={`text-sm ${
                            product.stock > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={product.stock === 0}
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

