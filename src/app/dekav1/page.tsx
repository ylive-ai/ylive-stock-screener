'use client';

import { useState } from 'react';
import { SCHEDULES, PRICE } from '@/lib/schedules';

type Step = 'schedule' | 'form' | 'payment';

export default function DekaV1Page() {
  const [step, setStep] = useState<Step>('schedule');
  const [selectedSchedule, setSelectedSchedule] = useState<string>('rabu');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');
  const [regId, setRegId] = useState('');
  const [error, setError] = useState('');

  const selected = SCHEDULES.find((s) => s.id === selectedSchedule)!;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      setError('Mohon isi semua kolom.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, scheduleId: selectedSchedule }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar');
      setRegId(data.id);
      setInvoiceUrl(data.invoiceUrl);
      setStep('payment');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {/* Navbar */}
      <nav className="bg-[#0f1b2d] px-6 py-4 flex justify-between items-center">
        <img src="/images/logo-coach-deka.png" alt="Coach DEKA" className="h-10" />
        <button
          onClick={() => document.getElementById('daftar')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-[#c9a84c] text-[#0f1b2d] font-bold px-5 py-2 rounded-lg text-sm hover:bg-[#b8953d] transition"
        >
          Pilih Jadwal ↗
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-[#c9a84c] font-semibold tracking-widest text-sm uppercase mb-3">Pilih Malam Anda</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0f1b2d] leading-tight mb-6">Satu malam untuk mulai memahami.</h1>
          <p className="text-gray-600 text-lg mb-8">Ikuti satu sesi webinar live melalui Zoom bersama Coach DEKA dan dapatkan bonus <strong>E-Book Revolusi Saham Syariah [True Story]</strong>.</p>
          <div className="mb-8">
            <span className="text-5xl font-extrabold text-[#0f1b2d]">Rp149.000</span>
            <span className="text-gray-500 ml-2">/ peserta</span>
          </div>
          <ul className="space-y-2 text-gray-700">
            {['Materi fondasi untuk pemula','Bonus E-Book Revolusi Saham Syariah [True Story]','Mulai pukul 19.00 WIB','Pilih Selasa, Rabu, atau Kamis malam'].map((item) => (
              <li key={item} className="flex items-center gap-2"><span className="text-[#c9a84c]">✓</span> {item}</li>
            ))}
          </ul>
        </div>

        {/* Registration Card */}
        <div id="daftar" className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'schedule' && (
            <>
              <h2 className="text-xl font-bold text-[#0f1b2d] mb-1">Pilih jadwal webinar</h2>
              <p className="text-sm text-[#c9a84c] mb-5">Termasuk bonus e-book setelah pembayaran berhasil.</p>
              <div className="space-y-3 mb-6">
                {SCHEDULES.map((s) => (
                  <label key={s.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${
                    selectedSchedule === s.id ? 'border-[#c9a84c] bg-[#fdf8ed]' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div>
                      <div className="font-semibold text-[#0f1b2d]">{s.label}</div>
                      <div className="text-sm text-gray-500">{s.date} · {s.time}</div>
                    </div>
                    <input type="radio" name="schedule" value={s.id} checked={selectedSchedule === s.id} onChange={() => setSelectedSchedule(s.id)} className="accent-[#c9a84c] w-5 h-5" />
                  </label>
                ))}
              </div>
              <div className="flex justify-between items-center mb-5">
                <span className="text-gray-600 font-medium">Total</span>
                <span className="font-bold text-[#0f1b2d]">Rp{PRICE.toLocaleString('id-ID')}</span>
              </div>
              <button onClick={() => setStep('form')} className="w-full bg-[#c9a84c] text-white font-bold py-4 rounded-xl hover:bg-[#b8953d] transition">Lanjutkan Pendaftaran ↗</button>
              <p className="text-center text-xs text-gray-400 mt-3">Pembayaran melalui <strong>Xendit</strong></p>
            </>
          )}

          {step === 'form' && (
            <>
              <button onClick={() => setStep('schedule')} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">← Kembali</button>
              <h2 className="text-xl font-bold text-[#0f1b2d] mb-1">Isi data Anda</h2>
              <p className="text-sm text-gray-500 mb-5">{selected.label} · {selected.date} · {selected.time}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama lengkap</label>
                  <input type="text" placeholder="Masukkan nama lengkap" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" placeholder="contoh@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp</label>
                  <input type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]" required />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-600 font-medium">Total</span>
                  <span className="font-bold text-[#0f1b2d]">Rp{PRICE.toLocaleString('id-ID')}</span>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#c9a84c] text-white font-bold py-4 rounded-xl hover:bg-[#b8953d] transition disabled:opacity-60">
                  {loading ? 'Memproses...' : 'Lanjut ke Pembayaran →'}
                </button>
                <p className="text-center text-xs text-gray-400">Pembayaran melalui <strong>Xendit</strong> — aman & terenkripsi</p>
              </form>
            </>
          )}

          {step === 'payment' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#f0faf0] rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">🎉</span></div>
              <h2 className="text-xl font-bold text-[#0f1b2d] mb-2">Satu langkah lagi!</h2>
              <p className="text-gray-600 mb-2">Anda telah mendaftar untuk <strong>{selected.label} · {selected.date}</strong></p>
              <p className="text-sm text-gray-500 mb-6">Notifikasi sudah dikirim ke WhatsApp & email Anda. Selesaikan pembayaran untuk mengamankan tempat.</p>
              <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#c9a84c] text-white font-bold py-4 rounded-xl hover:bg-[#b8953d] transition mb-3">Bayar Sekarang – Rp{PRICE.toLocaleString('id-ID')} →</a>
              <p className="text-xs text-gray-400">Tautan juga sudah dikirim ke WhatsApp & email Anda.</p>
            </div>
          )}
        </div>
      </section>

      {/* Social proof */}
      <section className="bg-[#0f1b2d] py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-white text-2xl font-bold mb-8">Bergabung bersama ribuan peserta yang sudah belajar bersama Coach DEKA</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[{icon:'📈',title:'25+ Tahun',desc:'Pengalaman pasar modal & bisnis'},{icon:'🕌',title:'Syariah Compliant',desc:'Saham yang halal & berkah'},{icon:'👨‍👩‍👧‍👦',title:'10 Juta Keluarga',desc:'Target dampak Ylive Academy'}].map((item) => (
              <div key={item.title} className="text-center p-6">
                <div className="text-4xl mb-3">{item.icon}</div>
                <div className="text-white font-bold text-lg">{item.title}</div>
                <div className="text-gray-400 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h3 className="text-2xl font-bold text-[#0f1b2d] text-center mb-10">Pertanyaan yang sering ditanyakan</h3>
        {[{q:'Apakah webinar ini cocok untuk pemula?',a:'Ya, sangat cocok! Materi dirancang untuk pemula yang belum pernah berinvestasi saham syariah.'},{q:'Bagaimana cara mendapatkan link Zoom?',a:'Setelah pembayaran berhasil, link Zoom akan langsung dikirim melalui WhatsApp dan email Anda.'},{q:'Apakah ada rekaman jika saya tidak bisa hadir?',a:'Webinar dilaksanakan secara live. Kami sarankan hadir langsung agar bisa tanya jawab.'},{q:'Apa itu E-Book bonus?',a:'E-Book "Revolusi Saham Syariah [True Story]" ditulis langsung oleh Coach DEKA berdasarkan pengalaman nyata.'}].map((item) => (
          <details key={item.q} className="border-b border-gray-200 py-4 group cursor-pointer">
            <summary className="font-semibold text-[#0f1b2d] flex justify-between items-center">{item.q}<span className="text-[#c9a84c] group-open:rotate-45 transition-transform">+</span></summary>
            <p className="text-gray-600 mt-2 text-sm leading-relaxed">{item.a}</p>
          </details>
        ))}
      </section>

      {/* Footer CTA */}
      <section className="bg-[#c9a84c] py-12 px-6 text-center">
        <h3 className="text-2xl font-bold text-[#0f1b2d] mb-4">Siap mulai perjalanan investasi syariah Anda?</h3>
        <button onClick={() => { setStep('schedule'); document.getElementById('daftar')?.scrollIntoView({ behavior: 'smooth' }); }} className="bg-[#0f1b2d] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#1a2744] transition">Pilih Jadwal Sekarang →</button>
      </section>

      <footer className="bg-[#0f1b2d] py-6 text-center text-gray-500 text-sm">© 2026 Ylive Academy · Coach DEKA · ylive.ai</footer>
    </div>
  );
}
