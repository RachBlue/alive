import { useState } from 'react';
import LoginScreen from './LoginScreen';
import OnboardingScreen from './OnboardingScreen';

export default function App() {
  const [screen, setScreen] = useState('login');

  if (screen === 'login') {
    return <LoginScreen onComplete={() => setScreen('onboarding')} />;
  }

  if (screen === 'onboarding') {
    return <OnboardingScreen onComplete={() => setScreen('feed')} />;
  }
}