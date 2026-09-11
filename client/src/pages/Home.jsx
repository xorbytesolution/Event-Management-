import React from "react";
import Navbar from "../components/layout/Navbar";
import HeroBanner from "../components/home/HeroBanner";
import StatsSection from "../components/home/StatsSection";
import CityGridSection from "../components/home/CityGridSection";
import SocialBanner from "../components/layout/SocialBanner";
import Footer from "../components/layout/Footer";

function Home() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
            {/* Header & Navigation */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow">
                {/* Promoted Event Feature Carousel */}
                <HeroBanner />

                {/* Growth Stats Metrics */}
                <StatsSection />

                {/* Cities Grid Selection */}
                <CityGridSection />
            </main>

            {/* Social Follow Banner */}
            <SocialBanner />

            {/* Multi-column Footer */}
            <Footer />
        </div>
    );
}

export default Home;