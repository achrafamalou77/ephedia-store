import React from 'react';

const HERO_IMAGE_URL = "/banner.png";

const Hero = () => {
    return (
        <div className="relative h-[70vh] w-full flex items-center justify-center bg-navy text-cream overflow-hidden">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 bg-black/40 z-10"></div>

            <img
                src={HERO_IMAGE_URL}
                alt="Ephedia Jewelry"
                className="absolute inset-0 w-full h-full object-cover opacity-90"
            />

            <div className="relative z-20 text-center space-y-6 px-4 animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-serif tracking-wider mb-4 drop-shadow-md">
                    Ephedia Store
                </h1>
                <p className="text-lg md:text-xl font-light tracking-widest uppercase opacity-95 max-w-2xl mx-auto drop-shadow-sm">
                    Timeless Elegance & Artistic Soul
                </p>

                {/* CHANGED: Button is now an Link (<a>) pointing to #products */}
                <a
                    href="#products"
                    className="mt-8 px-10 py-4 border border-cream bg-cream/10 backdrop-blur-sm text-cream hover:bg-cream hover:text-navy transition-all duration-300 uppercase tracking-widest text-sm font-medium rounded-full inline-block cursor-pointer"
                >
                    Shop Now
                </a>
            </div>
        </div>
    );
};

export default Hero;