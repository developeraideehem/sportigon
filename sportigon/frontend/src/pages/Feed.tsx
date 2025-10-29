import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, Send } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { feedApi } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

interface Post {
  id: string;
  content: string;
  author: string;
  authorAvatar?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
  bookmarked?: boolean;
  sport?: string;
}

const Feed: React.FC = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMorePosts();
    }
  }, [inView]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await feedApi.getPosts(1, 10);
      if (response.success) {
        setPosts(response.posts || getMockPosts());
        setPage(1);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPosts(getMockPosts());
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    try {
      setLoading(true);
      const nextPage = page + 1;
      const response = await feedApi.getPosts(nextPage, 10);
      if (response.success && response.posts) {
        setPosts((prev) => [...prev, ...response.posts]);
        setPage(nextPage);
        if (response.posts.length < 10) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      toast.error('Please enter some content');
      return;
    }

    try {
      setIsPosting(true);
      const response = await feedApi.createPost(newPostContent);
      if (response.success) {
        toast.success('Post created!');
        setNewPostContent('');
        fetchPosts();
      }
    } catch (error) {
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await feedApi.likePost(postId);
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
            : post
        )
      );
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, bookmarked: !post.bookmarked } : post
      )
    );
    toast.success('Post bookmarked!');
  };

  const getMockPosts = (): Post[] => [
    {
      id: '1',
      content: 'What an incredible game! That last-minute goal was absolutely stunning! 🎯⚽',
      author: 'sportsfan2024',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      likes: 142,
      comments: 23,
      shares: 8,
      liked: false,
      bookmarked: false,
      sport: 'Football',
    },
    {
      id: '2',
      content: 'Excited for tonight\'s championship match! Who\'s watching? 🏆',
      author: 'athletepro',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      likes: 89,
      comments: 15,
      shares: 5,
      liked: true,
      bookmarked: false,
      sport: 'Basketball',
    },
    {
      id: '3',
      content: 'The level of sportsmanship shown today was truly inspirational. This is what sports is all about! 💪',
      author: 'coachmike',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      likes: 234,
      comments: 45,
      shares: 18,
      liked: false,
      bookmarked: true,
      sport: 'Tennis',
    },
  ];

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
      >
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-lg">
              {user?.firstName?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your thoughts on sports..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-2">
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="text-xl">📷</span>
                </button>
                <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <span className="text-xl">😊</span>
                </button>
              </div>
              <Button
                onClick={handleCreatePost}
                isLoading={isPosting}
                disabled={!newPostContent.trim()}
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Post
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold">
                    {post.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">@{post.author}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    {formatTimeAgo(post.timestamp)}
                    {post.sport && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-blue-600">{post.sport}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-800 mb-4 text-base leading-relaxed">{post.content}</p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-6">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors group"
                >
                  <Heart
                    className={`w-5 h-5 transition-all ${
                      post.liked ? 'fill-red-600 text-red-600' : 'group-hover:scale-110'
                    }`}
                  />
                  <span className="text-sm font-medium">{post.likes}</span>
                </button>

                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.comments}</span>
                </button>

                <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.shares}</span>
                </button>
              </div>

              <button
                onClick={() => handleBookmark(post.id)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bookmark
                  className={`w-5 h-5 ${post.bookmarked ? 'fill-blue-600 text-blue-600' : ''}`}
                />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <div ref={ref} className="py-4 text-center">
        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-gray-600 text-sm">You've reached the end</p>
        )}
      </div>
    </div>
  );
};

export default Feed;
