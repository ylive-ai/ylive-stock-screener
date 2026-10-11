import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { SCHEDULES, REMINDER_INTERVALS } from '@/lib/schedules';
import { sendPaymentConfirmation } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const callbackToken = req.headers.get('x-callback-token');
    if (process.env.XENDIT_WEBHOOK_TOKEN && callbackToken !== process.env.XENDIT_WEBHOOK_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { external_id, status } = body;

    if (status !== 'PAID' && status !== 'SETTLED') {
      return NextResponse.json({ ok: true });
    }

    const db = getDb();
    const reg = db.prepare('SELECT * FROM registrations WHERE id = ?').get(external_id) as any;
    if (!reg || reg.status === 'paid') return NextResponse.json({ ok: true });

    db.prepare(`UPDATE registrations SET status = 'paid', paid_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`).run(external_id);
    db.prepare(`UPDATE followups SET status = 'cancelled' WHERE registration_id = ? AND status = 'pending'`).run(external_id);

    const schedule = SCHEDULES.find((s) => s.id === reg.schedule);
    if (schedule) {
      const eventTime = new Date(schedule.datetime).getTime();
      for (const interval of REMINDER_INTERVALS) {
        const reminderTime = new Date(eventTime - interval.minutes * 60 * 1000);
        if (reminderTime > new Date()) {
          db.prepare(`INSERT INTO notifications (registration_id, type, channel, scheduled_at, status, content) VALUES (?, 'reminder', 'wa', ?, 'pending', ?)`).run(external_id, reminderTime.toISOString(), interval.label);
        }
      }
      sendPaymentConfirmation({ name: reg.name, email: reg.email, phone: reg.phone, scheduleLabel: reg.schedule_label, scheduleDate: schedule.date }).catch(console.error);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
