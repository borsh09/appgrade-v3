import framing from '@/data/samsung-photo-framing.json';

/** Fit the device, rather than the source canvas, to a consistent square. */
export function SamsungPhoto({ src, alt }: { src: string; alt: string }) {
  const key = src.split('/').at(-2) as keyof typeof framing;
  const photo = framing[key];
  if (!photo) return null;
  const [x, y, width, height] = photo.bounds;
  const size = Math.max(width, height) / 0.78;
  return (
    <svg
      className="samsung-normalized-photo"
      viewBox={`0 0 ${size} ${size}`}
      aria-label={alt}
    >
      <title>{alt}</title>
      <svg
        x={(size - width) / 2}
        y={(size - height) / 2}
        width={width}
        height={height}
        viewBox={`${x} ${y} ${width} ${height}`}
        overflow="hidden"
      >
        <image href={photo.src} width={photo.width} height={photo.height} />
      </svg>
    </svg>
  );
}
