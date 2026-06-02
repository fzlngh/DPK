import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || 'Mid-server-4hyH2SvI_MjY859ZPRRxWhMD';
const MIDTRANS_API_URL    = 'https://app.sandbox.midtrans.com/snap/v1/transactions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, packageId, packageName } = body;

    if (!orderId || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const payload = {
      transaction_details: {
        order_id:     orderId,
        gross_amount: amount,
      },
      item_details: [
        {
          id:       packageId,
          price:    amount,
          quantity: 1,
          name:     packageName || 'BeatPoints Package',
        },
      ],
      credit_card: {
        secure: true,
      },
      enabled_payments: [
        'credit_card',
        'gopay',
        'shopeepay',
        'dana',
        'ovo',
        'qris',
        'bca_va',
        'bni_va',
        'bri_va',
        'permata_va',
        'other_va',
        'indomaret',
        'alfamart',
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://dhiyaa-fazila.my.id'}/projek-5`,
        error:  `${process.env.NEXT_PUBLIC_BASE_URL || 'https://dhiyaa-fazila.my.id'}/projek-5`,
        pending:`${process.env.NEXT_PUBLIC_BASE_URL || 'https://dhiyaa-fazila.my.id'}/projek-5`,
      },
    };

    const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
    const response = await fetch(MIDTRANS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Basic ${auth}`,
        'Accept':        'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Midtrans error:', errText);
      return NextResponse.json({ error: 'Midtrans API error', detail: errText }, { status: 502 });
    }

    const data = await response.json();

    return NextResponse.json({
      token:    data.token,
      redirect: data.redirect_url,
      orderId,
    });

  } catch (err: any) {
    console.error('API route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
