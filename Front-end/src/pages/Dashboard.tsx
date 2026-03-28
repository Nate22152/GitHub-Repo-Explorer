import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
  language: string | null;
  owner: {
    login: string;
    avatar_url: string;
  };
}

const Dashboard = () => {
  const [query, setQuery] = useState('');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRepos, setSavedRepos] = useState<Set<number>>(new Set());
  useEffect(() => {
  const loadFavorites = async () => {
    try {
      const response = await apiRequest('/user/favorites', 'GET');
      if (response.success && response.data) {
        const savedIds = new Set<number>(
          response.data.map((fav: any) => Number(fav.repo_id))
        );
        setSavedRepos(savedIds);
      }
    } catch (err) {
      console.error('Failed to load favorites:', err);
    }
  };

  loadFavorites();
}, []);
  const handleSearch = async () => {
    if (!query.trim()) return;
    //review
    console.log("hello mister");

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.github.com/users/${query}/repos`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories from GitHub');
      }
      
      const data = await response.json();
      setRepos(data || []);
      
      if (!data || data === 0) {
        setError('No repositories found. Try a different search term.');
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError('Failed to search repositories. Please try again.');
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (repo: GitHubRepo) => {
    const isSaved = savedRepos.has(repo.id);

  // Optimistically toggle
    setSavedRepos(prev => {
      const next = new Set(prev);
      isSaved ? next.delete(repo.id) : next.add(repo.id);
      return next;
    });

    try {
     if (isSaved) {
      // Remove from favorites
       const response = await apiRequest(`/user/favorites/${repo.id}`, 'DELETE');
        if (!response.success) {
          throw new Error(response.error || 'Failed to remove favorite');
        }
      } else {
      // Add to favorites
        const response = await apiRequest('/user/favorites', 'POST', {
         repoId: repo.id,
          githubId: repo.id,
          name: repo.name,
          description: repo.description,
          stargazersCount: repo.stargazers_count,
          htmlUrl: repo.html_url,
         language: repo.language,
         owner: repo.owner.login
        });
        if (!response.success) {
          throw new Error(response.error || 'Failed to save favorite');
        }
     }
    } catch (err: any) {
      // Revert optimistic update on any failure
      setSavedRepos(prev => {
       const next = new Set(prev);
       isSaved ? next.add(repo.id) : next.delete(repo.id);
       return next;
      });
      alert(err.message || 'Something went wrong. Please try again.');
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore GitHub
        </h1>
        <p className="text-slate-500 mt-1">Find repositories and save them to your personal collection.</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3 mb-10">
        <input 
          type="text" 
          placeholder="Search repositories (e.g. 'Tailwind', 'Express')..." 
          className="app-input" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={loading}
        />
        <button 
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-8 py-2 rounded-lg font-semibold transition-all shadow-md active:scale-95 disabled:cursor-not-allowed"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Searching repositories...</p>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 gap-4">
        {!loading && repos.length > 0 && (
          <>
            <div className="text-sm text-slate-500 mb-2">
              Found {repos.length} repositories
            </div>
            {repos.map((repo) => (
              <div key={repo.id} className="repo-card flex justify-between items-start">
                <div className="flex-grow pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <img 
                      src={repo.owner.avatar_url} 
                      alt={repo.owner.login}
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-xs text-slate-500">{repo.owner.login}</span>
                  </div>
                  
                  <a 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="font-bold text-lg text-blue-600 hover:underline decoration-2"
                  >
                    {repo.name}
                  </a>
                  
                  <p className="text-slate-600 text-sm mt-1 line-clamp-2 leading-relaxed">
                    {repo.description || "No description available."}
                  </p>
                  
                  <div className="flex gap-3 mt-3 items-center">
                    {repo.language && (
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {repo.language}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 flex items-center">
                      ⭐ {repo.stargazers_count.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => handleSave(repo)}
                  title={savedRepos.has(repo.id) ? 'Favorited' : 'Add to favorites'}
                  className={`p-2 rounded-full transition-colors ${
                    savedRepos.has(repo.id)
                      ? 'text-yellow-400 hover:text-yellow-500'
                      : 'text-slate-300 hover:text-yellow-400'
                  }`}
                >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={savedRepos.has(repo.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      strokeWidth={2}
                      className="w-6 h-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.499z"
                      />
                    </svg>
                  </button>
              </div>
            ))}
          </>
        )}

        {/* Empty State */}
        {!loading && !error && repos.length === 0 && query && (
          <div className="text-center py-10">
            <p className="text-slate-400 text-lg">No results found</p>
            <p className="text-slate-400 text-sm mt-2">Try a different search term</p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !query && repos.length === 0 && (
          <div className="text-center py-10">
            <p className="text-slate-400 text-lg">Search for GitHub repositories</p>
            <p className="text-slate-400 text-sm mt-2">Enter a search term above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;