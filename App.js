import { useState } from 'react';
import LoginScreen from './LoginScreen';
import OnboardingScreen from './OnboardingScreen';
import FeedScreen from './FeedScreen';

export default function App() {
  const [screen, setScreen] = useState('login');

  if (screen === 'login') {
    return <LoginScreen onComplete={() => setScreen('onboarding')} />;
  }
  if (screen === 'onboarding') {
    return <OnboardingScreen onComplete={() => setScreen('feed')} />;
  }
  if (screen === 'feed') {
    return <FeedScreen />;
  }
}