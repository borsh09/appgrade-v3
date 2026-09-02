import Link from '@/components/shared/safe-link';
export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="logo logo-light">
            <span>APP</span>GRADE
          </Link>
          <p>Техника для следующего шага.</p>
        </div>
        <div>
          <h3>Покупателям</h3>
          <Link href="/catalog">Каталог</Link>
          <Link href="/#trade-in">Trade-In</Link>
          <Link href="/#контакты">Доставка</Link>
          <Link href="/#контакты">Контакты</Link>
        </div>
        <div>
          <h3>Мы рядом</h3>
          <span>Магнитогорск</span>
          <span>Белорецк</span>
          <span>Троицк</span>
        </div>
        <div>
          <h3>На связи</h3>
          <span>Telegram</span>
          <span>VK</span>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 APPGRADE</span>
        <span>Политика конфиденциальности</span>
      </div>
    </footer>
  );
}
