"use client";

import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: number;
}

export function Logo({ className = "", size = 40 }: LogoProps) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Megaphone SVG Logo */}
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          {/* Megaphone body */}
          <path
            d="M30 20 L30 50 L20 60 L20 70 L30 65 L30 80 L70 50 L30 20 Z"
            fill="#EF4444"
            stroke="#000000"
            strokeWidth="3"
          />
          {/* Speaker bell */}
          <ellipse
            cx="70"
            cy="50"
            rx="20"
            ry="25"
            fill="#EF4444"
            stroke="#000000"
            strokeWidth="3"
          />
          {/* Inner speaker opening */}
          <ellipse
            cx="70"
            cy="50"
            rx="12"
            ry="15"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="2"
          />
          {/* Handle */}
          <rect
            x="25"
            y="60"
            width="8"
            height="15"
            fill="#EF4444"
            stroke="#000000"
            strokeWidth="2"
          />
          {/* Back/microphone area */}
          <path
            d="M30 20 Q25 25 25 30 Q25 35 30 40"
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="2"
          />
          {/* Button/indicator */}
          <line
            x1="35"
            y1="30"
            x2="40"
            y2="30"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="text-2xl font-bold text-white">Blabla</span>
    </Link>
  );
}

