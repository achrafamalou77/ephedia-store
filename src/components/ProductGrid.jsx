import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { supabase } from '../lib/supabaseClient';

const ProductGrid = () => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setProducts(data || []);
            } catch (err) {
                console.error('Error fetching products:', err);
                setError('Unable to load products. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const categories = ['All', ...new Set(products.map(product => product.category).filter(Boolean))];
    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(product => product.category === selectedCategory);

    return (
        <section className="py-20 px-4 md:px-8 bg-cream">
            <div id="products" className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-serif text-navy mb-4">Latest Collection</h2>
                <div className="w-24 h-px bg-navy/20 mx-auto"></div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-12 max-w-4xl mx-auto px-4">
                {categories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${selectedCategory === category
                                ? 'bg-navy text-white border-navy shadow-md'
                                : 'bg-white text-navy/60 border-navy/10 hover:border-navy/30 hover:bg-navy/[0.02]'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy"></div>
                </div>
            ) : error ? (
                <div className="text-center py-20 text-navy/60">
                    <p>{error}</p>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 text-navy/60">
                    <p className="text-xl font-serif">No products found.</p>
                    <p className="text-sm mt-2">Check back soon for our new collection.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12 max-w-7xl mx-auto">
                    {filteredProducts.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default ProductGrid;
