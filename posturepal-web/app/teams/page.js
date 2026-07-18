import TeamsPage from '../_components/TeamsPage';

export const metadata = {
  title: 'PosturePal for Teams — On-Device Posture AI for Desk-Based Workforces',
  description:
    'Reduce ergonomic complaints and protect deep-work focus with a privacy-first posture coach on every employee laptop. On-device AI — no hardware, no wearables, no footage ever leaves the machine.',
  openGraph: {
    title: 'PosturePal for Teams',
    description:
      'A private, on-device posture coach on every employee laptop. Real-time nudges, no hardware, no footage leaving the machine.',
    images: ['/logo.png'],
  },
};

export default function Page() {
  return <TeamsPage />;
}
