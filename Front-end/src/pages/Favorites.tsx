import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';

interface Favorite {
  id: number;
  repo_id: number;
  name: string;
  description: string;
  stargazers_count: number;
  html_url: string;
  language: string;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  const fetchFavorites = async () => {
  try {
    const response = await apiRequest('/user/favorites', 'GET');
    
    // Check if response.data exists and is an array
    if (response && Array.isArray(response.data)) {
      setFavorites(response.data);
    } else {
      // Fallback to empty array if data is missing or malformed
      setFavorites([]);
    }
  } catch (err) {
    console.error("Could not fetch favorites", err);
    setFavorites([]); // Prevent the crash by keeping it an array
  }
};

  const removeFavorite = async (repoIdToRemove: number) => {
    try {
      await apiRequest(`/user/favorites/${repoIdToRemove}`, 'DELETE');
      // Update local state to remove the item immediately
      setFavorites(favorites.filter(repo => repo.repo_id !== repoIdToRemove));
    } catch (err) {
      alert("Failed to remove favorite");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Favorites</h1>
      {favorites.length === 0 ? (
        <p className="text-gray-500 italic">No favorites saved yet.</p>
      ) : (
        <div className="grid gap-4">
          {(favorites || []).map((repo) => (
            <div key={repo.repo_id} className="p-5 border-l-4 border-blue-500 bg-white shadow rounded flex justify-between items-center">
              <div>
                <a href={repo.html_url} target="_blank" rel="noreferrer" className="text-xl font-bold text-blue-700 hover:underline">
                  {repo.name}
                </a>
                <p className="text-gray-700 mt-1">{repo.description}</p>
                <p className="text-sm mt-2 text-gray-500">⭐ {repo.stargazers_count} | {repo.language}</p>
              </div>
              <button 
                onClick={() => removeFavorite(repo.repo_id)}
                className="text-red-500 hover:text-red-700 font-semibold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;