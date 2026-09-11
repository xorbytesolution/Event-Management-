import React from "react";
import { STATS_DATA } from "../../constants/homeData";

function StatsSection() {
  return (
    <section className="w-full border-b border-slate-200 bg-white px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section Heading */}
        <div className="mb-10 text-center sm:mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-500">
            Our Growth
          </p>

          <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            We are growing...
          </h3>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3">
          {STATS_DATA.map((item, index) => (
            <div
              key={item.id}
              className={`group flex min-h-[105px] flex-col items-center justify-center px-6 py-5 transition-all duration-200 ${
                index !== STATS_DATA.length - 1
                  ? "border-b border-slate-200 sm:border-b-0 sm:border-r"
                  : ""
              }`}
            >
              {/* Number */}
              <span className="text-4xl font-extrabold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-orange-500 sm:text-5xl">
                {Number(item.count).toLocaleString("en-IN")}+
              </span>

              {/* Label */}
              <span className="mt-2 text-sm font-medium text-slate-500">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default StatsSection;
