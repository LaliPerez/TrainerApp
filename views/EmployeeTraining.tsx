
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

// Generador de ID compatible
const generateId = () => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

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
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-red-500 mb-2">Error de Acceso</h2>
          <p className="text-slate-400">La capacitación o empresa solicitada no existe o el enlace es incorrecto.</p>
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
    if (!empSignature || !empName.trim() || !empDni.trim()) {
      alert('Por favor, complete todos los campos y realice su firma digital.');
      return;
    }
    const newRecord = {
      id: generateId(),
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

  const handleDownloadCertificate = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const doc = new jsPDF('landscape');
      const w = doc.internal.pageSize.getWidth();
      const h = doc.internal.pageSize.getHeight();

      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(5);
      doc.rect(10, 10, w - 20, h - 20);

      doc.setFontSize(35);
      doc.setTextColor(2, 6, 23);
      doc.text('CONSTANCIA DE ASISTENCIA', w / 2, 45, { align: 'center' });

      doc.setFontSize(18);
      doc.text('Por la presente se certifica que:', w / 2, 70, { align: 'center' });
      
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text(empName.toUpperCase(), w / 2, 90, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`Identificación: ${empDni}`, w / 2, 100, { align: 'center' });

      doc.text(`Ha completado con éxito la capacitación obligatoria:`, w / 2, 120, { align: 'center' });
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(training.title, w / 2, 130, { align: 'center' });
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`Prestada para la empresa: ${company.name}`, w / 2, 140, { align: 'center' });

      const footerY = h - 45;
      
      // Firma Instructor
      if (state.instructor?.signature) {
        doc.addImage(state.instructor.signature, 'PNG', 40, footerY - 20, 40, 20);
      }
      doc.setDrawColor(0);
      doc.line(30, footerY, 90, footerY);
      doc.setFontSize(9);
      doc.text(state.instructor?.name || 'Instructor Responsable', 60, footerY + 5, { align: 'center' });
      doc.text(state.instructor?.role || 'Firma del Instructor', 60, footerY + 10, { align: 'center' });

      // Firma Empleado
      if (empSignature) {
        doc.addImage(empSignature, 'PNG', w - 80, footerY - 20, 40, 20);
      }
      doc.line(w - 90, footerY, w - 30, footerY);
      doc.text(empName, w - 60, footerY + 5, { align: 'center' });
      doc.text('Firma del Participante', w - 60, footerY + 10, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`Emitido electrónicamente el ${new Date().toLocaleDateString()}`, w / 2, h - 15, { align: 'center' });

      doc.save(`certificado_${empName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Error al generar el certificado PDF.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 pb-24">
      <div className="mb-12">
        <p className="text-emerald-500 font-bold tracking-widest uppercase text-xs mb-2">{company.name}</p>
        <h1 className="text-4xl font-extrabold text-white mb-6">{training.title}</h1>
        
        <div className="relative pt-1">
          <div className="flex mb-3 items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              Progreso de Capacitación
            </span>
            <span className="text-lg font-black text-emerald-500">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="overflow-hidden h-3 mb-4 flex rounded-full bg-slate-800 border border-slate-700 p-0.5">
            <div style={{ width: `${progress}%` }} className="flex flex-col text-center whitespace-nowrap text-white justify-center bg-emerald-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(16,185,129,0.4)]"></div>
          </div>
        </div>
      </div>

      {!isSubmitted ? (
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 bg-slate-800/30">
              <h3 className="font-bold flex items-center text-slate-200 uppercase tracking-widest text-xs"><FileText size={18} className="mr-3 text-emerald-500" /> Material de Estudio Obligatorio</h3>
            </div>
            <div className="p-4 space-y-2">
              {training.links.map(l => (
                <div 
                  key={l.id} 
                  className={`group flex items-center justify-between p-4 rounded-2xl transition-all cursor-pointer border ${viewedLinks.includes(l.id) ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-950/50 border-transparent hover:bg-slate-800'}`}
                  onClick={() => toggleLink(l.id)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {viewedLinks.includes(l.id) ? (
                      <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                    ) : (
                      <Circle className="text-slate-700 shrink-0" size={24} />
                    )}
                    <span className={`font-bold text-sm transition-all ${viewedLinks.includes(l.id) ? 'text-emerald-500/70' : 'text-slate-100'}`}>{l.title}</span>
                  </div>
                  <a 
                    href={l.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!viewedLinks.includes(l.id)) toggleLink(l.id);
                    }}
                    className="p-3 bg-slate-800 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all ml-4 flex items-center shadow-lg"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {progress === 100 && (
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mb-4 ring-8 ring-emerald-500/5">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-white">Contenido Completado</h3>
                <p className="text-slate-400 text-sm mt-2">Por favor, registre su firma para validar la asistencia y obtener su certificado.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre y Apellido</label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 text-slate-500" size={18} />
                      <input 
                        value={empName} 
                        onChange={e => setEmpName(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-white outline-none transition-all" 
                        placeholder="Nombre completo"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Documento / DNI</label>
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-4 text-slate-500" size={18} />
                      <input 
                        value={empDni} 
                        onChange={e => setEmpDni(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-slate-800 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 text-white outline-none transition-all" 
                        placeholder="DNI del participante"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Firma Digital</label>
                  <SignaturePad onSave={setEmpSignature} className="h-44 border-slate-700 shadow-inner" />
                </div>

                <button 
                  type="submit" 
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-900/40 flex items-center justify-center transform active:scale-[0.98] uppercase tracking-widest text-sm"
                >
                  Registrar Firma de Asistencia <ChevronRight size={20} className="ml-2" />
                </button>
              </form>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center space-y-10 animate-in zoom-in duration-500 pt-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-600 text-white shadow-2xl">
              <Award size={56} />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-white">¡Asistencia Registrada!</h2>
            <p className="text-slate-400 font-medium">Su capacitación ha finalizado correctamente. Descargue su comprobante oficial a continuación.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
            <button 
              type="button"
              onClick={handleDownloadCertificate}
              className="flex items-center justify-center py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
            >
              <Download size={20} className="mr-3" /> Descargar Constancia
            </button>
            <button 
              type="button"
              onClick={() => {
                alert("Proceso finalizado. Muchas gracias.");
                window.location.hash = "#/";
              }}
              className="flex items-center justify-center py-5 bg-slate-800 hover:bg-slate-700 text-white font-black rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              Cerrar y Salir
            </button>
          </div>
          
          <p className="text-[10px] text-slate-700 pt-16 font-black uppercase tracking-[0.3em]">TrainerPro System © 2025</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeTraining;
