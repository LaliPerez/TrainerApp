
import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Settings, 
  Building2, 
  BookOpen, 
  Users, 
  Plus, 
  Trash2, 
  Share2, 
  QrCode, 
  FileText,
  X,
  ChevronRight,
  Download,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { AppState, LinkItem, Company, Training } from '../types';
import SignaturePad from '../components/SignaturePad';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';

// Generador de ID compatible y seguro
const generateId = () => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

interface AdminDashboardProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, updateState, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'companies' | 'trainings' | 'attendance'>('profile');
  
  // Perfil
  const [profName, setProfName] = useState(state.instructor?.name || '');
  const [profRole, setProfRole] = useState(state.instructor?.role || '');
  const [profSignature, setProfSignature] = useState(state.instructor?.signature || '');

  // Empresas
  const [compName, setCompName] = useState('');
  const [compCuit, setCompCuit] = useState('');

  // Capacitaciones
  const [trainTitle, setTrainTitle] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Filtros
  const [filterCompany, setFilterCompany] = useState('');
  const [filterTraining, setFilterTraining] = useState('');

  // Sincronizar datos de perfil si cambian externamente
  useEffect(() => {
    if (state.instructor && activeTab === 'profile') {
      setProfName(state.instructor.name);
      setProfRole(state.instructor.role);
      setProfSignature(state.instructor.signature);
    }
  }, [state.instructor]);

  const handleSaveProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!profName.trim()) {
      alert("Ingrese su nombre.");
      return;
    }
    if (!profRole.trim()) {
      alert("Ingrese su cargo.");
      return;
    }
    if (!profSignature) {
      alert("Debe realizar su firma digital.");
      return;
    }
    
    updateState({ 
      instructor: { 
        name: profName, 
        role: profRole, 
        signature: profSignature 
      } 
    });
    alert("Perfil guardado correctamente.");
  };

  const handleAddCompany = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!compName.trim() || !compCuit.trim()) {
      alert("Complete nombre y CUIT.");
      return;
    }
    const newCompany: Company = { id: generateId(), name: compName, cuit: compCuit };
    updateState({ companies: [...state.companies, newCompany] });
    setCompName('');
    setCompCuit('');
  };

  const handleAddLink = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      alert("Nombre y URL del link requeridos.");
      return;
    }
    setLinks([...links, { id: generateId(), title: newLinkTitle, url: newLinkUrl }]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleCreateTraining = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!trainTitle.trim()) {
      alert("Ingrese un título para la capacitación.");
      return;
    }
    if (links.length === 0) {
      alert("Debe agregar al menos un link de contenido.");
      return;
    }
    
    const newTraining: Training = { 
      id: generateId(), 
      title: trainTitle, 
      links: [...links] 
    };
    
    updateState({ trainings: [...state.trainings, newTraining] });
    setTrainTitle('');
    setLinks([]);
    alert("Capacitación creada con éxito.");
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.text('TrainerPro - Reporte de Asistencias', 20, 20);
    let y = 40;
    
    const filtered = state.attendances.filter(a => 
      (!filterCompany || a.companyId === filterCompany) && 
      (!filterTraining || a.trainingId === filterTraining)
    );

    if (filtered.length === 0) {
      alert("No hay registros para exportar.");
      return;
    }

    filtered.forEach((a, i) => {
      doc.text(`${i+1}. ${a.employeeName} (${a.employeeDni})`, 20, y);
      y += 10;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.save('reporte_asistencias.pdf');
  };

  const getShareUrl = (companyId: string, trainingId: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#/training?cid=${companyId}&tid=${trainingId}`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-emerald-500">TrainerPro</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4">
          <button onClick={() => setActiveTab('profile')} className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Settings size={18} className="mr-3" /> Perfil
          </button>
          <button onClick={() => setActiveTab('companies')} className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'companies' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Building2 size={18} className="mr-3" /> Empresas
          </button>
          <button onClick={() => setActiveTab('trainings')} className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'trainings' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <BookOpen size={18} className="mr-3" /> Capacitaciones
          </button>
          <button onClick={() => setActiveTab('attendance')} className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Users size={18} className="mr-3" /> Asistencias
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={onLogout} className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
            <LogOut size={18} className="mr-3" /> Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Mi Perfil</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input value={profName} onChange={e => setProfName(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" placeholder="Nombre completo" />
                <input value={profRole} onChange={e => setProfRole(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none" placeholder="Cargo" />
              </div>
              <SignaturePad onSave={setProfSignature} className="h-40" />
              {profSignature && (
                <div className="bg-white/5 p-4 rounded-lg flex items-center gap-4">
                  <img src={profSignature} className="h-10 invert opacity-50" alt="Vista previa firma" />
                  <span className="text-emerald-500 text-xs font-bold">Firma registrada</span>
                </div>
              )}
              <button type="button" onClick={handleSaveProfile} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all">
                Guardar Perfil
              </button>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4 text-white">Nueva Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={compName} onChange={e => setCompName(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white" placeholder="Nombre" />
                  <input value={compCuit} onChange={e => setCompCuit(e.target.value)} className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white" placeholder="CUIT" />
                </div>
                <button type="button" onClick={handleAddCompany} className="mt-4 px-6 py-2 bg-emerald-600 rounded-xl font-bold text-white">Agregar</button>
              </div>
              <div className="grid gap-4">
                {state.companies.map(c => (
                  <div key={c.id} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                    <div><p className="font-bold text-white">{c.name}</p><p className="text-slate-500 text-xs">{c.cuit}</p></div>
                    <button onClick={() => updateState({ companies: state.companies.filter(i => i.id !== c.id) })} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'trainings' && (
            <div className="space-y-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <h3 className="text-lg font-bold mb-4 text-white">Crear Capacitación</h3>
                <input value={trainTitle} onChange={e => setTrainTitle(e.target.value)} className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl mb-4 text-white" placeholder="Título del curso" />
                <div className="bg-slate-800/50 p-4 rounded-xl space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} placeholder="Nombre del link" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                    <input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="URL de Drive" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm" />
                  </div>
                  <button type="button" onClick={handleAddLink} className="text-xs text-emerald-500 font-bold">+ Añadir Link</button>
                  <div className="space-y-1">
                    {links.map(l => (
                      <div key={l.id} className="flex justify-between text-xs bg-slate-900 p-2 rounded border border-slate-800 text-slate-400">
                        <span>{l.title}</span>
                        <button onClick={() => setLinks(links.filter(i => i.id !== l.id))}><X size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={handleCreateTraining} className="mt-6 w-full py-4 bg-emerald-600 rounded-xl font-bold text-white">Publicar Capacitación</button>
              </div>

              <div className="grid gap-6">
                {state.trainings.map(t => (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-xl font-bold text-emerald-500">{t.title}</h4>
                      <button onClick={() => updateState({ trainings: state.trainings.filter(i => i.id !== t.id) })} className="text-slate-600 hover:text-red-500"><Trash2 size={20}/></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {state.companies.map(c => {
                        const url = getShareUrl(c.id, t.id);
                        return (
                          <div key={c.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
                            <p className="text-xs font-bold mb-2 text-slate-300 text-center">{c.name}</p>
                            <div className="bg-white p-2 rounded mb-3"><QRCodeSVG value={url} size={100} /></div>
                            <button onClick={() => { navigator.clipboard.writeText(url); alert("Copiado"); }} className="text-[10px] uppercase font-bold text-emerald-500">Copiar Link</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <select className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-white text-sm" value={filterCompany} onChange={e => setFilterCompany(e.target.value)}>
                    <option value="">Todas las Empresas</option>
                    {state.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-white text-sm" value={filterTraining} onChange={e => setFilterTraining(e.target.value)}>
                    <option value="">Todas las Capacitaciones</option>
                    {state.trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
                <button onClick={downloadReport} className="bg-emerald-600 px-6 py-2 rounded-xl font-bold text-white flex items-center text-sm"><Download size={16} className="mr-2"/> Reporte PDF</button>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="p-4">Empleado</th>
                      <th className="p-4">DNI</th>
                      <th className="p-4">Empresa</th>
                      <th className="p-4">Curso</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {state.attendances
                      .filter(a => (!filterCompany || a.companyId === filterCompany) && (!filterTraining || a.trainingId === filterTraining))
                      .map(a => (
                        <tr key={a.id} className="hover:bg-slate-800/50">
                          <td className="p-4 text-white font-medium">{a.employeeName}</td>
                          <td className="p-4 text-slate-400">{a.employeeDni}</td>
                          <td className="p-4 text-slate-400">{state.companies.find(c => c.id === a.companyId)?.name}</td>
                          <td className="p-4 text-emerald-500">{state.trainings.find(t => t.id === a.trainingId)?.title}</td>
                          <td className="p-4 text-right">
                            <button onClick={() => updateState({ attendances: state.attendances.filter(i => i.id !== a.id) })} className="text-slate-600 hover:text-red-500"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
