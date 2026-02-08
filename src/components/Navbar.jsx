import React, { useState } from 'react';
import { ShoppingCart, Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { getCartCount } = useCart();
    const navigate = useNavigate();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <nav className="flex justify-between items-center h-16 px-4 md:px-8 border-b border-white/10 bg-navy sticky top-0 z-50 shadow-md">
            <div className="flex items-center space-x-8">
                <Link to="/" className="flex items-center gap-3">
                    {/* Logo Slot */}
                    <img src="/header-logo.png" alt="Ephedia Store" className="h-12 w-auto object-contain" loading="eager" fetchpriority="high" />
                </Link>
                <div className="hidden md:flex space-x-6 text-cream/80 hover:text-cream transition-colors">
                    <Link to="/" className="font-sans font-medium text-sm tracking-wide hover:underline decoration-1 underline-offset-4">SHOP</Link>
                </div>
            </div>

            <div className="flex items-center space-x-4">

                {/* Search Input Transition */}
                <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-48 md:w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                        className="bg-navy-light/10 border-b border-cream/30 text-cream placeholder-cream/50 focus:outline-none focus:border-cream w-full py-1 text-sm bg-transparent"
                    />
                </div>

                {/* Search Toggle */}
                <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="text-cream hover:text-cream/80 transition-transform hover:scale-105"
                >
                    {isSearchOpen ? <X size={18} /> : <Search size={18} />}
                </button>

                {/* Cart Icon */}
                <Link to="/cart" className="text-cream hover:text-cream/80 transition-transform hover:scale-105 relative">
                    <ShoppingCart size={18} strokeWidth={1.5} />
                    {getCartCount() > 0 && (
                        <span className="absolute -top-2 -right-2 bg-cream text-navy text-[10px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                            {getCartCount()}
                        </span>
                    )}
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;
