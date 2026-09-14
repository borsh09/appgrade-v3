'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRef, useState } from 'react';
import Link from '@/components/shared/safe-link';
import { useCity } from '@/components/providers/city-provider';

type Props = { deviceType: string; condition: string; model: string; details: string; estimate: number };

export function TradeInForm({ deviceType, condition, model, details, estimate }: Props) {
  const { city } = useCity();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const identity = useRef({ fingerprint: '', key: '' });

  if (done) return <output className="appgrade-tradein-success"><CheckCircle2 size={28} /><span><strong>Заявка принята</strong><p>Ожидайте звонка — менеджер скоро свяжется с вами.</p></span></output>;

  return <form className="appgrade-tradein-contact" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setMessage('');
    const form = new FormData(event.currentTarget);
    const body = { deviceType, condition, model, details, estimate, city: city.id, name: form.get('name'), phone: form.get('phone'), consent: form.get('consent') === 'on' };
    const fingerprint = JSON.stringify(body);
    if (identity.current.fingerprint !== fingerprint) identity.current = { fingerprint, key: crypto.randomUUID() };
    try {
      const response = await fetch('/api/trade-in', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, requestKey: identity.current.key }), signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setDone(true);
    } catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
  }}>
    <h3>Зафиксировать оценку</h3>
    <div className="appgrade-tradein-contact-fields">
      <label><span>Ваше имя</span><input name="name" autoComplete="name" required maxLength={100} placeholder="Как к вам обращаться" /></label>
      <label><span>Телефон</span><input name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={30} placeholder="+7 999 000-00-00" /></label>
    </div>
    <label className="appgrade-tradein-consent"><input name="consent" type="checkbox" required /><span>Согласен на обработку данных. <Link href="/privacy">Политика обработки данных</Link></span></label>
    <button className="appgrade-tradein-cta" disabled={busy}>{busy ? 'Отправляем…' : 'Получить точную оценку'}{!busy && <ArrowRight size={17} />}</button>
    {message && <output className="appgrade-tradein-error" role="alert">{message}</output>}
  </form>;
}
