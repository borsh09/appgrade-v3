import {
  NextRequest,
  NextResponse,
} from 'next/server';

type OrderPayload = {
  customer: {
    name: string;
    phone: string;
    comment?: string;
  };

  city: {
    id: string;
    name: string;
    address?: string;
  };

  fulfillment:
    | 'pickup'
    | 'delivery';

  services: string[];

  items: {
    id: string;
    name: string;
    configuration?: string;
    price: number;
    quantity: number;
  }[];

  productsTotal: number;
  servicesTotal: number;
  total: number;
};

const money =
  new Intl.NumberFormat(
    'ru-RU',
  );

function escapeHtml(
  value: string,
) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export async function POST(
  request: NextRequest,
) {
  try {
    const payload =
      (await request.json()) as OrderPayload;

    if (
      !payload.customer?.name ||
      !payload.customer?.phone ||
      !payload.items?.length
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid order',
        },
        {
          status: 400,
        },
      );
    }

    const botToken =
      process.env
        .TELEGRAM_BOT_TOKEN;

    const chatId =
      process.env
        .TELEGRAM_CHAT_ID;

    if (
      !botToken ||
      !chatId
    ) {
      console.error(
        'Telegram variables are not configured',
      );

      return NextResponse.json(
        {
          error:
            'Order receiver is not configured',
        },
        {
          status: 503,
        },
      );
    }

    const itemsText =
      payload.items
        .map((item) => {
          const configuration =
            item.configuration
              ? `\n${escapeHtml(
                  item.configuration,
                )}`
              : '';

          return [
            `• <b>${escapeHtml(
              item.name,
            )}</b>`,
            configuration,
            `\n${item.quantity} шт. × ${money.format(
              item.price,
            )} ₽`,
          ].join('');
        })
        .join('\n\n');

    const servicesText =
      payload.services.length
        ? payload.services
            .map(
              (service) =>
                `• ${escapeHtml(
                  service,
                )}`,
            )
            .join('\n')
        : 'Не выбраны';

    const fulfillmentText =
      payload.fulfillment ===
      'pickup'
        ? 'Самовывоз'
        : 'Доставка';

    const message = `
<b>🛒 НОВАЯ ЗАЯВКА APPGRADE</b>

<b>Клиент</b>
${escapeHtml(payload.customer.name)}
${escapeHtml(payload.customer.phone)}

<b>Город</b>
${escapeHtml(payload.city.name)}
${escapeHtml(payload.city.address ?? '')}

<b>Получение</b>
${fulfillmentText}

<b>Товары</b>
${itemsText}

<b>Дополнительные услуги</b>
${servicesText}

<b>Стоимость товаров</b>
${money.format(payload.productsTotal)} ₽

<b>Доп. услуги</b>
${money.format(payload.servicesTotal)} ₽

<b>ИТОГО</b>
${money.format(payload.total)} ₽

${
  payload.customer.comment
    ? `<b>Комментарий</b>\n${escapeHtml(
        payload.customer.comment,
      )}`
    : ''
}
`.trim();

    const telegramResponse =
      await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify({
              chat_id:
                chatId,

              text:
                message,

              parse_mode:
                'HTML',

              disable_web_page_preview:
                true,
            }),
        },
      );

    if (
      !telegramResponse.ok
    ) {
      const result =
        await telegramResponse.text();

      console.error(
        'Telegram API error:',
        result,
      );

      return NextResponse.json(
        {
          error:
            'Telegram error',
        },
        {
          status: 502,
        },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      'Order API error:',
      error,
    );

    return NextResponse.json(
      {
        error:
          'Internal server error',
      },
      {
        status: 500,
      },
    );
  }
}