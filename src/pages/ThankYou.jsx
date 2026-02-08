import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const ThankYou = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in-up">
            <div className="bg-green-100 p-6 rounded-full text-green-700 mb-6">
                <CheckCircle size={64} strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-navy mb-4">Thank You!</h1>
            <p className="text-xl text-navy/80 max-w-lg mb-2">
                Your order has been received successfully.
            </p>
            <p className="text-navy/60 mb-10 text-lg">
                We will contact you shortly to confirm delivery.
            </p>
            <Link
                to="/"
                className="bg-navy text-cream px-10 py-4 rounded-full hover:bg-navy/90 transition-all shadow-lg hover:shadow-xl active:scale-95 uppercase tracking-widest text-sm font-medium"
            >
                Continue Shopping
            </Link>
        </div>
    );
};

export default ThankYou;
