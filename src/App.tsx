import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  BookOpen, 
  List, 
  Sparkles, 
  Printer, 
  Search, 
  Hourglass, 
  ChevronRight, 
  Award, 
  RotateCcw, 
  Wifi, 
  WifiOff, 
  Download,
  BookMarked,
  Flame,
  CheckCircle2,
  AlertTriangle,
  History,
  Trash2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Power,
  Users,
  BarChart2,
  LogOut,
  Settings,
  ShieldAlert,
  Clock,
  X,
  Cloud
} from 'lucide-react';
import { modulesData } from './data/modulesData';
import { fullQuestionsDatabase, Question } from './data/questionsData';
import AuthScreen from './components/AuthScreen';
import AdminPanel from './components/AdminPanel';
import MaintenanceScreen from './components/MaintenanceScreen';
import GoogleDriveStudyCenter from './components/GoogleDriveStudyCenter';
import { initGA, trackPageView, trackEvent } from './lib/analytics';
import { parseApiResponse } from './lib/apiHelpers';

interface SimuladoHistory {
  date: string;
  correct: number;
  total: number;
  percent: number;
}

export default function App() {
  // Abas e Navegação
  const [currentTab, setCurrentTab] = useState<'leitura' | 'perguntas' | 'simulador' | 'gdrive'>('leitura');
  const [currentModuleId, setCurrentModuleId] = useState<number>(1);

  // Estados de Conectividade & PWA
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(false);

  // Busca e Filtros no Banco de Questões
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterModule, setFilterModule] = useState<string>('all');

  // Estados do Simulador de Exame
  const [simState, setSimState] = useState<'setup' | 'active' | 'results'>('setup');
  const [simQuestions, setSimQuestions] = useState<Question[]>([]);
  const [simCurrentIndex, setSimCurrentIndex] = useState<number>(0);
  const [simSelectedOpt, setSimSelectedOpt] = useState<number | null>(null);
  const [simScore, setSimScore] = useState<number>(0);
  const [simTimerSeconds, setSimTimerSeconds] = useState<number>(0);
  const [simAnswers, setSimAnswers] = useState<number[]>([]);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [history, setHistory] = useState<SimuladoHistory[]>([]);

  // --- ESTADOS DE AUTENTICAÇÃO E ADMINISTRAÇÃO ---
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('minint_auth_token'));
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  
  // Painel Admin e Manutenção
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [isMaintenanceActive, setIsMaintenanceActive] = useState(false);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  // Estados de Alteração de Palavra-Passe
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [changePasswordSuccess, setChangePasswordSuccess] = useState<string | null>(null);
  const [isChangePasswordLoading, setIsChangePasswordLoading] = useState(false);

  // Monitorar Conectividade
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- INICIALIZAR GOOGLE ANALYTICS ---
  // Só inicializa se o dono do site configurar o seu próprio ID de medição
  // (VITE_GA_MEASUREMENT_ID). Sem isso, o Analytics simplesmente não corre —
  // evita enviar dados de utilização para uma conta que não é a sua.
  useEffect(() => {
    const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaMeasurementId) {
      initGA(gaMeasurementId);
    }
  }, []);

  // Rastrear navegação de abas no Google Analytics
  useEffect(() => {
    if (user) {
      const pageName = isAdminOpen ? 'Painel de Controlo do Administrador' : `Aba: ${currentTab}`;
      trackPageView(pageName);
    } else {
      trackPageView('Ecrã de Início de Sessão');
    }
  }, [currentTab, isAdminOpen, !!user]);

  // --- EFEITOS DE AUTENTICAÇÃO E CONFIGURAÇÃO ---
  useEffect(() => {
    // Verificar status de manutenção da aplicação
    fetch('/api/status')
      .then(res => parseApiResponse(res))
      .then(data => {
        setIsMaintenanceActive(data.maintenanceMode);
      })
      .catch(err => console.error("Erro ao verificar status do sistema:", err));

    if (token) {
      setIsAuthLoading(true);
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(async res => {
        if (!res.ok) {
          let errMsg = "Sessão inválida";
          try {
            const data = await parseApiResponse(res);
            errMsg = data.error || errMsg;
          } catch (e) {}
          throw new Error(errMsg);
        }
        return parseApiResponse(res);
      })
      .then(userData => {
        setUser(userData);
      })
      .catch((err) => {
        // Token expirado ou inválido
        localStorage.removeItem('minint_auth_token');
        setToken(null);
        setUser(null);
        if (err && err.message && err.message !== "Failed to fetch") {
          setAuthError(err.message);
        }
      })
      .finally(() => {
        setIsAuthLoading(false);
      });
    }
  }, [token]);

  // Carregar histórico do simulado a partir do servidor
  useEffect(() => {
    if (user && token) {
      fetch('/api/simulations/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(async res => {
        if (!res.ok) {
          if (res.status === 401) {
            let errMsg = "Sessão inválida ou expirada.";
            try {
              const data = await parseApiResponse(res);
              errMsg = data.error || errMsg;
            } catch (e) {}
            localStorage.removeItem('minint_auth_token');
            setToken(null);
            setUser(null);
            setAuthError(errMsg);
          }
          throw new Error("Erro ao carregar histórico");
        }
        return parseApiResponse(res);
      })
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map((sim: any) => ({
            date: new Date(sim.date).toLocaleDateString('pt-PT', {
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            correct: sim.correct,
            total: sim.total,
            percent: sim.percent
          }));
          setHistory(formatted);
        }
      })
      .catch(err => {
        console.error("Erro ao ler histórico do servidor:", err);
        // Fallback local caso o servidor falhe temporariamente
        const saved = localStorage.getItem('minint_sim_history');
        if (saved) setHistory(JSON.parse(saved));
      });
    } else {
      setHistory([]);
    }
  }, [user, token]);

  // Função para buscar dados de administração
  const loadAdminStats = () => {
    if (!token || user?.role !== 'admin') return;
    setIsStatsLoading(true);
    fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(async res => {
      if (!res.ok) {
        if (res.status === 401) {
          let errMsg = "Sessão inválida ou expirada.";
          try {
            const data = await parseApiResponse(res);
            errMsg = data.error || errMsg;
          } catch (e) {}
          localStorage.removeItem('minint_auth_token');
          setToken(null);
          setUser(null);
          setAuthError(errMsg);
        }
        throw new Error("Não autorizado");
      }
      return parseApiResponse(res);
    })
    .then(data => {
      setAdminStats(data);
      setIsMaintenanceActive(data.maintenanceMode);
    })
    .catch(err => {
      console.error("Erro ao ler dados de administração:", err);
    })
    .finally(() => {
      setIsStatsLoading(false);
    });
  };

  useEffect(() => {
    if (isAdminOpen && user?.role === 'admin') {
      loadAdminStats();
    }
  }, [isAdminOpen, user]);

  // Handler de Terminar Sessão (Logout)
  const handleLogout = () => {
    if (user) {
      trackEvent('logout', 'autenticacao', user.email);
    }
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => console.error("Erro ao remover sessão no servidor:", err));
    }
    localStorage.removeItem('minint_auth_token');
    setToken(null);
    setUser(null);
    setCurrentTab('leitura');
    setIsAdminOpen(false);
  };

  // Handler para alterar a palavra-passe do utilizador
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);
    setChangePasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setChangePasswordError("Por favor, preencha todos os campos.");
      return;
    }

    if (newPassword.length < 6) {
      setChangePasswordError("A nova palavra-passe deve ter pelo menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangePasswordError("As novas palavras-passe não coincidem.");
      return;
    }

    setIsChangePasswordLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await parseApiResponse(res);
      if (!res.ok) {
        throw new Error(data.error || "Erro ao alterar palavra-passe.");
      }

      setChangePasswordSuccess("Palavra-passe alterada com sucesso!");
      if (user) {
        trackEvent('change_password', 'autenticacao', user.email);
      }
      
      // Limpar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      
      // Fechar modal após 1.5 segundos
      setTimeout(() => {
        setIsChangePasswordOpen(false);
        setChangePasswordSuccess(null);
      }, 1500);

    } catch (err: any) {
      setChangePasswordError(err.message || "Erro de ligação.");
    } finally {
      setIsChangePasswordLoading(false);
    }
  };

  // Handler para alternar Manutenção (Admin Only)
  const handleToggleMaintenance = async (targetState: boolean) => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/toggle-maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ maintenanceMode: targetState }),
      });
      const data = await parseApiResponse(res);
      if (res.ok) {
        setIsMaintenanceActive(data.maintenanceMode);
        loadAdminStats();
      } else {
        alert(data.error || "Erro ao alterar modo de manutenção.");
      }
    } catch (err) {
      console.error("Erro de ligação:", err);
    }
  };

  // Handler para Suspender/Activar Utilizador
  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    if (!token) return;
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/admin/toggle-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, status: nextStatus }),
      });
      const data = await parseApiResponse(res);
      if (res.ok) {
        loadAdminStats();
      } else {
        alert(data.error || "Erro ao alterar estado do utilizador.");
      }
    } catch (err) {
      console.error("Erro de ligação:", err);
    }
  };

  // Monitorar Evento PWA de Instalação (Suportado no Chrome móvel e desktop)
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Timer do Simulador
  useEffect(() => {
    let interval: any;
    if (simState === 'active') {
      interval = setInterval(() => {
        setSimTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [simState]);

  // Função para Disparar a Instalação do PWA
  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Resultado do prompt de instalação: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  // Iniciar Simulado
  const startSimulation = (count: number) => {
    // Baralhar a lista de questões e selecionar o número desejado
    const shuffled = [...fullQuestionsDatabase].sort(() => Math.random() - 0.5);
    setSimQuestions(shuffled.slice(0, count));
    setSimCurrentIndex(0);
    setSimSelectedOpt(null);
    setSimScore(0);
    setSimTimerSeconds(0);
    setSimAnswers([]);
    setReviewFilter('all');
    setSimState('active');
    trackEvent('start_simulation', 'simulador', `Questoes: ${count}`);
  };

  // Selecionar Opção no Simulador
  const handleSelectSimOption = (optIdx: number) => {
    setSimSelectedOpt(optIdx);
  };

  // Próxima Pergunta no Simulador
  const handleNextSimQuestion = () => {
    if (simSelectedOpt === null) {
      alert("Por favor, selecione uma opção antes de avançar.");
      return;
    }

    const currentQuestion = simQuestions[simCurrentIndex];
    let newScore = simScore;
    if (simSelectedOpt === currentQuestion.ans) {
      newScore += 1;
      setSimScore(newScore);
    }

    // Guardar a resposta escolhida pelo usuário
    setSimAnswers((prev) => [...prev, simSelectedOpt]);

    if (simCurrentIndex + 1 < simQuestions.length) {
      setSimCurrentIndex((prev) => prev + 1);
      setSimSelectedOpt(null);
    } else {
      // Fim do Simulado: Calcula resultado e salva histórico
      const percent = Math.round((newScore / simQuestions.length) * 100);
      setSimState('results');
      trackEvent('complete_simulation', 'simulador', `Acertos: ${newScore}/${simQuestions.length}`, percent);
      
      const newHistoryItem: SimuladoHistory = {
        date: new Date().toLocaleDateString('pt-PT', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        correct: newScore,
        total: simQuestions.length,
        percent
      };
      
      const updatedHistory = [newHistoryItem, ...history].slice(0, 10);
      setHistory(updatedHistory);
      localStorage.setItem('minint_sim_history', JSON.stringify(updatedHistory));

      // Guardar simulação no servidor caso o utilizador esteja autenticado
      if (token) {
        fetch('/api/simulations/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            correct: newScore,
            total: simQuestions.length,
            percent,
            timeSpent: simTimerSeconds
          })
        })
        .then(async res => {
          if (!res.ok) {
            if (res.status === 401) {
              let errMsg = "Sessão inválida ou expirada.";
              try {
                const data = await parseApiResponse(res);
                errMsg = data.error || errMsg;
              } catch (e) {}
              localStorage.removeItem('minint_auth_token');
              setToken(null);
              setUser(null);
              setAuthError(errMsg);
            }
            throw new Error("Erro ao sincronizar simulação");
          }
          return parseApiResponse(res);
        })
        .catch(err => console.error("Erro ao sincronizar simulação:", err));
      }
    }
  };

  // Limpar Histórico de Simulados
  const handleClearHistory = () => {
    if (window.confirm("Deseja realmente limpar todo o histórico de simulados?")) {
      setHistory([]);
      localStorage.removeItem('minint_sim_history');
    }
  };

  // Cancelar Simulado em Progresso
  const handleCancelSim = () => {
    if (window.confirm("Deseja realmente cancelar o simulado em progresso? Todo o progresso atual será perdido.")) {
      setSimState('setup');
    }
  };

  // Filtragem Dinâmica das Questões
  const filteredQuestions = fullQuestionsDatabase.filter((q) => {
    const matchesSearch = 
      q.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.a.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.expl.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesModule = filterModule === 'all' || q.m === parseInt(filterModule);
    return matchesSearch && matchesModule;
  });

  // Formatar Segundos para MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen flex flex-col relative selection:bg-amber-500 selection:text-slate-900 font-sans">
      
      {/* Marcas de Água Estilizadas no Ecrã (Apenas Visual) */}
      <div className="fixed font-extrabold text-[12vw] text-slate-950/2 tracking-widest pointer-events-none select-none z-0 -rotate-12 left-5 top-1/4 print:hidden">
        Ivany Tomás Multivendas
      </div>
      <div className="fixed font-extrabold text-[12vw] text-slate-950/2 tracking-widest pointer-events-none select-none z-0 -rotate-12 right-5 bottom-1/4 print:hidden">
        Ivany Tomás Multivendas
      </div>

      {/* MARCAS DE ÁGUA OBRIGATÓRIAS PARA IMPRESSÃO (Escondidas no ecrã, visíveis na folha impressa) */}
      <div className="hidden print:block fixed top-6 left-6 text-[8pt] font-black text-slate-400/40 uppercase tracking-wider z-50">
        Ivany Tomás Multivendas • Cópia Oficial Autorizada
      </div>
      <div className="hidden print:block fixed bottom-6 right-6 text-[8pt] font-black text-slate-400/40 uppercase tracking-wider z-50">
        Ivany Tomás Multivendas • Material Exclusivo de Estudo
      </div>

      {/* CABEÇALHO DO PORTAL */}
      <header className="bg-slate-950 border-b border-slate-800/80 sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo e Título */}
          <div className="flex items-center gap-3">
            <div className="p-0.5 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 shadow-lg">
              <img
                src="/founder-photo.png"
                alt="Ivany Tomás Multivendas"
                className="w-11 h-11 rounded-lg object-cover"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                MININT ANGOLA 
                <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-amber-400 rounded-full font-bold uppercase tracking-widest">
                  Fascículos Académicos
                </span>
              </h1>
              <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest leading-none mt-1">
                Selo Editorial Académico: Ivany Tomás Multivendas
              </p>
            </div>
          </div>

          {/* Estado Offline / Online & Botões de Ações */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            
            {/* Status Conectividade */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border transition duration-300 ${
              isOnline 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span>ONLINE</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span>OFFLINE ACTIVO</span>
                </>
              )}
            </div>

            {/* Prompt de Instalação (PWA) */}
            {showInstallBtn && (
              <button 
                onClick={handleInstallApp}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-black transition duration-200 flex items-center gap-1.5 shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar no Celular</span>
              </button>
            )}

            {/* Ações e Menus para Utilizadores Autenticados */}
            {user && (
              <>
                {/* Nome e Nível de Acesso */}
                <div className="hidden sm:flex flex-col items-end text-right px-2 border-r border-slate-800/80 mr-1 pr-3">
                  <span className="text-[11px] font-black text-white">{user.name}</span>
                  <span className="text-[9px] text-amber-500 font-mono tracking-wider uppercase">
                    {user.role === 'admin' ? 'ADMINISTRADOR' : (user.role === 'admin_adjunto' ? 'ADMIN ADJUNTO' : 'ESTUDANTE')}
                  </span>
                </div>

                {/* Botão de Administração */}
                {(user.role === 'admin' || user.role === 'admin_adjunto') && (
                  <button 
                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
                      isAdminOpen 
                        ? 'bg-amber-500 text-slate-950 shadow-md' 
                        : 'bg-slate-800 text-amber-400 hover:bg-slate-700 border border-amber-500/10'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>{isAdminOpen ? "Ver Portal" : "Painel Admin"}</span>
                  </button>
                )}

                {/* Abas e Menus Gerais (Ocultados se o Painel de Administração estiver ativo) */}
                {!isAdminOpen && (
                  <>
                    <button 
                      onClick={() => setCurrentTab('leitura')} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
                        currentTab === 'leitura' 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Ler Manuais</span>
                    </button>

                    <button 
                      onClick={() => setCurrentTab('perguntas')} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
                        currentTab === 'perguntas' 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <List className="w-4 h-4" />
                      <span>Banco de Questões (200+)</span>
                    </button>

                    <button 
                      onClick={() => setCurrentTab('simulador')} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
                        currentTab === 'simulador' 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Simulador</span>
                    </button>

                    <button 
                      onClick={() => setCurrentTab('gdrive')} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 ${
                        currentTab === 'gdrive' 
                          ? 'bg-indigo-600 text-white shadow-md' 
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Cloud className="w-4 h-4" />
                      <span>Estudo Cloud (GDrive)</span>
                    </button>
                  </>
                )}

                {/* Exportação de PDF */}
                <button 
                  onClick={() => window.print()} 
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 shadow"
                >
                  <Printer className="w-4 h-4" />
                  <span>Exportar PDF</span>
                </button>

                {/* Alterar Palavra-Passe */}
                <button 
                  onClick={() => {
                    setChangePasswordError(null);
                    setChangePasswordSuccess(null);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setIsChangePasswordOpen(true);
                  }}
                  className="bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 shadow"
                >
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Palavra-passe</span>
                </button>

                {/* Sair do Sistema */}
                <button 
                  onClick={handleLogout}
                  className="bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 border border-rose-950 px-3 py-1.5 rounded-lg text-xs font-bold transition duration-200 flex items-center gap-1.5 shadow"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </button>
              </>
            )}

          </div>
        </div>
      </header>

      {/* CONTENTOR CENTRAL PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-grow w-full flex flex-col gap-6 z-10">
        {isAuthLoading ? (
          <div className="flex-grow flex flex-col items-center justify-center py-24">
            <div className="bg-slate-950/80 border border-slate-800 p-8 rounded-3xl text-center space-y-4 max-w-sm w-full shadow-2xl animate-pulse">
              <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto animate-spin" />
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-amber-500">A Carregar Sessão...</h2>
              <p className="text-[11px] text-slate-400">A estabelecer ligação académica segura com a Ivany Tomás Multivendas...</p>
            </div>
          </div>
        ) : !user ? (
          <AuthScreen 
            onLoginSuccess={(tok, usr) => {
              localStorage.setItem('minint_auth_token', tok);
              setToken(tok);
              setUser(usr);
              trackEvent('login', 'autenticacao', usr.email);
            }}
            isOnline={isOnline}
            initialError={authError}
          />
        ) : isMaintenanceActive && (user.role !== 'admin' && user.role !== 'admin_adjunto') ? (
          <MaintenanceScreen />
        ) : isAdminOpen && (user.role === 'admin' || user.role === 'admin_adjunto') ? (
          <AdminPanel 
            token={token!}
            onClose={() => setIsAdminOpen(false)}
            isMaintenanceActive={isMaintenanceActive}
            onToggleMaintenance={handleToggleMaintenance}
            onToggleUserStatus={handleToggleUserStatus}
            user={user}
          />
        ) : (
          <div className="w-full flex flex-col lg:flex-row gap-6">
        
        {/* BARRA LATERAL - SELEÇÃO DE FASCÍCULOS (Disponível apenas na aba de leitura, escondida no simulador e na impressão) */}
        {currentTab === 'leitura' && (
          <aside className="w-full lg:w-72 flex-shrink-0 print:hidden">
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 sticky top-24 space-y-5 shadow-lg">
              


              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-2">
                  Navegação de Fascículos
                </h3>
                <div className="space-y-1">
                  {Object.entries(modulesData).map(([idStr, mod]) => {
                    const id = parseInt(idStr);
                    const isActive = currentModuleId === id;
                    return (
                      <button 
                        key={id}
                        onClick={() => setCurrentModuleId(id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition duration-200 flex items-center gap-3 ${
                          isActive 
                            ? 'bg-indigo-950/60 border border-indigo-500/30 text-white shadow-md' 
                            : 'hover:bg-slate-900 border border-transparent text-slate-400'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shadow transition duration-200 ${
                          isActive 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}>
                          {String(id).padStart(2, '0')}
                        </span>
                        <div className="truncate">
                          <span className="block text-[8px] text-slate-500 font-extrabold uppercase leading-none">
                            {mod.chapter}
                          </span>
                          <span className="text-slate-300 font-bold text-[11px] hover:text-white">
                            {mod.title.split(':')[0]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Box de Autenticação de Direitos e Credibilidade */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/25 rounded-xl p-3.5 text-center">
                  <span className="block text-amber-400 text-[10px] font-black tracking-wider uppercase mb-1">
                    Garantia de Qualidade
                  </span>
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                    Material revisado e em estrita conformidade com as diretivas e regulamentos das provas de ingresso de Angola.
                  </p>
                  <div className="text-[11px] font-black text-slate-950 bg-amber-500 py-1.5 rounded shadow-md uppercase tracking-wider">
                    Ivany Tomás Multivendas
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ÁREA CENTRAL DE OPERAÇÃO */}
        <section className={`flex-grow bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 md:p-8 min-h-[550px] shadow-2xl flex flex-col justify-between ${
          (currentTab === 'simulador' || currentTab === 'gdrive') ? 'w-full' : ''
        }`}>
          
          {/* ===================== ABA 1: LEITURA COMPLETA ===================== */}
          {currentTab === 'leitura' && (
            <div className="space-y-6">
              
              {/* Cabeçalho de Impressão Oficial */}
              <div className="hidden print:block text-center space-y-1 pb-4 border-b border-slate-300 mb-6">
                <h1 className="text-xl font-extrabold uppercase tracking-widest text-slate-900">
                  REPÚBLICA DE ANGOLA
                </h1>
                <h2 className="text-base font-bold text-slate-800 uppercase">
                  Apostila Completa de Preparação ao Concurso do MININT
                </h2>
                <h3 className="text-xs font-semibold text-slate-500">
                  Selo Editorial Académico: Ivany Tomás Multivendas
                </h3>
              </div>

              {/* Cabeçalho do Módulo */}
              <div className="space-y-2 border-b border-slate-800/60 pb-4">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                  <BookMarked className="w-4 h-4" />
                  <span>{modulesData[currentModuleId].chapter}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                  {modulesData[currentModuleId].title}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/50 print:hidden mt-2">
                  <strong className="text-amber-500">Introdução do Fascículo:</strong> {modulesData[currentModuleId].intro}
                </p>
              </div>

              {/* Corpo Teórico */}
              <div 
                className="text-slate-300 text-sm leading-relaxed text-justify space-y-6"
                dangerouslySetInnerHTML={{ __html: modulesData[currentModuleId].body }}
              />

              {/* Quebra de página para impressão limpa da seção de perguntas do módulo */}
              <div className="page-break" />

              {/* Perguntas de Fixação do Módulo */}
              <div className="space-y-4 pt-8 border-t border-slate-800/80 mt-10">
                <div className="border-b border-slate-800/60 pb-3">
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>Perguntas de Fixação Resolvidas</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Fixe os conceitos essenciais do {modulesData[currentModuleId].chapter} através das resoluções técnicas a seguir.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {fullQuestionsDatabase
                    .filter((q) => q.m === currentModuleId)
                    .map((q, index) => (
                      <div 
                        key={q.id} 
                        className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 space-y-3 print:border-slate-300"
                      >
                        <div className="flex items-center">
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                            {modulesData[currentModuleId].chapter} • Questão {index + 1}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm leading-relaxed">
                          {q.q}
                        </h4>
                        
                        <div className="space-y-2 border-l-2 border-indigo-600 pl-4 mt-3 py-1">
                          <p className="text-xs text-slate-300">
                            <strong>Gabarito Oficial:</strong> <span className="text-emerald-400 font-bold">{q.a}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 italic leading-relaxed">
                            <strong>Doutrina / Explicação:</strong> {q.expl}
                          </p>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

            </div>
          )}

          {/* ===================== ABA 2: BANCO DE QUESTÕES COMPLETO ===================== */}
          {currentTab === 'perguntas' && (
            <div className="space-y-6">
              
              {/* Título e Buscas */}
              <div className="border-b border-slate-800/80 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    Banco de Questões Resolvidas (150+)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Pesquise temas, leis ou conceitos em toda a nossa base de dados académica.
                  </p>
                </div>
                
                {/* Inputs de busca */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full md:w-auto">
                  <div className="relative flex-grow">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pesquise por termo ou lei..." 
                      className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white w-full sm:w-60"
                    />
                  </div>

                  <select 
                    value={filterModule}
                    onChange={(e) => setFilterModule(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="all">Todos os Fascículos</option>
                    <option value="1">Fascículo 1 - Geral</option>
                    <option value="2">Fascículo 2 - PNA</option>
                    <option value="3">Fascículo 3 - SIC</option>
                    <option value="4">Fascículo 4 - SME</option>
                    <option value="5">Fascículo 5 - Penitenciário</option>
                    <option value="6">Fascículo 6 - SPCB / Bombeiros</option>
                    <option value="7">Fascículo 7 - Treino / TAF</option>
                  </select>
                </div>
              </div>

              {/* Lista das Questões Filtradas */}
              <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                  <div className="text-center py-12 bg-slate-900/40 border border-slate-800 rounded-2xl">
                    <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">Nenhuma questão encontrada com estes parâmetros de busca.</p>
                  </div>
                ) : (
                  filteredQuestions.map((q) => (
                    <div 
                      key={q.id} 
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md transition duration-200 hover:border-slate-700/60"
                    >
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px] font-black px-2 py-0.5 rounded">
                          EXAME CONCURSO • QUESTÃO {q.id}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase bg-slate-950 px-2 py-1 rounded">
                          {modulesData[q.m]?.chapter || `Fascículo ${q.m}`}
                        </span>
                      </div>

                      <h3 className="text-sm font-extrabold text-white leading-relaxed">
                        {q.q}
                      </h3>

                      {/* Opções de Resposta Ilustrativas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pl-1">
                        {q.opts.map((opt, oIdx) => {
                          const isCorrect = oIdx === q.ans;
                          return (
                            <div 
                              key={oIdx} 
                              className={`text-xs flex items-center gap-3 p-2 rounded-lg border ${
                                isCorrect 
                                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 font-semibold' 
                                  : 'border-slate-800 bg-slate-950/40 text-slate-400'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${
                                isCorrect 
                                  ? 'bg-emerald-600 text-slate-950' 
                                  : 'bg-slate-900 text-slate-500 border border-slate-800'
                              }`}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explicação Jurídico-Científica */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                        <strong className="text-amber-500 block mb-1">Fundamentação Técnico-Académica:</strong>
                        {q.expl}
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ===================== ABA 3: SIMULADOR DE EXAMES ===================== */}
          {currentTab === 'simulador' && (
            <div className="space-y-6">
              
              {/* 3.1 SETUP DO SIMULADOR */}
              {simState === 'setup' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-800/60 pb-3">
                    <h2 className="text-xl sm:text-2xl font-black text-white">Simulador de Prova Real</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Avalie os seus conhecimentos de forma aleatória em simulados de tempo real com regras baseadas nas provas oficiais do MININT.
                    </p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 text-center space-y-6 max-w-3xl mx-auto shadow-lg">
                    <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto border border-amber-500/20">
                      <Flame className="w-7 h-7" />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-black text-white">Configurar Exame de Avaliação</h3>
                      <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                        Escolha o número de questões para testar os seus limites intelectuais de forma totalmente offline. As questões serão geradas aleatoriamente de toda a nossa base de dados oficial.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3">
                      <button 
                        onClick={() => startSimulation(20)} 
                        className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl border border-slate-700 transition duration-200 shadow"
                      >
                        Simulado Rápido (20 Questões)
                      </button>
                      <button 
                        onClick={() => startSimulation(50)} 
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition duration-200 shadow"
                      >
                        Simulado Intermédio (50 Questões)
                      </button>
                      <button 
                        onClick={() => startSimulation(100)} 
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-5 py-3 rounded-xl transition duration-200 shadow"
                      >
                        Exame Completo (100 Questões)
                      </button>
                    </div>
                  </div>

                  {/* Histórico Local de Simulados do Usuário */}
                  <div className="max-w-3xl mx-auto space-y-4 pt-4">
                    <div className="flex justify-between items-center border-b border-slate-800/60 pb-2">
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <History className="w-4 h-4 text-indigo-400" />
                        <span>Histórico de Desempenho Local (Offline)</span>
                      </h3>
                      {history.length > 0 && (
                        <button 
                          onClick={handleClearHistory}
                          className="text-[10px] text-rose-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Limpar Histórico</span>
                        </button>
                      )}
                    </div>

                    {history.length === 0 ? (
                      <div className="text-center p-6 bg-slate-900/30 border border-slate-850 rounded-xl text-[11px] text-slate-500">
                        Nenhum simulado realizado neste dispositivo ainda.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {history.map((item, idx) => (
                          <div 
                            key={idx} 
                            className="bg-slate-900 border border-slate-800/80 rounded-xl p-3.5 flex justify-between items-center text-xs"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] text-slate-500 block">{item.date}</span>
                              <span className="font-extrabold text-slate-200">
                                {item.correct} de {item.total} questões certas
                              </span>
                            </div>
                            <div className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                              item.percent >= 75 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : item.percent >= 50 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {item.percent}%
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 3.2 SIMULADOR ACTIVO */}
              {simState === 'active' && simQuestions.length > 0 && (
                <div className="space-y-5">
                  
                  {/* Cronômetro e Progresso */}
                  <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      QUESTÃO <span className="text-indigo-400">{simCurrentIndex + 1}</span> DE <span className="text-slate-200">{simQuestions.length}</span>
                    </span>
                    <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xs">
                      <Hourglass className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '3s' }} />
                      <span className="font-mono">{formatTime(simTimerSeconds)}</span>
                    </div>
                  </div>

                  {/* Questão */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                    <h3 className="text-base sm:text-lg font-extrabold text-white leading-relaxed">
                      {simQuestions[simCurrentIndex].q}
                    </h3>
                    
                    {/* Opções Interativas */}
                    <div className="space-y-3">
                      {simQuestions[simCurrentIndex].opts.map((opt, idx) => {
                        const isSelected = simSelectedOpt === idx;
                        return (
                          <button 
                            key={idx}
                            onClick={() => handleSelectSimOption(idx)}
                            className={`w-full text-left p-4 rounded-xl border text-xs font-bold transition duration-150 flex items-center gap-3.5 ${
                              isSelected 
                                ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-950/20' 
                                : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900/80'
                            }`}
                          >
                            <span className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[10px] font-black transition duration-150 ${
                              isSelected 
                                ? 'bg-indigo-600 text-slate-950 border-indigo-400' 
                                : 'bg-slate-950 text-slate-400 border-slate-700'
                            }`}>
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Controles do Simulador */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
                    <button 
                      onClick={handleCancelSim}
                      className="text-xs text-rose-500 font-bold hover:underline transition duration-150"
                    >
                      Cancelar Exame
                    </button>
                    
                    <button 
                      onClick={handleNextSimQuestion}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-black transition duration-150 flex items-center gap-1.5 shadow"
                    >
                      <span>
                        {simCurrentIndex + 1 === simQuestions.length ? "Finalizar e Ver Relatório" : "Avançar Questão"}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* 3.3 RESULTADOS DO SIMULADOR */}
              {simState === 'results' && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 max-w-3xl mx-auto shadow-2xl">
                  
                  {/* Badge Circular Percentual */}
                  <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-xl font-black mx-auto border shadow-lg ${
                    Math.round((simScore / simQuestions.length) * 100) >= 75
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : Math.round((simScore / simQuestions.length) * 100) >= 50
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}>
                    <span className="text-2xl">{Math.round((simScore / simQuestions.length) * 100)}%</span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-black text-white">
                      Relatório Técnico de Desempenho
                    </h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      {Math.round((simScore / simQuestions.length) * 100) >= 75 ? (
                        <>
                          <strong className="text-emerald-400">Aprovação de Excelência!</strong> Obteve índices de mérito idênticos aos melhores candidatos admitidos nas avaliações do MININT.
                        </>
                      ) : Math.round((simScore / simQuestions.length) * 100) >= 50 ? (
                        <>
                          <strong className="text-amber-500">Aprovado dentro da média.</strong> Tem o conhecimento basal necessário, mas aconselhamos revisar os fascículos para fortalecer a sua vaga.
                        </>
                      ) : (
                        <>
                          <strong className="text-rose-400">Abaixo da média exigida.</strong> Precisa fortalecer o seu estudo doutrinário. Estude os manuais com atenção e repita o teste.
                        </>
                      )}
                    </p>
                  </div>

                  {/* Números Finais */}
                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                    <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl text-center shadow-inner">
                      <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider">Certos</span>
                      <span className="text-base font-extrabold text-emerald-400">{simScore}</span>
                    </div>
                    <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl text-center shadow-inner">
                      <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider">Errados</span>
                      <span className="text-base font-extrabold text-rose-400">{simQuestions.length - simScore}</span>
                    </div>
                    <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-xl text-center shadow-inner">
                      <span className="block text-[8px] text-slate-500 font-black uppercase tracking-wider">Tempo Gasto</span>
                      <span className="text-sm font-extrabold text-amber-500 font-mono mt-1.5 block">
                        {formatTime(simTimerSeconds)}
                      </span>
                    </div>
                  </div>

                  {/* Revisão Detalhada das Questões */}
                  <div className="text-left mt-8 pt-8 border-t border-slate-800/80 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/40">
                      <div>
                        <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-indigo-400" />
                          <span>Revisão Detalhada das Questões</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Confira cada resposta selecionada e a sua fundamentação técnica oficial.
                        </p>
                      </div>
                      
                      {/* Filtro Rápido */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850 self-start sm:self-center">
                        <button
                          onClick={() => setReviewFilter('all')}
                          className={`px-2.5 py-1 text-[10px] font-black rounded-md transition ${
                            reviewFilter === 'all'
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Todas ({simQuestions.length})
                        </button>
                        <button
                          onClick={() => setReviewFilter('correct')}
                          className={`px-2.5 py-1 text-[10px] font-black rounded-md transition flex items-center gap-1 ${
                            reviewFilter === 'correct'
                              ? 'bg-emerald-600 text-white'
                              : 'text-emerald-500 hover:text-emerald-400'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Acertos ({simScore})</span>
                        </button>
                        <button
                          onClick={() => setReviewFilter('incorrect')}
                          className={`px-2.5 py-1 text-[10px] font-black rounded-md transition flex items-center gap-1 ${
                            reviewFilter === 'incorrect'
                              ? 'bg-rose-600 text-white'
                              : 'text-rose-400 hover:text-rose-300'
                          }`}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Erros ({simQuestions.length - simScore})</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar print:max-h-none print:overflow-visible">
                      {simQuestions.map((q, idx) => {
                        const userAns = simAnswers[idx];
                        const isCorrect = userAns === q.ans;
                        
                        // Aplicar filtro de exibição
                        if (reviewFilter === 'correct' && !isCorrect) return null;
                        if (reviewFilter === 'incorrect' && isCorrect) return null;

                        return (
                          <div 
                            key={q.id} 
                            className={`p-4 rounded-xl border text-xs space-y-3 transition ${
                              isCorrect 
                                ? 'bg-emerald-950/10 border-emerald-500/20' 
                                : 'bg-rose-950/10 border-rose-500/20'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] text-slate-500 font-extrabold uppercase">
                                Questão {idx + 1}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1 ${
                                isCorrect 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                {isCorrect ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Acertou</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>Errou</span>
                                  </>
                                )}
                              </span>
                            </div>

                            <p className="font-extrabold text-white text-xs leading-relaxed">
                              {q.q}
                            </p>

                            {/* Opções com destaque */}
                            <div className="space-y-1.5 pt-1">
                              {q.opts.map((opt, oIdx) => {
                                const isUserChoice = userAns === oIdx;
                                const isCorrectChoice = q.ans === oIdx;
                                return (
                                  <div 
                                    key={oIdx}
                                    className={`p-2 rounded-lg text-[11px] font-medium flex items-center gap-2 border transition ${
                                      isCorrectChoice
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-bold'
                                        : isUserChoice
                                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 font-bold'
                                        : 'bg-slate-950/40 border-slate-900/60 text-slate-400'
                                    }`}
                                  >
                                    <span className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-black border ${
                                      isCorrectChoice
                                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                                        : isUserChoice
                                        ? 'bg-rose-500 text-white border-rose-400'
                                        : 'bg-slate-900 text-slate-500 border-slate-800'
                                    }`}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span className="flex-1">{opt}</span>
                                    {isCorrectChoice && <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">Gabarito</span>}
                                    {isUserChoice && !isCorrectChoice && <span className="text-[9px] font-black uppercase text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">Sua Opção</span>}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explicação */}
                            <div className="mt-2 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 text-[11px] leading-relaxed text-slate-300">
                              <strong className="text-amber-500 font-extrabold uppercase tracking-wide text-[10px] block mb-1">Fundamentação Académica</strong>
                              {q.expl}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-slate-800/80">
                    <button 
                      onClick={() => setSimState('setup')} 
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-black transition duration-150 shadow"
                    >
                      Reiniciar Simulador
                    </button>
                    <button 
                      onClick={() => setCurrentTab('leitura')} 
                      className="bg-slate-850 hover:bg-slate-800 text-slate-300 px-5 py-2.5 rounded-xl text-xs font-black transition duration-150 border border-slate-800 shadow"
                    >
                      Voltar para os Manuais
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ===================== ABA 4: GOOGLE DRIVE STUDY CENTER ===================== */}
          {currentTab === 'gdrive' && (
            <GoogleDriveStudyCenter simHistory={history} />
          )}

        </section>
          </div>
        )}
      </main>

      {/* RODAPÉ IMPRIMÍVEL (Ocultado em impressão) */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-900/80 mt-auto print:hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-xs text-slate-500">
            © 2026 Concurso Público Geral do Ministério do Interior (MININT) - República de Angola.
          </p>
          <p className="text-[10px] text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Este material foi estruturado sob a chancela académica e comercial da marca <strong className="text-amber-500">Ivany Tomás Multivendas</strong>. É terminantemente proibida a comercialização e reprodução não autorizada sob as sanções penais vigentes no país.
          </p>
        </div>
      </footer>

      {/* MODAL DE ALTERAÇÃO DE PALAVRA-PASSE */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in print:hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-black text-white">Alterar Palavra-passe</h3>
              </div>
              <button 
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              {changePasswordError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{changePasswordError}</span>
                </div>
              )}

              {changePasswordSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{changePasswordSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Palavra-passe Atual</label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition font-sans"
                  placeholder="Introduza a sua palavra-passe atual"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Nova Palavra-passe</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition font-sans"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400">Confirmar Nova Palavra-passe</label>
                <input 
                  type="password" 
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none transition font-sans"
                  placeholder="Repita a nova palavra-passe"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-black transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isChangePasswordLoading}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-xl text-xs font-black transition shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isChangePasswordLoading ? 'A guardar...' : 'Alterar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
