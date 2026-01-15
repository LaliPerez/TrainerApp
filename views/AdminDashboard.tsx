
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

// Helper para generar IDs si crypto.randomUUID no está disponible
const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 11);
};

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
    if (!profName.trim() || !profRole.trim()) {
      alert('Por favor, complete su nombre y cargo antes de guardar.');
      return;
    }
    if (!profSignature) {
      alert('Por favor, firme digitalmente antes de guardar su perfil.');
      return;
    }
    updateState({ instructor: { name: profName, role: profRole, signature: profSignature } });
    alert('Perfil de instructor guardado correctamente.');
  };

  const addCompany = () => {
    if (!compName.trim() || !compCuit.trim()) {
      alert('Complete nombre y CUIT de la empresa.');
      return;
    }
    const newCompany: Company = { id: generateId(), name: compName, cuit: compCuit };
    updateState({ companies: [...state.companies, newCompany] });
    setCompName('');
    setCompCuit('');
  };

  const removeCompany = (id: string) => {
    if (confirm('¿Está seguro de eliminar esta empresa?')) {
      updateState({ companies: state.companies.filter(c => c.id !== id) });
    }
  };

  const addLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      alert('Debe ingresar un título y una URL para el link.');
      return;
    }
    setLinks([...links, { id: generateId(), title: newLinkTitle, url: newLinkUrl }]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const addTraining = () => {
    if (!trainTitle.trim()) {
      alert('Ingrese un título para la capacitación.');
      return;
    }
    if (links.length === 0) {
      alert('Debe añadir al menos un link de contenido (Drive) a la capacitación.');
      return;
    }
    const newTraining: Training = { id: generateId(), title: trainTitle, links };
    updateState({ trainings: [...state.trainings, newTraining] });
    setTrainTitle('');
    setLinks([]);
    alert('Capacitación creada con éxito.');
  };

  const removeTraining = (id: string) => {
    if (confirm('¿Eliminar esta capacitación?')) {
      updateState({ trainings: state.trainings.filter(t => t.id !== id) });
    }
  };

  const removeAttendance = (id: string) => {
    if (confirm('¿Eliminar este registro de asistencia?')) {
      updateState({ attendances: state.attendances.filter(a => a.id !== id) });
    }
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

    if (filtered.length === 0) {
      alert('No hay registros para exportar con los filtros seleccionados.');
      return;
    }

    filtered.forEach((a, i) => {
      const comp = state.companies.find(c => c.id === a.companyId)?.name || 'Empresa eliminada';
      const train = state.trainings.find(t => t.id === a.trainingId)?.title || 'Capacitación eliminada';
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
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-bold text-emerald-500">TrainerPro</h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Panel Instructor</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Settings size={18} className="mr-3" />
            <span>Mi Perfil</span>
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('companies')}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'companies' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Building2 size={18} className="mr-3" />
            <span>Empresas</span>
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('trainings')}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'trainings' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <BookOpen size={18} className="mr-3" />
            <span>Capacitaciones</span>
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center w-full px-4 py-3 rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users size={18} className="mr-3" />
            <span>Asistencias</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            type="button"
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={18} className="mr-3" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Nombre Completo</label>
                  <input 
                    value={profName} 
                    onChange={e => setProfName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white" 
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Cargo / Especialidad</label>
                  <input 
                    value={profRole} 
                    onChange={e => setProfRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white" 
                    placeholder="Ej: Instructor de Seguridad e Higiene"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Firma Digital del Instructor</label>
                <SignaturePad onSave={setProfSignature} className="mb-4" />
                {profSignature && (
                  <div className="mt-4 p-4 bg-white/5 border border-slate-800 rounded-lg">
                    <p className="text-xs text-slate-500 mb-2 uppercase">Firma Actual Registrada:</p>
                    <img src={profSignature} alt="Signature Preview" className="h-16 invert opacity-80" />
                  </div>
                )}
              </div>
              <button 
                type="button"
                onClick={saveProfile}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 text-white"
              >
                Guardar Perfil de Instructor
              </button>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="space-y-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center"><Plus size={20} className="mr-2 text-emerald-500" /> Registrar Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    value={compName} 
                    onChange={e => setCompName(e.target.value)}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                    placeholder="Nombre de la empresa"
                  />
                  <input 
                    value={compCuit} 
                    onChange={e => setCompCuit(e.target.value)}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white" 
                    placeholder="CUIT (20-XXXXXXXX-X)"
                  />
                </div>
                <button type="button" onClick={addCompany} className="mt-4 px-6 py-2.5 bg-emerald-600 rounded-xl font-bold hover:bg-emerald-500 active:scale-95 transition-all">Agregar Empresa</button>
              </div>

              <div className="grid gap-4">
                {state.companies.map(c => (
                  <div key={c.id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl flex justify-between items-center group">
                    <div>
                      <p className="font-bold text-lg text-white">{c.name}</p>
                      <p className="text-slate-500 text-sm">CUIT: {c.cuit}</p>
                    </div>
                    <button type="button" onClick={() => removeCompany(c.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors">
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
                <h3 className="text-lg font-bold mb-4 flex items-center"><Plus size={20} className="mr-2 text-emerald-500" /> Configurar Capacitación</h3>
                <input 
                  value={trainTitle} 
                  onChange={e => setTrainTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl mb-6 text-white" 
                  placeholder="Título de la capacitación (Ej: Prevención de Incendios)"
                />
                
                <div className="bg-slate-800/50 p-4 rounded-xl space-y-4 border border-slate-700/50">
                  <p className="text-sm font-bold text-slate-300">Añadir Módulos (Google Drive / PDF)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} placeholder="Título del archivo" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white" />
                    <input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="Enlace de Drive" className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white" />
                  </div>
                  <button type="button" onClick={addLink} className="text-sm text-emerald-500 flex items-center font-bold hover:text-emerald-400"><Plus size={16} className="mr-1" /> Añadir link a la lista</button>
                  
                  <div className="space-y-2 pt-2 border-t border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Links preparados:</p>
                    {links.map(l => (
                      <div key={l.id} className="flex justify-between items-center text-xs bg-slate-950 px-4 py-2.5 rounded-lg border border-slate-800">
                        <span className="truncate max-w-[250px] text-slate-300">{l.title}</span>
                        <button type="button" onClick={() => setLinks(links.filter(i => i.id !== l.id))} className="text-red-500 hover:text-red-400 p-1"><X size={16} /></button>
                      </div>
                    ))}
                    {links.length === 0 && <p className="text-xs text-slate-600 italic">No hay links añadidos aún.</p>}
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={addTraining} 
                  className="mt-6 w-full px-6 py-4 bg-emerald-600 rounded-xl font-bold hover:bg-emerald-500 active:scale-[0.99] transition-all text-white shadow-lg shadow-emerald-900/20"
                >
                  Confirmar y Crear Capacitación
                </button>
              </div>

              <div className="space-y-6 pt-8">
                <h3 className="text-xl font-bold flex items-center text-white border-b border-slate-800 pb-2"><Share2 size={24} className="mr-3 text-emerald-500" /> QR de Acceso por Empresa</h3>
                {state.trainings.length === 0 && <p className="text-slate-500 text-center py-8">No ha creado ninguna capacitación todavía.</p>}
                {state.trainings.map(t => (
                  <div key={t.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-xl font-bold text-emerald-500">{t.title}</h4>
                      <button type="button" onClick={() => removeTraining(t.id)} className="text-slate-600 hover:text-red-500 p-1 transition-colors"><Trash2 size={20} /></button>
                    </div>
                    
                    {state.companies.length === 0 && <p className="text-xs text-slate-600">Registre empresas primero para generar sus QRs.</p>}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {state.companies.map(c => {
                        const url = getShareUrl(c.id, t.id);
                        return (
                          <div key={c.id} className="flex flex-col items-center p-5 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800/60 transition-colors">
                            <p className="text-sm font-bold mb-4 text-slate-200 text-center h-10 flex items-center">{c.name}</p>
                            <div className="bg-white p-3 rounded-xl mb-4 shadow-xl">
                              <QRCodeSVG value={url} size={140} />
                            </div>
                            <div className="flex flex-col gap-2 w-full">
                              <button 
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(url);
                                  alert('Enlace de capacitación copiado.');
                                }}
                                className="text-xs py-2 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center font-bold text-emerald-400 transition-colors"
                              >
                                <Share2 size={12} className="mr-1.5" /> Copiar Link
                              </button>
                            </div>
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
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap gap-4 mb-8 shadow-xl">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Filtrar por Empresa</label>
                  <select 
                    className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl w-full text-white text-sm"
                    value={filterCompany}
                    onChange={e => setFilterCompany(e.target.value)}
                  >
                    <option value="">Todas las empresas</option>
                    {state.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1 ml-1">Filtrar por Curso</label>
                  <select 
                    className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl w-full text-white text-sm"
                    value={filterTraining}
                    onChange={e => setFilterTraining(e.target.value)}
                  >
                    <option value="">Todas las capacitaciones</option>
                    {state.trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    type="button"
                    onClick={downloadReport}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center shadow-lg transition-all active:scale-95"
                  >
                    <Download size={18} className="mr-2" /> Exportar Registro PDF
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800 text-slate-400 text-xs uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-5 font-bold">Empleado</th>
                        <th className="px-6 py-5 font-bold">DNI</th>
                        <th className="px-6 py-5 font-bold">Empresa</th>
                        <th className="px-6 py-5 font-bold">Capacitación</th>
                        <th className="px-6 py-5 font-bold text-center">Fecha</th>
                        <th className="px-6 py-5 font-bold"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {state.attendances
                        .filter(a => (!filterCompany || a.companyId === filterCompany) && (!filterTraining || a.trainingId === filterTraining))
                        .map(a => (
                          <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-100">{a.employeeName}</td>
                            <td className="px-6 py-4 text-slate-400">{a.employeeDni}</td>
                            <td className="px-6 py-4 text-slate-400 text-xs">{state.companies.find(c => c.id === a.companyId)?.name || 'Eliminada'}</td>
                            <td className="px-6 py-4 text-emerald-500/80 text-xs font-semibold">{state.trainings.find(t => t.id === a.trainingId)?.title || 'Eliminada'}</td>
                            <td className="px-6 py-4 text-slate-500 text-[10px] text-center">{new Date(a.timestamp).toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                              <button type="button" onClick={() => removeAttendance(a.id)} className="text-slate-600 hover:text-red-500 p-2">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {state.attendances.length === 0 && (
                  <div className="p-20 text-center text-slate-600">
                    <Users size={64} className="mx-auto mb-4 opacity-10" />
                    <p className="font-medium">No se encontraron registros con los filtros actuales.</p>
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
