'use client';

import { useEffect } from 'react';

export function RevealEffects() {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(
        'main > section:not(.hero), main > aside, .product-grid > article',
      ),
    );
    sections.forEach((section, index) => {
      section.classList.add('reveal-ready');
      section.style.setProperty(
        '--reveal-delay',
        `${Math.min(index % 4, 3) * 55}ms`,
      );
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          (entry.target as HTMLElement).classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' },
    );
    sections.forEach((section) => observer.observe(section));

    const tiltCards = Array.from(
      document.querySelectorAll<HTMLElement>(
        '.category-mosaic > a, .offer-tile, .product-day-card',
      ),
    );
    const reset = (card: HTMLElement) => {
      card.style.removeProperty('--pointer-x');
      card.style.removeProperty('--pointer-y');
    };
    const cleanups = tiltCards.map((card) => {
      const move = (event: PointerEvent) => {
        if (event.pointerType === 'touch') return;
        const bounds = card.getBoundingClientRect();
        card.style.setProperty(
          '--pointer-x',
          `${((event.clientX - bounds.left) / bounds.width - 0.5) * 8}px`,
        );
        card.style.setProperty(
          '--pointer-y',
          `${((event.clientY - bounds.top) / bounds.height - 0.5) * 8}px`,
        );
      };
      const leave = () => reset(card);
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', leave);
      return () => {
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', leave);
      };
    });

    return () => {
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
