import type { Metadata } from 'next';
import TermsPage from '@/components/policy/TermsPage';
import './terms.css';

export const metadata: Metadata = {
  title: 'Terms & Conditions · Science Driven Performance',
  description:
    'The terms of use covering this site, the pre-strategy call, and SDP coaching services.',
};

export default function Page() {
  return <TermsPage />;
}
