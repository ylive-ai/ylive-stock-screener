import nodemailer from 'nodemailer';
import axios from 'axios';
import { ZOOM_LINK } from './schedules';

async function sendWhatsApp(phone: string, message: string) {
  const token = process.env.FONNTE_TOKEN;
  if (!token) {
    console.log('[WA MOCK]', phone, message.slice(0, 80));
    return;
  }
  const normalized = phone.replace(/\D/g, '').replace(/^0/, '62');
  await axios.post(
    'https://api.fonnte.com/send',
    { target: normalized, message, countryCode: '62' },
    { headers: { Authorization: token } }
  );
}

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendEmail(to: string, subject: string, html: string) {
  const user = process.env.SMTP_USER;
  if (!user) {
    console.log('[EMAIL MOCK]', to, subject);
    return;
  }
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"Coach DEKA – Ylive Academy" <${user}>`,
    to,
    subject,
    html,
  });
}

export async function sendCheckoutNotification(reg: {
  name: string;
  email: string;
  phone: string;
  scheduleLabel: string;
  scheduleDate: string;
  invoiceUrl: string;
}) {
  const waMsg = `Halo *${reg.name}* 👋\n\nTerima kasih sudah mendaftar Webinar *Saham Syariah bersama Coach DEKA*!\n\n📅 Jadwal pilihan Anda:\n*${reg.scheduleLabel} – ${reg.scheduleDate} · 19.00 WIB*\n\n💳 Silakan selesaikan pembayaran Rp149.000 melalui tautan berikut:\n${reg.invoiceUrl}\n\nPembayaran berlaku selama *24 jam*. Setelah lunas, Anda akan langsung mendapatkan konfirmasi & link Zoom.\n\nJika ada pertanyaan, balas pesan ini ya 🙏`;

  const emailHtml = `
<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;background:#fffdf7;border-radius:12px">
  <h2 style="color:#1a2744">Halo, ${reg.name}! 👋</h2>
  <p>Terima kasih sudah mendaftar <strong>Webinar Saham Syariah bersama Coach DEKA</strong>.</p>
  <p>Jadwal pilihan Anda: <strong>${reg.scheduleLabel} – ${reg.scheduleDate} · 19.00 WIB</strong></p>
  <a href="${reg.invoiceUrl}" style="display:inline-block;background:#c9a84c;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
    Bayar Sekarang – Rp149.000 →
  </a>
  <p style="color:#666;font-size:13px">Tautan pembayaran berlaku 24 jam.</p>
  <hr style="border:1px solid #eee;margin:24px 0"/>
  <p style="color:#999;font-size:12px">Ylive Academy · Coach DEKA · ylive.ai</p>
</div>`;

  await Promise.all([
    sendWhatsApp(reg.phone, waMsg),
    sendEmail(reg.email, `✅ Selesaikan Pembayaran – Webinar Coach DEKA (${reg.scheduleLabel})`, emailHtml),
  ]);
}

export async function sendPaymentConfirmation(reg: {
  name: string;
  email: string;
  phone: string;
  scheduleLabel: string;
  scheduleDate: string;
}) {
  const waMsg = `*Alhamdulillah!* Pembayaran Anda sudah kami terima ✅\n\nHalo *${reg.name}*, selamat bergabung di Webinar *Saham Syariah bersama Coach DEKA*!\n\n📅 *${reg.scheduleLabel}*\n🗓 ${reg.scheduleDate} · 19.00 WIB\n\n🔗 *Link Zoom Webinar:*\n${ZOOM_LINK}\n\nSelanjutnya, mohon isi asesmen singkat agar Coach DEKA bisa menyiapkan materi yang paling relevan untuk Anda 👇`;

  const emailHtml = `
<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px;background:#fffdf7;border-radius:12px">
  <h2 style="color:#1a2744">Alhamdulillah, Pembayaran Diterima! 🎉</h2>
  <p>Halo <strong>${reg.name}</strong>, Anda resmi terdaftar!</p>
  <div style="background:#f0f7f0;border-radius:8px;padding:16px;margin:16px 0">
    <p style="margin:0"><strong>📅 ${reg.scheduleLabel}</strong></p>
    <p style="margin:4px 0 0">${reg.scheduleDate} · 19.00 WIB</p>
  </div>
  <a href="${ZOOM_LINK}" style="display:inline-block;background:#1a2744;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
    🔗 Daftar Zoom Webinar
  </a>
  <p>Selanjutnya: isi asesmen singkat agar materi lebih relevan untuk Anda.</p>
  <hr style="border:1px solid #eee;margin:24px 0"/>
  <p style="color:#999;font-size:12px">Ylive Academy · Coach DEKA · ylive.ai</p>
</div>`;

  await Promise.all([
    sendWhatsApp(reg.phone, waMsg),
    sendEmail(reg.email, `🎉 Pembayaran Berhasil – Selamat Datang di Webinar Coach DEKA!`, emailHtml),
  ]);
}

const REMINDER_MESSAGES: Record<string, (name: string, schedule: string) => string> = {
  'H-48jam': (name, schedule) =>
    `Halo *${name}* 😊\n\nWebinar *Saham Syariah bersama Coach DEKA* tinggal *48 jam lagi*!\n\n📅 ${schedule} · 19.00 WIB\n\nPastikan Anda sudah menyimpan link Zoom ya:\n${ZOOM_LINK}\n\nAda yang ingin Anda tanyakan atau siapkan? Balas pesan ini 🙏`,

  'H-24jam': (name, schedule) =>
    `*${name}*, besok malam kita ketemu! 🌙\n\nWebinar *Saham Syariah* bersama Coach DEKA tinggal *24 jam lagi*.\n\n📅 ${schedule} · 19.00 WIB\n🔗 ${ZOOM_LINK}\n\n_Tips: pastikan koneksi internet Anda stabil dan cari tempat yang nyaman untuk belajar._ 🎯`,

  'H-12jam': (name, schedule) =>
    `Halo *${name}*! ⏰\n\nMalam ini kita belajar bersama Coach DEKA — *12 jam lagi*!\n\n📅 ${schedule} · 19.00 WIB\n🔗 ${ZOOM_LINK}\n\nSiapkan buku catatan atau notes digital Anda. Banyak insight berharga yang akan Coach DEKA bagikan malam ini 📝`,

  'H-6jam': (name, schedule) =>
    `*${name}*, sudah siap? 🚀\n\nWebinar tinggal *6 jam lagi*!\n\n📅 ${schedule} · 19.00 WIB\n🔗 ${ZOOM_LINK}\n\nJangan lupa makan malam dulu sebelum sesi ya — supaya fokus belajarnya maksimal 😄`,

  'H-3jam': (name, schedule) =>
    `Halo *${name}* 👋\n\n3 jam lagi kita mulai!\n\nWebinar *Saham Syariah bersama Coach DEKA*\n📅 ${schedule} · 19.00 WIB\n🔗 ${ZOOM_LINK}\n\n_Sudah buka Zoom-nya? Coba tes audio dan video sekarang agar sesi berjalan lancar._ ✅`,

  'H-1jam': (name, schedule) =>
    `*${name}*, kita mulai 1 jam lagi! ⚡\n\n📅 ${schedule} · 19.00 WIB\n🔗 ${ZOOM_LINK}\n\nSilakan klik link di atas dan daftarkan diri Anda di Zoom jika belum. Sampai jumpa sebentar lagi! 🙌`,

  'H-30menit': (name, schedule) =>
    `*30 menit lagi*, ${name}! 🔔\n\nWebinar dimulai pukul 19.00 WIB.\n🔗 ${ZOOM_LINK}\n\nSilakan masuk ke Zoom sekarang. Ruang sudah terbuka!`,

  'H-15menit': (name, schedule) =>
    `⏳ *15 menit lagi* — ruang Zoom sudah terbuka!\n\nHalo ${name}, segera bergabung:\n🔗 ${ZOOM_LINK}\n\nSampai jumpa di dalam! 😊`,

  'H-1menit': (name, schedule) =>
    `🟢 *Kita mulai 1 menit lagi, ${name}!*\n\nSegera klik link ini:\n${ZOOM_LINK}\n\nCoach DEKA sudah menunggu. Ayo! 🎯`,
};

export async function sendReminder(
  reg: { name: string; email: string; phone: string; scheduleLabel: string; scheduleDate: string },
  reminderLabel: string
) {
  const messageFn = REMINDER_MESSAGES[reminderLabel];
  if (!messageFn) return;
  const scheduleStr = `${reg.scheduleLabel} · ${reg.scheduleDate}`;
  const waMsg = messageFn(reg.name, scheduleStr);
  await sendWhatsApp(reg.phone, waMsg);
  if (['H-24jam', 'H-1jam'].includes(reminderLabel)) {
    await sendEmail(
      reg.email,
      `⏰ ${reminderLabel} – Webinar Coach DEKA malam ini!`,
      `<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px"><p>${waMsg.replace(/\n/g, '<br/>')}</p></div>`
    );
  }
}

const FOLLOWUP_MESSAGES: Record<number, (name: string, invoiceUrl: string) => string> = {
  10: (name, url) =>
    `Halo *${name}* 😊\n\nBaru saja Anda mendaftar Webinar *Saham Syariah bersama Coach DEKA* — tapi pembayarannya belum selesai.\n\nMungkin ada kendala? Silakan lanjutkan di sini:\n${url}\n\nHanya Rp149.000 dan Anda sudah bisa mulai belajar! 🎯`,

  20: (name, url) =>
    `*${name}*, tempat di webinar Coach DEKA masih tersedia untuk Anda! 📌\n\nSekadar mengingatkan, pembayaran Anda belum selesai.\n\n💡 Tahukah Anda? Saham syariah di Indonesia tumbuh lebih dari 30% dalam 5 tahun terakhir — dan Coach DEKA akan berbagi caranya malam ini.\n\nAyo selesaikan:\n${url}`,

  30: (name, url) =>
    `Halo *${name}* 🙏\n\nSudah 30 menit berlalu sejak Anda mendaftar. Kami ingin memastikan Anda tidak ketinggalan kesempatan ini.\n\n_"Ilmu yang benar menghasilkan keputusan yang lebih baik — bukan sekadar keberuntungan."_ — Coach DEKA\n\nLanjutkan pembayaran:\n${url}`,

  40: (name, url) =>
    `*${name}*, satu langkah lagi menuju pemahaman investasi syariah yang lebih dalam 📈\n\nPeserta lain sudah mengamankan tempat mereka. Jangan sampai Anda menyesal!\n\n✅ Materi fondasi untuk pemula\n✅ Bonus E-Book Revolusi Saham Syariah\n✅ Sesi tanya jawab langsung dengan Coach DEKA\n\nSelesaikan di:\n${url}`,

  50: (name, url) =>
    `Halo *${name}* 👋\n\nMasih ada waktu! Pembayaran Anda bisa diselesaikan sekarang dan tempat masih tersedia.\n\nBanyak keluarga Indonesia sudah memulai perjalanan investasi syariah mereka bersama Coach DEKA. Giliran Anda? 😊\n\n${url}`,

  60: (name, url) =>
    `*${name}*, ini pesan terakhir kami hari ini 🌙\n\nJika ada kendala dengan pembayaran — mungkin metode yang tidak cocok, atau butuh bantuan — mohon balas pesan ini dan tim kami siap membantu.\n\nTautan pembayaran Anda:\n${url}\n\nSemoga bisa bergabung bersama kami. Sampai ketemu di webinar! 🎉`,
};

export async function sendFollowUp(
  reg: { name: string; email: string; phone: string; invoiceUrl: string },
  attempt: number
) {
  const messageFn = FOLLOWUP_MESSAGES[attempt];
  if (!messageFn) return;
  const waMsg = messageFn(reg.name, reg.invoiceUrl || '');
  await sendWhatsApp(reg.phone, waMsg);
}
