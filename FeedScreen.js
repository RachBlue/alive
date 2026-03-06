import { StyleSheet, Text, View, TouchableOpacity, Animated, ScrollView, TextInput, Dimensions, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useEffect, useRef, useState } from 'react';
import { usePosts } from './usePosts';

const { width, height } = Dimensions.get('window');

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 8)   return { label: 'dawn',         colors: ['#1a0f1e', '#2d1a3a', '#ff6b9d', '#c44dff'], accent: '#ff6b9d' };
  if (h >= 8 && h < 12)  return { label: 'morning',      colors: ['#0d1a2e', '#1a3a5c', '#00d4ff', '#7b2fff'], accent: '#00d4ff' };
  if (h >= 12 && h < 17) return { label: 'afternoon',    colors: ['#0a1f0a', '#1a4020', '#39ff14', '#ffdd00'], accent: '#39ff14' };
  if (h >= 17 && h < 20) return { label: 'golden hour',  colors: ['#1a0a00', '#3d1800', '#ff8c00', '#ffd700'], accent: '#ff8c00' };
  if (h >= 20 && h < 23) return { label: 'evening',      colors: ['#0f0a06', '#1e1208', '#c17f4a', '#e8a060'], accent: '#c17f4a' };
  return                         { label: 'late night',   colors: ['#080608', '#120e14', '#6a4aaa', '#9a7acc'], accent: '#9a7acc' };
};

const POSTS = [
  {
    id: 0,
    user: 'maya_creates',
    avatar: '🌸',
    avatarColors: ['#c17f4a', '#8b4a20'],
    location: 'Greenwich Village',
    tag: 'Make things',
    caption: '"First time throwing on a wheel. My hands have never felt so alive."',
    bgColors: ['#2a1810', '#5c3520', '#8b6040', '#b08060'],
    reactions: { '🔥': 24, '🙌': 11, '💡': 8 },
    convoCount: 14,
    conversation: [
      { user: 'jordan_nyc', avatar: '🎵', avatarColors: ['#4a8aff', '#2a4aaa'], badge: 'Make things', text: 'I took a class at Mudspot last month — completely changed how I spend Sundays.' },
      { user: 'reese.makes', avatar: '🌿', avatarColors: ['#ff6b9d', '#aa2a5a'], badge: null, text: 'That first pull on the clay — nothing compares. Where in the village?' },
      { user: 'maya_creates', avatar: '🌸', avatarColors: ['#c17f4a', '#8b4a20'], badge: 'Make things', text: '@reese.makes — Choplet Studio on Perry St! Drop-in sessions Sat mornings ✨' },
    ],
  },
  {
    id: 1,
    user: 'run.with.sam',
    avatar: '🏃',
    avatarColors: ['#00d4ff', '#0060aa'],
    location: 'Central Park',
    tag: 'Get outside',
    caption: '"6am run club. 12 strangers. Zero phones. Just breath and the park waking up."',
    bgColors: ['#0a1a2a', '#1a3a5a', '#2a6080', '#3a90b0'],
    reactions: { '🔥': 41, '🙌': 29, '👀': 17 },
    convoCount: 31,
    conversation: [
      { user: 'alex.eats', avatar: '🍜', avatarColors: ['#ff8c00', '#aa4400'], badge: 'Get outside', text: 'Zero phones is the rule that changes everything. 🎯' },
      { user: 'tomas.writes', avatar: '✍️', avatarColors: ['#c17f4a', '#6a3a10'], badge: null, text: 'How do I find the next one? I need this in my life like yesterday.' },
      { user: 'run.with.sam', avatar: '🏃', avatarColors: ['#00d4ff', '#0060aa'], badge: 'Get outside', text: '@tomas.writes — every Saturday 6am, Bethesda Fountain. Just show up 🌅' },
    ],
  },
  {
    id: 2,
    user: 'leo.jams',
    avatar: '🎸',
    avatarColors: ['#9a7acc', '#4a2a8a'],
    location: 'Bushwick',
    tag: 'Make music',
    caption: '"Spontaneous session in a warehouse. Never met these people before. Left with 3 new friends and a song."',
    bgColors: ['#1a0a2a', '#3a1a5a', '#6a3a8a', '#9a60aa'],
    reactions: { '🔥': 67, '🫲': 44, '💡': 22 },
    convoCount: 58,
    conversation: [
      { user: 'maya_creates', avatar: '🌸', avatarColors: ['#ff6b9d', '#aa2a5a'], badge: 'Make things', text: 'This is exactly what Alive is for. 🫲' },
      { user: 'nadia.keys', avatar: '🎹', avatarColors: ['#39ff14', '#0a6a00'], badge: null, text: 'Is this recurring? I play keys and I need exactly this in my life.' },
      { user: 'leo.jams', avatar: '🎸', avatarColors: ['#9a7acc', '#4a2a8a'], badge: 'Make music', text: "@nadia.keys — we're making it recurring. Keys is exactly what we need. DM me 🎹" },
    ],
  },
];

const REACTIONS = [
  { emoji: '🔥', label: 'fire' },
  { emoji: '🙌', label: 'want in' },
  { emoji: '💡', label: 'sparked' },
  { emoji: '🎯', label: 'nailed it' },
  { emoji: '👀', label: 'tell more' },
  { emoji: '🫲', label: 'feel this' },
];

export default function FeedScreen({ navigation }) {
  const [currentPost, setCurrentPost] = useState(0);
  const [openConvo, setOpenConvo] = useState(null);
  const [reactions, setReactions] = useState(POSTS.map(p => ({ ...p.reactions })));
  const [firedReactions, setFiredReactions] = useState({});
  const timeOfDay = getTimeOfDay();
  const { posts, loading } = usePosts();

  const translateY = useRef(new Animated.Value(0)).current;
  const convoTranslate = useRef(new Animated.Value(300)).current;
  const navOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(navOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  // Swipe handler
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => openConvo === null,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10 && openConvo === null,
      onPanResponderRelease: (_, g) => {
        if (g.dy < -50 && currentPost < POSTS.length - 1) {
          setCurrentPost(prev => prev + 1);
        } else if (g.dy > 50 && currentPost > 0) {
          setCurrentPost(prev => prev - 1);
        }
      },
    })
  ).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: -currentPost * height,
      useNativeDriver: true,
      tension: 60,
      friction: 12,
    }).start();
  }, [currentPost]);

  // ← NEW: mouse wheel support for web
  useEffect(() => {
  const handleWheel = (e) => {
    if (e.deltaY > 50 && currentPost < POSTS.length - 1) {
      setCurrentPost(prev => prev + 1);
    } else if (e.deltaY < -50 && currentPost > 0) {
      setCurrentPost(prev => prev - 1);
    }
  };
  const handleKey = (e) => {
    if (e.key === 'ArrowDown' && currentPost < POSTS.length - 1) {
      setCurrentPost(prev => prev + 1);
    } else if (e.key === 'ArrowUp' && currentPost > 0) {
      setCurrentPost(prev => prev - 1);
    }
  };
  window.addEventListener('wheel', handleWheel);
  window.addEventListener('keydown', handleKey);
  return () => {
    window.removeEventListener('wheel', handleWheel);
    window.removeEventListener('keydown', handleKey);
  };
}, [currentPost]);

  function toggleConvo(postId) {
    if (openConvo === postId) {
      Animated.timing(convoTranslate, { toValue: 300, duration: 350, useNativeDriver: true }).start(() => setOpenConvo(null));
    } else {
      setOpenConvo(postId);
      Animated.spring(convoTranslate, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
    }
  }

  function fireReaction(postIndex, emoji) {
    const key = `${postIndex}-${emoji}`;
    const fired = firedReactions[key];
    setFiredReactions(prev => ({ ...prev, [key]: !fired }));
    setReactions(prev => {
      const next = [...prev];
      next[postIndex] = { ...next[postIndex], [emoji]: (next[postIndex][emoji] || 0) + (fired ? -1 : 1) };
      return next;
    });
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>

      {/* Posts */}
      <Animated.View style={[styles.postsContainer, { transform: [{ translateY }] }]}>
  {(posts.length > 0 ? posts.map((post, index) => ({
    ...post,
    avatar: '🌸',
    avatarColors: ['#c17f4a', '#8b4a20'],
    bgColors: ['#2a1810', '#5c3520', '#8b6040', '#b08060'],
    reactions: { '🔥': 0, '🙌': 0, '💡': 0 },
    convoCount: 0,
    conversation: [],
    tag: post.category,
  })) : POSTS).map((post, index) => (
          <View key={post.id} style={styles.post}>
            <LinearGradient colors={post.bgColors} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'transparent', 'rgba(0,0,0,0.85)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />

            {/* Post emoji visual */}
            <Text style={styles.postVisual}>
              {['🏺', '🏃', '🎸'][index]}
            </Text>

            {/* Post content */}
            <Animated.View style={[styles.postContent, openConvo === post.id && styles.postContentUp]}>
              <View style={styles.postMeta}>
                <LinearGradient colors={post.avatarColors} style={styles.avatar}>
                  <Text style={styles.avatarEmoji}>{post.avatar}</Text>
                </LinearGradient>
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{post.user}</Text>
                  <Text style={styles.location}>📍 {post.location}</Text>
                </View>
                <View style={[styles.tag, { borderColor: timeOfDay.accent }]}>
                  <Text style={[styles.tagText, { color: timeOfDay.accent }]}>{post.tag}</Text>
                </View>
              </View>

              <Text style={styles.caption}>{post.caption}</Text>

              <View style={styles.reactionsBar}>
                {Object.entries(reactions[index]).map(([emoji, count]) => {
                  const key = `${index}-${emoji}`;
                  const fired = firedReactions[key];
                  return (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.reactionBtn, fired && styles.reactionFired]}
                      onPress={() => fireReaction(index, emoji)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.reactionEmoji}>{emoji}</Text>
                      <Text style={[styles.reactionCount, fired && { color: timeOfDay.accent }]}>{count}</Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={styles.convoTrigger} onPress={() => toggleConvo(post.id)} activeOpacity={0.8}>
                  <Text style={styles.convoTriggerText}>💬 {post.convoCount} in conversation</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.swipeHint}>↑ swipe for next</Text>
            </Animated.View>

            {/* Conversation drawer */}
            {openConvo === post.id && (
              <Animated.View style={[styles.drawer, { transform: [{ translateY: convoTranslate }] }]}>
                <BlurView intensity={30} tint="dark" style={styles.drawerBlur}>
                  <View style={styles.drawerHandle} />
                  <View style={styles.drawerHeader}>
                    <Text style={styles.drawerTitle}>the conversation</Text>
                    <Text style={styles.drawerCount}>{post.convoCount} people</Text>
                  </View>
                  <ScrollView style={styles.convoList} showsVerticalScrollIndicator={false}>
                    {post.conversation.map((msg, i) => (
                      <View key={i} style={styles.convoItem}>
                        <LinearGradient colors={msg.avatarColors} style={styles.convoAvatar}>
                          <Text style={styles.convoAvatarEmoji}>{msg.avatar}</Text>
                        </LinearGradient>
                        <View style={styles.convoBody}>
                          <View style={styles.convoUserRow}>
                            <Text style={styles.convoUser}>{msg.user}</Text>
                            {msg.badge && (
                              <View style={[styles.convoBadge, { borderColor: timeOfDay.accent }]}>
                                <Text style={[styles.convoBadgeText, { color: timeOfDay.accent }]}>{msg.badge}</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.convoText}>{msg.text}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                  <View style={styles.convoInputRow}>
                    <TextInput
                      style={styles.convoInput}
                      placeholder="join the conversation..."
                      placeholderTextColor="rgba(245,240,232,0.25)"
                    />
                    <TouchableOpacity style={[styles.convoSend, { backgroundColor: timeOfDay.accent }]}>
                      <Text style={styles.convoSendText}>↑</Text>
                    </TouchableOpacity>
                  </View>
                </BlurView>
              </Animated.View>
            )}
          </View>
        ))}
      </Animated.View>

      {/* Top nav */}
      <Animated.View style={[styles.topNav, { opacity: navOpacity }]}>
        <BlurView intensity={20} tint="dark" style={styles.topNavBlur}>
          <Text style={styles.navLogo}>alive</Text>
          <Text style={[styles.navTime, { color: timeOfDay.accent }]}>{timeOfDay.label}</Text>
          <View style={[styles.navAvatar, { backgroundColor: timeOfDay.accent }]}>
            <Text style={styles.navAvatarText}>✦</Text>
          </View>
        </BlurView>
      </Animated.View>

      {/* Post indicators */}
      <View style={styles.indicators}>
        {POSTS.map((_, i) => (
          <View key={i} style={[styles.indicator, i === currentPost && { height: 20, backgroundColor: timeOfDay.accent }]} />
        ))}
      </View>

      {/* Bottom nav */}
      <Animated.View style={[styles.bottomNav, { opacity: navOpacity }]}>
        <BlurView intensity={20} tint="dark" style={styles.bottomNavBlur}>
          {[['✦', 'Feed'], ['🗺️', 'Explore'], ['＋', 'Share'], ['🔔', 'Activity'], ['👤', 'Profile']].map(([icon, label], i) => (
            <TouchableOpacity key={label} style={[styles.navItem, i === 0 && styles.navItemActive]} activeOpacity={0.7}onPress={() => i === 2 && navigation.navigate('Share')}>
              <Text style={styles.navIcon}>{icon}</Text>
              <Text style={[styles.navLabel, i === 0 && { color: timeOfDay.accent }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </BlurView>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0a06',
    overflow: 'hidden',
  },
  postsContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
  },
  post: {
    width,
    height,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  postVisual: {
    position: 'absolute',
    fontSize: 160,
    opacity: 0.08,
    alignSelf: 'center',
    top: height * 0.2,
  },
  postContent: {
    paddingHorizontal: 18,
    paddingBottom: 100,
    transition: 'transform 0.4s',
  },
  postContentUp: {
    transform: [{ translateY: -320 }],
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,248,238,0.3)',
  },
  avatarEmoji: { fontSize: 18 },
  userInfo: { flex: 1 },
  username: {
    fontSize: 13,
    fontWeight: '500',
    color: '#f5f0e8',
  },
  location: {
    fontSize: 11,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.5)',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: 'serif',
    fontSize: 19,
    fontWeight: '300',
    fontStyle: 'italic',
    color: '#f5f0e8',
    lineHeight: 26,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  reactionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,248,238,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,248,238,0.12)',
  },
  reactionFired: {
    borderColor: 'rgba(193,127,74,0.5)',
    backgroundColor: 'rgba(193,127,74,0.12)',
  },
  reactionEmoji: { fontSize: 14 },
  reactionCount: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.5)',
  },
  convoTrigger: {
    marginLeft: 'auto',
    paddingVertical: 6,
  },
  convoTriggerText: {
    fontSize: 12,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.5)',
  },
  swipeHint: {
    fontSize: 11,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.2)',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  drawer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 380,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  drawerBlur: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(255,248,238,0.1)',
  },
  drawerHandle: {
    width: 36, height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,248,238,0.2)',
    alignSelf: 'center',
    marginTop: 12,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,248,238,0.06)',
  },
  drawerTitle: {
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: '300',
    fontStyle: 'italic',
    color: '#f5f0e8',
  },
  drawerCount: {
    fontSize: 11,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.35)',
    letterSpacing: 1,
  },
  convoList: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  convoItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  convoAvatar: {
    width: 30, height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convoAvatarEmoji: { fontSize: 14 },
  convoBody: { flex: 1 },
  convoUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 3,
  },
  convoUser: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(245,240,232,0.7)',
  },
  convoBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  convoBadgeText: {
    fontSize: 9,
    fontWeight: '300',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  convoText: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.75)',
    lineHeight: 19,
  },
  convoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: 'rgba(255,248,238,0.06)',
  },
  convoInput: {
    flex: 1,
    padding: 10,
    backgroundColor: 'rgba(255,248,238,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,248,238,0.1)',
    color: '#f5f0e8',
    fontSize: 13,
    fontWeight: '300',
  },
  convoSend: {
    width: 36, height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convoSendText: {
    fontSize: 16,
    color: '#1a1410',
    fontWeight: '600',
  },
  topNav: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100,
  },
  topNavBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,248,238,0.06)',
  },
  navLogo: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '300',
    letterSpacing: 6,
    color: '#f5f0e8',
  },
  navTime: {
    fontSize: 11,
    fontWeight: '300',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  navAvatar: {
    width: 32, height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navAvatarText: {
    fontSize: 14,
    color: '#1a1410',
  },
  indicators: {
    position: 'absolute',
    top: 110,
    right: 16,
    gap: 5,
    zIndex: 50,
  },
  indicator: {
    width: 3,
    height: 8,
    borderRadius: 2,
    backgroundColor: 'rgba(255,248,238,0.2)',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    zIndex: 100,
  },
  bottomNavBlur: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(255,248,238,0.06)',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
    opacity: 0.4,
    paddingHorizontal: 8,
  },
  navItemActive: { opacity: 1 },
  navIcon: { fontSize: 22 },
  navLabel: {
    fontSize: 9,
    fontWeight: '300',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#f5f0e8',
  },
});