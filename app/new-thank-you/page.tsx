import type { Metadata } from 'next';
import ThankYouPage from '@/components/thank-you/ThankYouPage';
import './thank-you.css';
import '../landing.css';

export const metadata: Metadata = {
  title: 'You’re In · SDP Pre-Strategy Call Booked',
  description:
    'Your SDP pre-strategy call is booked. Here’s what happens next and how to prep.',
};

export default function Page() {
  return <ThankYouPage />;
}
