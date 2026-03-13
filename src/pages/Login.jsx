import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Lock } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/dashboard');
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-chocolate-900 relative overflow-hidden">
      {/* Background elegant accents */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-gold-400 opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-chocolate-600 opacity-20 rounded-full blur-3xl"></div>
      
      <div className="card w-full max-w-md p-10 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-chocolate-900 border border-gold-400 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Lock className="w-8 h-8 text-gold-400" />
          </div>
          <h1 className="text-2xl font-light text-beige-50 uppercase tracking-widest">Workspace</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm text-chocolate-500 mb-2 uppercase tracking-wider">Usuario</label>
            <input 
              type="text" 
              className="input-premium w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario admin"
            />
          </div>
          <div>
            <label className="block text-sm text-chocolate-500 mb-2 uppercase tracking-wider">Contraseña</label>
            <input 
              type="password" 
              className="input-premium w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          
          <button type="submit" className="btn-primary w-full py-3 mt-4 text-sm uppercase tracking-widest">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}