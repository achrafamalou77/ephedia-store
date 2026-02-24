export const createDeliveryOrder = async (orderData) => {
    const API_URL = "https://48hr.ecotrack.dz/api/v1/create/orders";
    const TOKEN = import.meta.env.VITE_ECOTRACK_TOKEN;

    if (!TOKEN) throw new Error("API Token missing in .env file");

    // Map Wilaya string (e.g., "16 - Alger") to just the number "16"
    const extractWilayaCode = (wilayaString) => {
        if (!wilayaString) return "16"; // Default fallback
        const match = wilayaString.match(/\d+/); // Extracts the first number it finds
        return match ? match[0] : "16";
    };

    // Determine if it's Home Delivery (0) or Stop Desk (1)
    const isStopDesk = orderData.delivery_method === 'Office Pickup' ? 1 : 0;

    const payload = {
        orders: [
            {
                reference: "WEB-" + orderData.id,
                nom_client: orderData.customer_name,
                telephone: orderData.phone,
                adresse: orderData.address || orderData.commune || orderData.wilaya,
                commune: orderData.commune || orderData.wilaya,
                code_wilaya: extractWilayaCode(orderData.wilaya),
                montant: orderData.total_price || orderData.product_price,
                produit: orderData.product_name,
                type: 1, // 1 = Standard Delivery
                stop_desk: isStopDesk,
                remarque: "Commande depuis Ephedia Store"
            }
        ]
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(payload)
    });

    const result = await response.json();

    // Ecotrack usually returns success: true or a specific structure.
    // If it fails, we want to know why.
    if (!response.ok || (result && result.error)) {
        throw new Error(JSON.stringify(result));
    }

    return result;
};
