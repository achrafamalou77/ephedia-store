import React, { useState, useEffect } from 'react';
import { X, Search, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Load recently viewed from localStorage
            const saved = localStorage.getItem('recentlyViewed');
            if (saved) {
                setRecentlyViewed(JSON.parse(saved));
            }
            // Focus input logic could go here if using a ref
        }
    }, [isOpen]);

    useEffect(() => {
        const fetchResults = async () => {
            if (query.length > 2) {
                setLoading(true);
                const { data, error } = await supabase
                    .from('products')
                    .select('id, title, price, image_url, category')
                    .ilike('title', `%${query}%`)
                    .limit(6);

                if (!error && data) {
                    setResults(data);
                }
                setLoading(false);
            } else {
                setResults([]);
            }
        };

        const timeoutId = setTimeout(fetchResults, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start pt-20 px-4">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in-up">

                {/* Header / Input */}
                <div className="flex items-center p-4 border-b border-gray-100">
                    <Search className="text-gray-400 w-6 h-6 ml-2" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="flex-1 text-xl px-4 py-2 focus:outline-none text-navy placeholder-gray-300 font-sans"
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="text-gray-500 w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 bg-gray-50/50 min-h-[300px] max-h-[70vh] overflow-y-auto">

                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Searching...</div>
                    ) : query.length > 0 ? (
                        /* Search Results */
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Search Results</h3>

                            {results.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {results.map(product => (
                                        <Link
                                            key={product.id}
                                            to={`/product/${product.id}`}
                                            onClick={onClose}
                                            className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100 hover:border-navy/20 hover:shadow-md transition-all group"
                                        >
                                            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img
                                                    src={product.image_url || "https://placehold.co/100"}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-serif text-navy font-medium group-hover:text-amber-700 transition-colors line-clamp-1">{product.title}</h4>
                                                <p className="text-sm text-gray-500">{product.price} DA</p>
                                            </div>
                                            <ArrowRight size={16} className="text-gray-300 group-hover:text-navy opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400">No products found matching "{query}"</div>
                            )}
                        </div>
                    ) : (
                        /* Recently Viewed */
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Clock size={14} /> Recently Viewed
                            </h3>

                            {recentlyViewed.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {recentlyViewed.map(item => (
                                        <Link
                                            key={item.id}
                                            to={`/product/${item.id}`}
                                            onClick={onClose}
                                            className="group bg-white p-3 rounded-lg border border-gray-100 hover:shadow-md transition-all text-center block"
                                        >
                                            <div className="aspect-[4/5] rounded-md overflow-hidden bg-gray-100 mb-3 relative">
                                                <img
                                                    src={item.image_url || "https://placehold.co/200"}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                                            </div>
                                            <div className="text-xs font-medium text-navy truncate px-1">{item.title}</div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-gray-400 text-sm">No recent history</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchModal;
