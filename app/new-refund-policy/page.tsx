import type { Metadata } from 'next';
import RefundPage from '@/components/policy/RefundPage';
import './refund.css';

export const metadata: Metadata = {
  title: 'Refund Policy · Science Driven Performance',
  description:
    'Full refund policy for the ₹97 pre-strategy fee and the SDP coaching programme.',
};

export default function Page() {
  return <RefundPage />;
}
