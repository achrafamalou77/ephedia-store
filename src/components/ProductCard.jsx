import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    return (
        <Link to={`/product/${product.id}`} className="group cursor-pointer flex flex-col h-full">
            <div className="relative overflow-hidden aspect-[4/5] bg-gray-100 mb-4 rounded-3xl shadow-sm">
                <img
                    src={product.image_url || product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-navy/0 group-hover:bg-navy/10 transition-colors duration-300"></div>
            </div>
            <div className="text-center space-y-2 flex-grow flex flex-col justify-between">
                <div>
                    <h3 className="font-serif text-lg text-navy font-medium">{product.title}</h3>
                    <p className="font-sans text-sm text-navy/60 uppercase tracking-wide">{product.category}</p>
                    <p className="font-sans font-semibold text-navy mt-1 text-lg">{product.price} DA</p>
                </div>
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        addToCart(product);
                        // Optional feedback
                        const btn = e.currentTarget;
                        const originalText = btn.innerText;
                        btn.innerText = "Added!";
                        btn.classList.add("bg-green-700", "text-white");
                        setTimeout(() => {
                            btn.innerText = originalText;
                            btn.classList.remove("bg-green-700", "text-white");
                        }, 1000);
                    }}
                    className="w-full mt-3 bg-navy text-cream py-3 rounded-full font-medium hover:bg-navy/90 transition-all shadow-md active:scale-95"
                >
                    Add to Cart
                </button>
            </div>
        </Link>
    );
};

export default ProductCard;
