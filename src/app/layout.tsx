import './globals.css';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer/Footer';
import type { Metadata } from 'next';
import { Providers } from './providers'; // 👈

export const metadata: Metadata = {
  title: {
    default: 'Ants Booking',
    template: '%s | Ants Booking',
  },
  description: 'Book your appointments with Ants Booking - fast, simple, reliable.',
};
//hydration error = ublock extension
//SEO is fine just run production build
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
