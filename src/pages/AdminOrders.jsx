import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Package, Phone, MapPin, Calendar, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';

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
                        <div key={order.id} className="bg-white rounded-xl shadow-sm border border-navy/10 overflow-hidden hover:shadow-md transition-shadow">

                            {/* Header */}
                            <div className="bg-navy/5 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-navy/5">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs text-navy/50 uppercase">ID: {order.id}</span>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-navy/70">
                                    <div className="flex items-center gap-1"><Calendar size={14} /> {new Date(order.created_at).toLocaleDateString()}</div>
                                    <div className="font-bold text-navy">{order.total_price} DA</div>
                                    <button
                                        onClick={() => deleteOrder(order.id)}
                                        className="text-red-400 hover:text-red-700 transition-colors ml-2"
                                        title="Delete Order"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Customer Info */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-2">Customer</h4>
                                    <p className="font-medium text-navy text-lg">{order.full_name}</p>
                                    <p className="flex items-center gap-2 text-navy/80"><Phone size={16} className="text-navy/40" /> {order.phone}</p>
                                    {order.instagram && <p className="text-sm text-blue-600">@{order.instagram}</p>}
                                </div>

                                {/* Shipping Info */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-2">Shipping</h4>
                                    <p className="flex items-start gap-2 text-navy/80">
                                        <MapPin size={16} className="text-navy/40 mt-1 shrink-0" />
                                        <span>
                                            {order.commune}, {order.wilaya_name}<br />
                                            <span className="text-xs bg-navy/10 px-2 py-0.5 rounded text-navy/70 mt-1 inline-block">
                                                {order.delivery_type === 'home' ? 'Home Delivery' : 'Stop Desk Pickup'}
                                            </span>
                                        </span>
                                    </p>
                                </div>

                                {/* Order Items & Action */}
                                <div className="space-y-4 md:text-right">
                                    <div>
                                        <h4 className="text-xs font-bold text-navy/40 uppercase tracking-wider mb-2 md:text-right">Item</h4>
                                        <p className="font-medium text-navy">{order.product_title}</p>
                                        <p className="text-sm text-navy/60">Product: {order.product_price} DA + Ship: {order.shipping_price} DA</p>
                                    </div>

                                    <div className="flex gap-2 md:justify-end pt-2">
                                        {(order.status === 'pending' || order.status === 'new') && (
                                            <>
                                                <button onClick={() => handleUpdateStatus(order.id, 'confirmed')} className="px-4 py-2 bg-green-50 text-green-700 text-xs font-bold uppercase rounded hover:bg-green-100 transition-colors border border-green-200">Confirm</button>
                                                <button onClick={() => handleUpdateStatus(order.id, 'cancelled')} className="px-4 py-2 bg-red-50 text-red-700 text-xs font-bold uppercase rounded hover:bg-red-100 transition-colors border border-red-200">Cancel</button>
                                            </>
                                        )}
                                        {order.status === 'confirmed' && (
                                            <span className="text-xs text-green-600 font-medium italic flex items-center gap-1"><CheckCircle size={12} /> Order Confirmed</span>
                                        )}
                                        {order.status === 'cancelled' && (
                                            <span className="text-xs text-red-600 font-medium italic flex items-center gap-1"><XCircle size={12} /> Order Cancelled</span>
                                        )}
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
