import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export function usePosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();

    // Real time listener — new posts appear instantly
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