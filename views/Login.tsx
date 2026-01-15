
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, UserCheck } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('trainerpro_remembered_pass');
    if (saved) {
      setPassword(saved);
      setRemember(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin2025') {
      if (remember) {
        localStorage.setItem('trainerpro_remembered_pass', 'admin2025');
      } else {
        localStorage.removeItem('trainerpro_remembered_pass');
      }
      onLoginSuccess();
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-emerald-500/10 text-emerald-500">
            <UserCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">TrainerPro</h1>
          <p className="mt-2 text-slate-400">Acceso exclusivo para Instructores</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <label className="text-sm font-medium text-slate-300">Contraseña de Administrador</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-white placeholder-slate-500"
                  placeholder="admin2025"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 text-emerald-600 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-slate-400 cursor-pointer">
                Recordar contraseña
              </label>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-900/20"
          >
            Ingresar al Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
