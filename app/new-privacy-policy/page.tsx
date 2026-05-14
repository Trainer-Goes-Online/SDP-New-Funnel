import type { Metadata } from 'next';
import PrivacyPage from '@/components/policy/PrivacyPage';
import './privacy.css';

export const metadata: Metadata = {
  title: 'Privacy Policy · Science Driven Performance',
  description:
    'Plain-English privacy policy. What we collect, why, how long we keep it, and your rights.',
};

export default function Page() {
  return <PrivacyPage />;
}
