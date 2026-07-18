import IndividualsPage from '../_components/IndividualsPage';

export const metadata = {
  title: 'PosturePal — Fix Your Posture with AI',
  description:
    'Turn your webcam into a private posture coach. Real-time slouch alerts, 100% offline, on-device AI. Free 21-day trial, then one payment of Rs. 299 for lifetime access.',
  openGraph: {
    title: 'PosturePal — Fix Your Posture with AI',
    description:
      'Real-time slouch alerts from your webcam. 100% offline, no subscription — one payment, lifetime access.',
    images: ['/logo.png'],
  },
};

export default function Page() {
  return <IndividualsPage />;
}
