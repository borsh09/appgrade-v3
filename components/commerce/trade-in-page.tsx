'use client';

import { BatteryMedium, Check, Laptop, PackageCheck, RotateCcw, ShieldCheck, Smartphone, Sparkles, Tablet, Watch, Wrench } from 'lucide-react';
import { useMemo, useState } from 'react';
import { TradeInForm } from './trade-in-form';

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

function getModelFactor(deviceType: DeviceType, model: string) {
  const value = model.toLowerCase();
  const generations: Record<DeviceType, [RegExp, number][]> = {
    'Смартфон': [[/\b(18|s26|pixel 11)\b/, 1], [/\b(17|s25|pixel 10)\b/, .92], [/\b(16|s24|pixel 9)\b/, .82], [/\b(15|s23|pixel 8)\b/, .7], [/\b(14|s22|pixel 7)\b/, .58], [/\b(13|s21|pixel 6)\b/, .48], [/\b(12|s20|pixel 5)\b/, .38], [/\b(11|xs|max|xr)\b/, .28], [/\b(x|se|8|7|6)\b/, .18]],
    'Планшет': [[/\b(m5|2026|2027)\b/, 1], [/\b(m4|2024|2025)\b/, .88], [/\b(m2|2022|2023)\b/, .7], [/\b(2020|2021)\b/, .52], [/\b(2018|2019)\b/, .34]],
    'Ноутбук': [[/\b(m5|2026|2027)\b/, 1], [/\b(m4|2024|2025)\b/, .9], [/\b(m3|2023)\b/, .8], [/\b(m2|2022)\b/, .69], [/\b(m1|2020|2021)\b/, .54], [/\b(2018|2019)\b/, .3]],
    'Смарт-часы': [[/\b(12|ultra 3|2026|2027)\b/, 1], [/\b(11|ultra 2|2025)\b/, .88], [/\b(10|ultra|2024)\b/, .76], [/\b(9|8|2022|2023)\b/, .58], [/\b(7|6|2020|2021)\b/, .4], [/\b(5|4|3)\b/, .25]],
  };
  const match = generations[deviceType].find(([pattern]) => pattern.test(value));
  const premium = /\b(pro max|ultra)\b/.test(value) ? 1.12 : /\bpro\b/.test(value) ? 1.06 : 1;
  return Math.min(1, (match?.[1] ?? .62) * premium);
}

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

export function TradeInPage() {
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
    const base = DEVICES.find((item) => item.value === deviceType)!.base;
    const functionFactor = FUNCTION_OPTIONS.find((item) => item.value === functionState)!.factor;
    const bodyFactor = BODY_OPTIONS.find((item) => item.value === bodyState)!.factor;
    const batteryFactor = BATTERY_OPTIONS.find((item) => item.value === batteryState)!.factor;
    const kitFactor = KIT_OPTIONS.find((item) => item.value === kitState)!.factor;
    const modelFactor = getModelFactor(deviceType, model);
    return Math.max(1500, Math.round((base * modelFactor * functionFactor * bodyFactor * batteryFactor * kitFactor) / 500) * 500);
  }, [ready, deviceType, model, functionState, bodyState, batteryState, kitState]);
  const condition = functionState === 'perfect' && bodyState === 'clean' ? 'Работает исправно' : functionState === 'broken' || bodyState === 'damaged' ? 'Нужна диагностика' : 'Есть следы использования';
  const details = ready ? [`Работа: ${FUNCTION_OPTIONS.find((item) => item.value === functionState)?.label}`, `Корпус: ${BODY_OPTIONS.find((item) => item.value === bodyState)?.label}`, `Аккумулятор: ${BATTERY_OPTIONS.find((item) => item.value === batteryState)?.label}`, `Комплект: ${KIT_OPTIONS.find((item) => item.value === kitState)?.label}`].join('. ') : '';
  const reset = () => { setDeviceType(null); setModel(''); setFunctionState(null); setBodyState(null); setBatteryState(null); setKitState(null); };

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
        {estimate ? <><h2>до {estimate.toLocaleString('ru-RU')} ₽</h2><p className="appgrade-tradein-summary-model">{model}</p><div className="appgrade-tradein-selection"><div><span>Устройство</span><strong>{deviceType}</strong></div><div><span>Состояние</span><strong>{condition}</strong></div></div><TradeInForm deviceType={deviceType!} condition={condition} model={model.trim()} details={details} estimate={estimate} /></> : <><h2>Заполните параметры</h2><p className="appgrade-tradein-summary-copy">Сумма появится здесь и будет меняться после каждого ответа.</p><div className="appgrade-tradein-summary-meter"><span style={{ width: `${completed / 6 * 100}%` }} /></div></>}
        <div className="appgrade-tradein-notice"><ShieldCheck size={18} /><p>Точную стоимость подтвердим после бесплатной диагностики в магазине.</p></div>
      </aside>
    </div>
  </div></main>;
}
