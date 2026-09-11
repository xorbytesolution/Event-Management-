// Mock data for BookMyStall homepage

export const PROMOTED_EVENTS = [
    {
        id: "58833",
        title: "SHEROES CARNIVAL EXHIBITION",
        partner: "STALL PARTNER Book my stall.in",
        date: "19 AUG 2026",
        venue: "Moea Moea, Ambalal Doshi Marg, Kala Ghoda, Mumbai.",
        verified: true,
        bgGradient: "from-teal-900 via-emerald-800 to-cyan-900",
        ctaText: "Stall Booking →",
    },
    {
        id: "58834",
        title: "GRAND FASHION & LIFESTYLE EXPO",
        partner: "OFFICIAL STALL PARTNER",
        date: "25 AUG 2026",
        venue: "HITEX Exhibition Centre, HITECH City, Hyderabad.",
        verified: true,
        bgGradient: "from-indigo-900 via-purple-800 to-pink-900",
        ctaText: "Book Stall Now →",
    },
    {
        id: "58835",
        title: "TECH & FLEA BAZAAR 2026",
        partner: "POWERED BY BookMyStall",
        date: "02 SEP 2026",
        venue: "Manpho Convention Centre, Manyata Tech Park, Bangalore.",
        verified: true,
        bgGradient: "from-blue-900 via-sky-800 to-slate-900",
        ctaText: "Explore Stalls →",
    }
];

export const STATS_DATA = [
    { id: 1, count: "13500", label: "Events" },
    { id: 2, count: "55000", label: "Exhibitors" },
    { id: 3, count: "3300", label: "Organizers" },
];

export const CITIES_DATA = [
    { id: 1, name: "Hyderabad", count: 19, color: "bg-red-500/80 hover:bg-red-500" },
    { id: 2, name: "Bangalore", count: 84, color: "bg-amber-600/80 hover:bg-amber-600" },
    { id: 3, name: "Mumbai", count: 31, color: "bg-rose-500/80 hover:bg-rose-500" },
    { id: 4, name: "Delhi", count: 8, color: "bg-teal-500/80 hover:bg-teal-500" },
    { id: 5, name: "Chennai", count: 15, color: "bg-yellow-500/80 hover:bg-yellow-500" },
    { id: 6, name: "Pune", count: 62, color: "bg-emerald-500/80 hover:bg-emerald-500" },
    { id: 7, name: "Noida", count: 10, color: "bg-yellow-600/80 hover:bg-yellow-600" },
    { id: 8, name: "Jaipur", count: 2, color: "bg-orange-500/80 hover:bg-orange-500" },
    { id: 9, name: "Lucknow", count: 1, color: "bg-amber-500/80 hover:bg-amber-500" },
    { id: 10, name: "Kolkata", count: 16, color: "bg-teal-600/80 hover:bg-teal-600" },
    { id: 11, name: "Gurgaon", count: 23, color: "bg-orange-600/80 hover:bg-orange-600" },
    { id: 12, name: "Rajasthan", count: 1, color: "bg-red-600/80 hover:bg-red-600" },
    { id: 13, name: "Akola", count: 12, color: "bg-sky-500/80 hover:bg-sky-500" },
    { id: 14, name: "Ghaziabad", count: 1, color: "bg-rose-600/80 hover:bg-rose-600" },
    { id: 15, name: "Ranchi", count: 1, color: "bg-emerald-600/80 hover:bg-emerald-600" },
    { id: 16, name: "Ludhiana", count: 1, color: "bg-red-500/80 hover:bg-red-500" },
];

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

export const FOOTER_DATA = {
    tips: [
        "Top 6 questions to check with Organizer",
        "Does your event have 'BMS Verified' tag ?",
        "Tips to follow in Techpark events",
        "How to get event details in my city ?",
        "How to know more details about event organizer ?"
    ],
    company: [
        "About BMS",
        "Our Team",
        "Our Investors",
        "FAQ's",
        "How it Works",
        "Contact US"
    ],
    links: [
        "BMS Blog",
        "Press Releases",
        "Submit KYC",
        "Be a Volunteer",
        "Premium Exhibitions"
    ],
    topCitiesCol1: [
        "Exhibitions in Hyderabad",
        "Exhibitions in Bangalore",
        "Exhibitions in Mumbai",
        "Exhibitions in Chennai",
        "Exhibitions in Pune"
    ],
    topCitiesCol2: [
        "Exhibitions in Delhi",
        "Exhibitions in Jaipur",
        "Exhibitions in Kolkata",
        "Exhibitions in Ahmedabad",
        "Exhibitions in Chandigarh"
    ]
};
