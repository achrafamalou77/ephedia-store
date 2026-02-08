import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Lock, Truck, MapPin } from 'lucide-react';
import { wilayaRates } from '../data/wilayaRates';
import ProductCard from '../components/ProductCard';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);

    // Checkout State
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        wilayaId: '',
        commune: '',
        deliveryType: 'home' // 'home' or 'stop_desk'
    });

    // Calculated Shipping
    const selectedWilaya = wilayaRates.find(w => w.id === parseInt(formData.wilayaId));
    const shippingPrice = selectedWilaya ? (formData.deliveryType === 'home' ? selectedWilaya.home_price : selectedWilaya.stop_desk_price) : 0;
    const subtotal = getCartTotal();
    const grandTotal = subtotal + shippingPrice;

    useEffect(() => {
        // Fetch random products for "You May Also Like"
        const fetchRelated = async () => {
            const { data } = await supabase.from('products').select('*').limit(10);
            if (data) {
                const shuffled = data.sort(() => 0.5 - Math.random());
                setRelatedProducts(shuffled.slice(0, 4));
            }
        };
        fetchRelated();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cartItems.length === 0) return;
        setLoading(true);

        try {
            // 1. Prepare Order Data
            const productNames = cartItems.map(item => `${item.title} (x${item.quantity})`).join(', ');

            const payload = {
                product_name: productNames,
                product_price: subtotal,
                shipping_price: shippingPrice,
                total_price: grandTotal,
                customer_name: formData.fullName,
                phone: formData.phone,
                wilaya: selectedWilaya?.name || '',
                commune: formData.commune,
                delivery_type: formData.deliveryType,
                status: 'new' // Initial status
            };

            // 2. Insert into Supabase
            const { error } = await supabase
                .from('orders')
                .insert([payload]);

            if (error) throw error;

            // 3. Success Flow
            clearCart();
            navigate('/thank-you');

        } catch (error) {
            console.error("Checkout Error:", error);
            alert("There was an error processing your order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-serif text-navy mb-4">Your Cart is Empty</h2>
                <p className="text-navy/60 mb-8">Looks like you haven't added any items yet.</p>
                <button onClick={() => navigate('/')} className="px-8 py-3 bg-navy text-cream rounded-full font-medium hover:bg-navy/90 transition-colors">
                    Start Shopping
                </button>

                {/* Related Products even if empty */}
                <div className="mt-24 text-left">
                    <h3 className="text-2xl font-serif text-navy mb-8">You May Also Like</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-serif text-navy mb-12">Shopping Cart</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* LEFT COLUMN: Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {cartItems.map(item => (
                        <div key={item.id} className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-navy/5">
                            {/* Image */}
                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                <img src={item.image_url || item.image} alt={item.title} className="w-full h-full object-cover" />
                            </div>

                            {/* Details */}
                            <div className="flex-grow">
                                <h3 className="font-serif text-lg text-navy">{item.title}</h3>
                                <p className="text-navy/60 text-sm mb-2">{item.category}</p>
                                <p className="font-bold text-navy">{item.price} DA</p>
                            </div>

                            {/* Quantity */}
                            <div className="flex items-center gap-3 bg-navy/5 px-3 py-1 rounded-full">
                                <button
                                    onClick={() => updateQuantity(item.id, -1)}
                                    className="p-1 hover:text-navy/70 disabled:opacity-30"
                                    disabled={item.quantity <= 1}
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.id, 1)}
                                    className="p-1 hover:text-navy/70"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            {/* Delete */}
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* RIGHT COLUMN: Checkout Form */}
                <div className="lg:col-span-1">
                    <div className="sticky top-28 bg-cream rounded-2xl overflow-hidden shadow-lg border border-navy/10">
                        <div className="bg-navy p-6 text-center">
                            <h2 className="text-2xl font-serif text-cream">Final Order</h2>
                            <p className="text-cream/60 text-sm mt-1 flex items-center justify-center gap-1">
                                <Lock size={12} /> Secure Checkout
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Personal Info */}
                            <div>
                                <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-1">Full Name</label>
                                <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-navy/10 rounded-lg focus:outline-none focus:border-navy transition-colors text-navy" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-1">Phone Number</label>
                                <input required type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-navy/10 rounded-lg focus:outline-none focus:border-navy transition-colors text-navy" placeholder="05 XX XX XX XX" />
                            </div>

                            {/* Shipping Location */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-1">Wilaya</label>
                                    <select required name="wilayaId" value={formData.wilayaId} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-navy/10 rounded-lg focus:outline-none focus:border-navy transition-colors text-navy appearance-none">
                                        <option value="">Select...</option>
                                        {wilayaRates.map(w => (
                                            <option key={w.id} value={w.id}>{w.id} - {w.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-1">Commune</label>
                                    <input required type="text" name="commune" value={formData.commune} onChange={handleInputChange} className="w-full px-4 py-3 bg-white border border-navy/10 rounded-lg focus:outline-none focus:border-navy transition-colors text-navy" placeholder="City" />
                                </div>
                            </div>

                            {/* Delivery Type */}
                            <div className="space-y-2 pt-2">
                                <label className="block text-xs font-bold text-navy/70 uppercase tracking-wider mb-1">Delivery Method</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${formData.deliveryType === 'home' ? 'border-navy bg-navy/5 text-navy' : 'border-navy/10 text-navy/50 hover:border-navy/30'}`}>
                                        <input type="radio" name="deliveryType" value="home" checked={formData.deliveryType === 'home'} onChange={handleInputChange} className="hidden" />
                                        <Truck size={20} />
                                        <span className="text-xs font-bold">Home</span>
                                    </label>
                                    <label className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition-all ${formData.deliveryType === 'stop_desk' ? 'border-navy bg-navy/5 text-navy' : 'border-navy/10 text-navy/50 hover:border-navy/30'}`}>
                                        <input type="radio" name="deliveryType" value="stop_desk" checked={formData.deliveryType === 'stop_desk'} onChange={handleInputChange} className="hidden" />
                                        <MapPin size={20} />
                                        <span className="text-xs font-bold">Office</span>
                                    </label>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="border-t border-navy/10 pt-4 mt-6 space-y-2">
                                <div className="flex justify-between text-navy/60 text-sm">
                                    <span>Subtotal</span>
                                    <span>{subtotal.toFixed(2)} DA</span>
                                </div>
                                <div className="flex justify-between text-navy/60 text-sm">
                                    <span>Shipping</span>
                                    <span>{shippingPrice.toFixed(2)} DA</span>
                                </div>
                                <div className="flex justify-between text-navy font-bold text-xl pt-2 border-t border-navy/5">
                                    <span>Total</span>
                                    <span>{grandTotal.toFixed(2)} DA</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-navy text-cream py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-navy/90 transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                {loading ? 'Processing...' : 'Confirm Order'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Cross Selling */}
            <div className="mt-24 pt-12 border-t border-navy/10">
                <h3 className="text-2xl font-serif text-navy mb-8 text-center">You May Also Like</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
            </div>
        </div>
    );
};

export default CartPage;
