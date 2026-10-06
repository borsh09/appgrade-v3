# Локальный запуск в Windows

Актуальные технологии, структура, настройки и команды описаны в [README.md](README.md).

Требуется Node.js >=22.13.0. В PowerShell используйте npm.cmd и npx.cmd.

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
npm.cmd run dev
```

Если .env.local уже существует, сохраните его настройки вместо копирования шаблона поверх файла. Сайт: http://localhost:3000. Остановка сервера: Ctrl+C.

Для админки и заказов настройте PostgreSQL, реквизиты продавца и пароль администратора по .env.example. Перед npm.cmd run db:migrate проверьте адрес базы. Telegram-боты для текущей версии не требуются.

Production-инструкции: [docs/beget-production.md](docs/beget-production.md).
