import { supabase } from './supabase';
import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const SCENES = [
  { colors: ['#2c1810', '#5c3520', '#8b5a3a', '#c4854a'], caption: 'pottery classes on a Sunday morning' },
  { colors: ['#0d1b2a', '#1a3a4a', '#2d6a7a', '#4a9aaa'], caption: 'run club in Central Park at dawn' },
  { colors: ['#1a2410', '#2d4420', '#4a7040', '#7aaa60'], caption: 'late night dinners that go until 2am' },
  { colors: ['#1a1020', '#3a2040', '#6a4070', '#9a70aa'], caption: 'making music with strangers who become friends' },
];

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sceneIndex, setSceneIndex] = useState(0);
  const [caption, setCaption] = useState(SCENES[0].caption);

  const captionOpacity = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslate = useRef(new Animated.Value(40)).current;
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkTranslate = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(wordmarkOpacity, { toValue: 1, duration: 1200, delay: 400, useNativeDriver: true }),
      Animated.timing(wordmarkTranslate, { toValue: 0, duration: 1200, delay: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 1200, delay: 800, useNativeDriver: true }),
      Animated.timing(cardTranslate, { toValue: 0, duration: 1200, delay: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(captionOpacity, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => {
        setSceneIndex(prev => {
          const next = (prev + 1) % SCENES.length;
          setCaption(SCENES[next].caption);
          return next;
        });
        Animated.timing(captionOpacity, { toValue: 1, duration: 600, useNativeDriver: true }).start();
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogin() {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigation.navigate('Onboarding');
    }
    setLoading(false);
  }

  async function handleSignUp() {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      navigation.navigate('Onboarding');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <LinearGradient
        colors={SCENES[sceneIndex].colors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.7)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Animated.View style={[styles.wordmarkWrap, { opacity: wordmarkOpacity, transform: [{ translateY: wordmarkTranslate }] }]}>
        <Text style={styles.wordmark}>alive</Text>
        <Text style={styles.tagline}>be here. for real.</Text>
      </Animated.View>

      <Animated.View style={[styles.captionWrap, { opacity: captionOpacity }]}>
        <Text style={styles.caption}>{caption}</Text>
        <View style={styles.dots}>
          {SCENES.map((_, i) => (
            <View key={i} style={[styles.dot, i === sceneIndex && styles.dotActive]} />
          ))}
        </View>
      </Animated.View>

      <Animated.View style={[styles.card, { opacity: cardOpacity, transform: [{ translateY: cardTranslate }] }]}>
        <BlurView intensity={20} tint="dark" style={styles.blurCard}>
          <TextInput
            style={styles.input}
            placeholder="your email"
            placeholderTextColor="rgba(245,240,232,0.4)"
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
            value={email}
          />
          <TextInput
            style={styles.input}
            placeholder="password"
            placeholderTextColor="rgba(245,240,232,0.4)"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
          />
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={styles.btnPrimary}
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.btnPrimaryText}>
              {loading ? 'Coming Alive...' : 'Come Alive'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.btnSecondary} activeOpacity={0.85}>
            <Text style={styles.btnSecondaryText}>Continue with Apple</Text>
          </TouchableOpacity>

          <Text style={styles.signupText}>
            New here?{' '}
            <Text style={styles.signupLink} onPress={handleSignUp}>
              Join the community →
            </Text>
          </Text>
        </BlurView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  wordmarkWrap: {
    alignItems: 'center',
    gap: 6,
  },
  wordmark: {
    fontFamily: 'serif',
    fontSize: 72,
    fontWeight: '300',
    letterSpacing: 12,
    color: '#f5f0e8',
    textShadowColor: 'rgba(193,127,74,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 20,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 5,
    color: 'rgba(245,240,232,0.5)',
    textTransform: 'uppercase',
  },
  captionWrap: {
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  caption: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '300',
    fontStyle: 'italic',
    color: 'rgba(245,240,232,0.75)',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(245,240,232,0.3)',
  },
  dotActive: {
    backgroundColor: '#c17f4a',
    transform: [{ scale: 1.4 }],
  },
  card: {
    width: '100%',
  },
  blurCard: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,240,232,0.15)',
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(255,248,238,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,240,232,0.15)',
    color: '#f5f0e8',
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  btnPrimary: {
    width: '100%',
    padding: 17,
    backgroundColor: '#f5f0e8',
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  btnPrimaryText: {
    color: '#1a1410',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(245,240,232,0.15)',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.35)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  btnSecondary: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(255,248,238,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(245,240,232,0.15)',
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: 'rgba(245,240,232,0.8)',
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  signupText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.4)',
    letterSpacing: 0.5,
  },
  signupLink: {
    color: 'rgba(193,127,74,0.85)',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});