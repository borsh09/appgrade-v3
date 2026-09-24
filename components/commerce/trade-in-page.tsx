'use client';

import { BatteryMedium, Check, Laptop, PackageCheck, RotateCcw, ShieldCheck, Smartphone, Sparkles, Tablet, Watch, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { TradeInForm } from './trade-in-form';
import { calculateTradeInEstimate, TRADE_IN_STORAGE_KEY, type TradeInSelection } from '@/lib/trade-in-estimate';
import { useCommerce } from '@/components/providers/commerce-provider';

const DEVICES = [
  { value: 'Смартфон', icon: Smartphone, base: 68000 },
  { value: 'Планшет', icon: Tablet, base: 52000 },
  { value: 'Ноутбук', icon: Laptop, base: 95000 },
  { value: 'Смарт-часы', icon: Watch, base: 32000 },
] as const;
const FUNCTION_OPTIONS = [
  { value: 'perfect', label: 'Всё работает', factor: 1 },
  { value: 'issues', label: 'Есть неисправности', factor: .65 },
  { value: 'broken', label: 'Не включается', factor: .32 },
] as const;
const BODY_OPTIONS = [
  { value: 'clean', label: 'Почти без следов', factor: 1 },
  { value: 'worn', label: 'Есть царапины', factor: .82 },
  { value: 'damaged', label: 'Сколы или трещины', factor: .56 },
] as const;
const BATTERY_OPTIONS = [
  { value: 'good', label: 'Держит заряд хорошо', factor: 1 },
  { value: 'service', label: 'Быстро разряжается', factor: .88 },
] as const;
const KIT_OPTIONS = [
  { value: 'full', label: 'Есть коробка и комплект', factor: 1 },
  { value: 'device', label: 'Только устройство', factor: .94 },
] as const;

type DeviceType = (typeof DEVICES)[number]['value'];
type FunctionState = (typeof FUNCTION_OPTIONS)[number]['value'];
type BodyState = (typeof BODY_OPTIONS)[number]['value'];
type BatteryState = (typeof BATTERY_OPTIONS)[number]['value'];
type KitState = (typeof KIT_OPTIONS)[number]['value'];


function ChoiceGroup<T extends string>({ label, icon: Icon, options, value, onChange }: {
  label: string;
  icon: typeof Wrench;
  options: readonly { value: T; label: string; factor: number }[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return <fieldset className="appgrade-tradein-question">
    <legend><Icon size={19} aria-hidden="true" />{label}</legend>
    <div className="appgrade-tradein-pills">{options.map((option) => <button key={option.value} type="button" className={value === option.value ? 'is-active' : ''} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}<span aria-hidden="true">{value === option.value && <Check size={14} />}</span></button>)}</div>
  </fieldset>;
}

export function TradeInPage({ returnToCart = false }: { returnToCart?: boolean }) {
  const { cartCount } = useCommerce();
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null);
  const [model, setModel] = useState('');
  const [functionState, setFunctionState] = useState<FunctionState | null>(null);
  const [bodyState, setBodyState] = useState<BodyState | null>(null);
  const [batteryState, setBatteryState] = useState<BatteryState | null>(null);
  const [kitState, setKitState] = useState<KitState | null>(null);
  const completed = [deviceType, model.trim(), functionState, bodyState, batteryState, kitState].filter(Boolean).length;
  const ready = completed === 6;
  const estimate = useMemo(() => {
    if (!ready || !deviceType || !functionState || !bodyState || !batteryState || !kitState) return null;
    return calculateTradeInEstimate({ deviceType, model: model.trim(), functionState, bodyState, batteryState, kitState });
  }, [ready, deviceType, model, functionState, bodyState, batteryState, kitState]);
  const condition = functionState === 'perfect' && bodyState === 'clean' ? 'Работает исправно' : functionState === 'broken' || bodyState === 'damaged' ? 'Нужна диагностика' : 'Есть следы использования';
  const details = ready ? [`Работа: ${FUNCTION_OPTIONS.find((item) => item.value === functionState)?.label}`, `Корпус: ${BODY_OPTIONS.find((item) => item.value === bodyState)?.label}`, `Аккумулятор: ${BATTERY_OPTIONS.find((item) => item.value === batteryState)?.label}`, `Комплект: ${KIT_OPTIONS.find((item) => item.value === kitState)?.label}`].join('. ') : '';
  const reset = () => { setDeviceType(null); setModel(''); setFunctionState(null); setBodyState(null); setBatteryState(null); setKitState(null); };
  const applyToCart = () => {
    if (!estimate || !deviceType || !functionState || !bodyState || !batteryState || !kitState) return;
    const selection: TradeInSelection = { deviceType, model: model.trim(), functionState, bodyState, batteryState, kitState };
    localStorage.setItem(TRADE_IN_STORAGE_KEY, JSON.stringify({ ...selection, estimate }));
    window.location.assign('/cart');
  };

  return <main className="appgrade-tradein-page"><div className="container">
    <header className="appgrade-tradein-hero"><h1>Узнайте стоимость устройства</h1><p>Ответьте на несколько вопросов — калькулятор сразу покажет предварительную сумму Trade‑In.</p></header>
    <div className="appgrade-tradein-progress" aria-label={`Заполнено ${completed} из 6`}><div><span style={{ width: `${completed / 6 * 100}%` }} /></div><strong>{completed} / 6</strong></div>
    <div className="appgrade-tradein-layout">
      <div className="appgrade-tradein-form">
        <section className="appgrade-tradein-step"><div className="appgrade-tradein-step-heading"><span>1</span><h2>Что сдаёте?</h2></div>
          <div className="appgrade-tradein-device-grid">{DEVICES.map(({ value, icon: Icon }) => <button key={value} type="button" className={deviceType === value ? 'is-active' : ''} aria-pressed={deviceType === value} onClick={() => setDeviceType(value)}><Icon size={25} aria-hidden="true" /><span>{value}</span><i aria-hidden="true">{deviceType === value && <Check size={14} />}</i></button>)}</div>
          <label className="appgrade-tradein-model"><span>Точная модель</span><input value={model} onChange={(event) => setModel(event.target.value)} maxLength={150} placeholder="Например, iPhone 15 Pro 256 ГБ" autoComplete="off" /></label>
        </section>
        <section className="appgrade-tradein-step"><div className="appgrade-tradein-step-heading"><span>2</span><h2>В каком состоянии?</h2></div><div className="appgrade-tradein-questions">
          <ChoiceGroup label="Работоспособность" icon={Wrench} options={FUNCTION_OPTIONS} value={functionState} onChange={setFunctionState} />
          <ChoiceGroup label="Корпус и экран" icon={Smartphone} options={BODY_OPTIONS} value={bodyState} onChange={setBodyState} />
          <ChoiceGroup label="Аккумулятор" icon={BatteryMedium} options={BATTERY_OPTIONS} value={batteryState} onChange={setBatteryState} />
          <ChoiceGroup label="Комплект" icon={PackageCheck} options={KIT_OPTIONS} value={kitState} onChange={setKitState} />
        </div></section>
      </div>
      <aside className={`appgrade-tradein-summary ${ready ? 'is-ready' : ''}`} aria-live="polite">
        <div className="appgrade-tradein-summary-top"><div className="appgrade-tradein-summary-icon"><Sparkles size={21} /></div><button type="button" className="appgrade-tradein-reset" onClick={reset} disabled={completed === 0} aria-label="Сбросить калькулятор"><RotateCcw size={18} /></button></div>
        <p className="appgrade-tradein-summary-label">Предварительная оценка</p>
        {estimate ? <><h2>до {estimate.toLocaleString('ru-RU')} ₽</h2><p className="appgrade-tradein-summary-model">{model}</p><div className="appgrade-tradein-selection"><div><span>Устройство</span><strong>{deviceType}</strong></div><div><span>Состояние</span><strong>{condition}</strong></div></div>{!returnToCart && <TradeInForm deviceType={deviceType!} condition={condition} model={model.trim()} details={details} estimate={estimate} />}</> : <><h2>Заполните параметры</h2><p className="appgrade-tradein-summary-copy">Сумма появится здесь и будет меняться после каждого ответа.</p><div className="appgrade-tradein-summary-meter"><span style={{ width: `${completed / 6 * 100}%` }} /></div></>}
        {estimate && cartCount > 0 && <button type="button" className="appgrade-tradein-cta" onClick={applyToCart}>Применить к корзине — до {estimate.toLocaleString('ru-RU')} ₽</button>}
        {returnToCart && !estimate && <p className="appgrade-tradein-summary-copy">После оценки устройства вы сможете вернуться к корзине с предварительной скидкой.</p>}
        <div className="appgrade-tradein-notice"><ShieldCheck size={18} /><p>Точную стоимость подтвердим после бесплатной диагностики в магазине.</p></div>
      </aside>
    </div>
  </div></main>;
}
