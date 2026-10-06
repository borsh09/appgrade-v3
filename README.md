# APPGRADE — интернет-магазин электроники

Витрина с каталогом, поиском и фильтрами, выбором комплектации, корзиной, избранным, заказами и Trade-In. Админка `/admin` управляет заявками, ценами, скидками и остатками по городам.

## Технологии

Версии взяты из `package.json`; точные версии установки закреплены в `package-lock.json`.

| Область | Технологии |
| --- | --- |
| Приложение | Next.js 16.3.8, App Router, серверный рендеринг и Route Handlers для API |
| Интерфейс | React 19.2.6, TypeScript 5.9.3, React Context для города, цен, корзины и избранного |
| Стили | Tailwind CSS 4.2.1, PostCSS, CSS Modules; clsx, tailwind-merge, class-variance-authority |
| UI | Base UI 1.7.0, Lucide React, Embla Carousel, cmdk, react-day-picker, react-resizable-panels; Recharts в зависимостях |
| Сервер | Node.js >=22.13.0; Docker использует Node.js 24 |
| База | PostgreSQL 17, драйвер pg, SQL и транзакции без ORM |
| Excel | ExcelJS и JSZip для чтения прайсов, проверки XLSX и отчётов импорта |
| Проверки | Node.js test runner через tsx, PGlite для тестов БД, TypeScript, Oxlint; Oxfmt для форматирования |
| Production | Beget VPS, Ubuntu 24.04, Docker Compose, Caddy 2 для HTTPS и reverse proxy |
| SEO | Metadata Next.js, sitemap, robots, структурированные данные и подтверждения Google/Яндекса |

## Структура

| Каталог | Назначение |
| --- | --- |
| app/ | Страницы App Router и API |
| components/ | Интерфейс витрины, админки и React providers |
| config/ | Города, магазины, продавец, настройки сайта |
| data/ | Каталог, цены, поисковый индекс и сведения о товарах |
| lib/ | Поиск, модели, комплектации, фотографии, SEO |
| lib/server/ | БД, авторизация, заказы, Trade-In, импорт цен |
| public/ | Фотографии и статические файлы |
| scripts/ | Миграции, индексы, обработка каталога и фото, бэкапы |
| tests/ | Автоматические проверки и тестовые данные |
| deployment/ | Caddyfile и шаблон production-переменных |
| docs/ | Эксплуатационная документация |

Основной каталог находится в `data/new-price-catalog.json`. `lib/catalog-registry.ts` подготавливает товары, группирует комплектации на страницах моделей и подключает фотографии. SKU и артикулы сохраняют связь с конкретной позицией. `npm run catalog:index` генерирует клиентский поисковый индекс и базовые цены; скрипт автоматически запускается перед сборкой.

PostgreSQL хранит цены, скидки и остатки по городам, заказы, заявки Trade-In, отчёты и историю импорта, ограничения запросов, счётчики событий и аудит админки. Идемпотентная миграция определена в `lib/server/db.ts`. Корзина и избранное сохраняются в localStorage; данные заказа проверяет сервер.

## API и безопасность

| Маршрут | Назначение |
| --- | --- |
| /api/health | Готовность приложения и приёма заказов |
| /api/prices | Цены витрины |
| /api/orders | Приём заказов |
| /api/trade-in | Заявки Trade-In |
| /api/events | Внутренние счётчики событий |
| /api/admin/session | Авторизация администратора |
| /api/admin, /api/admin/entries | Данные и операции админки |
| /api/admin/prices | Импорт и управление ценами |

Админка использует подписанную HMAC-сессию на восемь часов и пароль из окружения длиной от 20 символов. Сервер проверяет запросы, ограничивает их частоту и валидирует XLSX. Защитные заголовки заданы в `next.config.ts`. TRUST_PROXY включают только за доверенным прокси, который задаёт X-Real-IP.

Текущие заказы и прайсы обрабатываются через сайт и админку; Telegram-воркеры для запуска не требуются.

## Локальный запуск

Требуется Node.js >=22.13.0. В Windows используйте npm.cmd и npx.cmd.

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

Откройте http://localhost:3000. Если `.env.local` уже существует, сохраните его настройки вместо копирования шаблона поверх файла. Для базы нужен DATABASE_URL, для админки — ADMIN_USER и ADMIN_PASSWORD. Для приёма заказов необходимы доступная БД с миграциями и реквизиты продавца. Без них каталог можно просматривать, но заказы недоступны.

Проверьте адрес базы перед выполнением миграции:

```powershell
npm.cmd run db:migrate
```

Переменные описаны в [.env.example](.env.example). Изменение NEXT_PUBLIC_* требует пересборки, поскольку значения включаются в клиентский код.

## Проверка и сборка

```powershell
npm.cmd run lint
npm.cmd test
npx.cmd tsc --noEmit
npm.cmd run build
git diff --check
```

Production-сборка запускается командой `npm.cmd start`. Перед изменениями Next.js читайте локальные руководства `node_modules/next/dist/docs/`, как требует AGENTS.md.

## Production и резервное копирование

Рабочий сайт: [аппгрейд.рф](https://xn--80agddu7aaj.xn--p1ai). На VPS приложение находится в `/opt/appgrade`. Docker Compose запускает PostgreSQL, миграции и веб-приложение; production override подключает Caddy. Отдельный `compose.media.yaml` на сервере монтирует public в контейнер — сохраняйте его при обновлениях.

Команды эксплуатации, DNS и резервного копирования: [docs/beget-production.md](docs/beget-production.md). Альтернативное размещение на Vercel с внешней PostgreSQL описано в [DEPLOYMENT.md](DEPLOYMENT.md).

Git сохраняет код, документацию, каталог и отслеживаемые медиа. Для восстановления production отдельно нужны бэкапы БД и секретов. Файлы окружения, приватные SSH-ключи в .tmp-qa, node_modules, сборки и временные артефакты исключены из Git. `scripts/backup-db.sh` создаёт копии PostgreSQL; их следует хранить также вне VPS. Не выполняйте `docker compose down -v` на рабочем сервере: это удалит volumes.

Подтверждения домена: `public/google5a613935623de9b0.html` и `public/yandex_ed09cbaae0bf207d.html`, доступные после публикации в корне сайта.
