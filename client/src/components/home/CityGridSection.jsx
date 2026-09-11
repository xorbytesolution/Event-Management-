import React, { useState, useEffect } from "react";
import CityCard from "./CityCard";
import { CITIES_DATA } from "../../constants/homeData";
import api from "../../services/api";

function CityGridSection() {
  const [cityCounts, setCityCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCityCounts = async () => {
      try {
        const { data } = await api.get("/events");
        const counts = {};
        (data.events || []).forEach((e) => {
          if (e.city) {
            const key = e.city.toLowerCase().trim();
            counts[key] = (counts[key] || 0) + 1;
          }
        });
        setCityCounts(counts);
      } catch (err) {
        console.error("Failed to fetch live event counts per city:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCityCounts();
  }, []);

  return (
    <section className="w-full bg-slate-50 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            Explore events
          </p>

          <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Select City
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Explore exhibitions and events happening in your city
          </p>
        </div>

        {/* Cities */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CITIES_DATA.map((city) => {
            const realCount = cityCounts[city.name.toLowerCase()] ?? 0;
            return (
              <CityCard
                key={city.id}
                name={city.name}
                count={realCount}
                color={city.color}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CityGridSection;
