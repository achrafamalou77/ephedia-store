import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trash2, Plus } from 'lucide-react';
import AdminOrders from './AdminOrders';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newProduct, setNewProduct] = useState({
        title: '',
        price: '',
        category: '',
        image: '',
        gallery: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newProduct.title || !newProduct.price) return;

        try {
            // Split gallery string into array and trim whitespace
            const galleryUrls = newProduct.gallery
                ? newProduct.gallery.split(',').map(url => url.trim()).filter(url => url)
                : [];

            const { data, error } = await supabase
                .from('products')
                .insert([
                    {
                        title: newProduct.title,
                        price: parseFloat(newProduct.price),
                        category: newProduct.category,
                        image_url: newProduct.image,
                        gallery_urls: galleryUrls
                    }
                ])
                .select();

            if (error) throw error;

            setProducts([data[0], ...products]);
            setNewProduct({ title: '', price: '', category: '', image: '', gallery: '' });
            alert('Product added successfully!');
        } catch (error) {
            console.error('Error adding product:', error);
            alert(`Error adding product: ${error.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-12 px-4">
            <h1 className="text-3xl font-serif text-navy mb-8 border-b border-navy/10 pb-4">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-2 rounded-full text-base font-medium transition-colors ${activeTab === 'products'
                        ? 'bg-navy text-cream shadow-md'
                        : 'bg-navy/5 text-navy/70 hover:bg-navy/10'
                        }`}
                >
                    Products
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-6 py-2 rounded-full text-base font-medium transition-colors ${activeTab === 'orders'
                        ? 'bg-navy text-cream shadow-md'
                        : 'bg-navy/5 text-navy/70 hover:bg-navy/10'
                        }`}
                >
                    Orders
                </button>
            </div>

            {/* Content Area */}
            {activeTab === 'products' ? (
                <div className="animate-fade-in">
                    {/* Add Product Form */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-navy/5 mb-12">
                        <h2 className="text-xl font-serif text-navy mb-6 flex items-center gap-2">
                            <Plus size={20} /> Add New Product
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-navy/70 mb-1">Product Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={newProduct.title}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-navy/20 focus:outline-none focus:border-navy rounded-sm"
                                    placeholder="e.g. Vintage Gold Ring"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy/70 mb-1">Price (DA)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={newProduct.price}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-navy/20 focus:outline-none focus:border-navy rounded-sm"
                                    placeholder="e.g. 1200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy/70 mb-1">Category</label>
                                <select
                                    name="category"
                                    value={newProduct.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-navy/20 focus:outline-none focus:border-navy rounded-sm"
                                >
                                    <option value="">Select Category</option>
                                    <option value="Rings">Rings</option>
                                    <option value="Necklaces">Necklaces</option>
                                    <option value="Earrings">Earrings</option>
                                    <option value="Bracelets">Bracelets</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-navy/70 mb-1">Image URL</label>
                                <input
                                    type="url"
                                    name="image"
                                    value={newProduct.image}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-navy/20 focus:outline-none focus:border-navy rounded-sm"
                                    placeholder="https://full-image-url.com..."
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-navy/70 mb-1">Additional Images (Gallery)</label>
                                <textarea
                                    name="gallery"
                                    value={newProduct.gallery}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-navy/20 focus:outline-none focus:border-navy rounded-sm text-sm"
                                    placeholder="Paste multiple image links separated by commas..."
                                    rows="2"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    className="bg-navy text-cream px-8 py-3 w-full hover:bg-navy/90 transition-colors uppercase tracking-widest text-sm font-medium"
                                >
                                    Add Product
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Product List */}
                    <div>
                        <h2 className="text-xl font-serif text-navy mb-6">Inventory ({products.length})</h2>
                        {loading ? (
                            <p className="text-navy/50">Loading inventory...</p>
                        ) : products.length === 0 ? (
                            <p className="text-navy/50 italic">No products in inventory yet.</p>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-navy/5 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-navy/5 text-navy/70 uppercase text-xs tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Image</th>
                                            <th className="px-6 py-4 font-medium">Product</th>
                                            <th className="px-6 py-4 font-medium">Category</th>
                                            <th className="px-6 py-4 font-medium">Price</th>
                                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-navy/5">
                                        {products.map((product) => (
                                            <tr key={product.id} className="hover:bg-navy/[0.02]">
                                                <td className="px-6 py-4">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-sm overflow-hidden">
                                                        {(product.image || product.image_url) && (
                                                            <img src={product.image_url || product.image} alt={product.title} className="w-full h-full object-cover" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-navy">{product.title}</td>
                                                <td className="px-6 py-4 text-navy/70">{product.category}</td>
                                                <td className="px-6 py-4 text-navy">{product.price} DA</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="text-red-800 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <AdminOrders />
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
