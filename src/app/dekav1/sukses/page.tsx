'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ZOOM_LINK } from '@/lib/schedules';

function SuksesContent() {
  const params = useSearchParams();
  const id = params.get('id');
  const mock = params.get('mock');
  const [step, setStep] = useState<'confirm' | 'assessment' | 'done'>('confirm');
  const [assessment, setAssessment] = useState({ experience: '', goal: '', capital: '' });

  useEffect(() => {
    if (mock && id) fetch(`/api/mock-paid?id=${id}`).catch(() => {});
  }, [id, mock]);

  async function handleAssessment(e: React.FormEvent) {
    e.preventDefault();
    setStep('done');
  }

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center px-4 py-12">
      {step === 'confirm' && (
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><span className="text-4xl">✅</span></div>
          <h1 className="text-2xl font-bold text-[#0f1b2d] mb-3">Alhamdulillah, Pembayaran Berhasil!</h1>
          <p className="text-gray-600 mb-6">Konfirmasi sudah dikirim ke WhatsApp & email Anda. Selamat bergabung di Webinar Saham Syariah bersama Coach DEKA!</p>
          <div className="bg-[#f0faf0] rounded-xl p-4 mb-6 text-left">
            <p className="text-sm font-medium text-gray-700 mb-2">🔗 Link Zoom Webinar Anda:</p>
            <a href={ZOOM_LINK} target="_blank" rel="noopener noreferrer" className="text-[#c9a84c] font-semibold break-all hover:underline text-sm">{ZOOM_LINK}</a>
          </div>
          <p className="text-sm text-gray-500 mb-6">Sebelum webinar dimulai, bantu Coach DEKA menyiapkan materi terbaik untuk Anda dengan mengisi asesmen singkat berikut.</p>
          <button onClick={() => setStep('assessment')} className="w-full bg-[#c9a84c] text-white font-bold py-4 rounded-xl hover:bg-[#b8953d] transition">Isi Asesmen Singkat →</button>
        </div>
      )}

      {step === 'assessment' && (
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <h2 className="text-xl font-bold text-[#0f1b2d] mb-1">Asesmen Singkat</h2>
          <p className="text-sm text-gray-500 mb-6">3 pertanyaan singkat agar Coach DEKA bisa menyesuaikan materi untuk Anda.</p>
          <form onSubmit={handleAssessment} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">1. Seberapa familiar Anda dengan investasi saham?</label>
              {['Belum pernah sama sekali','Pernah dengar, belum pernah coba','Sudah punya rekening saham','Sudah aktif berinvestasi'].map((opt) => (
                <label key={opt} className="flex items-center gap-3 py-2 cursor-pointer">
                  <input type="radio" name="experience" value={opt} onChange={(e) => setAssessment({ ...assessment, experience: e.target.value })} className="accent-[#c9a84c]" required />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">2. Apa tujuan utama Anda belajar saham syariah?</label>
              {['Mulai berinvestasi dengan halal','Menambah penghasilan keluarga','Dana pendidikan anak','Persiapan pensiun','Lainnya'].map((opt) => (
                <label key={opt} className="flex items-center gap-3 py-2 cursor-pointer">
                  <input type="radio" name="goal" value={opt} onChange={(e) => setAssessment({ ...assessment, goal: e.target.value })} className="accent-[#c9a84c]" required />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">3. Berapa modal yang Anda siapkan untuk mulai?</label>
              {['Di bawah Rp1 juta','Rp1 – 5 juta','Rp5 – 20 juta','Di atas Rp20 juta','Belum tahu'].map((opt) => (
                <label key={opt} className="flex items-center gap-3 py-2 cursor-pointer">
                  <input type="radio" name="capital" value={opt} onChange={(e) => setAssessment({ ...assessment, capital: e.target.value })} className="accent-[#c9a84c]" required />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
            <button type="submit" className="w-full bg-[#0f1b2d] text-white font-bold py-4 rounded-xl hover:bg-[#1a2744] transition">Kirim & Lihat Detail Webinar →</button>
          </form>
        </div>
      )}

      {step === 'done' && (
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">🌟</div>
          <h1 className="text-2xl font-bold text-[#0f1b2d] mb-3">Selamat Hadir di Kelas Webinar!</h1>
          <p className="text-gray-600 mb-6">Terima kasih sudah mengisi asesmen. Coach DEKA sudah tahu apa yang Anda butuhkan dan akan menyiapkan sesi terbaik untuk Anda.</p>
          <div className="bg-[#fdf8ed] border border-[#c9a84c] rounded-xl p-5 mb-6 text-left">
            <h3 className="font-bold text-[#0f1b2d] mb-3">📋 Checklist sebelum webinar:</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ Simpan link Zoom di WhatsApp Anda</li>
              <li>✅ Siapkan buku catatan atau notes digital</li>
              <li>✅ Pastikan koneksi internet stabil</li>
              <li>✅ Hadir tepat pukul 19.00 WIB</li>
              <li>✅ Siapkan pertanyaan untuk sesi tanya jawab</li>
            </ul>
          </div>
          <a href={ZOOM_LINK} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#c9a84c] text-white font-bold py-4 rounded-xl hover:bg-[#b8953d] transition mb-4">🔗 Daftar Zoom Sekarang →</a>
          <p className="text-xs text-gray-400">Anda akan mendapatkan reminder otomatis melalui WhatsApp mulai H-48 jam sebelum webinar.</p>
        </div>
      )}
    </div>
  );
}

export default function SuksesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuksesContent />
    </Suspense>
  );
}
