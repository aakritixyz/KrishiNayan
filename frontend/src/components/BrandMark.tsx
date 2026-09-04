import Image from "next/image";

type Props = {
  className?: string;
};

/**
 * KrishiNayan brand mark.
 *
 * "Krishi" (crop) + "Nayan" (eye / vision): a leaf sits as the iris of an eye,
 * so the mark reads as "seeing the crop clearly". Custom logo — one
 * cohesive identity reused across the app shell, PWA icon and offline page.
 */
export default function BrandMark({ className = "" }: Props) {
  return (
    <Image
      src="/images/logo.png"
      alt="KrishiNayan"
      width={512}
      height={512}
      className={className}
      priority
    />
  );
}
