import React from "react";
import { Dock, DockIcon, DockItem, DockLabel } from "../ui/dock";

function SocialBanner() {
  const socialLinks = [
    {
      name: "Facebook",
      url: "https://facebook.com",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-full w-full"
          aria-hidden="true"
        >
          <path d="M14 8h3V4h-3c-3.31 0-5 1.69-5 5v3H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.67.33-1 1-1Z" />
        </svg>
      ),
    },
    {
      name: "Twitter",
      url: "https://twitter.com",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-full w-full"
          aria-hidden="true"
        >
          <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.96h1.73L8.28 3.92H6.42L17.8 19.96Z" />
        </svg>
      ),
    },
    {
      name: "Instagram",
      url: "https://instagram.com",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-full w-full"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle
            cx="17.5"
            cy="6.5"
            r="0.8"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      ),
    },
    {
      name: "LinkedIn",
      url: "https://linkedin.com",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-full w-full"
          aria-hidden="true"
        >
          <path d="M5.2 3.5A2.2 2.2 0 1 1 5.2 7.9a2.2 2.2 0 0 1 0-4.4ZM3.3 9.2h3.8V21H3.3V9.2Zm6.2 0h3.6v1.61h.05c.5-.95 1.73-1.95 3.56-1.95 3.81 0 4.51 2.5 4.51 5.75V21h-3.8v-5.67c0-1.35-.02-3.08-1.88-3.08-1.89 0-2.18 1.47-2.18 2.98V21H9.5V9.2Z" />
        </svg>
      ),
    },
    {
      name: "Pinterest",
      url: "https://pinterest.com",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-full w-full"
          aria-hidden="true"
        >
          <path d="M12 2a10 10 0 0 0-3.65 19.31c-.09-1.63-.02-3.59.41-5.45l1.05-4.44s-.27-.54-.27-1.34c0-1.25.73-2.19 1.64-2.19.77 0 1.14.58 1.14 1.28 0 .78-.5 1.95-.76 3.03-.22.91.46 1.65 1.36 1.65 1.63 0 2.73-1.72 2.73-4.21 0-2.2-1.58-3.74-3.84-3.74-2.62 0-4.16 1.96-4.16 3.98 0 .79.3 1.64.68 2.1.08.1.09.19.07.29l-.25 1.02c-.04.17-.14.2-.32.12-1.18-.55-1.91-2.26-1.91-3.64 0-2.97 2.16-5.7 6.24-5.7 3.28 0 5.83 2.34 5.83 5.47 0 3.26-2.06 5.88-4.92 5.88-.96 0-1.86-.5-2.17-1.09l-.59 2.25c-.21.87-.78 1.96-1.16 2.63A10 10 0 1 0 12 2Z" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      url: "https://youtube.com",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-full w-full"
          aria-hidden="true"
        >
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.12C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.4.58A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.12c1.86.58 9.4.58 9.4.58s7.54 0 9.4-.58a3 3 0 0 0 2.1-2.12A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8ZM9.6 15.5v-7l6 3.5-6 3.5Z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 px-4 py-10 text-white sm:py-11">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-100">
          Stay Connected
        </p>

        <h4 className="mt-2 text-xl font-extrabold tracking-tight sm:text-2xl">
          Follow BookMyStall On
        </h4>

        <div className="mt-5">
          <Dock
            className="items-end bg-transparent"
            magnification={64}
            distance={120}
            panelHeight={58}
          >
            {socialLinks.map((item) => (
              <DockItem
                key={item.name}
                className="aspect-square rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md"
              >
                <DockLabel>{item.name}</DockLabel>

                <DockIcon>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow BookMyStall on ${item.name}`}
                    className="flex h-full w-full items-center justify-center"
                  >
                    {item.icon}
                  </a>
                </DockIcon>
              </DockItem>
            ))}
          </Dock>
        </div>
      </div>
    </section>
  );
}

export default SocialBanner;
