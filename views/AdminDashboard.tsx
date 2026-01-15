
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
  // Fix: Added missing imports for CheckCircle and ExternalLink
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { AppState, LinkItem, Company, Training } from '../types';
import SignaturePad from '../components/SignaturePad';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';

// Helper robusto para generar IDs
const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch (e) {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
};

interface AdminDashboardProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ state, updateState, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'companies' | 'trainings' | 'attendance'>('profile');
  
  // Profile Form - Inicializado con el estado actual
  const [profName, setProfName] = useState(state.instructor?.name || '');
  const [profRole, setProfRole] = useState(state.instructor?.role || '');
  const [profSignature, setProfSignature] = useState(state.instructor?.signature || '');

  // Sincronizar el formulario de perfil si el estado global cambia (ej: al cargar)
  useEffect(() => {
    if (state.instructor) {
      setProfName(state.instructor.name);
      setProfRole(state.instructor.role);
      setProfSignature(state.instructor.signature);
    }
  }, [state.instructor]);

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

  const saveProfile = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    if (!profName.trim() || !profRole.trim()) {
      alert('Por favor, complete su nombre y cargo.');
      return;
    }
    if (!profSignature) {
      alert('Debe realizar su firma digital para poder guardar el perfil.');
      return;
    }

    updateState({ 
      instructor: { 
        name: profName, 
        role: profRole, 
        signature: profSignature 
      } 
    });
    
    alert('¡Perfil actualizado con éxito!');
  };

  const addCompany = (e: React.MouseEvent) => {
    e.preventDefault();
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

  const addLink = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      alert('Debe ingresar un título y una URL.');
      return;
    }
    setLinks([...links, { id: generateId(), title: newLinkTitle, url: newLinkUrl }]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const addTraining = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!trainTitle.trim()) {
      alert('Ingrese un título para la capacitación.');
      return;
    }
    if (links.length === 0) {
      alert('Debe añadir al menos un enlace de contenido (Drive/PDF).');
      return;
    }
    
    const newTraining: Training = { 
      id: generateId(), 
      title: trainTitle, 
      links: [...links] 
    };
    
    updateState({ trainings: [...state.trainings, newTraining] });
    
    // Resetear formulario
    setTrainTitle('');
    setLinks([]);
    alert('Capacitación creada y lista para compartir.');
  };

  const removeTraining = (id: string) => {
    if (confirm('¿Eliminar esta capacitación?')) {
      updateState({ trainings: state.trainings.filter(t => t.id !== id) });
    }
  };

  const removeAttendance = (id: string) => {
    if (confirm('¿Desea borrar este registro de asistencia individualmente?')) {
      updateState({ attendances: state.attendances.filter(a => a.id !== id) });
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Registro de Asistencias - TrainerPro', 20, 20);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 20, 30);
    
    let y = 45;
    const filtered = state.attendances.filter(a => 
      (!filterCompany || a.companyId === filterCompany) && 
      (!filterTraining || a.trainingId === filterTraining)
    );

    if (filtered.length === 0) {
      alert('No hay registros para exportar con los filtros actuales.');
      return;
    }

    filtered.forEach((a, i) => {
      const comp = state.companies.find(c => c.id === a.companyId)?.name || 'N/A';
      const train = state.trainings.find(t => t.id === a.trainingId)?.title || 'N/A';
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${i + 1}. ${a.employeeName} (DNI: ${a.employeeDni})`, 20, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`Empresa: ${comp} | Capacitación: ${train}`, 25, y + 6);
      doc.text(`Fecha: ${new Date(a.timestamp).toLocaleString()}`, 25, y + 12);
      
      y += 20;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.save(`asistencias_${new Date().getTime()}.pdf`);
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
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">Panel de Instructor</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {[
            { id: 'profile', label: 'Mi Perfil', icon: Settings },
            { id: 'companies', label: 'Empresas', icon: Building2 },
            { id: 'trainings', label: 'Capacitaciones', icon: BookOpen },
            { id: 'attendance', label: 'Asistencias', icon: Users },
          ].map((tab) => (
            <button 
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center w-full px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <tab.icon size={18} className="mr-3 shrink-0" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            type="button"
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut size={18} className="mr-3" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-extrabold text-white">
              {activeTab === 'profile' && 'Perfil Profesional'}
              {activeTab === 'companies' && 'Empresas Vinculadas'}
              {activeTab === 'trainings' && 'Módulos de Capacitación'}
              {activeTab === 'attendance' && 'Registro de Participantes'}
            </h1>
            <p className="text-slate-500 mt-1">Gestione sus contenidos y verifique la asistencia de sus empleados.</p>
          </header>

          {activeTab === 'profile' && (
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                  <input 
                    value={profName} 
                    onChange={e => setProfName(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white transition-all outline-none" 
                    placeholder="Ej: Ing. Jorge Valdivia"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Cargo u Organismo</label>
                  <input 
                    value={profRole} 
                    onChange={e => setProfRole(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white transition-all outline-none" 
                    placeholder="Ej: Especialista en RRHH"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Firma Digital para Certificados</label>
                <SignaturePad 
                  onSave={(data) => setProfSignature(data)} 
                  onClear={() => setProfSignature('')}
                  className="mb-4 shadow-inner" 
                />
                {profSignature && (
                  <div className="mt-4 p-4 bg-slate-800/30 border border-slate-800 rounded-xl flex items-center space-x-4">
                    <div className="bg-white p-2 rounded-lg">
                      <img src={profSignature} alt="Firma Instructor" className="h-12 w-auto" />
                    </div>
                    <p className="text-xs text-emerald-500 font-medium italic">Firma capturada correctamente</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button 
                  type="button"
                  onClick={saveProfile}
                  className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/30 text-white flex items-center"
                >
                  <CheckCircle size={20} className="mr-2" /> Guardar Cambios del Perfil
                </button>
              </div>
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-bold mb-6 flex items-center text-white"><Plus size={20} className="mr-2 text-emerald-500" /> Nueva Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    value={compName} 
                    onChange={e => setCompName(e.target.value)}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-1 focus:ring-emerald-500" 
                    placeholder="Razón Social"
                  />
                  <input 
                    value={compCuit} 
                    onChange={e => setCompCuit(e.target.value)}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-1 focus:ring-emerald-500" 
                    placeholder="CUIT"
                  />
                </div>
                <button type="button" onClick={addCompany} className="mt-6 px-8 py-3 bg-emerald-600 rounded-xl font-bold hover:bg-emerald-500 active:scale-95 transition-all text-white">Vincular Empresa</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.companies.map(c => (
                  <div key={c.id} className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                    <div>
                      <p className="font-bold text-xl text-white">{c.name}</p>
                      <p className="text-slate-500 text-sm font-medium tracking-tight">CUIT: {c.cuit}</p>
                    </div>
                    <button type="button" onClick={() => removeCompany(c.id)} className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
                {state.companies.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
                    <Building2 className="mx-auto text-slate-700 mb-3" size={40} />
                    <p className="text-slate-500 font-medium">No hay empresas registradas aún.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'trainings' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl">
                <h3 className="text-lg font-bold mb-6 flex items-center text-white"><Plus size={20} className="mr-2 text-emerald-500" /> Crear Nueva Capacitación</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Nombre del Curso</label>
                    <input 
                      value={trainTitle} 
                      onChange={e => setTrainTitle(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-800 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all" 
                      placeholder="Ej: Seguridad en el Trabajo - Nivel 1"
                    />
                  </div>
                  
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                    <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center">
                      <FileText size={16} className="mr-2 text-emerald-500" /> Adjuntar Enlaces de Contenido
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input value={newLinkTitle} onChange={e => setNewLinkTitle(e.target.value)} placeholder="Título del Material" className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" />
                      <input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="URL (Google Drive, PDF, etc)" className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white" />
                    </div>
                    <button type="button" onClick={addLink} className="mt-4 inline-flex items-center text-xs font-bold text-emerald-500 hover:text-emerald-400 py-2 px-3 bg-emerald-500/10 rounded-lg transition-colors">
                      <Plus size={14} className="mr-1.5" /> Agregar a la lista
                    </button>
                    
                    <div className="mt-6 space-y-2">
                      {links.map(l => (
                        <div key={l.id} className="flex justify-between items-center text-xs bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 group">
                          <span className="truncate max-w-[300px] text-slate-300 font-medium">{l.title}</span>
                          <button type="button" onClick={() => setLinks(links.filter(i => i.id !== l.id))} className="text-slate-600 hover:text-red-500 transition-colors"><X size={16} /></button>
                        </div>
                      ))}
                      {links.length === 0 && <p className="text-xs text-slate-600 italic text-center py-4">No se han añadido enlaces aún.</p>}
                    </div>
                  </div>

                  <button 
                    type="button"
                    onClick={addTraining} 
                    className="w-full py-5 bg-emerald-600 rounded-2xl font-black text-white hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-xl shadow-emerald-900/20 uppercase tracking-widest"
                  >
                    Confirmar y Publicar Capacitación
                  </button>
                </div>
              </div>

              <div className="pt-10 space-y-8">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <h3 className="text-2xl font-bold text-white flex items-center"><QrCode size={24} className="mr-3 text-emerald-500" /> Códigos QR de Acceso</h3>
                </div>

                {state.trainings.length === 0 && <p className="text-slate-600 text-center py-12 font-medium">No hay capacitaciones creadas para generar códigos.</p>}
                
                <div className="grid grid-cols-1 gap-8">
                  {state.trainings.map(t => (
                    <div key={t.id} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <h4 className="text-2xl font-black text-emerald-500 leading-tight">{t.title}</h4>
                          <p className="text-slate-500 text-sm mt-1">{t.links.length} módulos incluidos</p>
                        </div>
                        <button type="button" onClick={() => removeTraining(t.id)} className="text-slate-700 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={24} /></button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {state.companies.map(c => {
                          const url = getShareUrl(c.id, t.id);
                          return (
                            <div key={c.id} className="flex flex-col items-center p-6 bg-slate-950/50 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all">
                              <p className="text-sm font-black mb-4 text-slate-200 text-center uppercase tracking-tighter line-clamp-1">{c.name}</p>
                              <div className="bg-white p-4 rounded-2xl mb-5 shadow-2xl">
                                <QRCodeSVG value={url} size={150} level="H" />
                              </div>
                              <div className="w-full space-y-2">
                                <button 
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(url);
                                    alert(`Enlace copiado para ${c.name}`);
                                  }}
                                  className="w-full py-2.5 bg-slate-800 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center group/btn"
                                >
                                  <Share2 size={14} className="mr-2 group-hover/btn:scale-110 transition-transform" /> Copiar Link
                                </button>
                                <a 
                                  href={url}
                                  target="_blank"
                                  className="w-full py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center"
                                >
                                  <ExternalLink size={14} className="mr-2" /> Previsualizar
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-wrap gap-4 items-end shadow-xl">
                <div className="flex-1 min-w-[200px] space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Filtrar Empresa</label>
                  <select 
                    className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl w-full text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                    value={filterCompany}
                    onChange={e => setFilterCompany(e.target.value)}
                  >
                    <option value="">Todas las empresas</option>
                    {state.companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-[200px] space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-600 tracking-widest ml-1">Filtrar Curso</label>
                  <select 
                    className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-xl w-full text-white text-sm outline-none focus:ring-1 focus:ring-emerald-500"
                    value={filterTraining}
                    onChange={e => setFilterTraining(e.target.value)}
                  >
                    <option value="">Todas las capacitaciones</option>
                    {state.trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  </select>
                </div>
                <button 
                  type="button"
                  onClick={downloadReport}
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center shadow-lg transition-all active:scale-95 shrink-0"
                >
                  <Download size={18} className="mr-2" /> Exportar PDF
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/80 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                      <tr>
                        <th className="px-8 py-5">Nombre Participante</th>
                        <th className="px-8 py-5">Identificación</th>
                        <th className="px-8 py-5">Empresa</th>
                        <th className="px-8 py-5">Módulo de Capacitación</th>
                        <th className="px-8 py-5 text-center">Fecha y Hora</th>
                        <th className="px-8 py-5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {state.attendances
                        .filter(a => (!filterCompany || a.companyId === filterCompany) && (!filterTraining || a.trainingId === filterTraining))
                        .map(a => (
                          <tr key={a.id} className="hover:bg-slate-800/30 transition-all group">
                            <td className="px-8 py-5 font-bold text-slate-100">{a.employeeName}</td>
                            <td className="px-8 py-5 text-slate-400 font-medium">{a.employeeDni}</td>
                            <td className="px-8 py-5">
                              <span className="px-3 py-1 bg-slate-800 rounded-lg text-xs text-slate-400 font-bold">{state.companies.find(c => c.id === a.companyId)?.name || 'N/A'}</span>
                            </td>
                            <td className="px-8 py-5 text-emerald-500 text-xs font-black uppercase tracking-tight">
                              {state.trainings.find(t => t.id === a.trainingId)?.title || 'N/A'}
                            </td>
                            <td className="px-8 py-5 text-slate-500 text-[10px] font-bold text-center">
                              {new Date(a.timestamp).toLocaleString()}
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button type="button" onClick={() => removeAttendance(a.id)} className="text-slate-700 hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {state.attendances.length === 0 && (
                  <div className="p-24 text-center">
                    <Users size={48} className="mx-auto mb-4 text-slate-800" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Sin registros que mostrar</p>
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
