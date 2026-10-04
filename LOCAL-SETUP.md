# Локальный запуск в Windows

Требуется Node.js >=22.13.0 и npm. В PowerShell используйте `npm.cmd` и
`npx.cmd`: это работает без изменения политики выполнения скриптов.

```powershell
cd C:\Users\borsh\appgrade-v3-main
npm.cmd ci
npm.cmd run dev
```

Откройте http://localhost:3000. Остановка сервера: Ctrl+C.

Файл `.env.local` исключён из Git. Для просмотра каталога достаточно:

```dotenv
APP_ORIGIN=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_USER=admin
TRUST_PROXY=false
```

Для админки, импорта цен и заказов восстановите настройки из прежнего
`.env.local` или настроек Vercel. Список переменных находится в `.env.example`.
Нужны PostgreSQL (`DATABASE_URL`), пароль админки длиной от 20 символов и
настройки Telegram. Без них каталог работает, приём заказов отключён,
а `/api/health` отвечает 503.

Если используется удалённая PostgreSQL, устанавливать PostgreSQL или Docker
на этот компьютер не требуется. Для отдельной локальной базы можно использовать
PostgreSQL или Docker Compose; инструкции находятся в `docs/telegram-setup.md`.
Миграции выполняйте только после проверки, к какой базе ведёт `DATABASE_URL`:

```powershell
npm.cmd run db:migrate
```

Telegram-воркеры запускаются отдельно. Не запускайте вторую копию воркера
с рабочим токеном, пока прежняя копия работает на сервере.

```powershell
npm.cmd run bot:prices
npm.cmd run bot:orders
```

Проверки проекта:

```powershell
npm.cmd run lint
npm.cmd test
npx.cmd tsc --noEmit
npm.cmd run build
npm.cmd start
```

Эта папка не содержит `.git`. Для восстановления истории и отправки изменений
нужен URL исходного репозитория; сохраните эту папку и клонируйте репозиторий
в отдельную папку для сравнения.
