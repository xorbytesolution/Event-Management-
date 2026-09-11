import React, { useEffect, useState } from "react";
import { PROMOTED_EVENTS } from "../../constants/homeData";

function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? PROMOTED_EVENTS.length - 1 : prev - 1,
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === PROMOTED_EVENTS.length - 1 ? 0 : prev + 1,
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === PROMOTED_EVENTS.length - 1 ? 0 : prev + 1,
      );
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const activeSlide = PROMOTED_EVENTS[currentIndex];

  return (
    <section
      id="featured"
      className="relative h-[430px] w-full overflow-hidden bg-slate-950 text-white sm:h-[460px] lg:h-[480px]"
    >
      {/* Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${activeSlide.bgGradient} opacity-90 transition-all duration-700`}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-slate-950/25" />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -left-32 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-orange-400/20 blur-3xl" />

      <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

      {/* Promoted badge */}
      <div className="absolute left-5 top-5 z-20 sm:left-8 lg:left-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-lg backdrop-blur-md sm:text-[11px]">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
          Promoted Event
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 pb-12 pt-16 sm:px-8 sm:pb-14 sm:pt-16 lg:px-12">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[0.8fr_1.4fr] lg:gap-16">
          {/* Event preview card */}
          <div className="hidden lg:flex lg:justify-center">
            <div className="group relative w-full max-w-[280px]">
              {/* Glow */}
              <div className="absolute -inset-3 rounded-[28px] bg-white/10 opacity-0 blur-xl transition duration-500 group-hover:opacity-100" />

              <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-md">
                {/* Card top */}
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
                    Featured
                  </span>

                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-white/80">
                    #{activeSlide.id}
                  </span>
                </div>

                {/* Event visual */}
                <div className="flex aspect-square items-center justify-center rounded-2xl bg-white/10">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl">
                    <svg
                      className="h-10 w-10 text-orange-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 10h18" />
                      <path d="M5 10v9" />
                      <path d="M19 10v9" />
                      <path d="M4 19h16" />
                      <path d="M6 10V8l2-4h8l2 4v2" />
                      <path d="M8 14h3v5H8z" />
                      <path d="M14 14h3v3h-3z" />
                    </svg>
                  </div>
                </div>

                {/* Event details */}
                <div className="mt-5">
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-orange-300">
                    {activeSlide.partner}
                  </p>

                  <h3 className="mt-1 line-clamp-2 min-h-[40px] text-base font-bold leading-snug text-white">
                    {activeSlide.title}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Event information */}
          <div className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
            {/* Event ID */}
            <div className="mb-4 inline-flex shrink-0 items-center rounded-lg border border-white/10 bg-black/20 px-3 py-1.5 font-mono text-[10px] font-medium tracking-wide text-white/65 backdrop-blur-sm sm:text-xs">
              EVENT ID: {activeSlide.id}
            </div>

            {/* Title */}
            <h2 className="line-clamp-2 min-h-[65px] max-w-3xl overflow-hidden text-3xl font-extrabold leading-[1.08] tracking-tight sm:min-h-[78px] sm:text-4xl lg:min-h-[122px] lg:text-5xl xl:text-[56px]">
              {activeSlide.title}
            </h2>

            {/* Event metadata */}
            <div className="mt-5 flex w-full flex-wrap items-center justify-center gap-2.5 overflow-hidden lg:justify-start">
              <div className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-slate-900 shadow-lg sm:text-sm">
                <span className="text-orange-500">●</span>
                {activeSlide.date}
              </div>

              <div className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-lg border border-white/15 bg-black/15 px-3.5 py-2 text-xs font-medium text-white/85 backdrop-blur-sm sm:text-sm">
                <span className="shrink-0 text-orange-300">⌖</span>

                <span className="truncate">{activeSlide.venue}</span>
              </div>
            </div>

            {/* Bottom actions */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {activeSlide.verified && (
                <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/95 px-3.5 py-2 text-[11px] font-bold text-slate-800 shadow-lg">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] text-white">
                    ✓
                  </span>

                  <span>BMS VERIFIED</span>

                  <span className="text-[10px] tracking-tight text-amber-500">
                    ★★★★★
                  </span>
                </div>
              )}

              <button
                type="button"
                className="shrink-0 rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-950/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-xl active:translate-y-0"
              >
                {activeSlide.ctaText}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Previous */}
      <button
        type="button"
        onClick={prevSlide}
        className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-white/15 sm:left-5 sm:h-10 sm:w-10"
        aria-label="Previous Slide"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 18l-6-6 6-6"
          />
        </svg>
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={nextSlide}
        className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-sm transition-all hover:bg-white/15 sm:right-5 sm:h-10 sm:w-10"
        aria-label="Next Slide"
      >
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 18l6-6-6-6"
          />
        </svg>
      </button>

      {/* Indicators */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5">
        {PROMOTED_EVENTS.map((_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-7 bg-orange-400"
                : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? "true" : undefined}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroBanner;
