import React from "react";
import { FOOTER_DATA } from "../../constants/homeData";

function Footer() {
  const createAnchor = (item) => `#${item.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <footer className="w-full bg-[#0F172A] px-4 pb-6 pt-12 text-slate-400 sm:px-6 sm:pt-14 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-10 border-b border-slate-700/60 pb-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Tips & Suggestions */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-orange-500" />

              <h4 className="text-sm font-bold tracking-wide text-white">
                Tips & Suggestions
              </h4>
            </div>

            <ul className="space-y-3 text-xs leading-relaxed">
              {FOOTER_DATA.tips.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 transition-colors duration-200 hover:text-white"
                >
                  <span className="mt-1 text-orange-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-orange-500" />

              <h4 className="text-sm font-bold tracking-wide text-white">
                Company
              </h4>
            </div>

            <ul className="space-y-3 text-xs">
              {FOOTER_DATA.company.map((item) => (
                <li key={item}>
                  <a
                    href={createAnchor(item)}
                    className="inline-block transition-all duration-200 hover:translate-x-0.5 hover:text-orange-400"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-orange-500" />

              <h4 className="text-sm font-bold tracking-wide text-white">
                Links
              </h4>
            </div>

            <ul className="space-y-3 text-xs">
              {FOOTER_DATA.links.map((item) => (
                <li key={item}>
                  <a
                    href={createAnchor(item)}
                    className="inline-block transition-all duration-200 hover:translate-x-0.5 hover:text-orange-400"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Cities */}
          <div>
            <div className="mb-5 flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-orange-500" />

              <h4 className="text-sm font-bold tracking-wide text-white">
                Top 10 Cities
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-x-6">
              <ul className="space-y-3 text-xs">
                {FOOTER_DATA.topCitiesCol1.map((item) => (
                  <li key={item}>
                    <a
                      href={createAnchor(item)}
                      className="inline-block transition-all duration-200 hover:translate-x-0.5 hover:text-orange-400"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>

              <ul className="space-y-3 text-xs">
                {FOOTER_DATA.topCitiesCol2.map((item) => (
                  <li key={item}>
                    <a
                      href={createAnchor(item)}
                      className="inline-block transition-all duration-200 hover:translate-x-0.5 hover:text-orange-400"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* App CTA */}
        <div className="flex flex-col items-center justify-between gap-5 border-b border-slate-700/60 py-7 sm:flex-row">
          <div className="text-center sm:text-left">
            <p className="text-sm font-semibold text-white">
              Get the BookMyStall app
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Stay updated with exhibitions and events.
            </p>
          </div>

          <a
            href="#app-download"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/50 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:border-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
              />
            </svg>

            <span>Get APP Link</span>
          </a>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col items-center justify-between gap-3 pt-5 text-center text-[11px] text-slate-500 sm:flex-row sm:text-left">
          <p>
            © {new Date().getFullYear()} BookMyStall.in. All rights reserved.
          </p>

          <p className="text-slate-600">Find exhibitions. Book your stall.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
