import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

const Login = () => {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === 'ephedia2026') {
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/admin');
        } else {
            alert('Incorrect Admin Code');
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-cream px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-navy/5 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-navy/5 rounded-full mb-6">
                    <Lock className="text-navy" size={24} />
                </div>
                <h1 className="text-2xl font-serif text-navy mb-2">Admin Access</h1>
                <p className="text-navy/60 text-sm mb-8">Please enter the security code to continue.</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Admin Code"
                        className="w-full px-4 py-3 bg-cream/30 border border-navy/10 rounded-lg focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all text-center placeholder:text-navy/30"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="w-full bg-navy text-cream py-3 rounded-lg font-medium hover:bg-navy/90 transition-all uppercase tracking-wide text-sm"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
