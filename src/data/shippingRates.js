export const wilayaRates = {
    "01 - Adrar": { home: 1200, desk: 750 },
    "02 - Chlef": { home: 600, desk: 400 },
    "03 - Laghouat": { home: 800, desk: 500 },
    "04 - Oum El Bouaghi": { home: 600, desk: 400 },
    "05 - Batna": { home: 600, desk: 400 },
    "06 - Béjaïa": { home: 600, desk: 350 },
    "07 - Biskra": { home: 800, desk: 500 },
    "08 - Béchar": { home: 1200, desk: 650 },
    "09 - Blida": { home: 500, desk: 350 },
    "10 - Bouira": { home: 600, desk: 400 },
    "11 - Tamanrasset": { home: 1200, desk: 1050 },
    "12 - Tébessa": { home: 600, desk: 400 },
    "13 - Tlemcen": { home: 600, desk: 350 },
    "14 - Tiaret": { home: 600, desk: 350 },
    "15 - Tizi Ouzou": { home: 600, desk: 350 },
    "16 - Alger": { home: 400, desk: 200 },
    "17 - Djelfa": { home: 800, desk: 500 },
    "18 - Jijel": { home: 600, desk: 400 },
    "19 - Sétif": { home: 600, desk: 400 },
    "20 - Saïda": { home: 600, desk: 400 },
    "21 - Skikda": { home: 600, desk: 350 },
    "22 - Sidi Bel Abbès": { home: 600, desk: 350 },
    "23 - Annaba": { home: 600, desk: 350 },
    "24 - Guelma": { home: 600, desk: 400 },
    "25 - Constantine": { home: 600, desk: 350 },
    "26 - Médéa": { home: 600, desk: 400 },
    "27 - Mostaganem": { home: 600, desk: 400 },
    "28 - M'Sila": { home: 600, desk: 400 },
    "29 - Mascara": { home: 600, desk: 350 },
    "30 - Ouargla": { home: 900, desk: 650 },
    "31 - Oran": { home: 600, desk: 400 },
    "32 - El Bayadh": { home: 900, desk: 650 },
    "33 - Illizi": { home: 1200, desk: 1050 },
    "34 - Bordj Bou Arreridj": { home: 600, desk: 400 },
    "35 - Boumerdes": { home: 500, desk: 350 },
    "36 - El Tarf": { home: 600, desk: 350 },
    "37 - Tindouf": { home: 1200, desk: 750 },
    "38 - Tissemsilt": { home: 600, desk: 350 },
    "39 - El Oued": { home: 900, desk: 650 },
    "40 - Khenchela": { home: 600, desk: 400 },
    "41 - Souk Ahras": { home: 600, desk: 400 },
    "42 - Tipaza": { home: 500, desk: 350 },
    "43 - Mila": { home: 600, desk: 400 },
    "44 - Aïn Defla": { home: 600, desk: 400 },
    "45 - Naâma": { home: 900, desk: 650 },
    "46 - Aïn Témouchent": { home: 600, desk: 400 },
    "47 - Ghardaïa": { home: 900, desk: 650 },
    "48 - Relizane": { home: 600, desk: 400 },
    "49 - Timimoun": { home: 1200, desk: 750 },
    "50 - Bordj Badji Mokhtar": { home: 1200, desk: null },
    "51 - Ouled Djellal": { home: 800, desk: 500 },
    "52 - Béni Abbès": { home: 1200, desk: null },
    "53 - In Salah": { home: 1200, desk: 1050 },
    "54 - In Guezzam": { home: 1200, desk: null },
    "55 - Touggourt": { home: 1000, desk: 650 },
    "56 - Djanet": { home: 1200, desk: null },
    "57 - El M'Ghair": { home: 1000, desk: null },
    "58 - El Meniaa": { home: 1000, desk: 650 },
    "default": { home: 600, desk: 400 }
};

export const calculateShipping = (wilaya, deliveryMethod) => {
    if (!wilaya) return 0;

    // Safely extract the exact number as an integer (turns "5 - Batna" or "05 - Batna" into the math number 5)
    const match = wilaya.match(/\d+/);
    if (!match) return wilayaRates["default"][deliveryMethod === 'Office Pickup' ? 'desk' : 'home'];

    const extractedNumber = parseInt(match[0], 10);

    // Find the matching Wilaya in our list by comparing integers
    const rateKey = Object.keys(wilayaRates).find(key => {
        const keyMatch = key.match(/\d+/);
        if (!keyMatch) return false;
        const keyNumber = parseInt(keyMatch[0], 10);
        return keyNumber === extractedNumber;
    });

    const rates = wilayaRates[rateKey] || wilayaRates["default"];

    // If they choose Stop Desk, but this Wilaya doesn't have an Ecotrack office (null), fallback to home delivery price safely
    if (deliveryMethod === 'Office Pickup') {
        return rates.desk !== null ? rates.desk : rates.home;
    }

    return rates.home;
};