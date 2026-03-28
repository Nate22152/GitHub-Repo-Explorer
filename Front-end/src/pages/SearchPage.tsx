import { useState } from 'react';
import SearchBar from '../components/Searchbar'; 
import Pagination from '../components/Pagination'; 
import ResultCard from '../components/ResultCard'; 

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [totalResults, setTotalResults] = useState(0); 
  const [results, setResults] = useState([]);
  // Handle search submission
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); 
    fetchData(query, 1);
  };
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchData(searchQuery, newPage);
  };

  const fetchData = async (query: string, page: number) => {
    setIsLoading(true);
    try {
      console.log('plz for god sake work');
      const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=30&sort=stars`);
      const data = await response.json();
      
      if (data.items) {
        setTotalResults(data.total_count);
        setResults(data.items);
      } else {
        setResults([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <SearchBar onSearch={handleSearch} isLoading={isLoading} />

      <div className="my-6 min-h-[400px]">
        {isLoading ? (
          <p className="text-slate-500">Loading results...</p>
        ) : (
          <>
            {searchQuery && (
              <p className="mb-4 text-slate-600">
                Showing page {currentPage} results for "{searchQuery}"
              </p>
            )}
            
            <div className="flex flex-col gap-4">
              {results?.map((item: any) => (
                <ResultCard key={item.id} data={item} />
              ))}
            </div>
          </>
        )}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalResults={totalResults}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default SearchPage;