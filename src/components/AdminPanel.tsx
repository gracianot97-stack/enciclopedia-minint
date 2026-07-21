import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart2, 
  ShieldAlert, 
  Power, 
  Clock, 
  RefreshCw, 
  X, 
  Circle, 
  AlertTriangle, 
  CheckCircle2,
  Lock,
  Key,
  Mail,
  ShieldCheck,
  Trash2,
  Plus,
  Activity,
  Radio
} from 'lucide-react';
import { parseApiResponse } from '../lib/apiHelpers';
import { MAIN_ADMIN_EMAIL } from '../lib/constants';

interface AdminPanelProps {
  token: string;
  onClose: () => void;
  isMaintenanceActive: boolean;
  onToggleMaintenance: (targetState: boolean) => Promise<void>;
  onToggleUserStatus: (userId: string, currentStatus: string) => Promise<void>;
  user: { id: string; name: string; email: string; role: string };
}

export default function AdminPanel({
  token,
  onClose,
  isMaintenanceActive,
  onToggleMaintenance,
  onToggleUserStatus,
  user
}: AdminPanelProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'utilizadores' | 'simulados'>('utilizadores');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [togglingMaintenance, setTogglingMaintenance] = useState(false);

  // Estados para Redefinição de Senha
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [resetUserName, setResetUserName] = useState<string | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Estados para Convite de Administrador Adjunto
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  // Estados para o Diagnóstico de Funcionamento (apenas administrador principal)
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [diagnosticsLoading, setDiagnosticsLoading] = useState(false);
  const [diagnosticsError, setDiagnosticsError] = useState<string | null>(null);
  const [terminatingEmail, setTerminatingEmail] = useState<string | null>(null);

  // Handler para terminar remotamente a sessão activa de um utilizador
  const handleTerminateSession = async (email: string) => {
    setTerminatingEmail(email);
    try {
      const res = await fetch('/api/admin/terminate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email }),
      });
      const data = await parseApiResponse(res);
      if (!res.ok) {
        throw new Error(data.error || "Erro ao terminar a sessão.");
      }
      await handleRunDiagnostics();
    } catch (err: any) {
      setDiagnosticsError(err.message || "Erro de ligação ao servidor.");
    } finally {
      setTerminatingEmail(null);
    }
  };

  // Handler para carregar o diagnóstico de funcionamento do aplicativo
  const isMainAdmin = user.email === MAIN_ADMIN_EMAIL;

  const handleRunDiagnostics = async () => {
    setDiagnosticsLoading(true);
    setDiagnosticsError(null);
    try {
      const res = await fetch('/api/admin/diagnostics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await parseApiResponse(res);
      if (!res.ok) {
        throw new Error(data.error || "Erro ao executar o diagnóstico.");
      }
      setDiagnostics(data);
    } catch (err: any) {
      setDiagnosticsError(err.message || "Erro de ligação ao servidor.");
    } finally {
      setDiagnosticsLoading(false);
    }
  };

  // Handler para Redefinir Senha de um utilizador
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetUserId || !resetNewPassword) return;
    setResetError(null);
    setResetSuccess(null);
    setResetLoading(true);

    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: resetUserId, newPassword: resetNewPassword })
      });

      const data = await parseApiResponse(res);
      if (!res.ok) {
        throw new Error(data.error || "Erro ao redefinir a palavra-passe.");
      }

      setResetSuccess(data.message || "Palavra-passe redefinida com sucesso!");
      setResetNewPassword('');
      setTimeout(() => {
        setResetUserId(null);
        setResetUserName(null);
        setResetSuccess(null);
      }, 1500);
    } catch (err: any) {
      setResetError(err.message || "Erro de ligação.");
    } finally {
      setResetLoading(false);
    }
  };

  // Handler para Convidar Administrador Adjunto
  const handleInviteDeputy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteError(null);
    setInviteSuccess(null);
    setInviteLoading(true);

    try {
      const res = await fetch('/api/admin/invite-deputy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: inviteEmail })
      });

      const data = await parseApiResponse(res);
      if (!res.ok) {
        throw new Error(data.error || "Erro ao convidar administrador adjunto.");
      }

      setInviteSuccess(data.message || "Administrador adjunto convidado!");
      setInviteEmail('');
      await loadStats();
      setTimeout(() => setInviteSuccess(null), 3000);
    } catch (err: any) {
      setInviteError(err.message || "Erro de ligação.");
    } finally {
      setInviteLoading(false);
    }
  };

  // Handler para Revogar Administrador Adjunto
  const handleRevokeDeputy = async (email: string) => {
    if (!window.confirm(`Tem a certeza que deseja revogar o cargo de administrador adjunto de ${email}?`)) {
      return;
    }
    try {
      const res = await fetch('/api/admin/revoke-deputy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });

      const data = await parseApiResponse(res);
      if (!res.ok) {
        throw new Error(data.error || "Erro ao revogar cargo.");
      }

      await loadStats();
    } catch (err: any) {
      alert(err.message || "Erro ao revogar cargo.");
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await parseApiResponse(res);
        setStats(data);
      }
    } catch (err) {
      console.error("Erro ao ler dados de administração:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [token]);

  const handleToggleMaintenanceState = async () => {
    setTogglingMaintenance(true);
    try {
      await onToggleMaintenance(!isMaintenanceActive);
      // Wait a short moment and reload stats to keep in sync
      setTimeout(loadStats, 500);
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingMaintenance(false);
    }
  };

  const handleToggleUser = async (userId: string, status: string) => {
    setUpdatingUser(userId);
    try {
      await onToggleUserStatus(userId, status);
      await loadStats();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingUser(null);
    }
  };

  // Format date helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (err) {
      return isoString;
    }
  };

  // Format time helper (seconds to MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Regras de hierarquia de autoridade para gerir utilizadores
  const canManageUser = (targetUser: any) => {
    // 1. O admin principal (gracianot97@gmail.com) pode gerir qualquer utilizador exceto ele próprio
    const isCallerMainAdmin = user.email === MAIN_ADMIN_EMAIL;
    if (isCallerMainAdmin) {
      return targetUser.email !== MAIN_ADMIN_EMAIL;
    }

    // 2. Os administradores adjuntos podem gerir APENAS estudantes normais (u.role === 'user')
    // Eles NÃO podem gerir o admin principal nem outros adjuntos
    return targetUser.role === 'user';
  };

  return (
    <div className="flex-grow flex flex-col z-10 w-full animate-fade-in print:hidden">
      
      {/* Header and Controls */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-3xl p-6 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <ShieldAlert className="w-48 h-48 text-amber-500" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-5 mb-5">
          <div>
            <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-black tracking-widest uppercase">
              Consola Operacional de Administrador
            </span>
            <h2 className="text-lg font-black text-white mt-1.5 flex items-center gap-2">
              Painel de Controlo & Estatísticas
            </h2>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {/* Diagnóstico de Funcionamento — visível apenas para o administrador principal */}
            {isMainAdmin && (
              <button
                onClick={() => {
                  setIsDiagnosticsOpen(true);
                  setDiagnostics(null);
                  setDiagnosticsError(null);
                  handleRunDiagnostics();
                }}
                className="bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 border border-indigo-500/20 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                title="Diagnóstico de funcionamento do aplicativo"
              >
                <Activity className="w-4 h-4" />
                <span>Diagnóstico do Sistema</span>
              </button>
            )}
            <button
              onClick={loadStats}
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-850 text-slate-300 p-2.5 rounded-xl border border-slate-800 transition disabled:opacity-50"
              title="Recarregar dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border border-rose-500/20 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span>Fechar Painel</span>
            </button>
          </div>
        </div>

        {/* Maintenance Control Box */}
        <div className="bg-slate-900/60 border border-slate-850 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-3 rounded-xl ${isMaintenanceActive ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400 animate-pulse' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
              <Power className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Modo de Manutenção (Tirar App do Ar)
              </h3>
              <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed mt-0.5">
                Ao ativar este modo, todos os estudantes comuns que acederem ao link serão barrados com um ecrã de bloqueio e aviso de manutenção programada. Apenas contas administradoras poderão usar a aplicação.
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleMaintenanceState}
            disabled={togglingMaintenance}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition duration-150 shadow border flex items-center gap-2 self-start md:self-auto whitespace-nowrap ${
              isMaintenanceActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-600/20'
            }`}
          >
            <Circle className={`w-3 h-3 fill-current ${isMaintenanceActive ? 'text-white' : 'text-slate-950'}`} />
            <span>{isMaintenanceActive ? "Desactivar Manutenção" : "Activar Manutenção"}</span>
          </button>
        </div>

        {/* Scorecards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="bg-slate-900 border border-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-indigo-600/10 text-indigo-400 p-3 rounded-xl border border-indigo-500/10">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block leading-none">Estudantes</span>
              <strong className="text-2xl font-black text-white block mt-1">{loading ? '...' : stats?.totalUsers || 0}</strong>
              <span className="text-[9px] text-slate-400 font-mono">Contas registadas</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-emerald-600/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/10">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block leading-none">Simulados Feitos</span>
              <strong className="text-2xl font-black text-white block mt-1">{loading ? '...' : stats?.totalSimulations || 0}</strong>
              <span className="text-[9px] text-slate-400 font-mono">Testes submetidos</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800/50 p-4 rounded-2xl flex items-center gap-4">
            <div className="bg-amber-500/10 text-amber-400 p-3 rounded-xl border border-amber-500/10">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block leading-none">Média Geral</span>
              <strong className="text-2xl font-black text-white block mt-1">{loading ? '...' : `${stats?.averageScore || 0}%`}</strong>
              <span className="text-[9px] text-slate-400 font-mono">De aproveitamento</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Tables */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-3xl flex-grow flex flex-col overflow-hidden shadow-xl">
        
        {/* Table Selector Tabs */}
        <div className="flex border-b border-slate-900 bg-slate-950">
          <button
            onClick={() => setActiveTab('utilizadores')}
            className={`px-6 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'utilizadores'
                ? 'border-indigo-500 text-white bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Utilizadores ({stats?.users?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab('simulados')}
            className={`px-6 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition flex items-center gap-2 ${
              activeTab === 'simulados'
                ? 'border-indigo-500 text-white bg-slate-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/10'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Estatísticas de Simulados ({stats?.simulations?.length || 0})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 flex-grow overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-500 mx-auto animate-spin" />
              <p className="text-xs text-slate-400">A carregar registos operacionais...</p>
            </div>
          ) : activeTab === 'utilizadores' ? (
            <div className="space-y-6">
              {/* Painel de Convite de Administrador Adjunto - Apenas visível para o admin principal (EU) */}
              {user.email === MAIN_ADMIN_EMAIL && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">
                      Convidar Administrador Adjunto (Co-Admin)
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                    Como administrador principal, pode convidar utilizadores para serem administradores adjuntos. Eles terão um nível de autoridade inferior: podem gerir estudantes e redefinir as suas palavras-passe, mas <strong>não podem</strong> alterar configurações do sistema, colocar o portal em manutenção, nem gerir outros administradores.
                  </p>
                  
                  <form onSubmit={handleInviteDeputy} className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-grow relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input 
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="email.do.adjunto@exemplo.com"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white outline-none transition font-sans"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={inviteLoading}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black transition duration-150 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{inviteLoading ? 'A processar...' : 'Convidar Administrador'}</span>
                    </button>
                  </form>

                  {inviteError && (
                    <div className="mt-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{inviteError}</span>
                    </div>
                  )}
                  {inviteSuccess && (
                    <div className="mt-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{inviteSuccess}</span>
                    </div>
                  )}

                  {/* Lista de adjuntos convidados */}
                  {stats?.invitedDeputies && stats.invitedDeputies.length > 0 && (
                    <div className="mt-4 border-t border-slate-800/60 pt-4">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                        Autorizações de Adjunto Activas / Convites Pendentes:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {stats.invitedDeputies.map((email: string) => (
                          <div key={email} className="bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-1.5 flex items-center gap-2.5 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            <span className="font-mono text-slate-300 text-[11px]">{email}</span>
                            <button
                              type="button"
                              onClick={() => handleRevokeDeputy(email)}
                              className="text-rose-400 hover:text-rose-300 transition"
                              title="Revogar cargo de adjunto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tabela de Utilizadores */}
              <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-900 text-[10px] text-slate-500 uppercase tracking-widest">
                    <th className="pb-3 px-3">Nome</th>
                    <th className="pb-3 px-3">Email</th>
                    <th className="pb-3 px-3">Criado Em</th>
                    <th className="pb-3 px-3">Função</th>
                    <th className="pb-3 px-3">Estado</th>
                    <th className="pb-3 px-3 text-right">Ações Operativas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50">
                  {stats?.users && stats.users.length > 0 ? (
                    stats.users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-slate-900/20 transition">
                        <td className="py-3 px-3 font-bold text-white">{u.name}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{u.email}</td>
                        <td className="py-3 px-3 text-slate-400">{formatDate(u.createdAt)}</td>
                        <td className="py-3 px-3">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase border ${
                            u.role === 'admin'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              : u.role === 'admin_adjunto'
                              ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                              : 'bg-indigo-600/10 border-indigo-500/10 text-indigo-400'
                          }`}>
                            {u.role === 'admin' ? 'Admin Principal' : u.role === 'admin_adjunto' ? 'Admin Adjunto' : 'Estudante'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase border flex items-center gap-1.5 w-fit ${
                            u.status === 'active'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
                            {u.status === 'active' ? 'Ativo' : 'Suspenso'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Redefinir Senha de Estudante / Utilizador */}
                            {canManageUser(u) && (
                              <button
                                onClick={() => {
                                  setResetUserId(u.id);
                                  setResetUserName(u.name);
                                  setResetError(null);
                                  setResetSuccess(null);
                                  setResetNewPassword('');
                                }}
                                className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1"
                                title="Redefinir palavra-passe"
                              >
                                <Key className="w-3.5 h-3.5 text-amber-500" />
                                <span>Senha</span>
                              </button>
                            )}

                            {/* Activar/Suspender */}
                            {canManageUser(u) ? (
                              <button
                                onClick={() => handleToggleUser(u.id, u.status)}
                                disabled={updatingUser === u.id}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition ${
                                  u.status === 'active'
                                    ? 'bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 border-rose-500/20'
                                    : 'bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                                }`}
                              >
                                {updatingUser === u.id ? '...' : u.status === 'active' ? 'Suspender' : 'Ativar'}
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-600 italic">Sem Permissões</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-500 italic">
                        Nenhum utilizador registado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-900 text-[10px] text-slate-500 uppercase tracking-widest">
                  <th className="pb-3 px-3">Estudante</th>
                  <th className="pb-3 px-3">Email</th>
                  <th className="pb-3 px-3">Data & Hora</th>
                  <th className="pb-3 px-3">Resultado</th>
                  <th className="pb-3 px-3">Tempo Gasto</th>
                  <th className="pb-3 px-3 text-right">Desempenho</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/50">
                {stats?.simulations && stats.simulations.length > 0 ? (
                  stats.simulations.map((sim: any) => {
                    const isApproved = sim.percent >= 70;
                    return (
                      <tr key={sim.id} className="hover:bg-slate-900/20 transition">
                        <td className="py-3 px-3 font-bold text-white">{sim.userName}</td>
                        <td className="py-3 px-3 font-mono text-[11px] text-slate-400">{sim.userEmail}</td>
                        <td className="py-3 px-3 text-slate-400">{formatDate(sim.date)}</td>
                        <td className="py-3 px-3 font-mono font-bold">
                          {sim.correct} / {sim.total}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-400">
                          {formatTime(sim.timeSpent)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase border inline-flex items-center gap-1 ${
                            isApproved
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                          }`}>
                            {isApproved ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {sim.percent}% ({isApproved ? 'Apto' : 'Não Apto'})
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500 italic">
                      Nenhum simulado concluído ainda por estudantes.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL DE REDEFINIÇÃO DE PALAVRA-PASSE DE ESTUDANTE */}
      {resetUserId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-white">Redefinir Palavra-passe</h3>
              </div>
              <button 
                onClick={() => {
                  setResetUserId(null);
                  setResetUserName(null);
                }}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-[11px] text-slate-400">
                Está prestes a forçar a alteração de palavra-passe do utilizador: 
                <strong className="text-white block font-sans mt-0.5">{resetUserName}</strong>
              </div>

              {resetError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Nova Palavra-passe</label>
                <input 
                  type="password" 
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition font-sans"
                  placeholder="Mínimo de 6 caracteres"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setResetUserId(null);
                    setResetUserName(null);
                  }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-black transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-xl text-xs font-black transition shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {resetLoading ? 'A guardar...' : 'Redefinir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE DIAGNÓSTICO DE FUNCIONAMENTO DO APLICATIVO (Admin Principal) */}
      {isDiagnosticsOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-black text-white">Diagnóstico de Funcionamento do Aplicativo</h3>
              </div>
              <button
                onClick={() => setIsDiagnosticsOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {diagnosticsLoading ? (
                <div className="py-14 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-500 mx-auto animate-spin" />
                  <p className="text-xs text-slate-400">A verificar todos os sistemas...</p>
                </div>
              ) : diagnosticsError ? (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>{diagnosticsError}</span>
                </div>
              ) : diagnostics ? (
                <>
                  {/* Estado Geral */}
                  <div className={`flex items-center gap-3 p-4 rounded-2xl border ${
                    diagnostics.overallStatus === 'operacional'
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : 'bg-amber-500/10 border-amber-500/20'
                  }`}>
                    {diagnostics.overallStatus === 'operacional' ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-8 h-8 text-amber-400 flex-shrink-0" />
                    )}
                    <div>
                      <p className={`text-sm font-black uppercase tracking-wide ${
                        diagnostics.overallStatus === 'operacional' ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {diagnostics.overallStatus === 'operacional' ? 'Tudo Operacional' : 'Requer Atenção'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Verificado em {formatDate(diagnostics.timestamp)} • Servidor activo há {Math.floor((diagnostics.serverUptimeSeconds || 0) / 60)} min
                      </p>
                    </div>
                  </div>

                  {/* Lista de Verificações */}
                  <div className="space-y-2.5">
                    {diagnostics.checks?.map((check: any, idx: number) => (
                      <div key={idx} className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl flex items-start gap-3">
                        {check.ok ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs font-black text-white">{check.label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{check.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumo em Números */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-center">
                      <span className="text-lg font-black text-white block">{diagnostics.summary?.totalStudents ?? 0}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Estudantes</span>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-center">
                      <span className="text-lg font-black text-white block">{diagnostics.summary?.suspendedAccounts ?? 0}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Bloqueadas</span>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-center">
                      <span className="text-lg font-black text-white block">{diagnostics.summary?.activeSessionsCount ?? 0}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Sessões Activas</span>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-center">
                      <span className="text-lg font-black text-white block">
                        {diagnostics.summary?.databaseLatencyMs !== null ? `${diagnostics.summary?.databaseLatencyMs}ms` : '—'}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Latência BD</span>
                    </div>
                  </div>

                  {/* Sessões Activas Detalhadas */}
                  {diagnostics.activeSessions && diagnostics.activeSessions.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-emerald-400" />
                        Sessões Iniciadas Neste Momento
                      </h4>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                        {diagnostics.activeSessions.map((s: any, idx: number) => (
                          <div key={idx} className="bg-slate-950/60 border border-slate-850 rounded-lg px-3 py-2 flex items-center justify-between gap-2 text-[11px]">
                            <span className="font-mono text-slate-300 truncate">{s.email}</span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-slate-500 uppercase text-[9px] font-bold">
                                {s.role === 'admin' ? 'Admin' : s.role === 'admin_adjunto' ? 'Adjunto' : 'Estudante'}
                              </span>
                              {s.email !== user.email && (
                                <button
                                  onClick={() => handleTerminateSession(s.email)}
                                  disabled={terminatingEmail === s.email}
                                  className="text-rose-400 hover:text-rose-300 disabled:opacity-40 text-[9px] font-black uppercase tracking-wide border border-rose-500/30 rounded-md px-2 py-1 transition"
                                  title="Terminar esta sessão (força o logout imediato)"
                                >
                                  {terminatingEmail === s.email ? '...' : 'Terminar'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleRunDiagnostics}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Verificar Novamente</span>
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
