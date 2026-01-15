
import React, { useState } from 'react';
import { 
  LogOut, Settings, Building2, BookOpen, Users, 
  Plus, Trash2, X, Download, ExternalLink 
} from 'lucide-react';
import { AppState, LinkItem, Company, Training } from '../types';
import SignaturePad from '../components/SignaturePad';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';

const generateId = () => Math.random().toString(36).substring(2, 9);

interface AdminDashboardProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, updateState, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'companies' | 'trainings' | 'attendance'>('profile');
  
  // Local states for forms
  const [profName, setProfName] = useState(state.instructor?.name || '');
  const [profRole, setProfRole] = useState(state.instructor?.role || '');
  const [profSignature, setProfSignature] = useState(state.instructor?.signature || '');
  const [compName, setCompName] = useState('');
  const [compCuit, setCompCuit] = useState('');
  const [trainTitle, setTrainTitle] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const handleSaveProfile = () => {
    if (!profName || !profSignature) return alert("Complete su nombre y firma.");
    updateState({ instructor: { name: profName, role: profRole, signature: profSignature } });
    alert("Perfil guardado");
  };

  const handleCreateTraining = () => {
    if (!trainTitle || links.length === 0) return alert("Título y links requeridos");
    const newTraining = { id: generateId(), title: trainTitle, links };
    updateState({ trainings: [...state.trainings, newTraining] });
    setTrainTitle(''); setLinks([]);
    alert("Capacitación creada");
  };

  return (
    <div>
      <aside className="sidebar">
        <div style={{padding: '2rem'}}>
          <h2 style={{color: 'var(--primary)', margin: 0}}>TrainerPro</h2>
        </div>
        <div className="nav-item" onClick={() => setActiveTab('profile')} style={{background: activeTab === 'profile' ? 'var(--primary)' : 'transparent', color: activeTab === 'profile' ? 'white' : ''}}>
          <Settings size={20} style={{marginRight: '1rem'}}/> Perfil
        </div>
        <div className="nav-item" onClick={() => setActiveTab('companies')} style={{background: activeTab === 'companies' ? 'var(--primary)' : 'transparent', color: activeTab === 'companies' ? 'white' : ''}}>
          <Building2 size={20} style={{marginRight: '1rem'}}/> Empresas
        </div>
        <div className="nav-item" onClick={() => setActiveTab('trainings')} style={{background: activeTab === 'trainings' ? 'var(--primary)' : 'transparent', color: activeTab === 'trainings' ? 'white' : ''}}>
          <BookOpen size={20} style={{marginRight: '1rem'}}/> Capacitaciones
        </div>
        <div className="nav-item" onClick={() => setActiveTab('attendance')} style={{background: activeTab === 'attendance' ? 'var(--primary)' : 'transparent', color: activeTab === 'attendance' ? 'white' : ''}}>
          <Users size={20} style={{marginRight: '1rem'}}/> Asistencias
        </div>
        <div className="nav-item" onClick={onLogout} style={{marginTop: 'auto', color: 'var(--danger)'}}>
          <LogOut size={20} style={{marginRight: '1rem'}}/> Salir
        </div>
      </aside>

      <main className="main-content">
        {activeTab === 'profile' && (
          <div className="tp-card flex flex-col gap-4">
            <h2 style={{marginTop: 0}}>Configuración de Instructor</h2>
            <div className="grid grid-cols-2 gap-4">
              <input className="tp-input" value={profName} onChange={e => setProfName(e.target.value)} placeholder="Nombre completo" />
              <input className="tp-input" value={profRole} onChange={e => setProfRole(e.target.value)} placeholder="Cargo / Especialidad" />
            </div>
            <p style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>Firma Digital:</p>
            <SignaturePad onSave={setProfSignature} height={120} />
            <button className="tp-btn" onClick={handleSaveProfile}>Guardar Cambios de Perfil</button>
          </div>
        )}

        {activeTab === 'companies' && (
          <div className="flex flex-col gap-4">
            <div className="tp-card">
              <h3>Agregar Empresa</h3>
              <div className="grid grid-cols-2 gap-4">
                <input className="tp-input" value={compName} onChange={e => setCompName(e.target.value)} placeholder="Nombre Empresa" />
                <input className="tp-input" value={compCuit} onChange={e => setCompCuit(e.target.value)} placeholder="CUIT" />
              </div>
              <button className="tp-btn" style={{marginTop: '1rem'}} onClick={() => {
                if(!compName || !compCuit) return;
                updateState({ companies: [...state.companies, { id: generateId(), name: compName, cuit: compCuit }] });
                setCompName(''); setCompCuit('');
              }}>Vincular Empresa</button>
            </div>
            {state.companies.map(c => (
              <div key={c.id} className="tp-card flex justify-between items-center">
                <div><strong>{c.name}</strong><br/><small>{c.cuit}</small></div>
                <button className="tp-btn tp-btn-danger" onClick={() => updateState({ companies: state.companies.filter(i => i.id !== c.id) })}><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'trainings' && (
          <div className="flex flex-col gap-4">
            <div className="tp-card">
              <h3>Crear Nueva Capacitación</h3>
              <input className="tp-input" value={trainTitle} onChange={e => setTrainTitle(e.target.value)} placeholder="Título de la capacitación" style={{marginBottom: '1rem'}} />
              <div className="flex gap-4">
                <input className="tp-input" value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} placeholder="Nombre Material" />
                <input className="tp-input" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="URL de Drive" />
                <button className="tp-btn" onClick={() => {
                  if(!newLinkTitle || !newLinkUrl) return;
                  setLinks([...links, { id: generateId(), title: newLinkTitle, url: newLinkUrl }]);
                  setNewLinkTitle(''); setNewLinkUrl('');
                }}><Plus size={18}/></button>
              </div>
              <div style={{marginTop: '1rem'}}>
                {links.map(l => <div key={l.id} style={{fontSize: '0.8rem', padding: '0.5rem', background: 'var(--bg-input)', marginBottom: '0.2rem', borderRadius: '0.4rem'}}>{l.title}</div>)}
              </div>
              <button className="tp-btn" style={{marginTop: '1rem', width: '100%'}} onClick={handleCreateTraining}>Publicar Capacitación</button>
            </div>
            {state.trainings.map(t => (
              <div key={t.id} className="tp-card">
                <div className="flex justify-between items-center">
                  <h3 style={{margin: 0}}>{t.title}</h3>
                  <button className="tp-btn tp-btn-danger" onClick={() => updateState({ trainings: state.trainings.filter(i => i.id !== t.id) })}><Trash2 size={16}/></button>
                </div>
                <div style={{display: 'flex', gap: '1rem', marginTop: '1rem', overflowX: 'auto'}}>
                  {state.companies.map(c => (
                    <div key={c.id} style={{background: 'white', padding: '0.5rem', borderRadius: '0.5rem', textAlign: 'center'}}>
                      <QRCodeSVG value={`${window.location.origin}${window.location.pathname}#/training?cid=${c.id}&tid=${t.id}`} size={100} />
                      <p style={{color: 'black', fontSize: '0.6rem', margin: '0.2rem 0'}}>{c.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
