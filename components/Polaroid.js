import Image from "next/image";

/**
 * Pure-CSS polaroid frame around a fixed-size square photo.
 *
 * The frame is styling only — it never fetches or crops. The inner next/image
 * always gets explicit width/height matching `size`, so the frame contributes
 * zero CLS regardless of theme or viewport. Source photos are not square, so
 * object-cover centre-crops them to the design's square container rather than
 * distorting; swapping in purpose-cropped assets later needs no code change.
 *
 * LCP contract: `priority` is forwarded, never swallowed. At most one image
 * per page should set it — see docs/redesign-architecture-plan.md.
 */
export default function Polaroid({
  src,
  alt,
  size = 200,
  rotate = -2,
  priority = false,
  className = "",
}) {
  return (
    <div
      className={`shrink-0 border border-line bg-card p-3 pb-10 shadow-[0_8px_24px_rgba(33,31,28,0.14)] ${className}`}
      // One-off rotation angles; not worth encoding as utilities. Kept out of
      // the theme colour transition so it stays purely presentational.
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <div style={{ width: size, height: size }} className="overflow-hidden">
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          priority={priority}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
