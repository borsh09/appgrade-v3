'use client';

import { BrandWordmark } from './brand-wordmark';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'appgrade-startup-seen';

export function StartupLoader() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    sessionStorage.setItem(STORAGE_KEY, '1');
    const showTimer = window.setTimeout(() => setVisible(true), 0);
    const leaveTimer = window.setTimeout(() => setLeaving(true), 900);
    const hideTimer = window.setTimeout(() => setVisible(false), 1250);
    return () => { window.clearTimeout(showTimer); window.clearTimeout(leaveTimer); window.clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;
  return <div className={`appgrade-loading appgrade-startup-loader${leaving ? ' is-leaving' : ''}`} aria-label="Сайт загружается" aria-live="polite">
    <div className="appgrade-loading-content">
      <BrandWordmark priority />
      <div className="appgrade-loading-track" aria-hidden="true"><span /></div>
      <span className="sr-only">Загрузка…</span>
    </div>
  </div>;
}
