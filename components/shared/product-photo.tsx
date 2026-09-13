import Image, { type ImageProps } from 'next/image';
import framing from '@/data/product-photo-framing.json';

/** Centre the actual device rather than the supplier's surrounding canvas. */
export default function ProductPhoto(props: ImageProps) {
  const photo = typeof props.src === 'string'
    ? framing[props.src as keyof typeof framing]
    : undefined;
  if (!photo || !props.fill) return <Image {...props} />;
  const [x, y, width, height] = photo.bounds;
  const side = Math.max(width, height) / .84;
  return (
    <span className="normalized-product-photo">
      <span className="normalized-product-photo-square">
        <span className="normalized-product-photo-source" style={{
          left: `${((side - width) / 2 - x) / side * 100}%`,
          top: `${((side - height) / 2 - y) / side * 100}%`,
          width: `${photo.width / side * 100}%`,
          height: `${photo.height / side * 100}%`,
          clipPath: `inset(${y / photo.height * 100}% ${(photo.width - x - width) / photo.width * 100}% ${(photo.height - y - height) / photo.height * 100}% ${x / photo.width * 100}%)`,
        }}>
          <Image {...props} />
        </span>
      </span>
    </span>
  );
}
