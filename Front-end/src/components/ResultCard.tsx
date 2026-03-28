import { useState } from 'react';
import type { FC } from 'react';
import { apiRequest } from '../services/api'; 

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

interface ResultCardProps {
  data: GitHubRepo;
}

const ResultCard: FC<ResultCardProps> = ({ data }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggleFavorite = async () => {
    setIsSaving(true);
    
    try {
      if (isFavorite) {
        // DELETE request to remove it from the database
        await apiRequest(`/user/favorites/${data.id}`, 'DELETE');
        setIsFavorite(false);
      } else {
        const payload = {
          githubId: data.id,                  
          name: data.full_name,
          description: data.description,
          stargazersCount: data.stargazers_count,
          htmlUrl: data.html_url,
          language: data.language,
          owner: data.owner.login             
        };

        await apiRequest('/user/favorites', 'POST', payload);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      alert("Failed to update favorite status. Are you logged in?");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border-2 border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition bg-white">
      <div className="flex items-start justify-between mb-3">
        {/* Left Side: Avatar and Title */}
        <div className="flex items-center gap-3">
          <img 
            src={data.owner.avatar_url} 
            alt={`${data.owner.login}'s avatar`} 
            className="w-10 h-10 rounded-full border border-slate-200"
          />
          <div>
            <a href={data.html_url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-blue-600 hover:underline">
              {data.full_name}
            </a>
          </div>
        </div>

        {/* Right Side: Stars AND Favorite Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-600 bg-slate-100 px-3 py-1 rounded-full text-sm font-semibold">
            <span>⭐</span>
            <span>{data.stargazers_count.toLocaleString()}</span>
          </div>
          
          {/* THE FAVORITE BUTTON */}
          <button 
            onClick={toggleFavorite}
            disabled={isSaving}
            className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
              isFavorite ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-400 hover:text-red-500'
            }`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isSaving ? '⏳' : (isFavorite ? '♥' : '♡')}
          </button>
        </div>
      </div>

      <p className="text-slate-600 mb-4 line-clamp-2">
        {data.description || 'No description provided for this repository.'}
      </p>

      {/* Footer: Language */}
      <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
        {data.language && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            {data.language}
          </span>
        )}
      </div>
    </div>
  );
};

export default ResultCard;