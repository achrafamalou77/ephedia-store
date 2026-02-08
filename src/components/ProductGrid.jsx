import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { supabase } from '../lib/supabaseClient';

const ProductGrid = () => {
    const [products, setProducts] = useState([]);
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

    return (
        <section className="py-20 px-4 md:px-8 bg-cream">
            <div id="products" className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif text-navy mb-4">Latest Collection</h2>
                <div className="w-24 h-px bg-navy/20 mx-auto"></div>
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
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </section>
    );
};

export default ProductGrid;
