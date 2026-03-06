import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
    const subscription = supabase
      .channel('posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
        setPosts(prev => [payload.new, ...prev]);
      })
      .subscribe();
    return () => supabase.removeChannel(subscription);
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  }

  async function createPost({ caption, location, category }) {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('posts')
      .insert({ caption, location, category, user_id: user.id });
    if (error) console.error(error);
  }

  return { posts, loading, createPost };
}

export function useMessages(postId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId || typeof postId !== 'string' || postId.length < 10) return;
    fetchMessages();

    const subscription = supabase
      .channel(`messages:${postId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `post_id=eq.${postId}`
      }, payload => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [postId]);

  async function fetchMessages() {
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) console.error('messages error:', error);
    if (data) setMessages(data);
    setLoading(false);
  }

async function sendMessage(text, username) {
    if (!postId || typeof postId !== 'string' || postId.length < 10) {
      console.error('invalid postId:', postId);
      return;
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('user error:', userError);
      return;
    }
    const { data, error } = await supabase
      .from('messages')
      .insert({
        post_id: postId,
        user_id: user.id,
        username: username || user.email.split('@')[0],
        text,
      });
    if (error) console.error('send error:', error);
  }

  return { messages, loading, sendMessage };
}