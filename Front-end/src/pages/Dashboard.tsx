import { useState } from 'react';
import { apiRequest } from '../services/api';

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  stargazers_count: number;
  html_url: string;
  language: string;
}

const Dashboard = () => {
  const [query, setQuery] = useState('');
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const response = await fetch(`https://api.github.com/search/repositories?q=${query}`);
      const data = await response.json();
      setRepos(data.items || []);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (repo: GitHubRepo) => {
    try {
      await apiRequest('/user/favorites', 'POST', {
        githubId: repo.id,
        name: repo.name,
        description: repo.description,
        stargazersCount: repo.stargazers_count,
        htmlUrl: repo.html_url,
        language: repo.language
      });
      alert(`Saved ${repo.name} to favorites!`);
    } catch (err: any) {
      alert(err.message);
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
          // Using the .app-input component we defined in index.css
          className="app-input" 
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button 
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-8 py-2 rounded-lg font-semibold transition-all shadow-md active:scale-95"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {repos.length > 0 ? (
          repos.map((repo) => (
            // Using the .repo-card component we defined in index.css
            <div key={repo.id} className="repo-card flex justify-between items-start">
              <div className="flex-grow pr-4">
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
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {repo.language || 'Markdown'}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center">
                    ⭐ {repo.stargazers_count.toLocaleString()}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => handleSave(repo)}
                // Using the custom github-green color from our config
                className="bg-github-green hover:opacity-90 text-white px-4 py-1.5 rounded-md text-sm font-bold shadow-sm transition-opacity"
              >
                Save
              </button>
            </div>
          ))
        ) : (
          !loading && query && <p className="text-center text-slate-400 mt-10">No results found. Try a different search!</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;