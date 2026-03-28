import type { FC } from 'react';

interface PaginationProps {
  currentPage: number;
  totalResults: number;
  itemsPerPage?: number;
  onPageChange: (newPage: number) => void;
}

const Pagination: FC<PaginationProps> = ({ 
  currentPage, 
  totalResults, 
  itemsPerPage = 30, 
  onPageChange 
}) => {
  // Check if we have more items than what's currently displayed
  const totalPages = Math.ceil(totalResults / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // Don't render anything if there are 30 or fewer results
  if (totalResults <= itemsPerPage) return null;

  return (
    <div className="flex justify-center gap-4 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className="px-6 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Previous
      </button>
      
      <span className="flex items-center text-slate-600 font-medium">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        Next 30
      </button>
    </div>
  );
};

export default Pagination;