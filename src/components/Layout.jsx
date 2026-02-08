import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-cream text-navy font-sans selection:bg-navy/20">
            <Navbar />
            <main className="flex-grow animate-fade-in w-full">
                {children}
            </main>
            <footer className="py-8 text-center text-navy/40 text-sm font-serif border-t border-navy/5 mt-12">
                &copy; {new Date().getFullYear()} Ephedia Store. All rights reserved.
            </footer>
        </div>
    );
};

export default Layout;
