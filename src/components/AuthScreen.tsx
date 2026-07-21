import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Sparkles } from 'lucide-react';
import { parseApiResponse } from '../lib/apiHelpers';

interface AuthScreenProps {
  onLoginSuccess: (token: string, user: { id: string; name: string; email: string; role: string }) => void;
  isOnline: boolean;
  initialError?: string | null;
}

export default function AuthScreen({ onLoginSuccess, isOnline, initialError }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email || !password || (authMode === 'register' && !name)) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsLoading(true);

    try {
      if (authMode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await parseApiResponse(res);

        if (!res.ok) {
          throw new Error(data.error || "Erro ao realizar registo.");
        }

        setSuccess("Conta criada com sucesso! Agora já pode iniciar a sua sessão.");
        setAuthMode('login');
        setPassword('');
        setName('');
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await parseApiResponse(res);

        if (!res.ok) {
          throw new Error(data.error || "Erro ao iniciar sessão.");
        }

        onLoginSuccess(data.token, data.user);
      }
    } catch (err: any) {
      setError(err.message || "Erro de ligação ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center p-4 sm:p-6 z-10">
      <div className="bg-slate-950/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden">
        
        {/* Visual glow design */}
        <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20 rounded-full blur-sm" />



        {/* Institution Logo */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex p-1 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 shadow-xl">
            <img
              src="/founder-photo.png"
              alt="Ivany Tomás Multivendas"
              className="w-16 h-16 rounded-full object-cover border-2 border-slate-950"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight uppercase flex items-center justify-center gap-1.5">
              Portal Académico
              <span className="text-[9px] px-2 py-0.5 bg-indigo-600 text-white rounded-full font-bold">
                MININT
              </span>
            </h2>
            <p className="text-[10px] text-amber-500 font-extrabold uppercase tracking-widest leading-none mt-1.5">
              Ivany Tomás Multivendas
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Acesso exclusivo para preparação do Concurso Geral do Ministério do Interior
            </p>
          </div>
        </div>

        {/* Auth Tabs */}
        <div className="grid grid-cols-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800/60 mb-6">
          <button
            onClick={() => {
              setAuthMode('login');
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold transition duration-200 ${
              authMode === 'login'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setError(null);
              setSuccess(null);
            }}
            className={`py-2 rounded-lg text-xs font-bold transition duration-200 ${
              authMode === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Registar Conta
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3.5 rounded-xl mb-4 leading-relaxed font-semibold whitespace-pre-line">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3.5 rounded-xl mb-4 leading-relaxed font-semibold">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Ex: Pedro António"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">
              Endereço de Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-2.5 pl-11 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block ml-1">
              Palavra-Passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-800/80 rounded-xl py-2.5 pl-11 pr-11 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Offline alert inside auth */}
          {!isOnline && authMode === 'register' && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] p-2.5 rounded-xl leading-relaxed text-center">
              Aviso: Está offline. Novos registos requerem ligação de rede ativa.
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (!isOnline && authMode === 'register')}
            className={`w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 shadow-md flex items-center justify-center gap-2 mt-2 ${
              isLoading ? 'animate-pulse' : ''
            }`}
          >
            {isLoading ? (
              <span>A Processar...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{authMode === 'login' ? "Entrar no Portal" : "Criar Minha Conta"}</span>
              </>
            )}
          </button>
        </form>

        {/* Institutional notice footer */}
        <div className="text-[10px] text-slate-500 text-center mt-6 border-t border-slate-900/60 pt-4">
          Garantia de segurança operacional • Ivany Tomás Multivendas
        </div>
      </div>
    </div>
  );
}
