import './globals.css';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';
import ClientLayoutWrapper from '../components/ClientLayoutWrapper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Ants Booking',
    template: '%s | Ants Booking',
  },
  description: 'Book your appointments with Ants Booking - fast, simple, reliable.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayoutWrapper>
          <NavBar />
          {children}
          <Footer />
        </ClientLayoutWrapper>
      </body>
    </html>
  );
}
