import React from "react";
import { Link } from "react-router-dom";

function CityCard({ name, count, color }) {
    return (
        <Link
            to={`/events/${name.toLowerCase()}`}
            className={`group relative min-h-[140px] overflow-hidden rounded-2xl p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${color} block`}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/10 transition-colors duration-300 group-hover:bg-black/5" />

            {/* Decorative shapes */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />
            <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-white/5 blur-2xl" />

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/65">
                            City
                        </p>
                        <h4 className="mt-1 text-xl font-extrabold tracking-tight text-white">
                            {name}
                        </h4>
                    </div>

                    {/* Event count */}
                    <div className="flex h-9 min-w-9 items-center justify-center rounded-full bg-white/95 px-2.5 text-xs font-bold text-slate-800 shadow-md">
                        {count}
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-7 flex items-center justify-between">
                    <span className="text-xs font-medium text-white/75">
                        Events available
                    </span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white/25">
                        →
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default CityCard;
