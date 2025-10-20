import { Inter, Cairo, Poppins } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
});

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});