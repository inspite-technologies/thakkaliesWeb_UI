import { useState, useEffect } from 'react';
import {
  Search,
  Heart,
  ShoppingCart,
  Bell,
  MapPin,
  ChevronDown,
  User,
  Menu,
  X,
  Leaf
} from 'lucide-react';
import { useStore } from '../context/StoreContext.jsx';
import { Input } from './ui/input.jsx';
import { Button } from './ui/button.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu.jsx';

export default function Navigation({ onNavigate, currentPage }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount, wishlist, isLoggedIn, deliveryLocation, setDeliveryLocation } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('products');
    }
  };

  const navLinks = [
    { label: 'Home', page: 'home' },
    { label: 'Products', page: 'products' },
    { label: 'Orders', page: 'orders' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
          ? 'glass-nav shadow-lg shadow-black/5'
          : 'bg-white'
        }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between h-20">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 bg-[#006A52] rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1A1A1A]">Thakkalies</span>
          </button>

          <div className="hidden lg:flex items-center gap-2 ml-8">
            <MapPin className="w-4 h-4 text-[#006A52]" />
            <span className="text-sm text-[#666666]">Deliver to</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 text-sm font-medium text-[#1A1A1A] hover:text-[#006A52] transition-colors">
                  {deliveryLocation}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => setDeliveryLocation('Infopark, Kochi')}>
                  Infopark, Kochi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeliveryLocation('MG Road, Kochi')}>
                  MG Road, Kochi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeliveryLocation('Edappally, Kochi')}>
                  Edappally, Kochi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-8"
          >
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999] transition-colors group-focus-within:text-[#006A52]" />
              <Input
                type="text"
                placeholder="Search for pickles, chutneys, dry fruits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 h-12 bg-[#F5F5F5] border-none rounded-xl focus:ring-2 focus:ring-[#006A52]/20 focus:bg-white transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#006A52] text-white rounded-lg hover:bg-[#00523F] transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="hidden md:flex relative p-2.5 text-[#666666] hover:text-[#006A52] hover:bg-[#E8F5F1] rounded-xl transition-all duration-300">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E85A24] rounded-full"></span>
            </button>

            <button
              onClick={() => onNavigate('wishlist')}
              className="relative p-2.5 text-[#666666] hover:text-[#006A52] hover:bg-[#E8F5F1] rounded-xl transition-all duration-300"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#006A52] text-white text-xs font-medium rounded-full flex items-center justify-center animate-scale-in">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('cart')}
              className="relative p-2.5 text-[#666666] hover:text-[#006A52] hover:bg-[#E8F5F1] rounded-xl transition-all duration-300"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#006A52] text-white text-xs font-medium rounded-full flex items-center justify-center animate-scale-in">
                  {cartCount}
                </span>
              )}
            </button>

            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden md:flex items-center gap-2 p-2 hover:bg-[#F5F5F5] rounded-xl transition-colors">
                    <div className="w-9 h-9 bg-[#E8F5F1] rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-[#006A52]" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onNavigate('profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('orders')}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('addresses')}>
                    Saved Addresses
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('rewards')}>
                    Rewards
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('refer-earn')}>
                    Refer & Earn
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => onNavigate('login')}
                className="hidden md:flex btn-primary"
              >
                Login
              </Button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 text-[#666666] hover:text-[#006A52] hover:bg-[#E8F5F1] rounded-xl transition-all duration-300"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#999999]" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 h-12 bg-[#F5F5F5] border-none rounded-xl"
            />
          </div>
        </form>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E5E5] animate-slide-up">
          <div className="section-container py-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.page}
                  onClick={() => {
                    onNavigate(link.page);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`px-4 py-3 text-left rounded-xl transition-colors ${currentPage === link.page
                      ? 'bg-[#E8F5F1] text-[#006A52] font-medium'
                      : 'text-[#1A1A1A] hover:bg-[#F5F5F5]'
                    }`}
                >
                  {link.label}
                </button>
              ))}
              {!isLoggedIn && (
                <Button
                  onClick={() => {
                    onNavigate('login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn-primary mt-2"
                >
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
