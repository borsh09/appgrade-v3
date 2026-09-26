import { BrandWordmark } from '@/components/shared/brand-wordmark';
import Link from '@/components/shared/safe-link';

export function Footer() {
  return (
    <footer className="appgrade-footer">
      <div className="container appgrade-footer-main">
        <div className="appgrade-footer-brand">
          <Link
            href="/"
            aria-label="APPGRADE — на главную"
          >
            <BrandWordmark />
          </Link>

        </div>

        <div className="appgrade-footer-socials">
          <a
            href="https://t.me/APPGRADEmgn"
            target="_blank"
            rel="noreferrer"
            aria-label="Telegram APPGRADE"
          >
            TG
          </a>

          <a
            href="https://vk.ru/appgrade_mgn"
            target="_blank"
            rel="noreferrer"
            aria-label="VK APPGRADE"
          >
            VK
          </a>

          <a
            href="https://www.instagram.com/appgrade.ru?igsi=MTVuMXlkNWRsazdtZg=="
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram APPGRADE"
          >
            IG
          </a>
        </div>
      </div>

      <div className="container appgrade-footer-bottom">
        <span>
          © 2026 APPGRADE
        </span>

        <Link href="/#контакты">
          Контакты магазинов
        </Link>
        <Link href="/privacy">Обработка данных</Link>

        <a
          href="https://t.me/borschtsch09"
          target="_blank"
          rel="noreferrer"
          className="appgrade-footer-made"
          aria-label="Разработано студией БОРЩ"
        >
          <span>
            Разработано
          </span>

          <strong>
            БОРЩ.
          </strong>
        </a>
      </div>
    </footer>
  );
}
