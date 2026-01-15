
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import AdminDashboard from './views/AdminDashboard';
import EmployeeTraining from './views/EmployeeTraining';
import { loadState, saveState } from './services/storage';
import { AppState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = (newState: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...newState }));
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <Routes>
          <Route 
            path="/" 
            element={isAdmin ? <Navigate to="/admin" /> : <Login onLoginSuccess={() => setIsAdmin(true)} />} 
          />
          <Route 
            path="/admin/*" 
            element={
              isAdmin ? (
                <AdminDashboard state={state} updateState={updateState} onLogout={() => setIsAdmin(false)} />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/training" 
            element={<EmployeeTraining state={state} updateState={updateState} />} 
          />
        </Routes>
      </div>
    </HashRouter>
  );
};

export default App;
