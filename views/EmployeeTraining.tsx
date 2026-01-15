
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppState, Training, Company } from '../types';
import { 
  CheckCircle, 
  Circle, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  Award,
  ChevronRight,
  User,
  CreditCard,
  FileText
} from 'lucide-react';
import SignaturePad from '../components/SignaturePad';
import { jsPDF } from 'jspdf';

interface EmployeeTrainingProps {
  state: AppState;
  updateState: (newState: Partial<AppState>) => void;
}

const EmployeeTraining: React.FC<EmployeeTrainingProps> = ({ state, updateState }) => {
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('cid');
  const trainingId = searchParams.get('tid');

  const [company, setCompany] = useState<Company | null>(null);
  const [training, setTraining] = useState<Training | null>(null);
  const [viewedLinks, setViewedLinks] = useState<string[]>([]);

  // Form
  const [empName, setEmpName] = useState('');
  const [empDni, setEmpDni] = useState('');
  const [empSignature, setEmpSignature] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (companyId && trainingId) {
      setCompany(state.companies.find(c => c.id === companyId) || null);
      setTraining(state.trainings.find(t => t.id === trainingId) || null);
    }
  }, [companyId, trainingId, state]);

  if (!company || !training) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div>
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error de Acceso</h2>
          <p className="text-slate-400">Capacitación o Empresa no encontrada. Verifique el enlace.</p>
        </div>
      </div>
    );
  }

  const toggleLink = (id: string) => {
    setViewedLinks(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const progress = (viewedLinks.length / training.links.length) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empSignature || !empName || !empDni) {
      alert('Por favor, complete todos los campos y firme la asistencia.');
      return;
    }
    const newRecord = {
      id: crypto.randomUUID(),
      trainingId: training.id,
      companyId: company.id,
      employeeName: empName,
      employeeDni: empDni,
      signature: empSignature,
      timestamp: Date.now()
    };
    updateState({ attendances: [...state.attendances, newRecord] });
    setIsSubmitted(true);
  };

  const downloadCertificate = () => {
    const doc = new jsPDF('landscape');
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();

    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(5);
    doc.rect(10, 10, w - 20, h - 20);

    doc.setFontSize(40);
    doc.setTextColor(2, 6, 23);
    doc.text('CONSTANCIA DE CAPACITACIÓN', w / 2, 50, { align: 'center' });

    doc.setFontSize(20);
    doc.text('Certificamos que', w / 2, 75, { align: 'center' });
    
    doc.setFontSize(30);
    doc.setFont('helvetica', 'bold');
    doc.text(empName.toUpperCase(), w / 2, 95, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text(`DNI: ${empDni}`, w / 2, 105, { align: 'center' });

    doc.text(`Ha completado satisfactoriamente la capacitación de:`, w / 2, 125, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.text(training.title, w / 2, 135, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Para la empresa: ${company.name}`, w / 2, 145, { align: 'center' });

    const footerY = h - 45;
    
    if (state.instructor?.signature) {
      doc.addImage(state.instructor.signature, 'PNG', 40, footerY - 20, 40, 20);
    }
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(30, footerY, 90, footerY);
    doc.setFontSize(10);
    doc.text(state.instructor?.name || 'Instructor', 60, footerY + 5, { align: 'center' });
    doc.text(state.instructor?.role || 'Instructor Responsable', 60, footerY + 10, { align: 'center' });

    if (empSignature) {
      doc.addImage(empSignature, 'PNG', w - 80, footerY - 20, 40, 20);
    }
    doc.line(w - 90, footerY, w - 30, footerY);
    doc.text(empName, w - 60, footerY + 5, { align: 'center' });
    doc.text('Firma del Capacitado', w - 60, footerY + 10, { align: 'center' });

    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, w / 2, h - 15, { align: 'center' });

    doc.save(`constancia_${empName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 pb-24">
      <div className="mb-12">
        <p className="text-emerald-500 font-bold tracking-widest uppercase text-xs mb-2">{company.name}</p>
        <h1 className="text-4xl font-extrabold text-white mb-4">{training.title}</h1>
        
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-200/10">
                Progreso de Lectura
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-emerald-600">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-800">
            <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 transition-all duration-500"></div>
          </div>
        </div>
      </div>

      {!isSubmitted ? (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-800/50">
              <h3 className="font-bold flex items-center text-slate-200"><FileText size={20} className="mr-2 text-emerald-500" /> Contenido Obligatorio</h3>
            </div>
            <div className="p-2">
              {training.links.map(l => (
                <div 
                  key={l.id} 
                  className="group flex items-center justify-between p-4 hover:bg-slate-800 active:bg-slate-700/50 rounded-xl transition-all cursor-pointer"
                  onClick={() => toggleLink(l.id)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {viewedLinks.includes(l.id) ? (
                      <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                    ) : (
                      <Circle className="text-slate-600 shrink-0" size={24} />
                    )}
                    <span className={`font-medium transition-all ${viewedLinks.includes(l.id) ? 'text-slate-500 line-through' : 'text-slate-100'}`}>{l.title}</span>
                  </div>
                  <a 
                    href={l.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation(); // IMPORTANTE: Evita el doble toggle
                      if (!viewedLinks.includes(l.id)) toggleLink(l.id);
                    }}
                    className="p-3 bg-slate-800 text-emerald-500 rounded-lg hover:bg-emerald-500 hover:text-white active:scale-95 transition-all ml-4"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {progress === 100 && (
            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white">¡Contenido Completado!</h3>
                <p className="text-slate-400">Complete su firma de asistencia para finalizar el proceso.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Nombre y Apellido</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 text-slate-500" size={18} />
                      <input 
                        value={empName} 
                        onChange={e => setEmpName(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white transition-all" 
                        placeholder="Juan Carlos Pérez"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">DNI / ID</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3.5 text-slate-500" size={18} />
                      <input 
                        value={empDni} 
                        onChange={e => setEmpDni(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3.5 bg-slate-800 border border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 text-white transition-all" 
                        placeholder="XXXXXXXX"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Su Firma Digital</label>
                  <SignaturePad onSave={setEmpSignature} className="h-40 border-slate-700 shadow-inner" />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center transform active:scale-[0.98]"
                >
                  Registrar Asistencia Final <ChevronRight size={20} className="ml-2" />
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center space-y-8 animate-in zoom-in duration-300">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500 text-white shadow-2xl shadow-emerald-500/30">
            <Award size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">¡Registro Exitoso!</h2>
            <p className="text-slate-400">Su asistencia ha sido procesada. Puede descargar su comprobante ahora.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={downloadCertificate}
              className="flex items-center justify-center py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              <Download size={20} className="mr-2" /> Descargar Constancia
            </button>
            <button 
              onClick={() => {
                alert("Gracias por completar la capacitación. Ya puede cerrar esta ventana.");
                try { window.close(); } catch(e) {}
              }}
              className="flex items-center justify-center py-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-bold rounded-xl transition-all active:scale-95"
            >
              Finalizar y Salir
            </button>
          </div>
          
          <p className="text-sm text-slate-600 pt-12">© 2025 TrainerPro System - Módulo de Capacitación</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTraining;
