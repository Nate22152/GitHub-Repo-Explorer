import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex gap-8 items-center">
          <h1 className="text-xl font-bold text-blue-400">RepoExplorer</h1>
          {isLoggedIn && (
            <>
              <Link to="/dashboard" className="hover:text-blue-300 transition">Search</Link>
              <Link to="/favorites" className="hover:text-blue-300 transition">My Favorites</Link>
            </>
          )}
        </div>
        
        <div>
          {isLoggedIn ? (
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-sm transition"
            >
              Logout
            </button>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="hover:text-blue-300">Login</Link>
              <Link to="/register" className="bg-blue-600 px-4 py-1.5 rounded-md">Join</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;