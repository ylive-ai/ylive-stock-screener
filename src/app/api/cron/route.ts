import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { SCHEDULES } from '@/lib/schedules';
import { sendReminder, sendFollowUp } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('authorization');
  if (process.env.CRON_SECRET && secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const now = new Date().toISOString();

  const reminders = db.prepare(`
    SELECT n.*, r.name, r.email, r.phone, r.schedule, r.schedule_label
    FROM notifications n
    JOIN registrations r ON r.id = n.registration_id
    WHERE n.status = 'pending' AND n.scheduled_at <= ? AND n.type = 'reminder'
    LIMIT 20
  `).all(now) as any[];

  for (const rem of reminders) {
    try {
      const schedule = SCHEDULES.find((s) => s.id === rem.schedule);
      await sendReminder({ name: rem.name, email: rem.email, phone: rem.phone, scheduleLabel: rem.schedule_label, scheduleDate: schedule?.date || '' }, rem.content);
      db.prepare(`UPDATE notifications SET status = 'sent', sent_at = datetime('now') WHERE id = ?`).run(rem.id);
    } catch (e) { console.error('Reminder error:', e); }
  }

  const followups = db.prepare(`
    SELECT f.*, r.name, r.email, r.phone, r.xendit_invoice_url, r.status as reg_status
    FROM followups f
    JOIN registrations r ON r.id = f.registration_id
    WHERE f.status = 'pending' AND f.scheduled_at <= ? AND r.status = 'pending'
    LIMIT 20
  `).all(now) as any[];

  for (const fu of followups) {
    try {
      await sendFollowUp({ name: fu.name, email: fu.email, phone: fu.phone, invoiceUrl: fu.xendit_invoice_url }, fu.attempt);
      db.prepare(`UPDATE followups SET status = 'sent', sent_at = datetime('now') WHERE id = ?`).run(fu.id);
    } catch (e) { console.error('Followup error:', e); }
  }

  return NextResponse.json({ ok: true, reminders: reminders.length, followups: followups.length });
}
