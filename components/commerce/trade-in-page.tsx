'use client';

import { ArrowRight, BatteryMedium, Check, RotateCcw, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import Link from '@/components/shared/safe-link';
import { useCommerce } from '@/components/providers/commerce-provider';
import { normalizeSearchText } from '@/lib/catalog-search';
import {
  getTradeInAssessment, tradeInModels, tradeInPrices, TRADE_IN_STORAGE_KEY,
  type TradeInSelection,
} from '@/lib/trade-in-estimate';
import { TradeInForm } from './trade-in-form';
import styles from './trade-in-page.module.css';

const money = new Intl.NumberFormat('ru-RU');
const functionOptions = [
  { value: 'working', label: 'Всё работает' },
  { value: 'issues', label: 'Есть неисправности' },
  { value: 'broken', label: 'Не включается' },
] as const;
const bodyOptions = [
  { value: 'clean', label: 'Без заметных повреждений' },
  { value: 'worn', label: 'Есть следы использования' },
  { value: 'damaged', label: 'Трещины или сколы' },
] as const;
const batteryPresets = [75, 80, 85, 90, 95, 100];

export function TradeInPage({ returnToCart = false }: { returnToCart?: boolean }) {
  const { cartCount } = useCommerce();
  const [modelSearch, setModelSearch] = useState('');
  const [model, setModel] = useState('');
  const [storage, setStorage] = useState('');
  const [rowId, setRowId] = useState<number | null>(null);
  const [battery, setBattery] = useState('');
  const [functionState, setFunctionState] = useState<TradeInSelection['functionState'] | null>(null);
  const [bodyState, setBodyState] = useState<TradeInSelection['bodyState'] | null>(null);
  const visibleModels = useMemo(() => tradeInModels.filter(name => normalizeSearchText(name).includes(normalizeSearchText(modelSearch))), [modelSearch]);
  const modelRows = useMemo(() => tradeInPrices.filter(row => row.model === model), [model]);
  const storages = [...new Set(modelRows.map(row => row.storage))];
  const storageRows = modelRows.filter(row => row.storage === storage);
  const batteryPercent = battery === '' ? null : Number(battery);
  const batteryValid = batteryPercent !== null && Number.isInteger(batteryPercent) && batteryPercent >= 0 && batteryPercent <= 100;
  const selection = rowId !== null && batteryValid && functionState && bodyState
    ? { rowId, batteryPercent, functionState, bodyState } satisfies TradeInSelection
    : null;
  const assessment = selection ? getTradeInAssessment(selection) : null;
  const selectedRow = storageRows.find(row => row.id === rowId);
  const completed = Number(Boolean(model)) + Number(Boolean(storage && selectedRow)) + Number(batteryValid) + Number(Boolean(functionState)) + Number(Boolean(bodyState));
  const batteryInTable = selectedRow && batteryValid && selectedRow.minBattery !== null && selectedRow.maxBattery !== null
    && batteryPercent >= selectedRow.minBattery && batteryPercent <= selectedRow.maxBattery;
  const batteryRange = selectedRow && selectedRow.minBattery !== null && selectedRow.maxBattery !== null
    ? selectedRow.minBattery === 0 ? `до ${selectedRow.maxBattery}%` : `${selectedRow.minBattery}–${selectedRow.maxBattery}%`
    : null;

  const chooseModel = (value: string) => {
    setModel(value);
    setStorage('');
    setRowId(null);
    setModelSearch(value);
  };
  const chooseStorage = (value: string) => {
    const rows = modelRows.filter(row => row.storage === value);
    setStorage(value);
    setRowId(rows.length === 1 ? rows[0].id : null);
  };
  const reset = () => {
    setModel(''); setStorage(''); setRowId(null); setBattery('');
    setFunctionState(null); setBodyState(null); setModelSearch('');
  };
  const applyToCart = () => {
    if (!selection || !assessment?.estimate) return;
    localStorage.setItem(TRADE_IN_STORAGE_KEY, JSON.stringify({ ...selection, estimate: assessment.estimate }));
    window.location.assign('/cart');
  };
  const batteryHint = assessment?.reason === 'battery'
    ? 'Для такой ёмкости аккумулятора в таблице нет цены — оценим устройство индивидуально.'
    : assessment?.reason === 'condition'
      ? 'При неисправностях или повреждениях точную стоимость определим после диагностики.'
      : 'Эту комплектацию оценим индивидуально после проверки устройства.';

  return <main className={styles.page}><div className="container">
    <header className={styles.hero}>
      <span className={styles.eyebrow}>TRADE-IN · APPGRADE</span>
      <h1>Узнайте стоимость вашего iPhone.</h1>
      <p>Выберите модель из таблицы Trade-In и расскажите о состоянии. Покажем предварительный диапазон или передадим заявку менеджеру.</p>
    </header>
    <div className={styles.layout}>
      <div className={styles.steps}>
        <section className={styles.step} aria-labelledby="trade-model-title">
          <div className={styles.stepTitle}><span>01</span><div><h2 id="trade-model-title">Выберите модель</h2><p>Только устройства из таблицы приёмки</p></div></div>
          <label className={styles.search}><Search size={19} aria-hidden="true"/><input type="search" value={modelSearch} onChange={event => setModelSearch(event.target.value)} placeholder="Найти iPhone, например 15 Pro" aria-label="Найти модель для Trade-In"/></label>
          <div className={styles.models} aria-label="Модели Trade-In">
            {visibleModels.map(name => <button key={name} type="button" className={model === name ? styles.active : ''} aria-pressed={model === name} onClick={() => chooseModel(name)}>{name}{model === name && <Check size={17} aria-hidden="true"/>}</button>)}
            {!visibleModels.length && <p className={styles.noResults}>Такой модели нет в таблице Trade-In.</p>}
          </div>
        </section>
        <section className={styles.step} aria-labelledby="trade-version-title">
          <div className={styles.stepTitle}><span>02</span><div><h2 id="trade-version-title">Уточните версию</h2><p>Доступные варианты зависят от модели</p></div></div>
          {model ? <>
            <span className={styles.fieldLabel}>Память</span>
            <div className={styles.choices}>{storages.map(value => <button type="button" key={value} className={storage === value ? styles.active : ''} aria-pressed={storage === value} onClick={() => chooseStorage(value)}>{value}</button>)}</div>
            {storageRows.length > 1 && <><span className={styles.fieldLabel}>Версия SIM</span><div className={styles.choices}>{storageRows.map(row => <button key={row.id} type="button" className={rowId === row.id ? styles.active : ''} aria-pressed={rowId === row.id} onClick={() => setRowId(row.id)}>{row.sim}</button>)}</div></>}
          </> : <p className={styles.pending}>Сначала выберите модель iPhone.</p>}
        </section>
        <section className={styles.step} aria-labelledby="trade-condition-title">
          <div className={styles.stepTitle}><span>03</span><div><h2 id="trade-condition-title">Состояние устройства</h2><p>Окончательную оценку подтвердим при диагностике</p></div></div>
          <div className={styles.batteryPanel}>
            <div className={styles.batteryHead}>
              <label htmlFor="trade-in-battery"><BatteryMedium size={20} aria-hidden="true"/> Ёмкость аккумулятора</label>
              <span className={styles.batteryInput}><input id="trade-in-battery" type="number" inputMode="numeric" min="0" max="100" value={battery} onChange={event => setBattery(event.target.value)} placeholder="85"/><span>%</span></span>
            </div>
            <input className={styles.batterySlider} type="range" min="0" max="100" step="1" value={batteryValid ? batteryPercent : 0} onChange={event => setBattery(event.target.value)} aria-label="Выбрать ёмкость аккумулятора ползунком" style={{ background: `linear-gradient(90deg, #171717 ${batteryValid ? batteryPercent : 0}%, #e4e4e1 ${batteryValid ? batteryPercent : 0}%)` }}/>
            <div className={styles.batteryScale}><span>0%</span><span>50%</span><span>100%</span></div>
            <div className={styles.batteryPresets} aria-label="Быстрый выбор ёмкости">{batteryPresets.map(value => <button type="button" key={value} className={batteryPercent === value ? styles.active : ''} aria-pressed={batteryPercent === value} onClick={() => setBattery(String(value))}>{value}%</button>)}</div>
            <p className={styles.batteryHint} aria-live="polite">{!batteryValid
              ? battery === '' ? 'Укажите процент в настройках iPhone или выберите значение выше.' : 'Введите целое число от 0 до 100%.'
              : !selectedRow ? 'Выберите модель и память, чтобы увидеть диапазон из таблицы.'
                : batteryRange ? batteryInTable ? `${batteryPercent}% входит в диапазон таблицы: ${batteryRange}.` : `Для этой версии в таблице указан аккумулятор ${batteryRange}. При ${batteryPercent}% нужна индивидуальная оценка.`
                  : 'Для этой версии стоимость уточняется у менеджера.'}</p>
          </div>
          <span className={styles.fieldLabel}>Работоспособность</span>
          <div className={styles.choices}>{functionOptions.map(option => <button key={option.value} type="button" className={functionState === option.value ? styles.active : ''} aria-pressed={functionState === option.value} onClick={() => setFunctionState(option.value)}>{option.label}</button>)}</div>
          <span className={styles.fieldLabel}>Корпус и экран</span>
          <div className={styles.choices}>{bodyOptions.map(option => <button key={option.value} type="button" className={bodyState === option.value ? styles.active : ''} aria-pressed={bodyState === option.value} onClick={() => setBodyState(option.value)}>{option.label}</button>)}</div>
        </section>
      </div>
      <aside className={styles.summary} aria-live="polite">
        <div className={styles.summaryTop}><span className={styles.summaryIcon}><Sparkles size={22}/></span><button type="button" onClick={reset} disabled={completed === 0} aria-label="Сбросить оценку"><RotateCcw size={18}/></button></div>
        <span className={styles.summaryLabel}>ПРЕДВАРИТЕЛЬНАЯ ОЦЕНКА</span>
        {assessment && selection ? <>
          <h2>{assessment.estimate ? `до ${money.format(assessment.estimate)} ₽` : 'По запросу'}</h2>
          <p className={styles.summaryModel}>{assessment.row.model} · {assessment.row.storage}{assessment.row.sim ? ` · ${assessment.row.sim}` : ''}</p>
          {assessment.estimate ? <>
            <div className={styles.priceRange}><span>По таблице приёмки</span><strong>{assessment.row.minPrice === null ? `до ${money.format(assessment.row.maxPrice!)} ₽` : `${money.format(assessment.row.minPrice)}–${money.format(assessment.row.maxPrice!)} ₽`}</strong></div>
            <p className={styles.summaryHelp}>В корзине учтём верхнюю границу как предварительную скидку. Итог зависит от осмотра устройства.</p>
            {cartCount > 0 && <button type="button" className={styles.apply} onClick={applyToCart}>Применить к корзине <ArrowRight size={18}/></button>}
          </> : <><p className={styles.summaryHelp}>{batteryHint}</p>{assessment.reason === 'request' && assessment.row.minPrice !== null && <p className={styles.tableHint}>В таблице указано от {money.format(assessment.row.minPrice)} ₽. Верхнюю границу уточнит менеджер.</p>}</>}
          {(!returnToCart || !assessment.estimate) && <TradeInForm key={`${selection.rowId}-${selection.batteryPercent}-${selection.functionState}-${selection.bodyState}`} selection={selection} estimate={assessment.estimate}/>}
          {returnToCart && <Link className={styles.back} href="/cart">Вернуться в корзину</Link>}
        </> : <>
          <h2>Оценим вместе</h2>
          <p className={styles.summaryHelp}>Заполните параметры слева — здесь появится сумма из таблицы или вариант индивидуальной оценки.</p>
          <div className={styles.progress}><span style={{ width: `${completed / 5 * 100}%` }}/></div>
          <small>{completed} из 5 параметров</small>
        </>}
        <div className={styles.notice}><ShieldCheck size={20}/><span>Точную стоимость подтвердим после бесплатной диагностики в магазине.</span></div>
      </aside>
    </div>
  </div></main>;
}
