import React, { useState } from 'react';

interface FeedbackItemProps {
  id: string;
  title: string;
  description: string;
  category: string;
  voteCount: number;
  authorName: string;
  date: string;
  isOwn: boolean;
  hasVoted: boolean;
  onVote: () => void;
  onEdit?: (id: string, title: string, description: string) => void;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  'General': { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  'Feature': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  'Bug': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  'Improvement': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  'UI/UX': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  'Performance': { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  'Documentation': { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
  'Other': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
};

export const FeedbackItem: React.FC<FeedbackItemProps> = ({
  id,
  title,
  description,
  category,
  voteCount,
  authorName,
  date,
  isOwn,
  hasVoted,
  onVote,
  onEdit
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);

  const colors = categoryColors[category] || categoryColors['Other'];

  const handleSaveEdit = () => {
    if (onEdit && editTitle.trim() && editDescription.trim()) {
      onEdit(id, editTitle.trim(), editDescription.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(title);
    setEditDescription(description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-white rounded-lg border-2 border-teal-300 shadow-md">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 bg-sand-50 border-2 border-sand-200 rounded-lg focus:outline-none focus:border-teal-400 text-sand-900 font-medium"
            maxLength={100}
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-sand-50 border-2 border-sand-200 rounded-lg focus:outline-none focus:border-teal-400 resize-none text-sand-700 text-sm"
            maxLength={1000}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-sand-200 hover:bg-sand-300 text-sand-700 text-sm font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg border border-sand-200 hover:border-sand-300 transition-colors">
      <div className="flex gap-5">
        <div className="flex-shrink-0">
          <button
            onClick={onVote}
            disabled={isOwn}
            className={`w-16 h-20 rounded-xl flex flex-col items-center justify-center transition-all border-2 ${
              isOwn
                ? 'bg-sand-50 text-sand-300 cursor-not-allowed border-sand-200'
                : hasVoted
                ? 'bg-teal-500 text-white shadow-lg border-teal-600 hover:bg-teal-600'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-300 hover:border-teal-400 hover:shadow-md'
            }`}
            title={isOwn ? "You can't vote on your own feedback" : hasVoted ? 'Click to remove vote' : 'Click to vote'}
          >
            <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
            <span className="text-lg font-bold">{voteCount}</span>
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-semibold text-sand-900 text-base leading-snug">
              {title}
            </h4>
            <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold border ${colors.bg} ${colors.text} ${colors.border}`}>
              {category}
            </span>
          </div>
          <p className="text-sand-600 text-sm leading-relaxed mb-3">
            {description}
          </p>
          <div className="flex items-center gap-3 text-xs text-sand-400">
            <span className="font-medium text-sand-500">{authorName}</span>
            <span>-</span>
            <span>{date}</span>
            {isOwn && (
              <>
                <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                  Your feedback
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
