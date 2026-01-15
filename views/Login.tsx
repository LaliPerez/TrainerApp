
import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin2025') {
      if (remember) localStorage.setItem('tp_rem', 'admin2025');
      onLoginSuccess();
    } else {
      alert("Acceso denegado");
    }
  };

  return (
    <div className="flex items-center justify-center" style={{minHeight: '100vh'}}>
      <form onSubmit={handleLogin} className="tp-card flex flex-col gap-4" style={{width: '320px'}}>
        <h2 style={{textAlign: 'center', margin: 0, color: 'var(--primary)'}}>TrainerPro</h2>
        {/* Fixed: CSS variables in React inline styles must be strings. Original color: var(--text-muted) caused syntax errors. */}
        <p style={{textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)'}}>Acceso Instructor</p>
        <input 
          type="password" 
          className="tp-input" 
          placeholder="Contraseña" 
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <label style={{fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
          <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Recordar acceso
        </label>
        <button type="submit" className="tp-btn">Entrar al Dashboard</button>
      </form>
    </div>
  );
};

export default Login;
