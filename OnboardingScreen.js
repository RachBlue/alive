import { StyleSheet, Text, View, TouchableOpacity, Animated, Easing, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';

const CATEGORIES = [
  { id: 'music',   emoji: '🎵', title: 'Make music',      desc: 'Jam sessions, open mics, songwriting circles' },
  { id: 'outside', emoji: '🌿', title: 'Get outside',     desc: 'Run clubs, hikes, pick-up sports, park hangs' },
  { id: 'food',    emoji: '🍜', title: 'Cook & eat',      desc: 'Dinner parties, cooking together, trying new spots' },
  { id: 'create',  emoji: '🎨', title: 'Make things',     desc: 'Pottery, writing, painting, building with your hands' },
  { id: 'explore', emoji: '🗺️', title: 'Explore the city', desc: 'Hidden spots, neighborhood walks, strangers welcome' },
  { id: 'learn',   emoji: '✨', title: 'Learn something', desc: 'From locals — skills, stories, trades, crafts' },
];

const MESSAGES = {
  0: 'choose what calls to you',
  1: "that's a start — keep going",
  2: 'your people are out there',
  3: "now we're getting somewhere",
  4: "you're going to love this city",
  5: 'a full life is waiting',
  6: "you're exactly who Alive is for",
};

export default function OnboardingScreen({ onComplete }) {
  const [selected, setSelected] = useState(new Set());
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const headerTranslate = useRef(new Animated.Value(24)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const cardsTranslate = useRef(new Animated.Value(24)).current;
  const btnScale = useRef(new Animated.Value(0.95)).current;
  const cardScales = useRef(CATEGORIES.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(headerOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(headerTranslate, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardsOpacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(cardsTranslate, { toValue: 0, duration: 800, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.spring(btnScale, {
      toValue: selected.size > 0 ? 1 : 0.95,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [selected.size]);

  function toggleCard(id, index) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);

    // Bounce animation
    Animated.sequence([
      Animated.timing(cardScales[index], { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(cardScales[index], { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }),
    ]).start();
  }

  const count = selected.size;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0a06', '#1e1208', '#0f0a06']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Ambient orb */}
      <View style={styles.orb} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top */}
        <View style={styles.topBar}>
          <Text style={styles.logo}>alive</Text>
          <View style={styles.progress}>
            <View style={[styles.progDot, styles.progDone]} />
            <View style={[styles.progDot, styles.progActive]} />
            <View style={styles.progDot} />
            <View style={styles.progDot} />
          </View>
        </View>

        {/* Header */}
        <Animated.View style={[styles.header, { opacity: headerOpacity, transform: [{ translateY: headerTranslate }] }]}>
          <Text style={styles.greeting}>Hey, welcome 👋</Text>
          <Text style={styles.question}>What moves you{'\n'}<Text style={styles.questionItalic}>to show up?</Text></Text>
          <Text style={styles.subtext}>Pick everything that feels like you. We'll find your people.</Text>
        </Animated.View>

        {/* Cards */}
        <Animated.View style={[styles.grid, { opacity: cardsOpacity, transform: [{ translateY: cardsTranslate }] }]}>
          {CATEGORIES.map((cat, i) => {
            const isSelected = selected.has(cat.id);
            return (
              <Animated.View key={cat.id} style={[styles.cardWrap, { transform: [{ scale: cardScales[i] }] }]}>
                <TouchableOpacity
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => toggleCard(cat.id, i)}
                  activeOpacity={0.9}
                >
                  {isSelected && (
                    <LinearGradient
                      colors={['rgba(193,127,74,0.15)', 'rgba(193,127,74,0.05)']}
                      style={StyleSheet.absoluteFill}
                      borderRadius={20}
                    />
                  )}
                  <View style={[styles.check, isSelected && styles.checkSelected]}>
                    {isSelected && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.cardEmoji, isSelected && styles.cardEmojiSelected]}>{cat.emoji}</Text>
                  <Text style={styles.cardTitle}>{cat.title}</Text>
                  <Text style={styles.cardDesc}>{cat.desc}</Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Counter */}
        <Text style={[styles.counter, count > 0 && styles.counterActive]}>
          {MESSAGES[count]}
        </Text>

        {/* CTA */}
        <Animated.View style={{ transform: [{ scale: btnScale }], width: '100%' }}>
          <TouchableOpacity
            style={[styles.btnCta, count > 0 && styles.btnCtaReady]}
            onPress={() => count > 0 && onComplete && onComplete(Array.from(selected))}
            activeOpacity={0.85}
          >
            <Text style={[styles.btnCtaText, count > 0 && styles.btnCtaTextReady]}>
              Find My People
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.skip}>skip for now</Text>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0a06',
  },
  orb: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(193,127,74,0.08)',
    top: -100,
    left: -100,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 48,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  logo: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 8,
    color: 'rgba(245,240,232,0.5)',
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
  },
  progDot: {
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,248,238,0.15)',
  },
  progDone: {
    backgroundColor: '#c17f4a',
  },
  progActive: {
    backgroundColor: 'rgba(245,240,232,0.5)',
  },
  header: {
    width: '100%',
    marginBottom: 28,
    gap: 8,
  },
  greeting: {
    fontSize: 11,
    fontWeight: '400',
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: '#c17f4a',
    marginBottom: 4,
  },
  question: {
    fontFamily: 'serif',
    fontSize: 38,
    fontWeight: '300',
    color: '#f5f0e8',
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  questionItalic: {
    fontStyle: 'italic',
    color: 'rgba(245,240,232,0.65)',
  },
  subtext: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.4)',
    lineHeight: 20,
    marginTop: 4,
  },
  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  cardWrap: {
    width: '47.5%',
  },
  card: {
    padding: 18,
    backgroundColor: 'rgba(255,248,238,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,248,238,0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  cardSelected: {
    borderColor: 'rgba(193,127,74,0.55)',
  },
  check: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(245,240,232,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: {
    backgroundColor: '#c17f4a',
    borderColor: '#c17f4a',
  },
  checkMark: {
    fontSize: 11,
    color: '#0f0a06',
    fontWeight: '600',
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 10,
  },
  cardEmojiSelected: {
    transform: [{ scale: 1.2 }, { rotate: '-5deg' }],
  },
  cardTitle: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '400',
    color: '#f5f0e8',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 11,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.38)',
    lineHeight: 16,
  },
  counter: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.25)',
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  counterActive: {
    color: 'rgba(193,127,74,0.7)',
  },
  btnCta: {
    width: '100%',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,248,238,0.08)',
    backgroundColor: 'rgba(255,248,238,0.06)',
    alignItems: 'center',
  },
  btnCtaReady: {
    backgroundColor: '#f5f0e8',
    borderColor: 'transparent',
  },
  btnCtaText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'rgba(245,240,232,0.25)',
  },
  btnCtaTextReady: {
    color: '#1a1410',
  },
  skip: {
    marginTop: 18,
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.25)',
    letterSpacing: 2,
  },
});