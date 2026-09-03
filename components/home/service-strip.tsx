import {
  BadgeCheck,
  MapPin,
  RefreshCcw,
  ShoppingBag,
} from 'lucide-react';

const services = [
  {
    icon: BadgeCheck,
    title: 'Оригинальная техника',
    text: 'Новые устройства с гарантией',
  },
  {
    icon: RefreshCcw,
    title: 'Trade-In',
    text: 'Зачтём старое устройство',
  },
  {
    icon: ShoppingBag,
    title: 'Самовывоз',
    text: 'Заберите покупку в магазине',
  },
  {
    icon: MapPin,
    title: '3 города',
    text: 'Магнитогорск, Белорецк, Троицк',
  },
];

export function ServiceStrip() {
  return (
    <section className="appgrade-service-strip">
      <div className="container">
        <div className="appgrade-service-grid">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <div
                className="appgrade-service-item"
                key={service.title}
              >
                <div className="appgrade-service-icon">
                  <Icon size={20} strokeWidth={1.8} />
                </div>

                <div>
                  <h3>{service.title}</h3>
                  <p>{service.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}