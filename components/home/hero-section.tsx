'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { DesktopHero } from './desktop-hero';
import {
  ArrowRight,
} from 'lucide-react';

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const mobile = window.matchMedia('(max-width: 768px)');
    let visible = false;
    let disposed = false;
    const resume = () => {
      if (disposed || !mobile.matches || document.hidden || !visible) return;
      video.defaultMuted = true;
      video.muted = true;
      if (video.paused) void video.play().catch(() => {
        // A subsequent touch or visibility change retries blocked autoplay.
      });
    };
    const sync = () => {
      if (!mobile.matches || document.hidden || !visible) video.pause();
      else resume();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.01 });
    observer.observe(video);
    video.addEventListener('canplay', resume);
    mobile.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pageshow', sync);
    document.addEventListener('touchstart', resume, { passive: true });
    document.addEventListener('pointerdown', resume, { passive: true });

    return () => {
      disposed = true;
      observer.disconnect();
      video.pause();
      video.removeEventListener('canplay', resume);
      mobile.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('pageshow', sync);
      document.removeEventListener('touchstart', resume);
      document.removeEventListener('pointerdown', resume);
    };
  }, []);
  return (
    <section className="appgrade-video-hero">
      <div className="container appgrade-video-hero-container">
        <DesktopHero />
        <div className="appgrade-video-hero-media appgrade-mobile-hero">

          {/* MOBILE VIDEO */}
          <video
            ref={videoRef}
            className="appgrade-video-hero-video appgrade-hero-mobile-video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source
              src="/videos/hero-mobile.mp4"
              type="video/mp4"
            />
          </video>

          <div className="appgrade-video-hero-overlay" />

          <div className="appgrade-video-hero-content">
            <div className="appgrade-video-hero-copy">

              <div className="appgrade-hero-brand-logo">
                <Image
                  src="/images/appgrade-logo-white.png"
                  alt="APPGRADE"
                  width={220}
                  height={70}
                  priority
                />
              </div>

              <h2>
                То самое
                <br />
                обновление
              </h2>

              <p>
                iPhone, MacBook, AirPods и не только — в APPGRADE.
              </p>

              <div className="appgrade-video-hero-actions">
                <Link
                  href="/catalog"
                  className="appgrade-video-primary"
                >
                  Смотреть каталог
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/trade-in"
                  className="appgrade-video-secondary"
                >
                  Trade-In
                </Link>
              </div>
            </div>


          </div>
        </div>
      </div>
    </section>
  );
}
