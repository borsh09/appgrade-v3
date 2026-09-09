'use client';

import Image from 'next/image';
import Link from '@/components/shared/safe-link';

import {
  ArrowRight,
  Check,
  ChevronDown,
  Landmark,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Trash2,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';

import {
  type SyntheticEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useCommerce } from '@/components/providers/commerce-provider';
import { useCity } from '@/components/providers/city-provider';
import { ORDER_SERVICES } from '@/config/order-services';
import { OrderAvailability } from './order-availability';

/* =========================================================
   FORMAT
   ========================================================= */

const money = new Intl.NumberFormat('ru-RU');

/* =========================================================
   TYPES
   ========================================================= */

type AppleDeviceType =
  | 'iphone'
  | 'ipad';

type ServiceId =
  | 'transfer'
  | 'screen'
  | 'android'
  | 'setup'
  | 'banks'
  | 'apple-id';

type FulfillmentType =
  | 'pickup'
  | 'delivery';

type ContactMethod =
  | 'call'
  | 'telegram';

type Service = {
  id: ServiceId;
  title: string;
  description: string;
  price: number;
  badge: string | null;
  icon: LucideIcon;
  appliesTo: AppleDeviceType[];
};

/* =========================================================
   SERVICES
   ========================================================= */

const SERVICE_DETAILS: Service[] = [
  {
    id: 'transfer',
    title: 'Перенос данных',
    description:
      'Перенесём фотографии, переписки, приложения и пароли со старого устройства на новое.',
    price: 2990,
    badge: 'Популярно',
    icon: RefreshCw,
    appliesTo: [
      'iphone',
      'ipad',
    ],
  },

  {
    id: 'screen',
    title: 'Защита экрана',
    description:
      'Наклеим защитное стекло или гидрогелевую плёнку без пузырей и перекосов.',
    price: 990,
    badge: 'Рекомендуем',
    icon: ShieldCheck,
    appliesTo: [
      'iphone',
      'ipad',
    ],
  },

  {
    id: 'android',
    title: 'Перенос с Android на iOS',
    description:
      'Переведём контакты, фотографии, переписки и основные данные с Android на iPhone.',
    price: 2990,
    badge: null,
    icon: Smartphone,
    appliesTo: [
      'iphone',
    ],
  },

  {
    id: 'setup',
    title: 'Настройка iPhone и iPad',
    description:
      'Подготовим устройство к работе: учётная запись, почта, резервные копии и безопасность.',
    price: 2990,
    badge: null,
    icon: Settings2,
    appliesTo: [
      'iphone',
      'ipad',
    ],
  },

  {
    id: 'banks',
    title: 'Установка банковских приложений',
    description:
      'Установим и настроим доступные приложения российских банков.',
    price: 490,
    badge: null,
    icon: Landmark,
    appliesTo: [
      'iphone',
      'ipad',
    ],
  },

  {
    id: 'apple-id',
    title: 'Создание Apple ID',
    description:
      'Создадим учётную запись с нужным регионом и настроим восстановление доступа.',
    price: 990,
    badge: null,
    icon: UserPlus,
    appliesTo: [
      'iphone',
      'ipad',
    ],
  },
];

/* =========================================================
   HELPERS
   ========================================================= */

const SERVICES = SERVICE_DETAILS.map(service => ({
  ...service,
  title: ORDER_SERVICES[service.id].title,
  price: ORDER_SERVICES[service.id].price,
}));

function getAppleDeviceType(item: {
  name: string;
  href?: string;
}): AppleDeviceType | null {
  const name =
    item.name.toLowerCase();

  const href =
    item.href?.toLowerCase() ?? '';

  if (
    name.includes('iphone') ||
    href.includes('/iphones') ||
    href.includes('/iphone-')
  ) {
    return 'iphone';
  }

  if (
    name.includes('ipad') ||
    href.includes('/ipads') ||
    href.includes('/ipad-')
  ) {
    return 'ipad';
  }

  return null;
}

function productWord(
  count: number,
) {
  const mod100 =
    count % 100;

  const mod10 =
    count % 10;

  if (
    mod100 >= 11 &&
    mod100 <= 14
  ) {
    return 'товаров';
  }

  if (mod10 === 1) {
    return 'товар';
  }

  if (
    mod10 >= 2 &&
    mod10 <= 4
  ) {
    return 'товара';
  }

  return 'товаров';
}

/* =========================================================
   COMPONENT
   ========================================================= */

export function CartPage() {
  const [ordersAvailable, setOrdersAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const check = async () => {
      try {
        const response = await fetch('/api/health', { cache: 'no-store', signal: controller.signal });
        const result = await response.json();
        setOrdersAvailable(response.ok && result.ordersAvailable === true);
      } catch {
        if (!controller.signal.aborted) setOrdersAvailable(false);
      }
    };
    void check();
    window.addEventListener('focus', check);
    return () => { controller.abort(); window.removeEventListener('focus', check); };
  }, []);
  const requestIdentity = useRef({ fingerprint: '', key: '' });
  const [submitError, setSubmitError] = useState('');
  const [orderId, setOrderId] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const {
    cart,
    ready,
    removeFromCart,
    setQuantity,
  } = useCommerce();

  const {
    currentStore,
    city,
    openCitySelector,
  } = useCity();

  /* =======================================================
     REFS
     ======================================================= */

  const productsRef =
    useRef<HTMLElement | null>(
      null,
    );

  const servicesRef =
    useRef<HTMLElement | null>(
      null,
    );

  const checkoutRef =
    useRef<HTMLElement | null>(
      null,
    );

  /* =======================================================
     STATE
     ======================================================= */

  const [
    selectedServices,
    setSelectedServices,
  ] = useState<ServiceId[]>([]);

  const [
    fulfillment,
    setFulfillment,
  ] =
    useState<FulfillmentType>(
      'pickup',
    );

  const [
    contactMethod,
    setContactMethod,
  ] =
    useState<ContactMethod>(
      'call',
    );

  const [name, setName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [touchedFields, setTouchedFields] =
    useState({
      name: false,
      phone: false,
      address: false,
    });

  const [
    deliveryAddress,
    setDeliveryAddress,
  ] =
    useState('');

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    submitStatus,
    setSubmitStatus,
  ] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  /* =======================================================
     PRODUCTS
     ======================================================= */

  const productsTotal =
    useMemo(
      () =>
        cart.reduce(
          (
            sum,
            item,
          ) =>
            sum +
            item.price *
              item.quantity,
          0,
        ),
      [cart],
    );

  const totalQuantity =
    useMemo(
      () =>
        cart.reduce(
          (
            sum,
            item,
          ) =>
            sum +
            item.quantity,
          0,
        ),
      [cart],
    );

  /* =======================================================
     IPHONE / IPAD
     ======================================================= */

  const compatibleItems =
    useMemo(
      () =>
        cart.filter(
          (item) =>
            getAppleDeviceType(
              item,
            ) !== null,
        ),
      [cart],
    );

  const compatibleDeviceCount =
    useMemo(
      () =>
        compatibleItems.reduce(
          (
            sum,
            item,
          ) =>
            sum +
            item.quantity,
          0,
        ),
      [compatibleItems],
    );

  const hasIphone =
    useMemo(
      () =>
        compatibleItems.some(
          (item) =>
            getAppleDeviceType(
              item,
            ) ===
            'iphone',
        ),
      [compatibleItems],
    );

  const hasIpad =
    useMemo(
      () =>
        compatibleItems.some(
          (item) =>
            getAppleDeviceType(
              item,
            ) ===
            'ipad',
        ),
      [compatibleItems],
    );

  const hasServices =
    hasIphone ||
    hasIpad;

  /* =======================================================
     AVAILABLE SERVICES
     ======================================================= */

  const availableServices =
    useMemo(
      () =>
        SERVICES.filter(
          (service) => {
            if (
              hasIphone &&
              service.appliesTo.includes(
                'iphone',
              )
            ) {
              return true;
            }

            if (
              hasIpad &&
              service.appliesTo.includes(
                'ipad',
              )
            ) {
              return true;
            }

            return false;
          },
        ),
      [
        hasIphone,
        hasIpad,
      ],
    );

  /*
   * Если пользователь удалил
   * iPhone / iPad,
   * больше недоступные услуги
   * удаляем автоматически.
   */

  useEffect(() => {
    const allowedIds =
      new Set<ServiceId>(
        availableServices.map(
          (service) =>
            service.id,
        ),
      );

    const syncServices = window.setTimeout(() => {
      setSelectedServices(
        (current) =>
          current.filter(
            (id) =>
              allowedIds.has(
                id,
              ),
          ),
      );
    }, 0);

    return () => window.clearTimeout(syncServices);
  }, [availableServices]);

  /* =======================================================
     SERVICES TOTAL
     ======================================================= */

  const servicesTotal =
    useMemo(
      () =>
        SERVICES.filter(
          (service) =>
            selectedServices.includes(
              service.id,
            ),
        ).reduce(
          (
            sum,
            service,
          ) =>
            sum +
            service.price,
          0,
        ),
      [selectedServices],
    );

  const total =
    productsTotal +
    servicesTotal;

  /* =======================================================
     FORM VALIDATION
     ======================================================= */

  const nameReady =
    name.trim().length >= 2;

  const phoneReady =
    /^\+?[\d\s()-]+$/.test(phone) &&
    phone.replace(/\D/g, '').length >= 10 &&
    phone.replace(/\D/g, '').length <= 15;

  const deliveryReady =
    fulfillment ===
      'pickup' ||
    deliveryAddress
      .trim()
      .length >= 5;

  const checkoutReady =
    nameReady &&
    phoneReady &&
    deliveryReady &&
    (contactMethod !== 'telegram' || /^@?[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(telegramUsername.trim()));

  /* =======================================================
     PROGRESS
     ======================================================= */

  const progress =
    useMemo(
      () => {
        let value = 35;

        /*
         * Способ получения
         * уже выбран.
         */
        value += 15;

        if (nameReady) {
          value += 20;
        }

        if (phoneReady) {
          value += 20;
        }

        if (
          deliveryReady
        ) {
          value += 10;
        }

        return Math.min(
          value,
          100,
        );
      },
      [
        nameReady,
        phoneReady,
        deliveryReady,
      ],
    );

  /* =======================================================
     SCROLL
     ======================================================= */

  const scrollTo = (
    ref: RefObject<HTMLElement | null>,
  ) => {
    ref.current?.scrollIntoView(
      {
        behavior:
          'smooth',

        block:
          'start',
      },
    );
  };

  /* =======================================================
     SERVICES
     ======================================================= */

  const toggleService = (
    serviceId: ServiceId,
  ) => {
    setSelectedServices(
      (current) =>
        current.includes(
          serviceId,
        )
          ? current.filter(
              (id) =>
                id !==
                serviceId,
            )
          : [
              ...current,
              serviceId,
            ],
    );
  };

  /* =======================================================
     ORDER SUBMIT
     ======================================================= */

  const handleSubmit =
    async (
      event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
    ) => {
      event.preventDefault();

      if (
        !cart.length ||
        ordersAvailable !== true ||
        !checkoutReady ||
        sending
      ) {
        return;
      }

      setSending(true);

      setSubmitStatus(
        'idle',
      );

      const form =
        new FormData(
          event.currentTarget,
        );

      const commentValue =
        form.get('comment');

      const comment =
        typeof commentValue === 'string'
          ? commentValue.trim()
          : '';

      const payload = {
        deliveryAddress,
        contactMethod,
        telegramUsername: contactMethod === 'telegram' ? telegramUsername : '',
        serviceIds: selectedServices,
        customer: {
          name,
          phone,

          comment,
        },

        city: {
          id:
            city.id,

          name:
            currentStore?.city ??
            city.name,

          address:
            currentStore?.address ??
            '',
        },

        fulfillment,

        items:
          cart.map(
            (item) => ({
              id:
                item.id,

              name:
                item.name,

              configuration:
                item.configuration,

              price:
                item.price,

              quantity:
                item.quantity,
            }),
          ),

        productsTotal,
        servicesTotal,
        total,
      };

      try {
        const fingerprint = JSON.stringify(payload);
        if (requestIdentity.current.fingerprint !== fingerprint) {
          requestIdentity.current = { fingerprint, key: crypto.randomUUID() };
        }
        const response =
          await fetch(
            '/api/orders',
            {
              method:
                'POST',

              headers: {
                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify(
                  { ...payload, requestKey: requestIdentity.current.key },
                ),
            },
          );

        const result = await response.json();
        if (
          !response.ok
        ) {
          if (response.status === 409) window.dispatchEvent(new Event('appgrade-prices-refresh'));
          throw new Error(
            result.error || 'Не удалось отправить заявку.',
          );
        }

        setOrderId(result.orderId);
        setSubmitStatus(
          'success',
        );
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : 'Не удалось отправить заявку.');
        setSubmitStatus(
          'error',
        );
      } finally {
        setSending(
          false,
        );
      }
    };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="appgrade-cart-page">
      <div className="container">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="appgrade-cart-heading">
          <div>
            <span>
              APPGRADE CHECKOUT
            </span>

            <h1>
              Корзина.
            </h1>
          </div>

          {cart.length >
            0 && (
            <button
              type="button"
              className="appgrade-cart-city"
              onClick={
                openCitySelector
              }
            >
              <MapPin
                size={17}
              />

              <div>
                <small>
                  Покупаем в
                </small>

                <strong>
                  {currentStore?.city ??
                    city.name}
                </strong>
              </div>

              <ChevronDown
                size={
                  15
                }
              />
            </button>
          )}
        </div>

        {/* =================================================
            EMPTY CART
            ================================================= */}

        {!ready ? <p aria-live="polite">Загружаем корзину…</p> : !cart.length ? (
          <div className="appgrade-cart-empty">
            <div className="appgrade-cart-empty-icon">
              <ShoppingBag
                size={
                  26
                }
              />
            </div>

            <span>
              Корзина пуста
            </span>

            <h2>
              Пора
              <br />
              обновиться.
            </h2>

            <p>
              Выберите устройство —
              продолжим оформление
              здесь.
            </p>

            <Link href="/catalog">
              В каталог

              <ArrowRight
                size={
                  17
                }
              />
            </Link>
          </div>
        ) : (
          <>

            {/* ===============================================
                STEPS
                =============================================== */}

            <div className="appgrade-cart-steps">
              <button
                type="button"
                onClick={() =>
                  scrollTo(
                    productsRef,
                  )
                }
              >
                <span className="is-done">
                  <Check
                    size={
                      13
                    }
                  />
                </span>

                <div>
                  <small>
                    01
                  </small>

                  <strong>
                    Товары
                  </strong>
                </div>
              </button>

              {hasServices && (
                <>
                  <div className="appgrade-cart-step-line" />

                  <button
                    type="button"
                    onClick={() =>
                      scrollTo(
                        servicesRef,
                      )
                    }
                  >
                    <span
                      className={
                        selectedServices.length
                          ? 'is-done'
                          : ''
                      }
                    >
                      {selectedServices.length ? (
                        <Check
                          size={
                            13
                          }
                        />
                      ) : (
                        '2'
                      )}
                    </span>

                    <div>
                      <small>
                        02
                      </small>

                      <strong>
                        Услуги
                      </strong>
                    </div>
                  </button>
                </>
              )}

              <div className="appgrade-cart-step-line" />

              <button
                type="button"
                onClick={() =>
                  scrollTo(
                    checkoutRef,
                  )
                }
              >
                <span
                  className={
                    checkoutReady
                      ? 'is-done'
                      : ''
                  }
                >
                  {checkoutReady ? (
                    <Check
                      size={
                        13
                      }
                    />
                  ) : hasServices ? (
                    '3'
                  ) : (
                    '2'
                  )}
                </span>

                <div>
                  <small>
                    {hasServices
                      ? '03'
                      : '02'}
                  </small>

                  <strong>
                    Оформление
                  </strong>
                </div>
              </button>
            </div>

            {/* ===============================================
                MAIN GRID
                =============================================== */}

            <div className="appgrade-cart-layout">

              {/* =============================================
                  LEFT
                  ============================================= */}

              <div className="appgrade-cart-main">

                {/* ===========================================
                    PRODUCTS
                    =========================================== */}

                <section
                  ref={
                    productsRef
                  }
                  className="appgrade-cart-section appgrade-cart-anchor"
                >
                  <div className="appgrade-cart-section-heading">
                    <div>
                      <span>
                        01
                      </span>

                      <h2>
                        Ваш выбор
                      </h2>
                    </div>

                    <p>
                      {totalQuantity}{' '}
                      {productWord(
                        totalQuantity,
                      )}
                    </p>
                  </div>

                  <div className="appgrade-cart-products">
                    {cart.map(
                      (item) => {
                        const lineTotal =
                          item.price *
                          item.quantity;

                        const compatible =
                          getAppleDeviceType(
                            item,
                          ) !==
                          null;

                        return (
                          <article
                            key={
                              item.id
                            }
                            className="appgrade-cart-product"
                          >
                            <Link
                              href={
                                item.href
                              }
                              className="appgrade-cart-product-image"
                            >
                              <Image
                                src={
                                  item.image
                                }
                                alt={
                                  item.name
                                }
                                fill
                                unoptimized
                                sizes="140px"
                              />
                            </Link>

                            <div className="appgrade-cart-product-copy">
                              <div>
                                <Link
                                  href={
                                    item.href
                                  }
                                >
                                  <h3>
                                    {
                                      item.name
                                    }
                                  </h3>
                                </Link>

                                {item.configuration && (
                                  <p>
                                    {
                                      item.configuration
                                    }
                                  </p>
                                )}

                                {compatible && (
                                  <span className="appgrade-cart-service-compatible">
                                    Доп. услуги доступны
                                  </span>
                                )}
                              </div>

                              <strong>
                                {money.format(
                                  lineTotal,
                                )}{' '}
                                ₽
                              </strong>
                            </div>

                            <div className="appgrade-cart-product-actions">
                              <div className="appgrade-cart-quantity">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setQuantity(
                                      item.id,
                                      item.quantity -
                                        1,
                                    )
                                  }
                                  aria-label="Уменьшить количество"
                                >
                                  <Minus
                                    size={
                                      15
                                    }
                                  />
                                </button>

                                <span>
                                  {
                                    item.quantity
                                  }
                                </span>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setQuantity(
                                      item.id,
                                      item.quantity +
                                        1,
                                    )
                                  }
                                  aria-label="Увеличить количество"
                                >
                                  <Plus
                                    size={
                                      15
                                    }
                                  />
                                </button>
                              </div>

                              <button
                                type="button"
                                className="appgrade-cart-remove"
                                onClick={() =>
                                  removeFromCart(
                                    item.id,
                                  )
                                }
                                aria-label={`Удалить ${item.name}`}
                              >
                                <Trash2
                                  size={
                                    17
                                  }
                                />
                              </button>
                            </div>
                          </article>
                        );
                      },
                    )}
                  </div>
                </section>

                {/* ===========================================
                    SERVICES
                    =========================================== */}

                {hasServices && (
                  <section
                    ref={
                      servicesRef
                    }
                    className="appgrade-cart-section appgrade-cart-anchor"
                  >
                    <div className="appgrade-cart-section-heading">
                      <div>
                        <span>
                          02
                        </span>

                        <h2>
                          Дополнить покупку
                        </h2>
                      </div>

                      <p>
                        Для iPhone и iPad
                      </p>
                    </div>

                    {/* INTRO */}

                    <div className="appgrade-cart-services-intro">
                      <div className="appgrade-cart-services-intro-icon">
                        <Settings2
                          size={
                            18
                          }
                        />
                      </div>

                      <div>
                        <strong>
                          Подготовим устройство за вас
                        </strong>

                        <span>
                          В заказе{' '}
                          {
                            compatibleDeviceCount
                          }{' '}
                          совместимых устройств.
                          Выберите нужные услуги.
                        </span>
                      </div>
                    </div>

                    {/* SERVICE CARDS */}

                    <div className="appgrade-cart-services">
                      {availableServices.map(
                        (
                          service,
                        ) => {
                          const active =
                            selectedServices.includes(
                              service.id,
                            );

                          const Icon =
                            service.icon;

                          return (
                            <button
                              key={
                                service.id
                              }
                              type="button"
                              className={`appgrade-cart-service ${
                                active
                                  ? 'is-active'
                                  : ''
                              }`}
                              aria-pressed={
                                active
                              }
                              onClick={() =>
                                toggleService(
                                  service.id,
                                )
                              }
                            >
                              {/* ACTIVE RED LINE */}

                              <span
                                className="appgrade-cart-service-accent"
                                aria-hidden="true"
                              />

                              {/* TOP */}

                              <div className="appgrade-cart-service-top">
                                <div className="appgrade-cart-service-icon">
                                  <Icon
                                    size={
                                      18
                                    }
                                    strokeWidth={
                                      1.8
                                    }
                                  />
                                </div>

                                {service.badge && (
                                  <span className="appgrade-cart-service-badge">
                                    {
                                      service.badge
                                    }
                                  </span>
                                )}

                                <span className="appgrade-cart-service-check">
                                  {active && (
                                    <Check
                                      size={
                                        15
                                      }
                                      strokeWidth={
                                        2.5
                                      }
                                    />
                                  )}
                                </span>
                              </div>

                              {/* TEXT */}

                              <div className="appgrade-cart-service-content">
                                <h3>
                                  {
                                    service.title
                                  }
                                </h3>

                                <p>
                                  {
                                    service.description
                                  }
                                </p>
                              </div>

                              {/* PRICE */}

                              <div className="appgrade-cart-service-bottom">
                                <strong
                                  className={
                                    active
                                      ? 'is-added'
                                      : ''
                                  }
                                >
                                  {active &&
                                    '+ '}

                                  {money.format(
                                    service.price,
                                  )}{' '}
                                  ₽
                                </strong>

                                <span className="appgrade-cart-service-action">
                                  {active ? (
                                    <>
                                      <Check
                                        size={
                                          12
                                        }
                                      />

                                      Добавлено
                                    </>
                                  ) : (
                                    'Добавить'
                                  )}
                                </span>
                              </div>
                            </button>
                          );
                        },
                      )}
                    </div>

                    {/* SELECTED SUMMARY */}

                    {selectedServices.length >
                      0 && (
                      <div className="appgrade-cart-selected-services">
                        <div>
                          <span className="appgrade-cart-selected-services-check">
                            <Check
                              size={
                                13
                              }
                            />
                          </span>

                          <div>
                            <small>
                              Дополнительные услуги
                            </small>

                            <strong>
                              Выбрано:{' '}
                              {
                                selectedServices.length
                              }
                            </strong>
                          </div>
                        </div>

                        <strong className="appgrade-cart-selected-services-price">
                          +{' '}
                          {money.format(
                            servicesTotal,
                          )}{' '}
                          ₽
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedServices(
                              [],
                            )
                          }
                        >
                          Убрать все
                        </button>
                      </div>
                    )}
                  </section>
                )}

                {/* ===========================================
                    CHECKOUT
                    =========================================== */}

                <section
                  ref={
                    checkoutRef
                  }
                  className="appgrade-cart-section appgrade-cart-anchor"
                >
                  <div className="appgrade-cart-section-heading">
                    <div>
                      <span>
                        {hasServices
                          ? '03'
                          : '02'}
                      </span>

                      <h2>
                        Получение
                      </h2>
                    </div>
                  </div>

                  {/* DELIVERY TYPE */}

                  <div
                    className="appgrade-order-delivery"
                  >
                    <button
                      type="button"
                      className={
                        fulfillment ===
                        'pickup'
                          ? 'is-active'
                          : ''
                      }
                      onClick={() =>
                        setFulfillment(
                          'pickup',
                        )
                      }
                      aria-pressed={
                        fulfillment ===
                        'pickup'
                      }
                      aria-label="Самовывоз"
                    >
                      <span className="appgrade-order-radio" />

                      <div>
                        <strong>
                          Заберу сам
                        </strong>

                        <small>
                          {currentStore?.address ??
                            'Адрес уточняется'}
                        </small>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={
                        fulfillment ===
                        'delivery'
                          ? 'is-active'
                          : ''
                      }
                      onClick={() =>
                        setFulfillment(
                          'delivery',
                        )
                      }
                      aria-pressed={
                        fulfillment ===
                        'delivery'
                      }
                      aria-label="Доставка"
                    >
                      <span className="appgrade-order-radio" />

                      <div>
                        <strong>
                          Нужна доставка
                        </strong>

                        <small>
                          Уточним условия и время
                        </small>
                      </div>
                    </button>
                  </div>

                  {/* DELIVERY ADDRESS */}

                  <div
                    inert={fulfillment !== 'delivery'}
                    aria-hidden={fulfillment !== 'delivery'}
                    className={`appgrade-delivery-reveal ${
                      fulfillment ===
                      'delivery'
                        ? 'is-open'
                        : ''
                    }`}
                  >
                    <label
                      className={
                        touchedFields.address &&
                        !deliveryReady
                          ? 'is-invalid'
                          : deliveryReady &&
                              deliveryAddress
                            ? 'is-valid'
                            : ''
                      }
                    >
                      <span>
                        Адрес доставки
                      </span>

                      <input
                        type="text"
                        value={
                          deliveryAddress
                        }
                        onChange={(
                          event,
                        ) =>
                          setDeliveryAddress(
                            event
                              .target
                              .value,
                          )
                        }
                        onBlur={() =>
                          setTouchedFields(
                            (current) => ({
                              ...current,
                              address: true,
                            }),
                          )
                        }
                        placeholder="Улица, дом, квартира"
                        autoComplete="street-address"
                        aria-invalid={
                          touchedFields.address &&
                          !deliveryReady
                        }
                      />

                      {touchedFields.address &&
                        !deliveryReady && (
                        <small className="appgrade-field-message">
                          Укажите улицу и номер дома
                        </small>
                      )}
                    </label>
                  </div>

                  {/* FORM */}
                  <OrderAvailability available={ordersAvailable} />

                  <form
                    id="appgrade-order-form"
                    className="appgrade-order-form"
                    onSubmit={
                      handleSubmit
                    }
                  >
                    <div className="appgrade-checkout-subheading">
                      <span>
                        Почти готово
                      </span>

                      <strong>
                        Оставьте контакты
                      </strong>
                    </div>

                    <div className="appgrade-order-fields">
                      <label
                        className={
                          touchedFields.name
                            ? nameReady
                              ? 'is-valid'
                              : 'is-invalid'
                            : ''
                        }
                      >
                        <span>
                          Имя
                        </span>

                        <input
                          type="text"
                          name="name"
                          maxLength={100}
                          value={
                            name
                          }
                          onChange={(
                            event,
                          ) =>
                            setName(
                              event
                                .target
                                .value,
                            )
                          }
                          onBlur={() =>
                            setTouchedFields(
                              (current) => ({
                                ...current,
                                name: true,
                              }),
                            )
                          }
                          placeholder="Как к вам обращаться?"
                          autoComplete="name"
                          aria-invalid={
                            touchedFields.name &&
                            !nameReady
                          }
                          required
                        />

                        {touchedFields.name &&
                          !nameReady && (
                          <small className="appgrade-field-message">
                            Введите минимум 2 символа
                          </small>
                        )}
                      </label>

                      <label
                        className={
                          touchedFields.phone
                            ? phoneReady
                              ? 'is-valid'
                              : 'is-invalid'
                            : ''
                        }
                      >
                        <span>
                          Телефон
                        </span>

                        <input
                          type="tel"
                          name="phone"
                          maxLength={30}
                          value={
                            phone
                          }
                          onChange={(
                            event,
                          ) =>
                            setPhone(
                              event
                                .target
                                .value,
                            )
                          }
                          onBlur={() =>
                            setTouchedFields(
                              (current) => ({
                                ...current,
                                phone: true,
                              }),
                            )
                          }
                          placeholder="+7 999 000-00-00"
                          autoComplete="tel"
                          inputMode="tel"
                          aria-invalid={
                            touchedFields.phone &&
                            !phoneReady
                          }
                          required
                        />

                        {touchedFields.phone &&
                          !phoneReady && (
                          <small className="appgrade-field-message">
                            Введите номер из 10 цифр
                          </small>
                        )}
                      </label>
                    </div>

                    {/* CONTACT METHOD */}

                    <div className="appgrade-contact-method">
                      <span>
                        Как удобнее связаться?
                      </span>

                      <div>
                        <button
                          type="button"
                          className={
                            contactMethod ===
                            'call'
                              ? 'is-active'
                              : ''
                          }
                          onClick={() =>
                            setContactMethod(
                              'call',
                            )
                          }
                        >
                          Позвонить
                        </button>

                        <button
                          type="button"
                          className={
                            contactMethod ===
                            'telegram'
                              ? 'is-active'
                              : ''
                          }
                          onClick={() =>
                            setContactMethod(
                              'telegram',
                            )
                          }
                        >
                          Telegram
                        </button>
                      </div>
                    </div>

                    {/* COMMENT */}
                    {contactMethod === 'telegram' && (
                      <div className="appgrade-order-fields"><label>
                        <span>Ваш Telegram</span>
                        <input name="telegramUsername" value={telegramUsername} onChange={event => setTelegramUsername(event.target.value)} placeholder="@username" pattern="@?[a-zA-Z][a-zA-Z0-9_]{4,31}" maxLength={33} required />
                      </label></div>
                    )}

                    <label className="appgrade-order-comment">
                      <span>
                        Комментарий
                      </span>

                      <textarea
                        name="comment"
                        maxLength={1000}
                        rows={3}
                        placeholder="Например: связаться после 18:00"
                      />
                    </label>
                  </form>
                </section>
              </div>

              {/* =============================================
                  RIGHT SUMMARY
                  ============================================= */}

              <aside className="appgrade-cart-summary">

                {/* PROGRESS */}

                <div className="appgrade-cart-progress">
                  <div>
                    <span>
                      Готовность заказа
                    </span>

                    <strong>
                      {progress}%
                    </strong>
                  </div>

                  <div className="appgrade-cart-progress-track">
                    <span
                      style={{
                        width:
                          `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                <span className="appgrade-cart-summary-kicker">
                  APPGRADE ORDER
                </span>

                {/* TOTAL */}

                <div className="appgrade-cart-summary-title">
                  <strong>
                    Итого
                  </strong>

                  <b
                    key={
                      total
                    }
                    className="appgrade-cart-total-value"
                  >
                    {money.format(
                      total,
                    )}{' '}
                    ₽
                  </b>
                </div>

                {/* BREAKDOWN */}

                <div className="appgrade-cart-summary-lines">
                  <div>
                    <span>
                      Товары
                    </span>

                    <strong>
                      {money.format(
                        productsTotal,
                      )}{' '}
                      ₽
                    </strong>
                  </div>

                  {hasServices && (
                    <div>
                      <span>
                        Доп. услуги
                      </span>

                      <strong>
                        {servicesTotal
                          ? `+ ${money.format(
                              servicesTotal,
                            )} ₽`
                          : '—'}
                      </strong>
                    </div>
                  )}

                  <div>
                    <span>
                      Получение
                    </span>

                    <strong>
                      {fulfillment ===
                      'pickup'
                        ? 'Самовывоз'
                        : 'Доставка'}
                    </strong>
                  </div>
                </div>

                {/* SELECTED SERVICES */}

                {selectedServices.length >
                  0 && (
                  <div className="appgrade-cart-summary-services">
                    <span className="appgrade-cart-summary-services-title">
                      Вы выбрали
                    </span>

                    {SERVICES.filter(
                      (
                        service,
                      ) =>
                        selectedServices.includes(
                          service.id,
                        ),
                    ).map(
                      (
                        service,
                      ) => (
                        <div
                          key={
                            service.id
                          }
                        >
                          <span>
                            {
                              service.title
                            }
                          </span>

                          <strong>
                            +{' '}
                            {money.format(
                              service.price,
                            )}{' '}
                            ₽
                          </strong>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {/* CITY */}

                <div className="appgrade-cart-summary-city">
                  <MapPin
                    size={
                      17
                    }
                  />

                  <div>
                    <span>
                      Ваш магазин
                    </span>

                    <strong>
                      {currentStore?.city ??
                        city.name}
                    </strong>
                  </div>
                </div>

                {/* SUBMIT */}
                <OrderAvailability available={ordersAvailable} />

                <button
                  type="submit"
                  form="appgrade-order-form"
                  className="appgrade-cart-submit"
                  disabled={
                    ordersAvailable !== true ||
                    sending ||
                    !checkoutReady
                  }
                >
                  <span>
                    {ordersAvailable === null ? 'Проверяем доступность…' : ordersAvailable === false ? 'Приём заявок недоступен' : sending
                      ? 'Отправляем...'
                      : checkoutReady
                        ? 'Оформить заявку'
                        : 'Заполните контакты'}
                  </span>

                  {!sending && (
                    <ArrowRight
                      size={
                        17
                      }
                    />
                  )}
                </button>

                {/* SUCCESS */}

                {submitStatus ===
                  'success' && (
                  <div className="appgrade-cart-message is-success">
                    <Check
                      size={
                        16
                      }
                    />

                    <div>
                      <strong>
                        Заявка отправлена
                      </strong>

                      <span>
                        Заказ № {orderId}. Менеджер скоро свяжется с вами.
                      </span>
                    </div>
                  </div>
                )}

                {/* ERROR */}

                {submitStatus ===
                  'error' && (
                  <div className="appgrade-cart-message is-error">
                    {submitError || 'Не удалось отправить заявку.'}
                  </div>
                )}

                <p className="appgrade-cart-summary-note">
                  Заявка не обязывает к покупке.
                  Менеджер подтвердит наличие
                  и детали заказа.
                </p>
              </aside>
            </div>

            {/* ===============================================
                MOBILE CHECKOUT BAR
                =============================================== */}

            <div className="appgrade-cart-mobile-bar">
              <div>
                <small>
                  Итого
                </small>

                <strong
                  key={`mobile-${total}`}
                  className="appgrade-cart-total-value"
                >
                  {money.format(
                    total,
                  )}{' '}
                  ₽
                </strong>
              </div>

              <button
                type={
                  checkoutReady
                    ? 'submit'
                    : 'button'
                }
                form={
                  checkoutReady
                    ? 'appgrade-order-form'
                    : undefined
                }
                onClick={
                  checkoutReady
                    ? undefined
                    : () =>
                        scrollTo(
                          checkoutRef,
                        )
                }
                disabled={sending}
              >
                {sending
                  ? 'Отправляем...'
                  : checkoutReady
                    ? 'Оформить'
                    : 'К оформлению'}

                <ArrowRight
                  size={
                    16
                  }
                />
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
