'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
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
    city?: { name?: string };
    items?: { name: string; quantity: number }[];
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
  unchanged: number;
  warnings: string[];
  errors: string[];
};
type State = {
  catalog: CatalogItem[];
  prices: Record<string, number | null>;
  priceRevision: string;
  priceUpdatedAt: string;
  inventory: { sku: string; city: string; quantity: number }[];
  cityPrices: {
    sku: string;
    city: string;
    price: number;
    updated_at: string;
  }[];
  orders: Entry[];
  tradeIns: Entry[];
  metrics: { day: string; event: string; count: number }[];
  health: { role?: string; heartbeat_at: string }[];
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
};
type Tab = 'overview' | 'orders' | 'tradeIns' | 'prices' | 'catalog';
const money = new Intl.NumberFormat('ru-RU');
const date = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
const statuses: Record<string, string> = {
  new: 'Новый',
  confirmed: 'Подтверждён',
  completed: 'Завершён',
  cancelled: 'Отменён',
};
const categoryNames: Record<string, string> = {
  all: 'Все товары',
  iphones: 'iPhone',
  samsung: 'Samsung',
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
    [busy, setBusy] = useState(false),
    [tab, setTab] = useState<Tab>('overview'),
    [query, setQuery] = useState(''),
    [draft, setDraft] = useState<{
      id: string;
      filename: string;
      report: Report;
      targetCities?: string[];
    } | null>(null),
    [checkedAt, setCheckedAt] = useState(0);
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
      setCheckedAt(Date.now());
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
    try {
      await api('/api/admin', { method: 'PATCH', body: JSON.stringify(body) });
      await load();
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
    try {
      const result = await api('/api/admin/prices', {
        method: 'PATCH',
        body: JSON.stringify({ action, id }),
      });
      setDraft(null);
      await load();
      setError(result.message);
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
  const fresh = state.health.some(
    (h) => checkedAt - new Date(h.heartbeat_at).getTime() < 30_000,
  );
  const nav: [Tab, string, React.ReactNode, number?][] = [
    ['overview', 'Обзор', <LayoutDashboard key="o" />],
    [
      'orders',
      'Заказы',
      <ShoppingBag key="a" />,
      state.orders.filter((x) => x.status === 'new').length,
    ],
    [
      'tradeIns',
      'Trade‑In',
      <Wrench key="t" />,
      state.tradeIns.filter((x) => x.status === 'new').length,
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
              onClick={() => setTab(id)}
            >
              {icon}
              <span>{label}</span>
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
          </div>
          <div className="admin-header-actions">
            <span className={fresh ? 'online' : 'offline'}>
              <i />
              {fresh ? 'Система работает' : 'Проверьте бота'}
            </span>
            <button onClick={() => void load()} aria-label="Обновить">
              <RefreshCw size={18} />
            </button>
          </div>
        </header>
        {error && (
          <div className="admin-toast">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}
        {tab === 'overview' && (
          <Overview state={state} fresh={fresh} setTab={setTab} />
        )}{' '}
        {tab === 'orders' && (
          <Entries
            title="Заказы"
            entries={state.orders}
            type="order"
            busy={busy}
            mutate={mutate}
          />
        )}{' '}
        {tab === 'tradeIns' && (
          <Entries
            title="Заявки Trade‑In"
            entries={state.tradeIns}
            type="trade-in"
            busy={busy}
            mutate={mutate}
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
  const revenue = state.orders
      .filter((x) => x.status !== 'cancelled')
      .reduce((sum, x) => sum + (x.payload.total || 0), 0),
    active = state.orders.filter((x) =>
      ['new', 'confirmed'].includes(x.status),
    ).length,
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
          note={`${state.orders.length} всего`}
        />
        <Stat
          icon={<PackageCheck />}
          label="Товаров"
          value={String(state.catalog.length)}
          note={`${low} с низким остатком`}
        />
        <Stat
          icon={<Activity />}
          label="Бот заказов"
          value={fresh ? 'Онлайн' : 'Нет связи'}
          note={fresh ? 'heartbeat актуален' : 'нужна проверка'}
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
  type,
  busy,
  mutate,
}: {
  title: string;
  entries: Entry[];
  type: 'order' | 'trade-in';
  busy: boolean;
  mutate: (body: unknown) => Promise<void>;
}) {
  const [filter, setFilter] = useState('all');
  const shown =
    filter === 'all' ? entries : entries.filter((x) => x.status === filter);
  return (
    <div className="admin-page">
      <div className="admin-section-tools">
        <div>
          <h2>{title}</h2>
          <p>{entries.length} записей в журнале</p>
        </div>
        <div className="admin-segments">
          {[
            ['all', 'Все'],
            ['new', 'Новые'],
            ['confirmed', 'В работе'],
            ['completed', 'Готово'],
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
            <div className="admin-table-row" key={entry.id}>
              <span>
                <strong>{entry.payload.customer.name}</strong>
                <small>{entry.payload.customer.phone}</small>
              </span>
              <span>
                <strong>{date(entry.created_at)}</strong>
                <small>
                  {entry.notified_at
                    ? 'Менеджер уведомлён'
                    : 'Ожидает уведомления'}
                </small>
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
              </span>
              <span>
                <i className={`status status-${entry.status}`}>
                  {statuses[entry.status] || entry.status}
                </i>
              </span>
              <span className="admin-actions">
                {entry.status === 'new' && (
                  <>
                    <button
                      disabled={busy}
                      onClick={() =>
                        void mutate({
                          action: type,
                          id: entry.id,
                          status: 'confirmed',
                        })
                      }
                    >
                      Принять
                    </button>
                    <button
                      className="ghost"
                      disabled={busy}
                      onClick={() =>
                        void mutate({
                          action: type,
                          id: entry.id,
                          status: 'cancelled',
                        })
                      }
                    >
                      Отменить
                    </button>
                  </>
                )}
                {entry.status === 'confirmed' && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      void mutate({
                        action: type,
                        id: entry.id,
                        status: 'completed',
                      })
                    }
                  >
                    Завершить
                  </button>
                )}
              </span>
            </div>
          ))}
          {!shown.length && <Empty text="В этой категории пока ничего нет." />}
        </div>
      </section>
    </div>
  );
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
                <small>Исходный формат прайса APPGRADE</small>
              </span>
              <input type="file" name="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => setSelectedFile(event.currentTarget.files?.[0] ?? null)} />
              <em className="admin-file-name">{selectedFile ? selectedFile.name : 'Файл ещё не выбран'}</em>
            </label>
            <button type="submit" disabled={busy}>
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
          {[...draft.report.errors, ...draft.report.warnings].map((x, i) => (
            <p className="report-warning" key={i}>
              {x}
            </p>
          ))}
          {draft.report.changes.length > 0 && (
            <button
              className="admin-primary"
              disabled={busy}
              onClick={() => void priceAction('apply', draft.id)}
            >
              <Check /> Применить корректные {draft.report.changes.length} изменений
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
      `${item.model} ${item.storage || ''} ${item.ram || ''} ${item.color} ${item.sim || ''} ${item.configuration || ''}`
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
                  placeholder="Память, цвет, SIM…"
                />
              </label>
            </div>
          </div>
          <section className="admin-table-card">
            <div className="admin-table admin-city-table">
              <div className="admin-table-head">
                <span>Товар</span>
                <span>Базовая цена</span>
                <span>Цена в городе</span>
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
                return (
                  <CityProductRow
                    key={`${item.id}-${city}-${cityPrice}-${stock}`}
                    item={item}
                    basePrice={state.prices[item.id]}
                    cityPrice={cityPrice}
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
  stock,
  city,
  busy,
  mutate,
}: {
  item: CatalogItem;
  basePrice: number | null | undefined;
  cityPrice: number | null;
  stock: number | null;
  city: string;
  busy: boolean;
  mutate: (b: unknown) => Promise<void>;
}) {
  const [price, setPrice] = useState(
      cityPrice == null ? '' : String(cityPrice),
    ),
    [quantity, setQuantity] = useState(stock == null ? '' : String(stock));
  const changed =
    price !== String(cityPrice ?? '') || quantity !== String(stock ?? '');
  return (
    <div className="admin-table-row">
      <span>
        <strong>{item.model}</strong>
        <small>{[item.storage, item.color].filter(Boolean).join(' · ')}</small>
      </span>
      <span>
        <strong>
          {basePrice == null
            ? 'Цена не задана'
            : `${money.format(basePrice)} ₽`}
        </strong>
        <small>общая цена</small>
      </span>
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
