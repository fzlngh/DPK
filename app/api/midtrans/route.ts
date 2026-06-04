import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';
// ─────────────────────────────────────────────
// MIDTRANS SANDBOX CONFIG
// https://dashboard.sandbox.midtrans.com → Settings → Access Keys
// ─────────────────────────────────────────────
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || 'Mid-server-4hyH2SvI_MjY859ZPRRxWhMD';
const MIDTRANS_API_URL    = 'https://app.sandbox.midtrans.com/snap/v1/transactions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      amount,           // final amount after discount
      originalAmount,   // original price before discount
      discount,         // discount amount
      packageId,
      packageName,
      promoCode,        // kode promo yang dipakai (nullable)
      promoLabel,       // deskripsi promo (nullable)
      bonusBP,          // bonus BP dari promo
    } = body;

    if (!orderId || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Build item_details — include discount as separate line item if any
    const itemDetails: Record<string, any>[] = [
      {
        id:       packageId,
        price:    originalAmount ?? amount,
        quantity: 1,
        name:     packageName || 'BeatPoints Package',
      },
    ];

    // Midtrans memerlukan gross_amount == sum of item_details
    // Jadi tambahkan discount sebagai item dengan harga negatif
    if (discount && discount > 0) {
      itemDetails.push({
        id:       'PROMO_DISCOUNT',
        price:    -discount,
        quantity: 1,
        name:     `Diskon Promo${promoCode ? ` (${promoCode})` : ''}`,
      });
    }

    const payload: Record<string, any> = {
      transaction_details: {
        order_id:     orderId,
        gross_amount: amount,   // final amount yang dibayar
      },
      item_details: itemDetails,
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
        finish:  `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/beat-bang?payment=finish`,
        error:   `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/beat-bang?payment=error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/beat-bang?payment=pending`,
      },
    };

    // ── Custom fields — dikirim ke Midtrans, muncul di dashboard & notifikasi ──
    if (promoCode) {
      // Midtrans mendukung custom_field1, custom_field2, custom_field3
      payload.custom_field1 = promoCode;                              // kode promo
      payload.custom_field2 = promoLabel  ?? '';                     // label promo
      payload.custom_field3 = bonusBP ? `bonus_bp:${bonusBP}` : ''; // info bonus BP
    }

    // Call Midtrans Snap API
    const auth     = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');
    const response = await fetch(MIDTRANS_API_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Basic ${auth}`,
        'Accept':        'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Midtrans] Error:', errText);
      return NextResponse.json({ error: 'Midtrans API error', detail: errText }, { status: 502 });
    }

    const data = await response.json();

    // Log transaksi untuk debugging (hanya di server)
    console.log(`[Midtrans] Order: ${orderId} | Amount: ${amount} | Promo: ${promoCode ?? '-'} | Token: ${data.token}`);

    return NextResponse.json({
      token:    data.token,
      redirect: data.redirect_url,
      orderId,
      // Return promo info ke client untuk konfirmasi
      promoApplied: promoCode ?? null,
      discount:     discount ?? 0,
      finalAmount:  amount,
    });

  } catch (err: any) {
    console.error('[API] midtrans route error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}