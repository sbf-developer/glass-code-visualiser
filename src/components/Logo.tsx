interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 18, className = "" }: LogoProps) {
  const tile = size + 10;

  return (
    <span
      className={`logo-mark inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: tile, height: tile }}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2"
          y="2"
          width="16"
          height="16"
          rx="4.5"
          stroke="#f2f2f2"
          strokeWidth="1.25"
          opacity="0.92"
        />
        <path
          d="M5.5 8c2-1.5 4.5-1.5 6.5 0"
          stroke="#ffffff"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </span>
  );
}
