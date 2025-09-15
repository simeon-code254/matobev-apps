import React from "react";

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5AA6FF"/>
          <stop offset="1" stopColor="#2D5BFF"/>
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="64" x2="64" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9BC9FF"/>
          <stop offset="1" stopColor="#5AA6FF"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#g1)"/>
      <path d="M16 46V18h6l10 14 10-14h6v28h-8V31l-8 11h-0.3L24 31v15h-8z" fill="url(#g2)"/>
    </svg>
  );
}
