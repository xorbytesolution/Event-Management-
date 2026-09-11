// Dedicated data file for Event entities (Verified & Published Events)

export const EVENTS_LIST = [
    {
        id: "58898",
        title: "The Golden Oasis(Food,Fun And Family Carnival/Alfa Gardens)",
        city: "bangalore",
        cityNameDisplay: "Bangalore",
        date: "29th Aug 2026",
        time: "From 10:00 AM - 08:00 PM",
        venue: "Alfa Gardens, Krishnarajapuram, Bengaluru",
        isNewOrganizer: true,
        verified: true,
        eventType: "Outdoor",
        footfall: "2000+",
        availableStalls: 16,
        totalStalls: 25,
        organizerPhone: "6281924259",
        pricingOptions: [
            {
                daysLabel: "1 Day",
                price: "₹6,500/-",
                tables: 4,
                chairs: 2,
                stallType: "Full Stall - Canopy"
            },
            {
                daysLabel: "1 Day",
                price: "₹4,500/-",
                tables: 2,
                chairs: 1,
                stallType: "Half Stall - Canopy"
            }
        ],
        categories: [
            "Automobiles", "Bridal & Ethnic Wear", "Cosmetics & Beauty", "Devotional Products",
            "Electronic Gadgets", "Fashion Accessories", "Food Stalls", "Footwear", "Handicrafts",
            "Handmade Products", "Health & Medical", "Home Appliances", "Home Decor",
            "Home Furnishing", "Jewellery", "Kids Wear", "Kitchenware", "Mens Wear", "NGO's",
            "Nutrition & Wellness", "Organic Products", "Promotional Stalls", "Real Estate",
            "Sports Wear", "Startups", "Stationary & Books", "Toys", "Women Wear"
        ],
        facilities: ["Water", "Parking", "Power", "Light"]
    },
    {
        id: "58899",
        title: "Hyderabad Grand Shopping Flea & Food Carnival",
        city: "hyderabad",
        cityNameDisplay: "Hyderabad",
        date: "05th Sep 2026",
        time: "From 11:00 AM - 09:00 PM",
        venue: "HITEX Exhibition Centre, HITECH City, Hyderabad",
        isNewOrganizer: true,
        verified: true,
        eventType: "Indoor & Outdoor",
        footfall: "5000+",
        availableStalls: 22,
        totalStalls: 40,
        organizerPhone: "6281924259",
        pricingOptions: [
            {
                daysLabel: "2 Days",
                price: "₹12,000/-",
                tables: 4,
                chairs: 2,
                stallType: "Full Stall - Octanorm"
            },
            {
                daysLabel: "2 Days",
                price: "₹7,500/-",
                tables: 2,
                chairs: 1,
                stallType: "Half Stall - Open Table"
            }
        ],
        categories: [
            "Mens Wear", "Women Wear", "Kids Wear", "Food Stalls", "Jewellery",
            "Handicrafts", "Electronic Gadgets", "Cosmetics & Beauty"
        ],
        facilities: ["Water", "Tea/Coffee", "Parking", "Toilets", "AC", "Power", "Light"]
    },
    {
        id: "58900",
        title: "Deccan Lifestyle & Fashion Carnival",
        city: "hyderabad",
        cityNameDisplay: "Hyderabad",
        date: "12th Sep 2026",
        time: "From 10:00 AM - 08:00 PM",
        venue: "N Convention, Madhapur, Hyderabad",
        isNewOrganizer: false,
        verified: true,
        eventType: "Indoor",
        footfall: "3500+",
        availableStalls: 10,
        totalStalls: 30,
        organizerPhone: "6281924259",
        pricingOptions: [
            {
                daysLabel: "1 Day",
                price: "₹8,000/-",
                tables: 3,
                chairs: 2,
                stallType: "Full Stall - Canopy"
            }
        ],
        categories: [
            "Bridal & Ethnic Wear", "Jewellery", "Fashion Accessories", "Cosmetics & Beauty", "Footwear"
        ],
        facilities: ["Water", "Parking", "AC", "Power", "Light"]
    }
];
