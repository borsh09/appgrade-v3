'use client';

import Link from '@/components/shared/safe-link';
import {
  ArrowRight,
  Check,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

const DEVICE_TYPES = [
  'Смартфон',
  'Планшет',
  'Ноутбук',
  'Смарт-часы',
] as const;

const CONDITIONS = [
  'Работает исправно',
  'Есть следы использования',
  'Нужна диагностика',
] as const;

type DeviceType = (typeof DEVICE_TYPES)[number];
type Condition = (typeof CONDITIONS)[number];

export function TradeInPage() {
  const [deviceType, setDeviceType] =
    useState<DeviceType | null>(null);
  const [condition, setCondition] =
    useState<Condition | null>(null);

  const ready = Boolean(deviceType && condition);

  const reset = () => {
    setDeviceType(null);
    setCondition(null);
  };

  return (
    <main className="appgrade-tradein-page">
      <div className="container">
        <header className="appgrade-tradein-hero">
          <span>APPGRADE TRADE-IN</span>
          <h1>
            Обновиться
            <br />
            проще.
          </h1>
          <p>
            Ответьте на два вопроса. Это предварительная
            анкета — окончательную стоимость назовём после
            осмотра устройства в магазине.
          </p>
        </header>

        <div className="appgrade-tradein-layout">
          <div className="appgrade-tradein-form">
            <section className="appgrade-tradein-step">
              <div className="appgrade-tradein-step-heading">
                <span>01</span>
                <div>
                  <small>Устройство</small>
                  <h2>Что хотите сдать?</h2>
                </div>
              </div>

              <div className="appgrade-tradein-options">
                {DEVICE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={deviceType === type ? 'is-active' : ''}
                    aria-pressed={deviceType === type}
                    onClick={() => setDeviceType(type)}
                  >
                    <span>{type}</span>
                    <i aria-hidden="true">
                      {deviceType === type && <Check size={15} />}
                    </i>
                  </button>
                ))}
              </div>
            </section>

            <section
              className={`appgrade-tradein-step ${
                deviceType ? '' : 'is-disabled'
              }`}
            >
              <div className="appgrade-tradein-step-heading">
                <span>02</span>
                <div>
                  <small>Состояние</small>
                  <h2>Как выглядит устройство?</h2>
                </div>
              </div>

              {!deviceType && (
                <p className="appgrade-tradein-empty">
                  Сначала выберите тип устройства
                </p>
              )}

              <div className="appgrade-tradein-options is-condition">
                {CONDITIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    disabled={!deviceType}
                    className={condition === item ? 'is-active' : ''}
                    aria-pressed={condition === item}
                    onClick={() => setCondition(item)}
                  >
                    <span>{item}</span>
                    <i aria-hidden="true">
                      {condition === item && <Check size={15} />}
                    </i>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="appgrade-tradein-summary" aria-live="polite">
            <div className="appgrade-tradein-summary-icon">
              {ready ? <Sparkles size={20} /> : <RefreshCw size={20} />}
            </div>
            <span>Предварительная оценка</span>
            <h2>{ready ? 'Анкета готова' : 'Выберите устройство'}</h2>

            {ready ? (
              <div className="appgrade-tradein-selection">
                <div>
                  <span>Тип</span>
                  <strong>{deviceType}</strong>
                </div>
                <div>
                  <span>Состояние</span>
                  <strong>{condition}</strong>
                </div>
              </div>
            ) : (
              <p>
                Здесь появится краткая сводка выбранных
                параметров.
              </p>
            )}

            <div className="appgrade-tradein-notice">
              <ShieldCheck size={17} />
              <p>
                Онлайн-анкета не определяет стоимость.
                Финальная оценка возможна только после
                диагностики устройства специалистом APPGRADE.
              </p>
            </div>

            {ready ? (
              <Link href="/#контакты" className="appgrade-tradein-cta">
                Найти ближайший магазин
                <ArrowRight size={17} />
              </Link>
            ) : (
              <button className="appgrade-tradein-cta" disabled>
                Заполните два шага
                <ArrowRight size={17} />
              </button>
            )}

            {ready && (
              <button
                type="button"
                className="appgrade-tradein-reset"
                onClick={reset}
              >
                Начать заново
              </button>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
