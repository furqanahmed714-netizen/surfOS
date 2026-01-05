import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FeedbackItem } from './FeedbackItem';

interface Feedback {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  vote_count: number;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

interface SimilarFeedback {
  feedback: Feedback;
  matchType: 'exact' | 'similar';
}

const CATEGORIES = ['General', 'Feature', 'Bug', 'Improvement', 'UI/UX', 'Performance', 'Documentation', 'Other'];

const detectCategory = (title: string, description: string): string => {
  const text = `${title} ${description}`.toLowerCase();

  if (/\b(bug|error|crash|broken|fix|issue|doesn't work|not working)\b/.test(text)) {
    return 'Bug';
  }
  if (/\b(feature|add|new|implement|create|build|want|wish|would be nice)\b/.test(text)) {
    return 'Feature';
  }
  if (/\b(improve|better|enhance|upgrade|optimize|faster|speed)\b/.test(text)) {
    return 'Improvement';
  }
  if (/\b(ui|ux|design|layout|style|color|button|interface|visual|look)\b/.test(text)) {
    return 'UI/UX';
  }
  if (/\b(slow|performance|lag|loading|memory|cpu)\b/.test(text)) {
    return 'Performance';
  }
  if (/\b(doc|documentation|guide|tutorial|help|readme|explain)\b/.test(text)) {
    return 'Documentation';
  }

  return 'General';
};

export const FeedbackApp: React.FC = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'submit'>('list');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [similarMatch, setSimilarMatch] = useState<SimilarFeedback | null>(null);
  const [sortBy, setSortBy] = useState<'votes' | 'recent'>('votes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const uniqueCategories = useMemo(() => {
    const cats = new Set(feedbacks.map(f => f.category));
    return ['All', ...Array.from(cats).sort()];
  }, [feedbacks]);

  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter(fb => {
      const matchesSearch = searchQuery === '' ||
        fb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fb.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || fb.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [feedbacks, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchFeedbacks();
    if (user) {
      fetchUserVotes();
    }
  }, [user]);

  const fetchFeedbacks = async () => {
    const orderColumn = sortBy === 'votes' ? 'vote_count' : 'created_at';
    const { data, error } = await supabase
      .from('feedbacks')
      .select(`*, profiles!feedbacks_user_id_profiles_fkey(first_name, last_name)`)
      .order(orderColumn, { ascending: false });

    if (!error && data) {
      setFeedbacks(data);
    }
    setLoading(false);
  };

  const fetchUserVotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('feedback_votes')
      .select('feedback_id')
      .eq('user_id', user.id);

    if (data) {
      setUserVotes(new Set(data.map(v => v.feedback_id)));
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [sortBy]);

  const findSimilarFeedback = (searchTitle: string, searchDesc: string): SimilarFeedback | null => {
    const normalizeText = (text: string) => text.toLowerCase().trim().replace(/[^\w\s]/g, '');
    const normalizedTitle = normalizeText(searchTitle);
    const normalizedDesc = normalizeText(searchDesc);

    for (const fb of feedbacks) {
      const fbTitle = normalizeText(fb.title);
      const fbDesc = normalizeText(fb.description);

      if (fbTitle === normalizedTitle) {
        return { feedback: fb, matchType: 'exact' };
      }

      const titleWords = normalizedTitle.split(/\s+/).filter(w => w.length > 2);
      const fbTitleWords = fbTitle.split(/\s+/).filter(w => w.length > 2);
      const titleMatches = titleWords.filter(w => fbTitleWords.includes(w)).length;
      const titleSimilarity = titleWords.length > 0 ? titleMatches / titleWords.length : 0;

      const descWords = normalizedDesc.split(/\s+/).filter(w => w.length > 3);
      const fbDescWords = fbDesc.split(/\s+/).filter(w => w.length > 3);
      const descMatches = descWords.filter(w => fbDescWords.includes(w)).length;
      const descSimilarity = descWords.length > 0 ? descMatches / descWords.length : 0;

      if (titleSimilarity > 0.6 || (titleSimilarity > 0.4 && descSimilarity > 0.4)) {
        return { feedback: fb, matchType: 'similar' };
      }
    }

    return null;
  };

  const handleSubmitCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Please fill in both title and description');
      return;
    }

    const similar = findSimilarFeedback(title, description);
    if (similar) {
      setSimilarMatch(similar);
    } else {
      submitFeedback();
    }
  };

  const submitFeedback = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');

    const category = detectCategory(title, description);

    const { error } = await supabase.from('feedbacks').insert({
      user_id: user.id,
      title: title.trim(),
      description: description.trim(),
      category,
    });

    if (error) {
      setError(error.message);
    } else {
      setTitle('');
      setDescription('');
      setSimilarMatch(null);
      setView('list');
      fetchFeedbacks();
    }
    setSubmitting(false);
  };

  const handleEditFeedback = async (id: string, newTitle: string, newDescription: string) => {
    const category = detectCategory(newTitle, newDescription);

    const { error } = await supabase
      .from('feedbacks')
      .update({
        title: newTitle,
        description: newDescription,
        category,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user?.id);

    if (!error) {
      fetchFeedbacks();
    }
  };

  const handleVote = async (feedbackId: string) => {
    if (!user) return;

    const feedback = feedbacks.find(f => f.id === feedbackId);
    if (feedback?.user_id === user.id) {
      return;
    }

    if (userVotes.has(feedbackId)) {
      const { error } = await supabase
        .from('feedback_votes')
        .delete()
        .eq('feedback_id', feedbackId)
        .eq('user_id', user.id);

      if (!error) {
        setUserVotes(prev => {
          const next = new Set(prev);
          next.delete(feedbackId);
          return next;
        });
        fetchFeedbacks();
      }
    } else {
      const { error } = await supabase.from('feedback_votes').insert({
        feedback_id: feedbackId,
        user_id: user.id,
      });

      if (!error) {
        setUserVotes(prev => new Set([...prev, feedbackId]));
        fetchFeedbacks();
      }
    }
  };

  const handleVoteOnSimilar = async () => {
    if (similarMatch) {
      await handleVote(similarMatch.feedback.id);
      setSimilarMatch(null);
      setTitle('');
      setDescription('');
      setView('list');
    }
  };

  const getAuthorName = (fb: Feedback): string => {
    if (fb.profiles) {
      return `${fb.profiles.first_name} ${fb.profiles.last_name?.charAt(0)}.`;
    }
    return 'Anonymous';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ backgroundColor: '#F88A8C' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-ocean-500/30 border-t-ocean-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sand-500 text-sm">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (similarMatch) {
    return (
      <div className="p-6 h-full" style={{ backgroundColor: '#F88A8C' }}>
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-amber-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-amber-800">Similar Feedback Found</h3>
              <p className="text-amber-700 text-sm mt-1">
                Someone already submitted similar feedback. Vote for it instead?
              </p>
            </div>
          </div>

          <div className="bg-white border border-amber-200 rounded-lg p-4 mb-5">
            <h4 className="font-semibold text-sand-900 text-base mb-2">{similarMatch.feedback.title}</h4>
            <p className="text-sand-600 text-sm leading-relaxed mb-3">{similarMatch.feedback.description}</p>
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              {similarMatch.feedback.vote_count} votes
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleVoteOnSimilar}
              disabled={similarMatch.feedback.user_id === user?.id || userVotes.has(similarMatch.feedback.id)}
              className="flex-1 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {userVotes.has(similarMatch.feedback.id) ? 'Already Voted' : 'Vote for This'}
            </button>
            <button
              onClick={submitFeedback}
              disabled={submitting}
              className="flex-1 py-3 bg-sand-200 hover:bg-sand-300 text-sand-800 rounded-lg font-semibold transition-colors text-sm"
            >
              Submit Mine Anyway
            </button>
          </div>
          <button
            onClick={() => setSimilarMatch(null)}
            className="w-full mt-3 py-2 text-sm text-sand-500 hover:text-sand-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (view === 'submit') {
    return (
      <div className="p-6 h-full" style={{ backgroundColor: '#F88A8C' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-sand-900">Share Your Feedback</h3>
          <button
            onClick={() => setView('list')}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            Back to all feedback
          </button>
        </div>

        <form onSubmit={handleSubmitCheck} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-sand-700 mb-2">
              What's your idea?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give it a short, clear title"
              className="w-full px-4 py-3 bg-white border-2 border-sand-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors text-sand-900 placeholder:text-sand-400"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-sand-700 mb-2">
              Tell us more
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your feedback in detail. What problem does it solve? Why would it be helpful?"
              rows={5}
              className="w-full px-4 py-3 bg-white border-2 border-sand-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors resize-none text-sand-900 placeholder:text-sand-400 leading-relaxed"
              maxLength={1000}
            />
          </div>

          {title && description && (
            <div className="flex items-center gap-2 text-sm text-sand-600">
              <span>Auto-detected category:</span>
              <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full font-medium text-xs">
                {detectCategory(title, description)}
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-base"
          >
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: '#F88A8C' }}>
      <div className="p-4 space-y-3">
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-sand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search feedback..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-sand-200 rounded-lg focus:outline-none focus:border-teal-400 transition-colors text-sand-900 placeholder:text-sand-400 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {uniqueCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-white border border-sand-200 text-sand-600 hover:border-teal-300 hover:text-teal-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-sand-600">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'votes' | 'recent')}
              className="text-sm bg-white border-2 border-sand-200 rounded-lg px-3 py-1.5 font-medium text-sand-700 focus:outline-none focus:border-teal-400"
            >
              <option value="votes">Most Voted</option>
              <option value="recent">Newest First</option>
            </select>
          </div>
          <button
            onClick={() => setView('submit')}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-lg font-semibold transition-colors"
          >
            + New Feedback
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredFeedbacks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-sand-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-sand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            {searchQuery || selectedCategory !== 'All' ? (
              <>
                <h4 className="font-semibold text-sand-700 text-lg mb-1">No matching feedback</h4>
                <p className="text-sand-500 text-sm mb-4">Try adjusting your search or filter</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                  className="px-4 py-2 bg-sand-200 hover:bg-sand-300 text-sand-700 text-sm rounded-lg font-semibold transition-colors"
                >
                  Clear Filters
                </button>
              </>
            ) : (
              <>
                <h4 className="font-semibold text-sand-700 text-lg mb-1">No feedback yet</h4>
                <p className="text-sand-500 text-sm mb-4">Be the first to share your ideas!</p>
                <button
                  onClick={() => setView('submit')}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm rounded-lg font-semibold transition-colors"
                >
                  Submit Feedback
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFeedbacks.map((fb) => (
              <FeedbackItem
                key={fb.id}
                id={fb.id}
                title={fb.title}
                description={fb.description}
                category={fb.category}
                voteCount={fb.vote_count}
                authorName={getAuthorName(fb)}
                date={formatDate(fb.created_at)}
                isOwn={fb.user_id === user?.id}
                hasVoted={userVotes.has(fb.id)}
                onVote={() => handleVote(fb.id)}
                onEdit={handleEditFeedback}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
