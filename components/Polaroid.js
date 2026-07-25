import Image from "next/image";

/**
 * Pure-CSS polaroid frame around a fixed-size square photo.
 *
 * The frame is styling only — it never fetches or crops. The inner next/image
 * gets explicit intrinsic width/height and the container fixes the displayed
 * box at every breakpoint, so the frame contributes zero CLS. Source photos
 * are not square, so object-cover centre-crops them rather than distorting;
 * swapping in purpose-cropped assets later needs no code change.
 *
 * Rotation and size are passed as CSS custom properties rather than a static
 * inline transform, because both are responsive: the frame sits straight and
 * slightly larger on mobile (where a tilt reads as a rendering fault and
 * there is no hover to correct it), and only takes its angle from lg upward,
 * where hovering straightens it.
 *
 * LCP contract: `priority` is forwarded, never swallowed. At most one image
 * per page should set it — see docs/redesign-architecture-plan.md.
 */
export default function Polaroid({
  src,
  alt,
  size = 200,
  mobileSize,
  rotate = -2,
  // The hero sits straight on mobile — a lone tilted frame there reads as a
  // rendering fault, and there is no hover to correct it. The resume trio is
  // the opposite case: several overlapping frames only read as a scattered
  // stack of photos if they keep their angles, so it opts in.
  rotateOnMobile = false,
  priority = false,
  className = "",
}) {
  const smallSize = mobileSize ?? size;
  // Intrinsic resolution tracks the largest box the photo is ever displayed
  // at, so the mobile size never renders a upscaled/soft image.
  const intrinsic = Math.max(size, smallSize);

  return (
    <div
      // Transition `rotate`, not `transform`: Tailwind v4's rotate-* utilities
      // set the independent `rotate` property, so a transition-transform would
      // never fire and the hover would snap. The colour properties are listed
      // too, because naming any property replaces the global theme-switch
      // transition on this element rather than adding to it.
      className={`shrink-0 border border-line bg-card p-3 pb-10 shadow-[0_8px_24px_rgba(33,31,28,0.14)] transition-[rotate,background-color,border-color,color] duration-300 motion-reduce:transition-none lg:rotate-[var(--polaroid-rotate)] lg:hover:rotate-0 ${
        rotateOnMobile ? "rotate-[var(--polaroid-rotate)]" : "rotate-0"
      } ${className}`}
      style={{
        "--polaroid-rotate": `${rotate}deg`,
        "--polaroid-size": `${size}px`,
        "--polaroid-size-mobile": `${smallSize}px`,
      }}
    >
      <div className="h-[var(--polaroid-size-mobile)] w-[var(--polaroid-size-mobile)] overflow-hidden lg:h-[var(--polaroid-size)] lg:w-[var(--polaroid-size)]">
        <Image
          src={src}
          alt={alt}
          width={intrinsic}
          height={intrinsic}
          priority={priority}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
