import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { wilayaRates } from '../data/wilayaRates';
import { Truck, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        instagram: '',
        phone: '',
        commune: '',
        wilayaId: '',
        deliveryType: 'home' // 'home' or 'stopdesk'
    });

    // Calculated State
    const [shippingPrice, setShippingPrice] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    const [selectedImage, setSelectedImage] = useState(null);

    // Fetch Product & Related
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Current Product
                const { data: productData, error: productError } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (productError) throw productError;
                setProduct(productData);
                setSelectedImage(productData.image_url || productData.image);
                if (productData) setTotalPrice(productData.price);

                // Fetch Related Products (Random 4 excluding current)
                const { data: relatedData, error: relatedError } = await supabase
                    .from('products')
                    .select('id, title, price, image_url, category')
                    .neq('id', id)
                    .limit(10);

                if (!relatedError && relatedData) {
                    console.log("Related Items:", relatedData);
                    const shuffled = relatedData.sort(() => 0.5 - Math.random());
                    setRelatedProducts(shuffled.slice(0, 4));
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Reset Form when ID changes
        setFormData({
            fullName: '',
            instagram: '',
            phone: '',
            commune: '',
            wilayaId: '',
            deliveryType: 'home'
        });
        setShippingPrice(0);
        window.scrollTo(0, 0);
    }, [id]);

    // Recalculate Logic
    useEffect(() => {
        if (!formData.wilayaId) {
            setShippingPrice(0);
            if (product) setTotalPrice(product.price);
            return;
        }

        const selectedRate = wilayaRates.find(w => w.id === parseInt(formData.wilayaId));
        if (!selectedRate) return;

        let price = 0;
        if (formData.deliveryType === 'home') {
            price = selectedRate.home;
        } else if (formData.deliveryType === 'stopdesk') {
            price = selectedRate.stopdesk || 0; // fallback if null, though disabled in UI
        }

        setShippingPrice(price);
        if (product) setTotalPrice(product.price + price);

    }, [formData.wilayaId, formData.deliveryType, product]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Reset to home delivery if stopdesk is not available for new wilaya
        if (name === 'wilayaId') {
            const rate = wilayaRates.find(r => r.id === parseInt(value));
            if (rate && rate.stopdesk === null && formData.deliveryType === 'stopdesk') {
                setFormData(prev => ({ ...prev, deliveryType: 'home', [name]: value }));
            }
        }
    };

    const isStopdeskDisabled = () => {
        if (!formData.wilayaId) return false;
        const rate = wilayaRates.find(r => r.id === parseInt(formData.wilayaId));
        return rate ? rate.stopdesk === null : false;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!product) return;

        try {
            const payload = {
                product_name: product.title,
                product_price: Number(product.price),
                shipping_price: Number(shippingPrice),
                total_price: Number(totalPrice),
                customer_name: formData.fullName,
                instagram: formData.instagram,
                phone: formData.phone,
                wilaya: wilayaRates.find(w => w.id === parseInt(formData.wilayaId))?.name || '',
                commune: formData.commune,
                delivery_type: formData.deliveryType,
                status: 'pending'
            };

            const { error } = await supabase
                .from('orders')
                .insert([payload]);

            if (error) throw error;

            navigate('/thank-you');

        } catch (error) {
            console.error("Error submitting order:", error);
            alert(`Sorry, there was an issue processing your order: ${error.message || 'Unknown error'}`);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-navy font-serif text-xl">Loading Product...</div>;
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center text-navy">Product not found. <Link to="/" className="ml-2 underline">Go Home</Link></div>;
    }

    // Prepare Gallery Images
    const mainImage = product.image_url || product.image;
    const gallery = product.gallery_urls || [];
    const allImages = [mainImage, ...gallery].filter(Boolean);


    return (
        <>
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-16">
                <Link to="/" className="inline-flex items-center text-navy/60 hover:text-navy mb-8 transition-colors">
                    <ArrowLeft size={20} className="mr-2" /> Back to Shop
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                    {/* Left Column: Product Image & Gallery */}
                    <div className="sticky top-24">
                        <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-lg bg-gray-100 mb-4 transition-all duration-300">
                            <img
                                src={selectedImage || mainImage}
                                alt={product.title}
                                className="w-full h-full object-cover animate-fade-in"
                            />
                        </div>

                        {/* Thumbnail Gallery */}
                        {allImages.length > 1 && (
                            <div className="grid grid-cols-5 gap-3">
                                {allImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(img)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-navy opacity-100 hover:opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="mt-8 text-center lg:text-left hidden lg:block">
                            <h1 className="text-3xl font-serif text-navy mb-2">{product.title}</h1>
                            <p className="text-2xl font-sans font-medium text-navy/80">{product.price} DA</p>
                        </div>
                    </div>

                    {/* Right Column: Order Form */}
                    <div className="relative md:sticky md:top-24 h-fit z-10 bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-navy/5">
                        <div className="lg:hidden mb-8 text-center">
                            <h1 className="text-3xl font-serif text-navy mb-2">{product.title}</h1>
                            <p className="text-2xl font-sans font-medium text-navy/80">{product.price} DA</p>
                        </div>

                        <h2 className="text-xl font-serif text-navy mb-6 pb-4 border-b border-navy/10 flex items-center gap-2">
                            <Truck size={20} /> Finalize Your Order
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-navy/70 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-cream/30 border border-navy/10 rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-navy/70 mb-1">Phone Number <span className="text-red-500">*</span></label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-cream/30 border border-navy/10 rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                                        placeholder="05 XX XX XX XX"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-navy/70 mb-1">Instagram (@username) <span className="text-xs text-navy/40 font-normal opacity-70">- Optional</span></label>
                                    <input
                                        type="text"
                                        name="instagram"
                                        value={formData.instagram}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-cream/30 border border-navy/10 rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                                        placeholder="@..."
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-sm font-bold text-navy uppercase tracking-wide flex items-center gap-2">
                                    <MapPin size={16} /> Shipping Address
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-navy/70 mb-1">Wilaya</label>
                                        <select
                                            name="wilayaId"
                                            value={formData.wilayaId}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-cream/30 border border-navy/10 rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                                        >
                                            <option value="">Select Wilaya</option>
                                            {wilayaRates.map(wilaya => (
                                                <option key={wilaya.id} value={wilaya.id}>
                                                    {wilaya.id} - {wilaya.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-navy/70 mb-1">Commune</label>
                                        <input
                                            type="text"
                                            name="commune"
                                            value={formData.commune}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 bg-cream/30 border border-navy/10 rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                                            placeholder="City / Commune"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Method */}
                            <div className="space-y-3 pt-2">
                                <label className="block text-sm font-medium text-navy/70">Delivery Method</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <label
                                        className={`relative flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.deliveryType === 'home'
                                            ? 'border-navy bg-navy/5'
                                            : 'border-navy/10 hover:border-navy/30'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="deliveryType"
                                            value="home"
                                            checked={formData.deliveryType === 'home'}
                                            onChange={handleInputChange}
                                            className="text-navy focus:ring-navy"
                                        />
                                        <div className="ml-3">
                                            <span className="block text-sm font-semibold text-navy">Home Delivery</span>
                                            <span className="block text-xs text-navy/60">A Domicile</span>
                                        </div>
                                    </label>

                                    <label
                                        className={`relative flex items-center p-4 border rounded-xl transition-all ${isStopdeskDisabled()
                                            ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100'
                                            : formData.deliveryType === 'stopdesk'
                                                ? 'border-navy bg-navy/5 cursor-pointer'
                                                : 'border-navy/10 hover:border-navy/30 cursor-pointer'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="deliveryType"
                                            value="stopdesk"
                                            checked={formData.deliveryType === 'stopdesk'}
                                            onChange={handleInputChange}
                                            disabled={isStopdeskDisabled()}
                                            className="text-navy focus:ring-navy disabled:opacity-50"
                                        />
                                        <div className="ml-3">
                                            <span className={`block text-sm font-semibold ${isStopdeskDisabled() ? 'text-gray-400' : 'text-navy'}`}>Office Pickup</span>
                                            <span className={`block text-xs ${isStopdeskDisabled() ? 'text-gray-400' : 'text-navy/60'}`}>Stop Desk</span>
                                        </div>
                                        {isStopdeskDisabled() && (
                                            <span className="absolute top-2 right-2 text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Unavailable</span>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-navy/5 p-6 rounded-xl space-y-3 mt-6">
                                <div className="flex justify-between text-sm text-navy/70">
                                    <span>Product Price</span>
                                    <span>{product.price} DA</span>
                                </div>
                                <div className="flex justify-between text-sm text-navy/70">
                                    <span>Shipping ({formData.deliveryType === 'home' ? 'Home' : 'Stop Desk'})</span>
                                    <span>{formData.wilayaId ? `+ ${shippingPrice} DA` : '--'}</span>
                                </div>
                                <div className="border-t border-navy/10 pt-3 flex justify-between items-center">
                                    <span className="font-serif text-lg text-navy">Total</span>
                                    <span className="font-bold text-2xl text-navy underline decoration-wavy decoration-navy/30 underline-offset-4">
                                        {totalPrice} DA
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-navy text-cream py-4 rounded-full font-medium text-lg hover:bg-navy/90 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={!formData.wilayaId || !formData.phone || !formData.fullName}
                            >
                                Confirm Order - Cash on Delivery
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Related Products Section */}
            {
                relatedProducts.length > 0 && (
                    <div className="border-t border-navy/10 pt-16 mb-20">
                        <h2 className="text-3xl font-serif text-navy mb-10 text-center">You May Also Like</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
                            {relatedProducts.map(newItem => (
                                <Link to={`/product/${newItem.id}`} key={newItem.id} className="group cursor-pointer flex flex-col h-full">
                                    <div className="relative overflow-hidden aspect-[4/5] bg-gray-100 mb-4 rounded-3xl shadow-sm">
                                        <img
                                            src={newItem.image_url || newItem.image || "https://placehold.co/400"}
                                            alt={newItem.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 transition-colors duration-300"></div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="font-serif text-lg text-navy font-medium line-clamp-1">{newItem.title}</h3>
                                        <p className="font-sans font-semibold text-navy">{newItem.price} DA</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default ProductPage;

