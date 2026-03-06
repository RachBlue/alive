import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, ScrollView, TextInput, Dimensions, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { usePosts, useMessages } from './usePosts';

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

const BG_COLORS = [
  ['#2a1810', '#5c3520', '#8b6040', '#b08060'],
  ['#0a1a2a', '#1a3a5a', '#2a6080', '#3a90b0'],
  ['#1a0a2a', '#3a1a5a', '#6a3a8a', '#9a60aa'],
  ['#1a1000', '#3a2800', '#6a4a10', '#9a7030'],
  ['#001a0a', '#003a1a', '#10602a', '#308a50'],
];

const EMOJIS = ['🏺', '🏃', '🎸', '🍜', '🌿', '✨'];

function ConversationDrawer({ post, timeOfDay, convoTranslate, onClose }) {
  const { messages, sendMessage } = useMessages(post.id);
  const [text, setText] = useState('');

  async function handleSend() {
  if (!text.trim()) return;
  await sendMessage(text);
  setText('');
}

  return (
    <Animated.View style={[styles.drawer, { transform: [{ translateY: convoTranslate }] }]}>
      <BlurView intensity={30} tint="dark" style={styles.drawerBlur}>
        <View style={styles.drawerHandle} />
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>the conversation</Text>
          <Text style={styles.drawerCount}>
            {messages.length > 0 ? `${messages.length} messages` : 'be the first to respond'}
          </Text>
        </View>
        <ScrollView style={styles.convoList} showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? (
            <Text style={styles.emptyConvo}>No one has responded yet. Start the conversation ✦</Text>
          ) : (
            messages.map((msg, i) => (
              <View key={i} style={styles.convoItem}>
                <View style={[styles.convoAvatar, { backgroundColor: '#c17f4a' }]}>
                  <Text style={styles.convoAvatarEmoji}>
                    {msg.username ? msg.username[0].toUpperCase() : '?'}
                  </Text>
                </View>
                <View style={styles.convoBody}>
                  <View style={styles.convoUserRow}>
                    <Text style={styles.convoUser}>{msg.username}</Text>
                  </View>
                  <Text style={styles.convoText}>{msg.text}</Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
        <View style={styles.convoInputRow}>
          <TextInput
            style={styles.convoInput}
            placeholder="join the conversation..."
            placeholderTextColor="rgba(245,240,232,0.25)"
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.convoSend, { backgroundColor: timeOfDay.accent }]}
            onPress={handleSend}
          >
            <Text style={styles.convoSendText}>↑</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </Animated.View>
  );
}

export default function FeedScreen({ navigation }) {
  const [currentPost, setCurrentPost] = useState(0);
  const [openConvo, setOpenConvo] = useState(null);
  const [firedReactions, setFiredReactions] = useState({});
  const timeOfDay = getTimeOfDay();
  const { posts, loading } = usePosts();

  const translateY = useRef(new Animated.Value(0)).current;
  const convoTranslate = useRef(new Animated.Value(300)).current;
  const navOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(navOpacity, { toValue: 1, duration: 800, useNativeDriver: true }).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => openConvo === null,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 10 && openConvo === null,
      onPanResponderRelease: (_, g) => {
        if (g.dy < -50 && currentPost < posts.length - 1) {
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

  useEffect(() => {
    const handleWheel = (e) => {
      if (e.deltaY > 50 && currentPost < posts.length - 1) {
        setCurrentPost(prev => prev + 1);
      } else if (e.deltaY < -50 && currentPost > 0) {
        setCurrentPost(prev => prev - 1);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'ArrowDown' && currentPost < posts.length - 1) {
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
  }, [currentPost, posts.length]);

  function toggleConvo(postId) {
    if (openConvo === postId) {
      Animated.timing(convoTranslate, { toValue: 300, duration: 350, useNativeDriver: true }).start(() => setOpenConvo(null));
    } else {
      setOpenConvo(postId);
      Animated.spring(convoTranslate, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
    }
  }

  function fireReaction(postId, emoji) {
    const key = `${postId}-${emoji}`;
    setFiredReactions(prev => ({ ...prev, [key]: !prev[key] }));
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f0a06', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'rgba(245,240,232,0.4)', fontFamily: 'serif', fontSize: 20, fontStyle: 'italic' }}>
          loading moments...
        </Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0f0a06', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
        <Text style={{ color: 'rgba(245,240,232,0.4)', fontFamily: 'serif', fontSize: 24, fontStyle: 'italic', textAlign: 'center', marginBottom: 16 }}>
          no moments yet
        </Text>
        <Text style={{ color: 'rgba(245,240,232,0.25)', fontSize: 13, fontWeight: '300', textAlign: 'center', marginBottom: 32 }}>
          be the first to share something alive
        </Text>
        <TouchableOpacity
          style={{ padding: 16, backgroundColor: '#f5f0e8', borderRadius: 14 }}
          onPress={() => navigation.navigate('Share')}
        >
          <Text style={{ color: '#1a1410', fontSize: 13, fontWeight: '500', letterSpacing: 2, textTransform: 'uppercase' }}>
            Share a moment ✦
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>

      <Animated.View style={[styles.postsContainer, { transform: [{ translateY }] }]}>
        {posts.map((post, index) => (
          <View key={post.id} style={styles.post}>
            <LinearGradient
              colors={BG_COLORS[index % BG_COLORS.length]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'transparent', 'rgba(0,0,0,0.85)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />

            <Text style={styles.postVisual}>
              {EMOJIS[index % EMOJIS.length]}
            </Text>

            <Animated.View style={[styles.postContent, openConvo === post.id && styles.postContentUp]}>
              <View style={styles.postMeta}>
                <View style={[styles.avatar, { backgroundColor: '#c17f4a' }]}>
                  <Text style={styles.avatarEmoji}>
                    {post.user_id ? post.user_id[0].toUpperCase() : '?'}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.username}>{post.user_id?.slice(0, 8) || 'anonymous'}</Text>
                  <Text style={styles.location}>📍 {post.location || 'somewhere in the city'}</Text>
                </View>
                <View style={[styles.tag, { borderColor: timeOfDay.accent }]}>
                  <Text style={[styles.tagText, { color: timeOfDay.accent }]}>{post.category}</Text>
                </View>
              </View>

              <Text style={styles.caption}>"{post.caption}"</Text>

              <View style={styles.reactionsBar}>
                {['🔥', '🙌', '💡'].map((emoji) => {
                  const key = `${post.id}-${emoji}`;
                  const fired = firedReactions[key];
                  return (
                    <TouchableOpacity
                      key={emoji}
                      style={[styles.reactionBtn, fired && styles.reactionFired]}
                      onPress={() => fireReaction(post.id, emoji)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.reactionEmoji}>{emoji}</Text>
                      <Text style={[styles.reactionCount, fired && { color: timeOfDay.accent }]}>
                        {fired ? 1 : 0}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={styles.convoTrigger} onPress={() => toggleConvo(post.id)} activeOpacity={0.8}>
                  <Text style={styles.convoTriggerText}>💬 conversation</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.swipeHint}>↑ swipe for next</Text>
            </Animated.View>

            {openConvo === post.id && (
              <ConversationDrawer
                post={post}
                timeOfDay={timeOfDay}
                convoTranslate={convoTranslate}
                onClose={() => toggleConvo(post.id)}
              />
            )}
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[styles.topNav, { opacity: navOpacity }]}>
        <BlurView intensity={20} tint="dark" style={styles.topNavBlur}>
          <Text style={styles.navLogo}>alive</Text>
          <Text style={[styles.navTime, { color: timeOfDay.accent }]}>{timeOfDay.label}</Text>
          <View style={[styles.navAvatar, { backgroundColor: timeOfDay.accent }]}>
            <Text style={styles.navAvatarText}>✦</Text>
          </View>
        </BlurView>
      </Animated.View>

      <View style={styles.indicators}>
        {posts.map((_, i) => (
          <View key={i} style={[styles.indicator, i === currentPost && { height: 20, backgroundColor: timeOfDay.accent }]} />
        ))}
      </View>

      <Animated.View style={[styles.bottomNav, { opacity: navOpacity }]}>
        <BlurView intensity={20} tint="dark" style={styles.bottomNavBlur}>
          {[['✦', 'Feed'], ['🗺️', 'Explore'], ['＋', 'Share'], ['🔔', 'Activity'], ['👤', 'Profile']].map(([icon, label], i) => (
            <TouchableOpacity
              key={label}
              style={[styles.navItem, i === 0 && styles.navItemActive]}
              activeOpacity={0.7}
              onPress={() => i === 2 && navigation.navigate('Share')}
            >
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
  avatarEmoji: { fontSize: 16, color: '#fff', fontWeight: '600' },
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
    bottom: 80,
    left: 0,
    right: 0,
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
  convoAvatarEmoji: { fontSize: 14, color: '#fff', fontWeight: '600' },
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
  emptyConvo: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(245,240,232,0.3)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 24,
    lineHeight: 20,
  },
});