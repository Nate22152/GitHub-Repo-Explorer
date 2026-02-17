import { useState } from 'react';
import type { FormEvent } from 'react';

interface SearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar = ({ onSearch, isLoading }: SearchProps) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(text);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <input 
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search for a repository (e.g. 'tensorflow')..."
        className="flex-grow p-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none transition"
      />
      <button 
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white px-8 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400"
      >
        {isLoading ? '...' : 'Search'}
      </button>
    </form>
  );
};

export default SearchBar;