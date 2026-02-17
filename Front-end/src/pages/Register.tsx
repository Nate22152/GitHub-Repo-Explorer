import React, { useState } from 'react';
import { apiRequest } from '../services/api';

const Register = () => {
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/auth/register', 'POST', form);
      alert('Success! Please log in.');
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl mb-4 font-bold">Register</h2>
        <input className="w-full p-2 border mb-2" placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} />
        <input className="w-full p-2 border mb-4" type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
        <button type="submit"className="w-full bg-blue-600 text-white py-2 rounded">Create Account</button>
      </form>
    </div>
  );
};
export default Register;