import HomePage from './_components/HomePage';

export const metadata = {
  title: 'PosturePal — AI Posture Coaching, On-Device & Private',
  description:
    'A private posture coach that lives on your laptop and nudges you upright — before the ache sets in. On-device AI for teams and individuals. No cloud, no wearables, no footage ever leaves your machine.',
  openGraph: {
    title: 'PosturePal — AI Posture Coaching, On-Device & Private',
    description:
      'On-device AI that watches your posture — never your privacy. For teams and individuals.',
    images: ['/logo.png'],
  },
};

export default function Page() {
  return <HomePage />;
}
