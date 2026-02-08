import React, { useState } from 'react';
import { ShoppingCart, Search, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

import SearchModal from './SearchModal';

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

    const LOGO_URL = "https://hlmpdrzntwhlbijqttvr.supabase.co/storage/v1/object/public/website-assets/Adobe%20Express%20-%20file.png";

    return (
        <>
            <nav className="flex justify-between items-center h-16 px-4 md:px-8 border-b border-white/10 bg-navy sticky top-0 z-50 shadow-md">
                <div className="flex items-center space-x-8">
                    <Link to="/" className="flex items-center gap-3">
                        {/* Logo Slot */}
                        <img
                            src={LOGO_URL}
                            alt="Ephedia"
                            className="h-12 w-auto object-contain"
                            loading="eager"
                            fetchpriority="high"
                        />
                    </Link>
                    <div className="hidden md:flex space-x-6 text-cream/80 hover:text-cream transition-colors">
                        <Link to="/" className="font-sans font-medium text-sm tracking-wide hover:underline decoration-1 underline-offset-4">SHOP</Link>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Search Trigger */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className="text-cream hover:text-cream/80 transition-transform hover:scale-105"
                    >
                        <Search size={18} />
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

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
};

export default Navbar;
