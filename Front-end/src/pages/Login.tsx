import { useState, type FormEvent } from 'react'; // Use type import for FormEvent
import { useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../services/api';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiRequest('/auth/login', 'POST', form);
      if(response.success && response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      }
    } catch (err: any) { 
      alert(err.message); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <form 
          onSubmit={handleLogin} 
          className="p-8 bg-white shadow-xl rounded-2xl border border-slate-200"
        >
          <header className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mt-2">Log in to manage your favorite repos</p>
          </header>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
              <input 
                className="app-input" 
                placeholder="Enter your username" 
                required
                onChange={e => setForm({...form, username: e.target.value})} 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input 
                className="app-input" 
                type="password" 
                placeholder="••••••••" 
                required
                onChange={e => setForm({...form, password: e.target.value})} 
              />
            </div>

            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:bg-slate-400"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>

          <footer className="mt-6 text-center text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Register here
            </Link>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default Login;