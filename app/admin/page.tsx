'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ArrowDownToLine,
  BarChart3,
  Boxes,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tag,
  UploadCloud,
  UserRound,
  Wrench,
} from 'lucide-react';
import { CITIES } from '@/config/cities';
import { notifyPriceUpdate } from '@/lib/price-updates';
import { orderStatuses, tradeInStatuses, nextEntryStatuses, statusActionLabels, closedOrderStatuses, completedOrderStatuses } from '@/lib/order-status';
import type { CatalogItem } from '@/lib/catalog-registry';

type Entry = {
  id: string;
  status: string;
  created_at: string;
  notified_at: string | null;
  attempts?: number;
  payload: {
    customer: { name: string; phone: string };
    total?: number;
    model?: string;
    rowId?: number;
    storage?: string;
    sim?: string | null;
    batteryPercent?: number;
    functionState?: string;
    bodyState?: string;
    condition?: string;
    details?: string;
    estimate?: number | null;
    assessmentReason?: string;
    priceLabel?: string;
    batteryLabel?: string;
    tradeIn?: { model: string; storage: string; sim: string | null; batteryPercent: number; functionState: string; bodyState: string; estimate: number; rowId: number };
    city?: { name?: string };
    fulfillment?: string;
    deliveryAddress?: string;
    services?: { title: string; price: number }[];
    comment?: string;
    telegramUsername?: string;
    items?: { name: string; quantity: number; price?: number; configuration?: string }[];
  };
};
type Report = {
  changes: {
    id: string;
    name: string;
    before: number | null;
    after: number;
    source: string;
  }[];
  matched: number;
  matchedRows?: number;
  unchanged: number;
  inputRows?: number;
  unmatchedRows?: number;
  unavailableRows?: number;
  hiddenRows?: number;
  blankRows?: number;
  articleMappings?: Record<string, string>;
  warnings: string[];
  errors: string[];
};
type State = {
  catalog: CatalogItem[];
  prices: Record<string, number | null>;
  priceRevision: string;
  priceUpdatedAt: string;
  inventory: { sku: string; city: string; quantity: number }[];
  discounts: { sku: string; city: string; price: number }[];
  cityPrices: {
    sku: string;
    city: string;
    price: number;
    updated_at: string;
  }[];
  orders: Entry[];
  tradeIns: Entry[];
  orderSummary: { total: number; new: number; active: number; revenue: string };
  tradeInSummary: { total: number; new: number };
  metrics: { day: string; event: string; count: number }[];
  history: {
    id: string;
    source: string;
    owner_id: string;
    created_at: string;
  }[];
  imports: {
    id: string;
    filename: string;
    status: string;
    report: Report;
    created_at: string;
  }[];
  audit: { id: string; owner_id: string; action: string; details: Record<string, unknown>; created_at: string }[];
};
type Tab = 'overview' | 'orders' | 'tradeIns' | 'prices' | 'catalog';
function mergeEntries(recent: Entry[], older: Entry[]) {
  const seen = new Set<string>();
  return [...recent, ...older]
    .filter((entry) => !seen.has(entry.id) && !!seen.add(entry.id))
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id));
}
const money = new Intl.NumberFormat('ru-RU');
const date = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
const categoryNames: Record<string, string> = {
  all: 'Все товары',
  iphones: 'iPhone',
  samsung: 'Samsung',
  smartphones: 'Другие смартфоны',
  macbooks: 'MacBook',
  ipads: 'iPad',
  watches: 'Часы',
  audio: 'Аудио',
  playstation: 'PlayStation',
  google: 'Google',
  xiaomi: 'Xiaomi',
  cameras: 'Камеры',
  dyson: 'Dyson',
  gadgets: 'Гаджеты',
};

export default function AdminPage() {
  const [state, setState] = useState<State | null>(null),
    [checking, setChecking] = useState(true),
    [error, setError] = useState(''),
    [notice, setNotice] = useState(''),
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState<Tab>('overview'),
    [query, setQuery] = useState(''),
    [draft, setDraft] = useState<{
      id: string;
      filename: string;
      report: Report;
      targetCities?: string[];
    } | null>(null),
    [olderOrders, setOlderOrders] = useState<Entry[]>([]),
    [olderTradeIns, setOlderTradeIns] = useState<Entry[]>([]);
  async function api(url: string, options?: RequestInit) {
    const headers = new Headers(options?.headers);
    if (!(options?.body instanceof FormData))
      headers.set('Content-Type', 'application/json');
    const response = await fetch(url, { ...options, headers });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Ошибка запроса');
    return result;
  }
  async function load() {
    try {
      setState(await api('/api/admin'));
      setError('');
    } catch (e) {
      if ((e as Error).message.includes('вход')) setState(null);
      else setError((e as Error).message);
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => {
    queueMicrotask(() => void load());
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void load();
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  async function login(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      await api('/api/admin/session', {
        method: 'POST',
        body: JSON.stringify({
          user: form.get('user'),
          password: form.get('password'),
        }),
      });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    await api('/api/admin/session', { method: 'DELETE' });
    setState(null);
  }
  async function mutate(body: unknown) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await api('/api/admin', { method: 'PATCH', body: JSON.stringify(body) });
      const change = body as { action?: string; type?: string; id?: string; status?: string; city?: string; price?: number | null; quantity?: number | null };
      if (change.id && change.status && change.action === 'order')
        setOlderOrders((items) => items.map((item) => item.id === change.id ? { ...item, status: change.status! } : item));
      if (change.id && change.status && change.action === 'trade-in')
        setOlderTradeIns((items) => items.map((item) => item.id === change.id ? { ...item, status: change.status! } : item));
      if (change.action === 'city-product' && change.id && change.city) {
        const { id, city, price, quantity } = change;
        setState((current) => current ? {
          ...current,
          cityPrices: [...current.cityPrices.filter((row) => row.sku !== id || row.city !== city),
            ...(price == null ? [] : [{ sku: id, city, price, updated_at: new Date().toISOString() }])],
          inventory: [...current.inventory.filter((row) => row.sku !== id || row.city !== city),
            ...(quantity == null ? [] : [{ sku: id, city, quantity }])],
        } : current);
        notifyPriceUpdate();
      } else if (change.action === 'product-discount' && change.id && change.city) {
        const { id, city, price } = change;
        setState(current => current ? { ...current, discounts: [
          ...current.discounts.filter(row => row.sku !== id || row.city !== city),
          ...(price == null ? [] : [{ sku: id, city, price }]),
        ] } : current);
        notifyPriceUpdate();
      } else {
        if (change.action === 'product' || change.action === 'inventory') notifyPriceUpdate();
        await load();
      }
      setNotice('Изменения сохранены.');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function loadMore(type: 'order' | 'trade-in', last: Entry) {
    setBusy(true);
    setError('');
    try {
      const params = new URLSearchParams({ type, before: last.created_at, beforeId: last.id });
      const result = await api(`/api/admin/entries?${params}`) as { entries: Entry[] };
      const setter = type === 'order' ? setOlderOrders : setOlderTradeIns;
      setter((items) => mergeEntries(items, result.entries));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get('file');
    if (!(file instanceof File) || !file.name) {
      setError('Сначала выберите Excel-файл .xlsx.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    setDraft(null);
    try {
      setDraft(await api('/api/admin/prices', { method: 'POST', body: form }));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function priceAction(action: 'apply' | 'rollback', id: string) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await api('/api/admin/prices', {
        method: 'PATCH',
        body: JSON.stringify({ action, id }),
      });
      setDraft(null);
      notifyPriceUpdate();
      await load();
      setNotice(result.message);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (checking)
    return (
      <main className="admin-shell admin-loading">
        <RefreshCw className="spin" />
        <span>Открываем панель управления</span>
      </main>
    );
  if (!state)
    return (
      <main className="admin-shell admin-login">
        <section className="admin-login-card">
          <div className="admin-brand">
            <span>A</span>
            <strong>APPGRADE</strong>
          </div>
          <div className="admin-login-icon">
            <ShieldCheck />
          </div>
          <p className="admin-kicker">ЗАЩИЩЁННЫЙ ДОСТУП</p>
          <h1>Панель управления</h1>
          <p>Цены, остатки и заказы — в одном рабочем пространстве.</p>
          <form onSubmit={login}>
            <label>
              <span>Логин</span>
              <input
                name="user"
                autoComplete="username"
                defaultValue="admin"
                required
              />
            </label>
            <label>
              <span>Пароль</span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </label>
            {error && <div className="admin-alert">{error}</div>}
            <button disabled={busy}>
              {busy ? 'Проверяем…' : 'Войти в панель'}
              <ChevronRight size={17} />
            </button>
          </form>
          <small>
            Сессия защищена и автоматически завершится через 8 часов.
          </small>
        </section>
      </main>
    );
  const fresh = !error;
  const nav: [Tab, string, React.ReactNode, number?][] = [
    ['overview', 'Обзор', <LayoutDashboard key="o" />],
    [
      'orders',
      'Заказы',
      <ShoppingBag key="a" />,
      state.orderSummary.new,
    ],
    [
      'tradeIns',
      'Trade‑In',
      <Wrench key="t" />,
      state.tradeInSummary.new,
    ],
    ['prices', 'Прайс-листы', <FileSpreadsheet key="p" />],
    ['catalog', 'Каталог и остатки', <Boxes key="c" />],
  ];
  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span>A</span>
          <strong>APPGRADE</strong>
          <small>CONTROL</small>
        </div>
        <nav>
          {nav.map(([id, label, icon, count]) => (
            <button
              key={id}
              className={tab === id ? 'active' : ''}
              aria-current={tab === id ? 'page' : undefined}
              aria-label={label}
              onClick={() => { setTab(id); setNotice(''); }}
            >
              {icon}
              <span className="admin-nav-label">{label}</span>
              <span className="admin-nav-mobile">{id === 'catalog' ? 'Каталог' : id === 'prices' ? 'Цены' : label}</span>
              {count ? <i>{count}</i> : null}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <div className="admin-user">
            <UserRound />
            <span>
              <strong>Администратор</strong>
              <small>Полный доступ</small>
            </span>
          </div>
          <button onClick={() => void logout()}>
            <LogOut />
            <span>Выйти</span>
          </button>
        </div>
      </aside>
      <section className="admin-workspace">
        <header>
          <div>
            <p className="admin-kicker">ПАНЕЛЬ УПРАВЛЕНИЯ</p>
            <h1>{nav.find((x) => x[0] === tab)?.[1]}</h1>
            <p className="admin-header-description">{tab === 'prices' ? 'Проверка и обновление цен из Excel' : tab === 'catalog' ? 'Цены и наличие в каждом магазине' : tab === 'orders' ? 'Все заказы и их текущий статус' : tab === 'tradeIns' ? 'Заявки клиентов на обмен устройств' : 'Главные показатели вашего магазина'}</p>
          </div>
          <div className="admin-header-actions">
            <span className={fresh ? 'online' : 'offline'}>
              <i />
              {fresh ? 'База подключена' : 'База недоступна'}
            </span>
            <button onClick={() => void load()} aria-label="Обновить">
              <RefreshCw size={18} />
            </button>
          </div>
        </header>
        {error && (
          <div className="admin-toast admin-toast-error" role="alert">
            <AlertCircle size={20} /><span>{error}</span>
            <button aria-label="Закрыть ошибку" onClick={() => setError('')}>×</button>
          </div>
        )}
        {notice && <output className="admin-toast admin-toast-success"><CheckCircle2 size={20} /><span>{notice}</span><button aria-label="Закрыть уведомление" onClick={() => setNotice('')}>×</button></output>}
        <div className="admin-view" key={tab}>
        {tab === 'overview' && (
          <Overview state={state} fresh={fresh} setTab={setTab} />
        )}{' '}
        {tab === 'orders' && (
          <Entries
            title="Заказы"
            entries={mergeEntries(state.orders, olderOrders)}
            total={state.orderSummary.total}
            newCount={state.orderSummary.new}
            type="order"
            busy={busy}
            mutate={mutate}
            loadMore={loadMore}
          />
        )}{' '}
        {tab === 'tradeIns' && (
          <Entries
            title="Заявки Trade‑In"
            entries={mergeEntries(state.tradeIns, olderTradeIns)}
            total={state.tradeInSummary.total}
            newCount={state.tradeInSummary.new}
            type="trade-in"
            busy={busy}
            mutate={mutate}
            loadMore={loadMore}
          />
        )}{' '}
        {tab === 'prices' && (
          <Prices
            state={state}
            draft={draft}
            busy={busy}
            upload={upload}
            priceAction={priceAction}
          />
        )}{' '}
        {tab === 'catalog' && (
          <Catalog
            state={state}
            query={query}
            setQuery={setQuery}
            busy={busy}
            mutate={mutate}
          />
        )}
        </div>
      </section>
    </main>
  );
}

function Overview({
  state,
  fresh,
  setTab,
}: {
  state: State;
  fresh: boolean;
  setTab: (tab: Tab) => void;
}) {
  const revenue = Number(state.orderSummary.revenue),
    active = state.orderSummary.active,
    low = state.inventory.filter((x) => x.quantity <= 2).length;
  const days = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of state.metrics)
      map.set(m.day, (map.get(m.day) || 0) + m.count);
    return [...map.entries()].slice(0, 14).reverse();
  }, [state.metrics]);
  const max = Math.max(1, ...days.map((x) => x[1]));
  return (
    <div className="admin-page">
      <div className="admin-stats">
        <Stat
          icon={<CircleDollarSign />}
          label="Оборот заказов"
          value={`${money.format(revenue)} ₽`}
          note="без отменённых"
        />
        <Stat
          icon={<ShoppingBag />}
          label="В работе"
          value={String(active)}
          note={`${state.orderSummary.total} всего`}
        />
        <Stat
          icon={<PackageCheck />}
          label="Товаров"
          value={String(state.catalog.length)}
          note={`${low} с низким остатком`}
        />
        <Stat
          icon={<Activity />}
          label="База заказов"
          value={fresh ? 'Онлайн' : 'Нет связи'}
          note={fresh ? 'Данные загружены' : 'Обновите данные'}
        />
      </div>
      <div className="admin-grid-main">
        <section className="admin-card admin-chart">
          <div className="admin-card-head">
            <div>
              <p className="admin-kicker">АКТИВНОСТЬ</p>
              <h2>События за 14 дней</h2>
            </div>
            <BarChart3 />
          </div>
          {days.length ? (
            <div className="admin-bars">
              {days.map(([day, value]) => (
                <div key={day}>
                  <span
                    style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
                  />
                  <small>{new Date(day).getDate()}</small>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Статистика появится после первых визитов и заказов." />
          )}
        </section>
        <section className="admin-card">
          <div className="admin-card-head">
            <div>
              <p className="admin-kicker">ПОСЛЕДНИЕ</p>
              <h2>Новые заказы</h2>
            </div>
            <button className="admin-link" onClick={() => setTab('orders')}>
              Все заказы <ChevronRight />
            </button>
          </div>
          {state.orders.slice(0, 5).map((x) => (
            <div className="admin-row" key={x.id}>
              <span className="admin-row-icon">
                <ShoppingBag />
              </span>
              <div>
                <strong>{x.payload.customer.name}</strong>
                <small>
                  {date(x.created_at)} ·{' '}
                  {x.payload.city?.name || 'Город не указан'}
                </small>
              </div>
              <b>{money.format(x.payload.total || 0)} ₽</b>
            </div>
          ))}
          {!state.orders.length && <Empty text="Новых заказов пока нет." />}
        </section>
      </div>
    </div>
  );
}
function Stat({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <section className="admin-stat">
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{note}</small>
    </section>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="admin-empty">
      <Clock3 />
      <p>{text}</p>
    </div>
  );
}

function Entries({
  title,
  entries,
  total,
  newCount,
  type,
  busy,
  mutate,
  loadMore,
}: {
  title: string;
  entries: Entry[];
  total: number;
  newCount: number;
  type: 'order' | 'trade-in';
  busy: boolean;
  mutate: (body: unknown) => Promise<void>;
  loadMore: (type: 'order' | 'trade-in', last: Entry) => Promise<void>;
}) {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const statuses = type === 'order' ? orderStatuses : tradeInStatuses;
  const shown = entries.filter((entry) => {
    const matchesStatus = filter === 'all' || entry.status === filter
      || (filter === 'active' && entry.status !== 'new' && !closedOrderStatuses.includes(entry.status))
      || (filter === 'done' && completedOrderStatuses.includes(entry.status));
    const matchesCity = cityFilter === 'all' || entry.payload.city?.name === CITIES[cityFilter as keyof typeof CITIES]?.name;
    const haystack = `${entry.id} ${entry.payload.customer.name} ${entry.payload.customer.phone} ${entry.payload.city?.name || ''} ${entry.payload.model || ''} ${entry.payload.items?.map((item) => item.name).join(' ') || ''}`.toLowerCase();
    return matchesStatus && matchesCity && haystack.includes(query.toLowerCase().trim());
  });
  return (
    <div className={`admin-page admin-entries-page ${type === 'order' ? 'admin-orders-page' : 'admin-trade-page'}`}>
      <section className="admin-entry-hero">
        <div className="admin-entry-hero-icon">{type === 'order' ? <ShoppingBag /> : <Wrench />}</div>
        <div><p className="admin-kicker">{type === 'order' ? 'РАБОТА С ПРОДАЖАМИ' : 'ОЦЕНКА УСТРОЙСТВ'}</p><h2>{type === 'order' ? 'Обрабатывайте заказы без потерь' : 'Ведите Trade‑In заявки в одном месте'}</h2><p>{type === 'order' ? 'Откройте заказ, свяжитесь с клиентом и обновите статус после разговора.' : 'Проверьте модель и состояние устройства, затем свяжитесь с клиентом для диагностики.'}</p></div>
        <div className="admin-entry-hero-count"><strong>{newCount}</strong><span>новых</span></div>
      </section>
      <div className="admin-section-tools">
        <div>
          <h2>{title}</h2>
          <p>{total} записей в журнале{total > entries.length ? ` · показаны последние ${entries.length}` : ''}</p>
        </div>
        <div className="admin-segments">
          {[
            ['all', 'Все'],
            ['new', 'Новые'],
            ['active', 'В работе'],
            ['done', 'Завершённые'],
          ].map(([id, label]) => (
            <button
              className={filter === id ? 'active' : ''}
              key={id}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="admin-entry-filters">
      <label className="admin-search admin-entry-search">
        <Search />
        <input aria-label="Поиск заказов" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Клиент, телефон, товар или номер заказа" />
      </label>
      <select aria-label="Город заказа" className="admin-entry-city-filter" value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}>
        <option value="all">Все города</option>
        {Object.entries(CITIES).map(([id, city]) => <option key={id} value={id}>{city.name}</option>)}
      </select>
      <select aria-label="Статус заказа" className="admin-entry-city-filter" value={filter} onChange={(event) => setFilter(event.target.value)}>
        <option value="all">Все статусы</option>
        <option value="active">В работе</option>
        <option value="done">Завершённые</option>
        {Object.entries(statuses).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select>
      </div>
      <p className="admin-entry-result" aria-live="polite">Найдено: <strong>{shown.length}</strong> из {entries.length} загруженных</p>
      <section className="admin-table-card">
        <div className="admin-table admin-orders-table">
          <div className="admin-table-head">
            <span>Клиент</span>
            <span>Создан</span>
            <span>Сумма / модель</span>
            <span>Статус</span>
            <span>Действия</span>
          </div>
          {shown.map((entry) => (
            <div className={`admin-order-group${expandedId === entry.id ? ' is-expanded' : ''}`} key={entry.id}>
            <div className="admin-table-row">
              <span>
                <strong>{entry.payload.customer.name}</strong>
                <a className="admin-customer-phone" href={`tel:${entry.payload.customer.phone}`}>{entry.payload.customer.phone}</a>
                <small>{entry.payload.city?.name || '\u0413\u043e\u0440\u043e\u0434 \u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d'}</small>
                <button aria-expanded={expandedId === entry.id} aria-controls={`order-details-${entry.id}`} className="admin-order-open" onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}>
                  {expandedId === entry.id ? '\u0441\u043a\u0440\u044b\u0442\u044c' : '\u043f\u043e\u0434\u0440\u043e\u0431\u043d\u0435\u0435'}
                </button>
              </span>
              <span>
                <strong>{date(entry.created_at)}</strong>
                <small>Сохранено в базе</small>
              </span>
              <span>
                <strong>
                  {entry.payload.total
                    ? `${money.format(entry.payload.total)} ₽`
                    : entry.payload.model || '—'}
                </strong>
                <small>
                  {entry.payload.items?.length
                    ? `${entry.payload.items.length} позиций`
                    : entry.id.slice(0, 8)}
                </small>
                {type === 'order' && <small>{entry.payload.fulfillment === 'delivery' ? 'Доставка' : 'Самовывоз'}</small>}
              </span>
              <span>
                <i className={`status status-${entry.status}`}>
                  {statuses[entry.status] || entry.status}
                </i>
              </span>
              <span className="admin-actions">
                {nextEntryStatuses(type, entry.status, entry.payload.fulfillment).map((status) => (
                  <button key={status} className={status === 'cancelled' ? 'ghost' : undefined} disabled={busy}
                    onClick={() => {
                      if (status === 'cancelled' && !window.confirm('Отменить эту заявку? Для заказа зарезервированные товары вернутся в остатки.')) return;
                      void mutate({ action: type, id: entry.id, status });
                    }}>
                    {statusActionLabels[status]}
                  </button>
                ))}
              </span>
            </div>
            {expandedId === entry.id && (
              <div id={`order-details-${entry.id}`} className="admin-order-details">
                <div className="admin-order-details-head">
                  <strong>Заказ № {entry.id.slice(0, 8)}</strong>
                  <span>{date(entry.created_at)}</span>
                </div>
                <div className="admin-order-details-grid">
                  <div><small>Клиент</small><strong>{entry.payload.customer.name}</strong><a href={`tel:${entry.payload.customer.phone}`}>{entry.payload.customer.phone}</a></div>
                  <div><small>Связь</small><strong>{entry.payload.telegramUsername ? `Telegram: @${entry.payload.telegramUsername.replace(/^@/, '')}` : 'Телефонный звонок'}</strong></div>
                  <div><small>Получение</small><strong>{entry.payload.fulfillment === 'delivery' ? 'Доставка' : 'Самовывоз'}</strong><span>{entry.payload.deliveryAddress || entry.payload.city?.name || 'Адрес не указан'}</span></div>
                </div>
                <div className="admin-order-items">
                  {(type === 'trade-in' || entry.payload.tradeIn) && <TradeInDetails payload={entry.payload} />}
                  <small>Состав заказа</small>
                  {entry.payload.items?.map((item, index) => <div key={`${item.name}-${index}`}><span>{item.name}{item.configuration ? ` · ${item.configuration}` : ''} × {item.quantity}</span><b>{item.price ? `${money.format(item.price * item.quantity)} ₽` : ''}</b></div>)}
                  {entry.payload.services?.map((service) => <div key={service.title}><span>Услуга: {service.title}</span><b>{money.format(service.price)} ₽</b></div>)}
                </div>
                {entry.payload.comment && <p className="admin-order-comment"><small>Комментарий клиента</small>{entry.payload.comment}</p>}
              </div>
            )}
            </div>
          ))}
          {!shown.length && <Empty text="В этой категории пока ничего нет." />}
        </div>
      </section>
      {entries.length < total && entries.length > 0 && (
        <div className="admin-pagination">
          <button disabled={busy} onClick={() => void loadMore(type, entries[entries.length - 1])}>
            {busy ? 'Загружаем…' : 'Показать более ранние заявки'}
          </button>
        </div>
      )}
    </div>
  );
}

function TradeInDetails({ payload }: { payload: Entry['payload'] }) {
  const device = payload.tradeIn ?? payload;
  const functions: Record<string, string> = { working: 'Работает исправно', issues: 'Есть неисправности', broken: 'Не работает' };
  const bodies: Record<string, string> = { clean: 'Без следов использования', worn: 'Есть следы использования', damaged: 'Есть повреждения' };
  const reasons: Record<string, string> = { priced: 'Рассчитана по таблице', request: 'Оценка по запросу', battery: 'Аккумулятор вне диапазона таблицы', condition: 'Требуется диагностика состояния' };
  const fields = [
    ['Модель', device.model], ['Память', device.storage], ['SIM', device.sim],
    ['Аккумулятор', device.batteryPercent == null ? undefined : `${device.batteryPercent}%`],
    ['Работоспособность', device.functionState ? functions[device.functionState] ?? device.functionState : undefined],
    ['Состояние корпуса', device.bodyState ? bodies[device.bodyState] ?? device.bodyState : undefined],
    ['Предварительная оценка', device.estimate == null ? 'После диагностики' : `${money.format(device.estimate)} ₽`],
    ['Причина оценки', payload.assessmentReason ? reasons[payload.assessmentReason] ?? payload.assessmentReason : undefined],
    ['Диапазон аккумулятора по таблице', payload.batteryLabel], ['Цена по таблице', payload.priceLabel],
    ['Состояние', payload.condition], ['Дополнительные сведения', payload.details],
  ];
  const city = payload.city as unknown;
  const cityName = typeof city === 'string' ? CITIES[city as keyof typeof CITIES]?.name ?? city : payload.city?.name;
  return <section aria-label="Параметры Trade-In"><h3>Trade-In — параметры устройства</h3>
    {cityName && <div><span>Город</span><b>{cityName}</b></div>}
    {fields.filter(([, value]) => value != null && value !== '').map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}
  </section>;
}

function Prices({
  state,
  draft,
  busy,
  upload,
  priceAction,
}: {
  state: State;
  draft: { id: string; filename: string; report: Report } | null;
  busy: boolean;
  upload: (e: React.SyntheticEvent<HTMLFormElement>) => Promise<void>;
  priceAction: (a: 'apply' | 'rollback', id: string) => Promise<void>;
}) {
  const [targetCities, setTargetCities] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const cityEntries = Object.entries(CITIES) as [string, { name: string }][];
  return (
    <div className="admin-page">
      <div className="admin-price-grid">
        <section className="admin-card admin-upload">
          <div className="admin-card-head">
            <div>
              <p className="admin-kicker">ИМПОРТ EXCEL</p>
              <h2>Обновить цены</h2>
            </div>
            <UploadCloud />
          </div>
          <p>
            Загрузите прайс до 4 МБ. Сначала система покажет все изменения и
            ошибки — цены применятся только после подтверждения.
          </p>
          <p><a href="/api/admin/prices" download="appgrade-prices.xlsx"><ArrowDownToLine size={16} /> Скачать шаблон с артикулами сайта</a></p>
          <p>В файле «Парсер» читается только лист «Сайт Аппгрейд»: A — бренд, B — название, C — артикул, D — цена в рублях. Строка заголовков не обязательна. Пустые цены сохраняют текущие значения; цена 1 пропускается.</p>
          <form onSubmit={upload}>
            <fieldset className="admin-city-picker">
              <legend>Применить прайс для городов</legend>
              <label><input type="checkbox" checked={!targetCities.length} onChange={() => setTargetCities([])} /> Все города</label>
              {cityEntries.map(([id, city]) => <label key={id}><input type="checkbox" checked={targetCities.includes(id)} onChange={() => setTargetCities((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])} /> {city.name}</label>)}
              <input type="hidden" name="cities" value={JSON.stringify(targetCities)} />
            </fieldset>
            <label>
              <FileSpreadsheet />
              <span>
                <strong>Выберите файл .xlsx</strong>
                <small>Лист «Сайт Аппгрейд», цены в четвёртом столбце (D). Подходит файл «Парсер.xlsx».</small>
              </span>
              <input type="file" name="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => setSelectedFile(event.currentTarget.files?.[0] ?? null)} />
              <em className="admin-file-name">{selectedFile ? selectedFile.name : 'Файл ещё не выбран'}</em>
            </label>
            <button type="submit" disabled={busy || !selectedFile}>
              <ArrowDownToLine /> {busy ? 'Проверяем файл…' : 'Проверить прайс'}
            </button>
          </form>
        </section>
        <section className="admin-card admin-price-state">
          <p className="admin-kicker">ТЕКУЩАЯ ВЕРСИЯ</p>
          <Tag />
          <strong>
            {state.priceRevision === 'initial'
              ? 'Исходный прайс'
              : state.priceRevision?.slice(0, 8)}
          </strong>
          <span>
            Обновлён {state.priceUpdatedAt ? date(state.priceUpdatedAt) : '—'}
          </span>
          {state.priceRevision !== 'initial' && (
            <button
              disabled={busy}
              onClick={() => void priceAction('rollback', state.priceRevision)}
            >
              Откатить последнее обновление
            </button>
          )}
        </section>
      </div>
      {draft && (
        <section className="admin-card admin-report">
          <div className="admin-card-head">
            <div>
              <p className="admin-kicker">ПРЕДПРОСМОТР</p>
              <h2>{draft.filename}</h2>
            </div>
            <span
              className={
                draft.report.errors.length ? 'report-bad' : 'report-good'
              }
            >
              {draft.report.errors.length
                ? 'Есть ошибки'
                : 'Готов к применению'}
            </span>
          </div>
          <div className="admin-report-stats">
            {draft.report.inputRows !== undefined && (
              <span><strong>{draft.report.inputRows}</strong> товарных строк</span>
            )}
            {(draft.report.unmatchedRows ?? 0) > 0 && (
              <span><strong>{draft.report.unmatchedRows}</strong> без совпадения</span>
            )}
            {draft.report.matchedRows !== undefined && (
              <span><strong>{draft.report.matchedRows}</strong> строк связано по артикулу</span>
            )}
            {(draft.report.unavailableRows ?? 0) > 0 && (
              <span><strong>{draft.report.unavailableRows}</strong> не продаётся (цена 1)</span>
            )}
            {(draft.report.hiddenRows ?? 0) > 0 && (
              <span><strong>{draft.report.hiddenRows}</strong> скрыто по пометке Active</span>
            )}
            {(draft.report.blankRows ?? 0) > 0 && <span><strong>{draft.report.blankRows}</strong> с пустой ценой — пропущено</span>}
            <span><strong>{draft.report.unchanged}</strong> цен без изменений</span>
            <span>
              <strong>{draft.report.matched}</strong> сопоставлено
            </span>
            <span>
              <strong>{draft.report.changes.length}</strong> изменится
            </span>
            <span>
              <strong>{draft.report.warnings.length}</strong> предупреждений
            </span>
            <span>
              <strong>{draft.report.errors.length}</strong> ошибок
            </span>
          </div>
          {draft.report.changes.slice(0, 50).map((c) => (
            <div className="price-change" key={c.id}>
              <div>
                <strong>{c.name}</strong>
                <small>{c.source}</small>
              </div>
              <span>
                <del>{c.before ? `${money.format(c.before)} ₽` : '—'}</del>
                <ChevronRight />
                <b>{money.format(c.after)} ₽</b>
              </span>
            </div>
          ))}
          {draft.report.changes.length > 50 && <p>Показаны первые 50 изменений из {draft.report.changes.length}. При подтверждении применятся все изменения.</p>}
          {draft.report.errors.map((text, index) => <p className="report-message report-error" key={`error-${index}`}><AlertCircle size={18} /><span>{text}</span></p>)}
          {draft.report.warnings.map((text, index) => <p className="report-message report-warning" key={`warning-${index}`}><AlertCircle size={18} /><span>{text}</span></p>)}
          {(draft.report.changes.length > 0 || Object.keys(draft.report.articleMappings ?? {}).length > 0) && draft.report.errors.length === 0 && (
            <button
              className="admin-primary"
              disabled={busy}
              onClick={() => void priceAction('apply', draft.id)}
            >
              <Check /> {draft.report.changes.length > 0
                ? `Применить ${draft.report.changes.length} изменений цен`
                : `Сохранить связи ${Object.keys(draft.report.articleMappings ?? {}).length} артикулов`}
            </button>
          )}
        </section>
      )}
      <section className="admin-card">
        <div className="admin-card-head">
          <div>
            <p className="admin-kicker">ЖУРНАЛ</p>
            <h2>История обновлений</h2>
          </div>
        </div>
        {state.history.map((x) => (
          <div className="admin-row" key={x.id}>
            <span className="admin-row-icon">
              <FileSpreadsheet />
            </span>
            <div>
              <strong>{x.source}</strong>
              <small>
                {date(x.created_at)} · {x.owner_id}
              </small>
            </div>
            <code>{x.id.slice(0, 8)}</code>
          </div>
        ))}
        {!state.history.length && (
          <Empty text="История появится после первого обновления." />
        )}
      </section>
    </div>
  );
}

function Catalog({
  state,
  query,
  setQuery,
  busy,
  mutate,
}: {
  state: State;
  query: string;
  setQuery: (x: string) => void;
  busy: boolean;
  mutate: (b: unknown) => Promise<void>;
}) {
  const [city, setCity] = useState(Object.keys(CITIES)[0]),
    [category, setCategory] = useState('all'),
    [model, setModel] = useState('all'),
    [page, setPage] = useState(1);
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of state.catalog)
      counts.set(
        item.category || 'gadgets',
        (counts.get(item.category || 'gadgets') || 0) + 1,
      );
    return [...counts.entries()].sort((a, b) =>
      (categoryNames[a[0]] || a[0]).localeCompare(
        categoryNames[b[0]] || b[0],
        'ru',
      ),
    );
  }, [state.catalog]);
  const models = useMemo(
    () =>
      [
        ...new Set(
          state.catalog
            .filter(
              (item) =>
                category === 'all' || (item.category || 'gadgets') === category,
            )
            .map((item) => item.model),
        ),
      ].sort((a, b) => a.localeCompare(b, 'ru')),
    [state.catalog, category],
  );
  const filtered = state.catalog.filter(
    (item) =>
      (category === 'all' || (item.category || 'gadgets') === category) &&
      (model === 'all' || item.model === model) &&
      `${item.article || ''} ${item.model} ${item.storage || ''} ${item.ram || ''} ${item.color} ${item.sim || ''} ${item.configuration || ''}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const pageSize = 50,
    totalPages = Math.max(1, Math.ceil(filtered.length / pageSize)),
    safePage = Math.min(page, totalPages),
    items = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const details = CITIES[city as keyof typeof CITIES];
  return (
    <div className="admin-page">
      <div className="admin-city-tabs">
        {Object.values(CITIES).map((item) => (
          <button
            key={item.id}
            className={city === item.id ? 'active' : ''}
            onClick={() => setCity(item.id)}
          >
            <span>{item.shortName.slice(0, 1)}</span>
            <div>
              <strong>{item.name}</strong>
              <small>Цены и остатки</small>
            </div>
          </button>
        ))}
      </div>
      <div className="admin-catalog-browser">
        <aside>
          <p className="admin-kicker">КАТЕГОРИИ</p>
          <button
            className={category === 'all' ? 'active' : ''}
            onClick={() => {
              setCategory('all');
              setModel('all');
              setPage(1);
            }}
          >
            <span>Все товары</span>
            <i>{state.catalog.length}</i>
          </button>
          {categories.map(([id, count]) => (
            <button
              key={id}
              className={category === id ? 'active' : ''}
              onClick={() => {
                setCategory(id);
                setModel('all');
                setPage(1);
              }}
            >
              <span>{categoryNames[id] || id}</span>
              <i>{count}</i>
            </button>
          ))}
        </aside>
        <div className="admin-catalog-content">
          <div className="admin-section-tools">
            <div>
              <p className="admin-kicker">{details.name.toUpperCase()}</p>
              <h2>{categoryNames[category] || category}</h2>
              <p>Найдено {filtered.length} товарных вариантов</p>
            </div>
            <div className="admin-product-filters">
              <select
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Все модели</option>
                {models.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <label className="admin-search">
                <Search />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Артикул, модель, цвет…"
                />
              </label>
            </div>
          </div>
          <section className="admin-table-card">
            <div className="admin-table admin-city-table">
              <div className="admin-table-head">
                <span>Товар</span>
                <span>Базовая цена</span>
                <span>Цена в городе / скидка</span>
                <span>Остаток</span>
                <span>Сохранить</span>
              </div>
              {items.map((item) => {
                const cityPrice =
                  state.cityPrices.find(
                    (x) => x.sku === item.id && x.city === city,
                  )?.price ?? null;
                const stock =
                  state.inventory.find(
                    (x) => x.sku === item.id && x.city === city,
                  )?.quantity ?? null;
                const discount = state.discounts.find(row => row.sku === item.id && row.city === city)?.price ?? null;
                return (
                  <CityProductRow
                    key={`${item.id}-${city}-${cityPrice}-${stock}-${discount}`}
                    item={item}
                    basePrice={state.prices[item.id]}
                    cityPrice={cityPrice}
                    discount={discount}
                    stock={stock}
                    city={city}
                    busy={busy}
                    mutate={mutate}
                  />
                );
              })}
              {!items.length && (
                <Empty text="По выбранным фильтрам товаров не найдено." />
              )}
            </div>
          </section>
          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
              >
                ← Назад
              </button>
              <span>
                Страница {safePage} из {totalPages}
              </span>
              <button
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
              >
                Далее →
              </button>
            </div>
          )}
          <p className="admin-table-note">
            Пустая городская цена использует базовый прайс. Пустой остаток
            означает, что количественный учёт для товара не ведётся; 0 — товара
            нет в наличии.
          </p>
        </div>
      </div>
    </div>
  );
}
function CityProductRow({
  item,
  basePrice,
  cityPrice,
  discount,
  stock,
  city,
  busy,
  mutate,
}: {
  item: CatalogItem;
  basePrice: number | null | undefined;
  cityPrice: number | null;
  discount: number | null;
  stock: number | null;
  city: string;
  busy: boolean;
  mutate: (b: unknown) => Promise<void>;
}) {
  const [price, setPrice] = useState(
      cityPrice == null ? '' : String(cityPrice),
    ),
    [quantity, setQuantity] = useState(stock == null ? '' : String(stock));
  const [salePrice, setSalePrice] = useState(discount == null ? '' : String(discount));
  const regularPrice = cityPrice ?? basePrice;
  const validSale = Number.isSafeInteger(Number(salePrice)) && Number(salePrice) > 0 && typeof regularPrice === 'number' && Number(salePrice) < regularPrice;
  const changed =
    price !== String(cityPrice ?? '') || quantity !== String(stock ?? '');
  return (
    <div className="admin-table-row">
      <span>
        <strong>{item.model}</strong>
        <small>{[item.article, item.ram, item.storage, item.color, item.sim].filter(Boolean).join(' · ')}</small>
      </span>
      <span>
        <strong>
          {basePrice == null
            ? 'Цена не задана'
            : `${money.format(basePrice)} ₽`}
        </strong>
        <small>общая цена</small>
      </span>
      <div className="admin-price-discount">
      <label className="admin-number">
        <input
          aria-label={`Цена ${item.model}`}
          type="number"
          min="1"
          value={price}
          placeholder={basePrice == null ? '—' : String(basePrice)}
          disabled={busy}
          onChange={(e) => setPrice(e.target.value)}
        />
        <i>₽</i>
      </label>
      <label className="admin-number">
        <input aria-label={`Цена со скидкой ${item.model}`} type="number" min="1" max={regularPrice == null ? undefined : regularPrice - 1}
          value={salePrice} placeholder="Цена со скидкой" disabled={busy} onChange={event => setSalePrice(event.target.value)} />
        <i>₽</i>
      </label>
      {discount !== null && <small>{typeof regularPrice === 'number' && discount < regularPrice ? <><del>{money.format(regularPrice)} ₽</del> → {money.format(discount)} ₽</> : 'Скидка не действует: обычная цена ниже или не задана.'}</small>}
      <div className="admin-discount-actions">
        <button disabled={busy || !validSale || Number(salePrice) === discount} onClick={() => void mutate({ action: 'product-discount', id: item.id, city, price: Number(salePrice) })}>Применить скидку</button>
        {discount !== null && <button className="ghost" disabled={busy} onClick={() => void mutate({ action: 'product-discount', id: item.id, city, price: null })}>Убрать скидку</button>}
      </div>
      </div>
      <label className="admin-number">
        <input
          aria-label={`Остаток ${item.model}`}
          type="number"
          min="0"
          value={quantity}
          placeholder="Без учёта"
          disabled={busy}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <i>шт.</i>
      </label>
      <span>
        <button
          className="admin-save-row"
          disabled={busy || !changed}
          onClick={() =>
            void mutate({
              action: 'city-product',
              id: item.id,
              city,
              price: price === '' ? null : Number(price),
              quantity: quantity === '' ? null : Number(quantity),
            })
          }
        >
          <Check /> Сохранить
        </button>
      </span>
    </div>
  );
}
