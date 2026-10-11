import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getDb } from '@/lib/db';
import { SCHEDULES, PRICE, FOLLOWUP_INTERVALS } from '@/lib/schedules';
import { sendCheckoutNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, scheduleId } = await req.json();

    if (!name || !email || !phone || !scheduleId) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const schedule = SCHEDULES.find((s) => s.id === scheduleId);
    if (!schedule) {
      return NextResponse.json({ error: 'Jadwal tidak valid' }, { status: 400 });
    }

    const id = randomUUID();
    const now = new Date();

    let invoiceId = '';
    let invoiceUrl = '';

    const xenditKey = process.env.XENDIT_SECRET_KEY;
    if (xenditKey) {
      const xenditRes = await fetch('https://api.xendit.co/v2/invoices', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(xenditKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_id: id,
          amount: PRICE,
          payer_email: email,
          description: `Webinar Saham Syariah – ${schedule.label} (${schedule.date})`,
          customer: { given_names: name, email, mobile_number: phone },
          items: [{ name: `Webinar Saham Syariah – ${schedule.label}`, quantity: 1, price: PRICE, category: 'Webinar' }],
          fees: [],
          invoice_duration: 86400,
          success_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dekav1/sukses?id=${id}`,
          failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dekav1`,
          currency: 'IDR',
        }),
      });
      const xenditData = await xenditRes.json();
      invoiceId = xenditData.id || '';
      invoiceUrl = xenditData.invoice_url || '';
    } else {
      invoiceId = `mock_${id}`;
      invoiceUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dekav1/sukses?id=${id}&mock=1`;
    }

    const db = getDb();
    db.prepare(`
      INSERT INTO registrations (id, name, email, phone, schedule, schedule_label, schedule_datetime, xendit_invoice_id, xendit_invoice_url, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'), datetime('now'))
    `).run(id, name, email, phone, scheduleId, schedule.label, schedule.datetime, invoiceId, invoiceUrl);

    for (const minutes of FOLLOWUP_INTERVALS) {
      const scheduledAt = new Date(now.getTime() + minutes * 60 * 1000).toISOString();
      db.prepare(`INSERT INTO followups (registration_id, attempt, scheduled_at, status) VALUES (?, ?, ?, 'pending')`).run(id, minutes, scheduledAt);
    }

    sendCheckoutNotification({ name, email, phone, scheduleLabel: schedule.label, scheduleDate: schedule.date, invoiceUrl }).catch(console.error);

    return NextResponse.json({ id, invoiceUrl });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
