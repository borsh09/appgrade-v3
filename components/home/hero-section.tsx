'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from '@/components/shared/safe-link';
import { DesktopHero } from './desktop-hero';
import {
  ArrowRight,
  Volume2,
  VolumeX,
} from 'lucide-react';

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const video = videoRef.current;

    if (!video) return;

    const nextMuted = !muted;

    video.muted = nextMuted;
    setMuted(nextMuted);

    if (!nextMuted) {
      video.play().catch(() => {});
    }
  };

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

              <h1>
                То самое
                <br />
                обновление
              </h1>

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

            <button
              type="button"
              className="appgrade-video-sound appgrade-mobile-sound-button"
              onClick={toggleSound}
              aria-label={
                muted ? 'Включить звук' : 'Выключить звук'
              }
            >
              {muted ? (
                <VolumeX size={18} />
              ) : (
                <Volume2 size={18} />
              )}

              <span>
                {muted ? 'Звук' : 'Выключить'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
