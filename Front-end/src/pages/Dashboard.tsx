import { useState } from 'react';
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

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=30&sort=stars`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories from GitHub');
      }
      
      const data = await response.json();
      setRepos(data.items || []);
      
      if (!data.items || data.items.length === 0) {
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
    try {
      const response = await apiRequest('/user/favorites', 'POST', {
        repoId: repo.id,
        githubId: repo.id, // Support both field names
        name: repo.name,
        description: repo.description,
        stargazersCount: repo.stargazers_count,
        htmlUrl: repo.html_url,
        language: repo.language,
        owner: repo.owner.login // Include owner field (required by backend)
      });

      if (response.success) {
        alert(`✓ Saved ${repo.name} to favorites!`);
      } else {
        alert(response.error || 'Failed to save favorite');
      }
    } catch (err: any) {
      console.error('Error saving favorite:', err);
      
      // Handle specific error messages
      if (err.message.includes('already in favorites')) {
        alert(`${repo.name} is already in your favorites!`);
      } else if (err.message.includes('not authenticated')) {
        alert('Please log in to save favorites');
      } else {
        alert(err.message || 'Failed to save favorite. Please try again.');
      }
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
                  className="bg-github-green hover:opacity-90 text-white px-4 py-1.5 rounded-md text-sm font-bold shadow-sm transition-opacity"
                >
                  Save
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