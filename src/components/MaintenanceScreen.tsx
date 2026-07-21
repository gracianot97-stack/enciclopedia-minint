import { ShieldAlert, AlertTriangle, MessageSquare, ExternalLink } from 'lucide-react';

export default function MaintenanceScreen() {
  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-6 z-10 animate-fade-in">
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden text-center">
        
        {/* Visual hazard glow stripes on top */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 animate-pulse" />

        <div className="inline-flex bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-3xl shadow-xl mb-6 mt-2">
          <ShieldAlert className="w-10 h-10 animate-bounce-slow" />
        </div>

        <h2 className="text-lg font-black text-white tracking-tight uppercase">
          Portal em Manutenção
        </h2>
        <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest leading-none mt-1.5">
          Ministério do Interior • Angola
        </p>

        <div className="my-6 bg-slate-900 border border-slate-850 p-4 rounded-2xl text-left space-y-3.5">
          <p className="text-xs text-slate-300 leading-relaxed">
            Estimado candidato, informamos que o portal de fascículos académicos está temporariamente offline para manutenção programada e sincronização de dados curriculares.
          </p>
          <div className="border-t border-slate-800/60 pt-3 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-normal">
              Novas inscrições, leituras de fascículos e simulações de gabarito estão suspensas temporariamente. O seu histórico de pontuação está guardado em segurança.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            Suporte e Dúvidas Académicas
          </p>
          <div className="flex items-center justify-center gap-2 text-indigo-400 hover:text-indigo-300 transition text-xs font-bold bg-slate-900/40 p-2.5 border border-slate-850 rounded-xl">
            <MessageSquare className="w-4 h-4 text-indigo-400" />
            <span>Contacto: Ivany Tomás Multivendas</span>
          </div>
        </div>

        <div className="text-[9px] text-slate-600 mt-6 pt-4 border-t border-slate-900/60 font-mono">
          OPERATIONAL MAINTENANCE STATUS • 503 SERVICE UNAVAILABLE
        </div>
      </div>
    </div>
  );
}
