
import React, { useState } from 'react';
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
  Download
} from 'lucide-react';
import { AppState, LinkItem, Company, Training } from '../types';
import SignaturePad from '../components/SignaturePad';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';

interface AdminDashboardProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, updateState, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'companies' | 'trainings' | 'attendance'>('profile');
  
  // Profile Form
  const [profName, setProfName] = useState(state.instructor?.name || '');
  const [profRole, setProfRole] = useState(state.instructor?.role || '');
  const [profSignature, setProfSignature] = useState(state.instructor?.signature || '');

  // Company Form
  const [compName, setCompName] = useState('');
  const [compCuit, setCompCuit] = useState('');

  // Training Form
  const [trainTitle, setTrainTitle] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Filtering
  const [filterCompany, setFilterCompany] = useState('');
  const [filterTraining, setFilterTraining] = useState('');

  const saveProfile = () => {
    updateState({ instructor: { name: profName, role: profRole, signature: profSignature } });
    alert('Perfil guardado');
  };

  const addCompany = () => {
    if (!compName || !compCuit) return;
    const newCompany: Company = { id: crypto.randomUUID(), name: compName, cuit: compCuit };
    updateState({ companies: [...state.companies, newCompany] });
    setCompName('');
    setCompCuit('');
  };

  const removeCompany = (id: string) => {
    updateState({ companies: state.companies.filter(c => c.id !== id) });
  };

  const addLink = () => {
    if (!newLinkTitle || !newLinkUrl) return;
    setLinks([...links, { id: crypto.randomUUID(), title: newLinkTitle, url: newLinkUrl }]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const addTraining = () => {
    if (!trainTitle || links.length === 0) return;
    const newTraining: Training = { id: crypto.randomUUID(), title: trainTitle, links };
    updateState({ trainings: [...state.trainings, newTraining] });
    setTrainTitle('');
    setLinks([]);
  };

  const removeTraining = (id: string) => {
    updateState({ trainings: state.trainings.filter(t => t.id !== id) });
  };

  const removeAttendance = (id: string) => {
    updateState({ attendances: state.attendances.filter(a => a.id !== id) });
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Registro de Asistencias - TrainerPro', 20, 20);
    doc.setFontSize(12);
    
    let y = 40;
    const filtered = state.attendances.filter(a => 
      (!filterCompany || a.companyId === filterCompany) && 
      (!filterTraining || a.trainingId === filterTraining)
    );

    filtered.forEach((a, i) => {
      const comp = state.companies.find(c => c.id === a.companyId)?.name;
      const train = state.trainings.find(t => t.id === a.trainingId)?.title;
      doc.text(`${i + 1}. ${a.employeeName} - DNI: ${a.employeeDni}`, 20, y);
      doc.text(`   Empresa: ${comp} | Capacitación: ${train}`, 20, y + 7);
      doc.text(`   Fecha: ${new Date(a.timestamp).toLocaleString()}`, 20, y + 14);
      y += 25;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.save('asistencias_trainerpro.pdf');
  };

  const getShareUrl = (companyId: string, trainingId: string) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}#/training?cid=${companyId}&tid=${trainingId}`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-emerald-500">TrainerPro</h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Panel Instructor</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Settings size={18} className="mr-3" />
            <span>Mi Perfil</span>
          </button>
          <button 
            onClick={() => setActiveTab('companies')}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'companies' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Building2 size={18} className="mr-3" />
            <span>Empresas</span>
          </button>
          <button 
            onClick={() => setActiveTab('trainings')}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'trainings' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <BookOpen size={18} className="mr-3" />
            <span>Capacitaciones</span>
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users size={18} className="mr-3" />
            <span>Asistencias</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={18} className="mr-3" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white capitalize">
            {activeTab === 'profile' && 'Configuración de Instructor'}
            {activeTab === 'companies' && 'Gestión de Empresas'}
            {activeTab === 'trainings' && 'Módulos de Capacitación'}
            {activeTab === 'attendance' && 'Registro de Asistencias'}
          </h1>
        </header>

        <div className="max-w-4xl">
          {activeTab === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Nombre Completo</label>
                  <input 
                    value={profName} 
                    onChange={e => setProfName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500" 
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Cargo / Especialidad</label>
                  <input 
                    value={profRole} 
                    onChange={e => setProfRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500" 
                    placeholder="Ej: Instructor de Seguridad e Higiene"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Firma Digital</label>
                <SignaturePad onSave={setProfSignature} className="mb-4" />
                {profSignature && (
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <p className="text-xs text-slate-500 mb-2 uppercase">Previsualización de Firma:</p>
                    <img src={profSignature} alt="Signature Preview" className="h-16 invert" />
                  </div>
                )}
              </div>
              <button 
                onClick={saveProfile}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold transition-all"
              >
                Guardar Perfil
              </button>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="space-y-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center"><Plus size={20} className="mr-2 text-emerald-500" /> Nueva Empresa</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    value={compName} 
                    onChange={e => setCompName(e.target.value)}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl" 
                    placeholder="Nombre de la empresa"
                  />
                  <input 
                    value={compCuit} 
                    onChange={e => setCompCuit(e.target.value)}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl" 
                    placeholder="CUIT"
                  />
                </div>
                <button onClick={addCompany} className="mt-4 px-6 py-2 bg-emerald-600 rounded-xl font-bold hover:bg-emerald-500">Agregar Empresa</button>
              </div>

              <div className="grid gap-4">
                {state.companies.map(c => (
                  <div key={c.id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl flex justify-between items-center group">
                    <div>
                      <p className="font-bold text-lg text-white">{c.name}</p>
                      <p className="text-slate-500 text-sm">CUIT: {c.cuit}</p>
                    </div>
                    <button onClick={() => removeCompany(c.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'trainings' && (
            <div className="space-y-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center"><Plus size={20} className="mr-2 text-emerald-500" /> Nueva Capacitación</h3>
                <input 
                  value={trainTitle} 
                  onChange={e => setTrainTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl mb-6" 
                  placeholder="Título de la capacitación"
                />
                
                <div className="bg-slate-800/50 p-4 rounded-xl space-y-4">
                  <p className="text-sm font-bold text-slate-300">Contenido (Links de Drive)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} placeholder="Título del archivo" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm" />
                    <input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://drive.google.com/..." className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm" />
                  </div>
                  <button onClick={addLink} className="text-sm text-emerald-500 flex items-center font-semibold"><Plus size={16} className="mr-1" /> Añadir link</button>
                  
                  <div className="space-y-2 pt-2">
                    {links.map(l => (
                      <div key={l.id} className="flex justify-between items-center text-xs bg-slate-900 px-3 py-2 rounded-lg">
                        <span className="truncate max-w-[200px]">{l.title}</span>
                        <button onClick={() => setLinks(links.filter(i => i.id !== l.id))} className="text-red-500"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={addTraining} className="mt-6 w-full px-6 py-3 bg-emerald-600 rounded-xl font-bold hover:bg-emerald-500">Crear Capacitación</button>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold flex items-center text-white"><Share2 size={24} className="mr-3 text-emerald-500" /> Generar Accesos QR</h3>
                {state.trainings.map(t => (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-xl font-bold text-white">{t.title}</h4>
                      <button onClick={() => removeTraining(t.id)} className="text-slate-600 hover:text-red-500"><Trash2 size={20} /></button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {state.companies.map(c => {
                        const url = getShareUrl(c.id, t.id);
                        return (
                          <div key={c.id} className="flex flex-col items-center p-4 bg-slate-800 rounded-xl border border-slate-700">
                            <p className="text-sm font-bold mb-3">{c.name}</p>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="bg-white p-2 rounded-lg mb-3 block hover:opacity-80 transition-opacity">
                              <QRCodeSVG value={url} size={120} />
                            </a>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(url);
                                alert('Link copiado al portapapeles');
                              }}
                              className="text-xs flex items-center text-emerald-500 hover:underline"
                            >
                              <Share2 size={12} className="mr-1" /> Copiar Link
                            </button>
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
              <div className="flex gap-4 mb-8">
                <select 
                  className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl flex-1 text-white"
                  value={filterCompany}
                  onChange={e => setFilterCompany(e.target.value)}
                >
                  <option value="">Todas las empresas</option>
                  {state.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select 
                  className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl flex-1 text-white"
                  value={filterTraining}
                  onChange={e => setFilterTraining(e.target.value)}
                >
                  <option value="">Todas las capacitaciones</option>
                  {state.trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
                <button 
                  onClick={downloadReport}
                  className="px-6 bg-emerald-600 rounded-xl font-bold flex items-center hover:bg-emerald-500"
                >
                  <Download size={20} className="mr-2" /> PDF
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                  <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
                    <tr>
                      <th className="px-6 py-4 font-medium">Empleado</th>
                      <th className="px-6 py-4 font-medium">DNI</th>
                      <th className="px-6 py-4 font-medium">Empresa</th>
                      <th className="px-6 py-4 font-medium">Capacitación</th>
                      <th className="px-6 py-4 font-medium">Fecha</th>
                      <th className="px-6 py-4 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {state.attendances
                      .filter(a => (!filterCompany || a.companyId === filterCompany) && (!filterTraining || a.trainingId === filterTraining))
                      .map(a => (
                        <tr key={a.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-4 font-bold">{a.employeeName}</td>
                          <td className="px-6 py-4">{a.employeeDni}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{state.companies.find(c => c.id === a.companyId)?.name}</td>
                          <td className="px-6 py-4 text-slate-400 text-sm">{state.trainings.find(t => t.id === a.trainingId)?.title}</td>
                          <td className="px-6 py-4 text-slate-500 text-xs">{new Date(a.timestamp).toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <button onClick={() => removeAttendance(a.id)} className="text-slate-600 hover:text-red-500">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {state.attendances.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Aún no hay registros de asistencia cargados.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
