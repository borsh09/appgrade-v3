import Link from '@/components/shared/safe-link';
import { ArrowRight } from 'lucide-react';

export function TradeInBanner() {
  return (
    <section className="appgrade-trade-clean-section">
      <div className="container">
        <Link
          href="/trade-in"
          className="appgrade-trade-clean"
        >
          <div className="appgrade-trade-clean-copy">
            <span>Trade-In</span>

            <h2>
              Старое устройство
              <br />
              может стоить
              <br />
              до 54 000 ₽
            </h2>

            <p>
              Оценим технику и зачтём её стоимость
              при покупке нового устройства.
            </p>

            <div className="appgrade-trade-clean-link">
              Оценить устройство
              <ArrowRight size={16} />
            </div>
          </div>

          <div
            className="appgrade-trade-clean-mark"
            aria-hidden="true"
          >
            TRADE
            <br />
            IN
          </div>
        </Link>
      </div>
    </section>
  );
}