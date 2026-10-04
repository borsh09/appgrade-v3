# Запуск магазина

Магазин работает без Telegram-ботов. Заказы и Trade-In сохраняются в PostgreSQL и доступны в /admin. Прайсы загружаются через админку.

1. Подготовьте Linux VPS с Docker Compose и публичным IP.
2. Заполните переменные из .env.example: пароль PostgreSQL, доступ в админку, реквизиты продавца и публичные HTTPS-адреса.
3. Выполните docker compose --env-file .env.local up -d --build. Миграции применяются перед запуском сайта.
4. Настройте HTTPS-прокси к 127.0.0.1:3000 и подключите домен.
5. Выполните npm run check:launch -- --url=https://ваш-домен. Проверьте заказ, Trade-In, просмотр заявок и загрузку прайса в админке.
6. Настройте резервные копии PostgreSQL и проверьте восстановление.

Без Compose задайте DATABASE_URL, выполните npm run db:migrate, npm run build и npm start.
