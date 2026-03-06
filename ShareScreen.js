import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from './supabase';

const CATEGORIES = [
  { id: 'music',   emoji: '🎵', title: 'Make music' },
  { id: 'outside', emoji: '🌿', title: 'Get outside' },
  { id: 'food',    emoji: '🍜', title: 'Cook & eat' },
  { id: 'create',  emoji: '🎨', title: 'Make things' },
  { id: 'explore', emoji: '🗺️', title: 'Explore' },
  { id: 'learn',   emoji: '✨', title: 'Learn something' },
];

export default function ShareScreen({ navigation }) {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handlePost() {
    if (!caption || !category) {
      setError('Add a caption and pick a category first.');
      return;
    }
    setLoading(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('posts')
      .insert({ caption, location, category, user_id: user.id });
    if (error) {
      setError(error.message);
    } else {
      navigation.navigate('Feed');
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0a06', '#1e1208', '#0f0a06']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>share a moment</Text>
          <Text style={styles.subtitle}>What are you doing that feels alive?</Text>
        </View>

        {/* Caption */}
        <View style={styles.section}>
          <Text style={styles.label}>what's happening</Text>
          <TextInput
            style={styles.textArea}
            placeholder="describe the moment..."
            placeholderTextColor="rgba(245,240,232,0.25)"
            multiline
            numberOfLines={4}
            onChangeText={setCaption}
            value={caption}
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>where</Text>
          <TextInput
            style={styles.input}
            placeholder="neighborhood or spot..."
            placeholderTextColor="rgba(245,240,232,0.25)"
            onChangeText={setLocation}
            value={location}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>what kind of moment</Text>
          <View style={styles.categories}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catBtn, category === cat.id && styles.catBtnSelected]}
                onPress={() => setCategory(cat.id)}
                activeOpacity={0.8}
              >
                {category === cat.id && (
                  <LinearGradient
                    colors={['rgba(193,127,74,0.2)', 'rgba(193,127,74,0.05)']}
                    style={StyleSheet.absoluteFill}
                    borderRadius={14}
                  />
                )}
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={[styles.catTitle, category === cat.id && styles.catTitleSelected]}>
                  {cat.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Error */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Post button */}
        <TouchableOpacity
          style={[styles.postBtn, (!caption || !category) && styles.postBtnDisabled]}
          onPress={handlePost}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={styles.postBtnText}>
            {loading ? 'sharing...' : 'Share this moment ✦'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0a06',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 36,
  },
  backBtn: {
    marginBottom: 20,
  },
  backText: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.4)',
    letterSpacing: 1,
  },
  title: {
    fontFamily: 'serif',
    fontSize: 36,
    fontWeight: '300',
    color: '#f5f0e8',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.4)',
    lineHeight: 20,
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: '#c17f4a',
    marginBottom: 12,
  },
  textArea: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(255,248,238,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,248,238,0.1)',
    color: '#f5f0e8',
    fontSize: 15,
    fontWeight: '300',
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: 'rgba(255,248,238,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,248,238,0.1)',
    color: '#f5f0e8',
    fontSize: 14,
    fontWeight: '300',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  catBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,248,238,0.1)',
    backgroundColor: 'rgba(255,248,238,0.04)',
    overflow: 'hidden',
  },
  catBtnSelected: {
    borderColor: 'rgba(193,127,74,0.55)',
  },
  catEmoji: { fontSize: 16 },
  catTitle: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.6)',
  },
  catTitleSelected: {
    color: '#f5f0e8',
  },
  error: {
    color: '#ff6b6b',
    fontSize: 12,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  postBtn: {
    width: '100%',
    padding: 18,
    backgroundColor: '#f5f0e8',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  postBtnDisabled: {
    backgroundColor: 'rgba(255,248,238,0.1)',
  },
  postBtnText: {
    color: '#1a1410',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});