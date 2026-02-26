import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Package, Phone, MapPin, Calendar, CheckCircle, XCircle, Clock, Trash2, Truck } from 'lucide-react';
import { createDeliveryOrder } from '../lib/ecotrack';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setOrders(orders.map(order =>
                order.id === id ? { ...order, status: newStatus } : order
            ));
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Could not update status');
        }
    };

    const handleConfirmAndShip = async (order) => {
        if (!window.confirm('Confirm and Send this order to Ecotrack?')) return;

        try {
            // 1. Send to Ecotrack
            await createDeliveryOrder(order);

            // 2. Update status in Supabase
            const { error } = await supabase
                .from('orders')
                .update({ status: 'shipped' })
                .eq('id', order.id);

            if (error) throw error;

            // 3. Update local state
            setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'shipped' } : o));

            alert("Success! Parcel sent to Ecotrack and status updated to Shipped.");
        } catch (error) {
            console.error("Ecotrack Error:", error);
            alert("Ecotrack Error: " + (error.message || "Unknown error occurred"));
        }
    };

    const deleteOrder = async (id) => {
        if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

        try {
            const { error } = await supabase
                .from('orders')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setOrders(orders.filter(order => order.id !== id));
        } catch (error) {
            console.error('Error deleting order:', error);
            alert('Could not delete order');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'shipped': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Truck size={14} className="mr-1" /> Shipped</span>;
            case 'confirmed': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={14} className="mr-1" /> Confirmed</span>;
            case 'cancelled': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={14} className="mr-1" /> Cancelled</span>;
            case 'pending':
            default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={14} className="mr-1" /> Pending</span>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <h2 className="text-2xl font-serif text-navy mb-6 flex justify-between items-center">
                <span>Incoming Orders</span>
                <span className="text-sm font-sans font-normal text-navy/50 bg-navy/5 px-4 py-2 rounded-full">Total: {orders.length}</span>
            </h2>

            {loading ? (
                <div className="text-center py-20 text-navy/50">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-navy/5">
                    <Package size={48} className="mx-auto text-navy/20 mb-4" />
                    <p className="text-navy/60">No orders received yet.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white rounded-xl shadow-lg border border-navy/10 overflow-hidden hover:border-navy/20 transition-all duration-300">

                            {/* Card Header: ID & Status */}
                            <div className="bg-navy/5 px-6 py-3 flex justify-between items-center border-b border-navy/5">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-navy/40 uppercase tracking-widest">Order #{order.id.toString().slice(0, 8)}...</span>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-navy/50 flex items-center gap-1 font-medium">
                                        <Calendar size={12} /> {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={() => deleteOrder(order.id)}
                                        className="text-red-300 hover:text-red-500 transition-colors p-1"
                                        title="Delete Order"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                                    {/* Column 1: Customer Info */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em]">Customer Profile</h4>
                                        <div className="space-y-1.5">
                                            <p className="text-xl font-serif text-navy font-semibold">{order.customer_name || 'N/A'}</p>
                                            <p className="flex items-center gap-2 text-navy/70 font-medium">
                                                <Phone size={14} className="text-navy/30" /> {order.phone}
                                            </p>
                                            {order.instagram && (
                                                <p className="text-sm text-pink-600 font-medium flex items-center gap-2">
                                                    <span className="w-4 h-4 rounded-full bg-pink-100 flex items-center justify-center text-[10px]">IG</span>
                                                    @{order.instagram.replace('@', '')}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Column 2: Shipping & Logistics */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em]">Deployment & Logistics</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2 text-navy/80">
                                                <MapPin size={14} className="text-navy/30 mt-1 shrink-0" />
                                                <div>
                                                    <p className="font-semibold leading-tight">{order.wilaya}</p>
                                                    <p className="text-sm text-navy/60">{order.commune}</p>
                                                </div>
                                            </div>
                                            <div className="pt-1">
                                                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md tracking-wider border ${order.delivery_method === 'home'
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                                                    : 'bg-amber-50 text-amber-700 border-amber-100'
                                                    }`}>
                                                    {order.delivery_method === 'home' ? 'Home Delivery' : 'Stop Desk Pickup'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 3: Product & Financials */}
                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-bold text-navy/30 uppercase tracking-[0.2em]">Revenue & Fulfillment</h4>
                                        <div className="bg-navy/[0.02] rounded-lg p-3 border border-navy/5 space-y-2">
                                            <div className="flex justify-between items-start gap-2 font-serif text-navy font-medium">
                                                <span className="line-clamp-2 leading-snug">{order.product_name || 'Unknown Product'}</span>
                                            </div>
                                            <div className="text-[10px] space-y-1 text-navy/50 border-t border-navy/5 pt-2">
                                                <div className="flex justify-between">
                                                    <span>Base Item</span>
                                                    <span>{order.product_price} DA</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Shipping Fee</span>
                                                    <span>+ {order.shipping_price || 0} DA</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-1 border-t border-navy/10 mt-1">
                                                <span className="text-xs font-bold text-navy">TOTAL</span>
                                                <span className="text-lg font-bold text-navy">{order.total_price || order.product_price} DA</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Order Actions Footer */}
                                <div className="mt-8 pt-6 border-t border-navy/5 flex flex-wrap gap-3 items-center justify-between">
                                    <div className="flex gap-2">
                                        {(order.status === 'pending' || order.status === 'new' || order.status === 'confirmed') && (
                                            <>
                                                {order.status !== 'confirmed' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                                        className="px-6 py-2 bg-white text-navy text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-navy/5 transition-all border border-navy/10 active:scale-95"
                                                    >
                                                        Confirm Only
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleConfirmAndShip(order)}
                                                    className="px-6 py-2 bg-navy text-cream text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-navy/90 transition-all shadow-sm active:scale-95"
                                                >
                                                    Confirm & Ship
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                                    className="px-6 py-2 bg-white text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-red-50 transition-all border border-red-100 active:scale-95"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <div className="px-6 py-2 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-100 flex items-center gap-2">
                                                <CheckCircle size={12} /> Successfully Processed
                                            </div>
                                        )}
                                        {order.status === 'cancelled' && (
                                            <div className="px-6 py-2 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-red-100 flex items-center gap-2">
                                                <XCircle size={12} /> Transaction Cancelled
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-[10px] text-navy/30 italic">
                                        Fulfillment pending visual inspection
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
