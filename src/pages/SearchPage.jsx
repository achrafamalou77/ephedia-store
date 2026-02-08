import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                if (!query) {
                    setProducts([]);
                    return;
                }

                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .ilike('title', `%${query}%`);

                if (error) throw error;
                setProducts(data || []);
            } catch (error) {
                console.error("Error searching products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 min-h-[60vh]">
            <h1 className="text-3xl font-serif text-navy mb-8 border-b border-navy/10 pb-4 flex items-center gap-3">
                <Search className="text-navy/50" />
                <span>Search Results for "{query}"</span>
            </h1>

            {loading ? (
                <div className="text-center py-20 text-navy/50">Searching...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-xl text-navy/60">No products found matching "{query}"</p>
                    <p className="text-navy/40 mt-2">Try checking for typos or using different keywords.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
