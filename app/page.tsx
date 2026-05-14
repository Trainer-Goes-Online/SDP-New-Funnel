import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';
import './landing.css';

export const metadata: Metadata = {
  title: 'Science Driven Performance — 90-Day System For Senior Professionals',
  description:
    'A clinical, data-driven 90-day fitness system for senior professionals who have restarted 3+ times. 550+ clients across 14 countries. Book a ₹97 refundable pre-strategy call.',
};

export default function Page() {
  return <LandingPage />;
}
