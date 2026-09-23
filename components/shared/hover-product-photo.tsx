'use client';

import { useState, type MouseEvent } from 'react';
import Image from '@/components/shared/product-photo';

type Props = {
  image: string;
  gallery?: string[];
  alt: string;
  sizes: string;
  className?: string;
};

/** Move across the photo to preview the available product angles. */
export function HoverProductPhoto({ image, gallery, alt, sizes, className }: Props) {
  const photos = [...new Set([image, ...(gallery ?? [])])].slice(0, 3);
  const [active, setActive] = useState(0);

  function showAngle(event: MouseEvent<HTMLSpanElement>) {
    if (photos.length < 2) return;
    const { left, width } = event.currentTarget.getBoundingClientRect();
    setActive(Math.min(photos.length - 1, Math.floor((event.clientX - left) / width * photos.length)));
  }

  return (
    <span className="hover-product-photo" onMouseMove={showAngle} onMouseLeave={() => setActive(0)}>
      <Image src={photos[active]} alt={alt} fill quality={90} sizes={sizes} className={className} />
      {photos.length > 1 && <span className="hover-product-photo-steps" aria-hidden="true">
        {photos.map((photo, index) => <span key={photo} className={index === active ? 'is-active' : ''} />)}
      </span>}
    </span>
  );
}
