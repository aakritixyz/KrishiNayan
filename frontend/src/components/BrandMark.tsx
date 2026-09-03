type Props = {
  className?: string;
};

/**
 * KrishiNayan brand mark.
 *
 * "Krishi" (crop) + "Nayan" (eye / vision): a leaf sits as the iris of an eye,
 * so the mark reads as "seeing the crop clearly". Hand-drawn vector — one
 * cohesive identity reused across the app shell, PWA icon and offline page.
 */
export default function BrandMark({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 512 512"
      role="img"
      aria-label="KrishiNayan"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="512" height="512" rx="128" fill="#b7e300" />
      {/* eye outline */}
      <path
        d="M92 256 Q256 132 420 256 Q256 380 92 256 Z"
        fill="none"
        stroke="#03271f"
        strokeWidth="26"
        strokeLinejoin="round"
      />
      {/* leaf iris */}
      <path
        d="M256 196 C212 233 212 301 256 340 C300 301 300 233 256 196 Z"
        fill="#03271f"
      />
      {/* leaf vein */}
      <path
        d="M256 222 V322"
        stroke="#b7e300"
        strokeWidth="14"
        strokeLinecap="round"
      />
    </svg>
  );
}
