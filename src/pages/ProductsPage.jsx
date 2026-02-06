import { useState, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, Star, Plus, Minus, Heart, Clock, ChevronDown, X, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { toast } from 'sonner';

const API_BASE_URL = 'http://localhost:5001';

export default function ProductsPage({ onNavigate, initialCategoryId, initialStoreId }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(initialCategoryId || 'all');
  const [selectedShop, setSelectedShop] = useState(initialStoreId || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const { addToCart, toggleWishlist, isInWishlist, cart, updateQuantity } = useStore();

  // Update selection if initial props change
  useEffect(() => {
    if (initialCategoryId) setSelectedCategory(initialCategoryId);
    if (initialStoreId) setSelectedShop(initialStoreId);
  }, [initialCategoryId, initialStoreId]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory);
      if (selectedShop !== 'all') params.append('storeId', selectedShop);

      const response = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
      const result = await response.json();

      if (result.data) {
        // Robust normalization
        const normalized = result.data.map(p => ({
          id: p._id,
          name: p.name || p.productName || 'Unnamed Product',
          price: p.price,
          image: p.image || (p.images && p.images[0]) || '/product-placeholder.jpg',
          category: p.categoryName || 'Uncategorized',
          shop: p.storeName || 'Unknown Store',
          rating: p.rating || 4.5,
          stock: p.quantity !== undefined ? p.quantity : 0,
          discount: p.discount || 0,
          originalPrice: p.originalPrice || Math.round(p.price * 1.2)
        }));

        setProducts(normalized);

        // Populate filters if they are empty
        if (result.filters?.categories && result.filters.categories.length > 0) {
          setCategories(result.filters.categories.map(c => ({ id: c._id, name: c.name })));
        }
        if (result.filters?.stores && result.filters.stores.length > 0) {
          setShops(result.filters.stores.map(s => ({ id: s._id, name: s.name })));
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedShop, categories.length, shops.length]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
    }

    return result;
  }, [sortBy, products]);

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error('Item is out of stock');
      return;
    }
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const findQuantity = (productId) => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const handleUpdateQuantity = (productId, delta) => {
    const currentQty = findQuantity(productId);
    updateQuantity(productId, currentQty + delta);
  };

  const handleToggleWishlist = (product) => {
    toggleWishlist(product);
    const isAdded = !isInWishlist(product.id || product._id);
    toast(isAdded ? 'Added to wishlist' : 'Removed from wishlist', {
      icon: isAdded ? '❤️' : '💔',
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-white border-b border-[#E5E5E5]">
        <div className="section-container py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">All Products</h1>
          <p className="text-[#666666] mt-1">
            {filteredProducts.length} products available
          </p>
        </div>
      </div>

      <div className="section-container py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[#1A1A1A]">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="lg:hidden p-2 hover:bg-[#F5F5F5] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-medium text-[#666666] mb-3">Categories</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === 'all'
                      ? 'bg-[#E8F5F1] text-[#006A52] font-medium'
                      : 'text-[#1A1A1A] hover:bg-[#F5F5F5]'
                      }`}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === category.id
                        ? 'bg-[#E8F5F1] text-[#006A52] font-medium'
                        : 'text-[#1A1A1A] hover:bg-[#F5F5F5]'
                        }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#666666] mb-3">Stores</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedShop('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedShop === 'all'
                      ? 'bg-[#E8F5F1] text-[#006A52] font-medium'
                      : 'text-[#1A1A1A] hover:bg-[#F5F5F5]'
                      }`}
                  >
                    All Stores
                  </button>
                  {shops.map((shop) => (
                    <button
                      key={shop.id}
                      onClick={() => setSelectedShop(shop.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedShop === shop.id
                        ? 'bg-[#E8F5F1] text-[#006A52] font-medium'
                        : 'text-[#1A1A1A] hover:bg-[#F5F5F5]'
                        }`}
                    >
                      {shop.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-medium"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[#666666] hidden sm:inline">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none px-4 py-2 pr-10 bg-white rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#006A52]/20"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666] pointer-events-none" />
                </div>
              </div>
            </div>

            {(selectedCategory !== 'all' || selectedShop !== 'all') && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E8F5F1] text-[#006A52] text-sm rounded-full">
                    {categories.find((c) => c.id === selectedCategory)?.name || 'Category'}
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="hover:bg-[#006A52]/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedShop !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#E8F5F1] text-[#006A52] text-sm rounded-full">
                    {shops.find((s) => s.id === selectedShop)?.name || 'Store'}
                    <button
                      onClick={() => setSelectedShop('all')}
                      className="hover:bg-[#006A52]/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl h-[350px] animate-pulse shadow-sm" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                  >
                    <div
                      className="relative aspect-square bg-[#F5F5F5] overflow-hidden cursor-pointer"
                      onClick={() => onNavigate('product-detail', { productId: product.id })}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {product.stock <= 0 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="bg-white/90 text-red-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleWishlist(product);
                        }}
                        className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#FFF3ED] transition-colors"
                      >
                        <Heart
                          className={`w-4 h-4 ${isInWishlist(product.id)
                            ? 'fill-[#E85A24] text-[#E85A24]'
                            : 'text-[#666666]'
                            }`}
                        />
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShoppingBag className="w-3 h-3 text-[#999999]" />
                        <span className="text-xs text-[#999999]">{product.shop}</span>
                      </div>

                      <h3
                        className="font-medium text-[#1A1A1A] line-clamp-2 mb-2 cursor-pointer hover:text-[#006A52] transition-colors"
                        onClick={() => onNavigate('product-detail', { productId: product.id })}
                      >
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-[#006A52]">
                              ₹{product.price}
                            </span>
                          </div>
                        </div>
                        {findQuantity(product.id) > 0 ? (
                          <div className="flex items-center gap-3 bg-[#F5F5F5] rounded-xl p-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQuantity(product.id, -1);
                              }}
                              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-[#E8F5F1] transition-colors shadow-sm"
                            >
                              <Minus className="w-4 h-4 text-[#006A52]" />
                            </button>
                            <span className="w-6 text-center font-bold text-[#1A1A1A]">
                              {findQuantity(product.id)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateQuantity(product.id, 1);
                              }}
                              className="w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:bg-[#E8F5F1] transition-colors shadow-sm"
                            >
                              <Plus className="w-4 h-4 text-[#006A52]" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(product);
                            }}
                            disabled={product.stock <= 0}
                            className={`w-10 h-10 bg-[#006A52] text-white rounded-xl flex items-center justify-center hover:bg-[#00523F] transition-colors hover:scale-105 active:scale-95 ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-[#999999]" />
                </div>
                <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">
                  No products found
                </h3>
                <p className="text-[#666666]">
                  Try adjusting your filters or search query
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
