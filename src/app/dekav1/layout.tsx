import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Webinar Saham Syariah – Coach DEKA | Ylive Academy',
  description: 'Ikuti satu malam bersama Coach DEKA dan mulai pahami investasi saham syariah. Rp149.000 / peserta. Bonus E-Book Revolusi Saham Syariah.',
  openGraph: {
    title: 'Webinar Saham Syariah – Coach DEKA',
    description: 'Satu malam untuk mulai memahami investasi syariah. Hanya Rp149.000.',
  },
};

export default function DekaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
