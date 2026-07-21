import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudRain, 
  RefreshCw, 
  FileText, 
  BookOpen, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  ExternalLink, 
  FileUp, 
  History, 
  LogOut,
  FileCode,
  FolderOpen
} from 'lucide-react';
import { 
  googleSignInDrive, 
  googleSignOutDrive, 
  initDriveAuth, 
  listDriveFiles, 
  getOrCreateAppFolder, 
  saveFileToDrive, 
  downloadFileFromDrive, 
  deleteFileFromDrive, 
  DriveFile 
} from '../lib/googleDrive';
import { User } from 'firebase/auth';

interface SimuladoHistory {
  date: string;
  correct: number;
  total: number;
  percent: number;
}

interface GoogleDriveStudyCenterProps {
  simHistory: SimuladoHistory[];
}

export default function GoogleDriveStudyCenter({ simHistory }: GoogleDriveStudyCenterProps) {
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // States for study notes editor
  const [studyNotes, setStudyNotes] = useState<string>('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [activeFileName, setActiveFileName] = useState<string>('Minhas_Notas_Estudo_MININT.md');
  const [isExportingHistory, setIsExportingHistory] = useState(false);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user, cachedToken) => {
        setDriveUser(user);
        setToken(cachedToken);
        setIsAuthLoading(false);
        // Automatically fetch files after successful connection
        fetchFolderAndFiles(cachedToken);
      },
      () => {
        setDriveUser(null);
        setToken(null);
        setIsAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchFolderAndFiles = async (authToken: string) => {
    if (!authToken) return;
    setIsLoadingFiles(true);
    setErrorMessage(null);
    try {
      // 1. Get or create the dedicated app folder in Drive
      const folder = await getOrCreateAppFolder('MININT Angola - Ivany Tomás Multivendas');
      setFolderId(folder);

      // 2. List all files in that folder
      const driveFiles = await listDriveFiles(folder);
      setFiles(driveFiles);

      // 3. Look if our default notes file exists and pre-load it
      const defaultNotesFile = driveFiles.find(f => f.name === 'Minhas_Notas_Estudo_MININT.md');
      if (defaultNotesFile) {
        const content = await downloadFileFromDrive(defaultNotesFile.id);
        setStudyNotes(content);
      } else {
        // Default welcoming template
        setStudyNotes(`# Notas de Estudo - Preparação MININT Angola\n\nCriado via Portal Académico (Ivany Tomás Multivendas)\n\n## 📌 Conteúdos Fundamentais\n- Constituição da República de Angola\n- Lei n.º 12/15 - Lei de Bases das Instituições Públicas\n- Regulamento Interno das Forças de Segurança\n\n## 📝 Minhas Anotações:\nEscreva aqui as suas reflexões e resumos de estudo sobre os fascículos lidos...`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Erro ao ligar ao Google Drive e obter ficheiros.");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleConnect = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const result = await googleSignInDrive();
      if (result) {
        setDriveUser(result.user);
        setToken(result.accessToken);
        showToast("Ligado com sucesso ao Google Drive!", "success");
        await fetchFolderAndFiles(result.accessToken);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Falha na autenticação do Google Drive.");
    }
  };

  const handleDisconnect = async () => {
    try {
      await googleSignOutDrive();
      setDriveUser(null);
      setToken(null);
      setFiles([]);
      setFolderId(null);
      setStudyNotes('');
      showToast("Desconectado do Google Drive.", "success");
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao desconectar.");
    }
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  // Save the custom notes text to Google Drive
  const handleSaveNotes = async () => {
    if (!token || !folderId) return;
    setIsSavingNotes(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await saveFileToDrive(activeFileName, studyNotes, 'text/markdown', folderId);
      showToast("Notas guardadas com sucesso no seu Google Drive!", "success");
      // Refresh list
      const driveFiles = await listDriveFiles(folderId);
      setFiles(driveFiles);
    } catch (err: any) {
      setErrorMessage(err.message || "Erro ao salvar notas no Drive.");
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Export Simulation Results report to Google Drive
  const handleExportHistory = async () => {
    if (!token || !folderId) return;
    if (simHistory.length === 0) {
      showToast("Não tem histórico de simulados para exportar.", "error");
      return;
    }

    const confirmExport = window.confirm("Pretende exportar o seu histórico atual de simulados para o Google Drive? Isto criará ou atualizará o relatório.");
    if (!confirmExport) return;

    setIsExportingHistory(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      let reportContent = `# Relatório de Desempenho - Preparação Académica MININT\n`;
      reportContent += `Selo Editorial: Ivany Tomás Multivendas\n`;
      reportContent += `Utilizador: ${driveUser?.displayName || driveUser?.email || 'Estudante'}\n`;
      reportContent += `Data de Exportação: ${new Date().toLocaleString('pt-PT')}\n\n`;
      reportContent += `## 📊 Histórico Recente de Simulados\n\n`;
      reportContent += `| Data do Simulado | Acertos / Total | Percentagem | Resultado |\n`;
      reportContent += `| :--- | :--- | :--- | :--- |\n`;

      simHistory.forEach((sim) => {
        const isApproved = sim.percent >= 50;
        const status = isApproved ? '🟢 Aprovado' : '🔴 Reprovado';
        reportContent += `| ${sim.date} | ${sim.correct} / ${sim.total} | ${sim.percent}% | ${status} |\n`;
      });

      reportContent += `\n\n*Relatório gerado automaticamente através da sincronização em tempo real do Portal Académico.*`;

      await saveFileToDrive('Relatorio_Simulados_MININT.md', reportContent, 'text/markdown', folderId);
      showToast("Relatório de simulados exportado para o Google Drive!", "success");
      
      // Refresh list
      const driveFiles = await listDriveFiles(folderId);
      setFiles(driveFiles);
    } catch (err: any) {
      setErrorMessage(err.message || "Falha ao exportar relatório.");
    } finally {
      setIsExportingHistory(false);
    }
  };

  // Load a file from the file explorer into the editor
  const handleLoadFile = async (file: DriveFile) => {
    if (file.mimeType.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      setIsLoadingFiles(true);
      try {
        const content = await downloadFileFromDrive(file.id);
        setStudyNotes(content);
        setActiveFileName(file.name);
        showToast(`Ficheiro '${file.name}' carregado no editor!`, "success");
      } catch (err: any) {
        setErrorMessage("Não foi possível carregar o conteúdo do ficheiro.");
      } finally {
        setIsLoadingFiles(false);
      }
    } else {
      showToast("Apenas ficheiros de texto ou Markdown (.md) podem ser editados.", "error");
    }
  };

  // Delete file from drive
  const handleDeleteFile = async (file: DriveFile) => {
    const confirmDelete = window.confirm(`Tem a certeza de que deseja eliminar o ficheiro "${file.name}" do seu Google Drive? Esta ação é irreversível.`);
    if (!confirmDelete) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const ok = await deleteFileFromDrive(file.id);
      if (ok) {
        showToast("Ficheiro eliminado com sucesso.", "success");
        if (file.name === activeFileName) {
          setStudyNotes('');
          setActiveFileName('Minhas_Notas_Estudo_MININT.md');
        }
        // Refresh list
        if (folderId) {
          const driveFiles = await listDriveFiles(folderId);
          setFiles(driveFiles);
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      setErrorMessage("Erro ao eliminar o ficheiro do Google Drive.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl flex items-center gap-3 text-xs">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Connection Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-4 -translate-y-4">
          <Cloud className="w-64 h-64 text-indigo-500" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1.5">
              <Cloud className="w-4 h-4" />
              <span>Sincronização Cloud Oficial</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              Google Drive Académico
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Conecte a sua conta Google para guardar notas de estudo, relatórios de simulados e manter os seus manuais sempre acessíveis de forma segura no seu Drive.
            </p>
          </div>

          <div>
            {isAuthLoading ? (
              <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />
                <span className="text-xs text-slate-400 font-bold">A verificar ligação...</span>
              </div>
            ) : !driveUser ? (
              /* Beautiful GSI Button Style */
              <button 
                onClick={handleConnect}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-black transition duration-200 flex items-center gap-2.5 shadow-lg active:scale-95"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>Conectar Google Drive</span>
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-800 border border-indigo-500/20">
                    {driveUser.photoURL ? (
                      <img src={driveUser.photoURL} alt={driveUser.displayName || 'Google user'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-indigo-400 font-bold">
                        GD
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-black text-white leading-tight">{driveUser.displayName || 'Ligado'}</div>
                    <div className="text-[9px] text-indigo-400 font-mono leading-none mt-0.5">{driveUser.email}</div>
                  </div>
                </div>
                
                <button 
                  onClick={handleDisconnect}
                  className="bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border border-rose-950 px-3 py-2 rounded-xl text-[11px] font-bold transition duration-200 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desligar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {driveUser && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Notes Editor */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <input 
                    type="text" 
                    value={activeFileName}
                    onChange={(e) => setActiveFileName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white font-bold w-48 sm:w-64 focus:outline-none focus:border-indigo-500"
                    placeholder="Nome do ficheiro"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportHistory}
                    disabled={isExportingHistory}
                    className="bg-slate-950 border border-slate-800 hover:bg-slate-800 text-amber-400 px-3 py-1.5 rounded-lg text-[11px] font-bold transition duration-200 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>{isExportingHistory ? "A exportar..." : "Exportar Simulados"}</span>
                  </button>

                  <button 
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes || !folderId}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-[11px] font-black transition duration-200 flex items-center gap-1.5 disabled:opacity-50 shadow"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingNotes ? "A guardar..." : "Guardar notas"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 font-extrabold uppercase tracking-wider mb-1.5">
                  Quadro de Estudo Virtual (Markdown Suportado)
                </label>
                <textarea
                  value={studyNotes}
                  onChange={(e) => setStudyNotes(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-200 w-full min-h-[300px] h-96 focus:outline-none focus:border-indigo-500 font-mono resize-y leading-relaxed"
                  placeholder="# Escreva as suas notas aqui..."
                />
              </div>
            </div>

            <div className="text-[10px] text-slate-500 border-t border-slate-850 pt-3 flex flex-wrap justify-between gap-2">
              <span>Selo Académico: Ivany Tomás Multivendas</span>
              <span>Guardado como ficheiro markdown compatível com Google Docs e Drive</span>
            </div>
          </div>

          {/* Right Column: Folder Explorer */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-black text-white">Explorador Cloud</span>
                </div>
                
                <button 
                  onClick={() => fetchFolderAndFiles(token!)}
                  disabled={isLoadingFiles}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition duration-200 disabled:opacity-50"
                  title="Atualizar pasta"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="space-y-2">
                <span className="block text-[9px] text-indigo-400 font-black tracking-wider uppercase">
                  Pasta: MININT Angola...
                </span>

                {isLoadingFiles ? (
                  <div className="py-12 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
                    <p className="text-[10px] text-slate-500">A obter ficheiros do seu Drive...</p>
                  </div>
                ) : files.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                    <CloudRain className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-[10px] text-slate-500 px-4">Sem ficheiros nesta pasta. Guarde as suas notas para começar!</p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                    {files.map((file) => {
                      const isMd = file.name.endsWith('.md');
                      return (
                        <div 
                          key={file.id}
                          className="bg-slate-950/60 border border-slate-850 hover:border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-3 text-xs transition duration-200 group"
                        >
                          <button 
                            onClick={() => handleLoadFile(file)}
                            className="flex items-center gap-2.5 text-left flex-grow min-w-0"
                          >
                            <FileCode className={`w-4 h-4 flex-shrink-0 ${isMd ? 'text-indigo-400' : 'text-slate-400'}`} />
                            <div className="truncate">
                              <span className="block text-[11px] font-bold text-slate-300 group-hover:text-white truncate">
                                {file.name}
                              </span>
                              <span className="block text-[9px] text-slate-500">
                                {file.createdTime ? new Date(file.createdTime).toLocaleDateString('pt-PT') : 'Ficheiro Drive'}
                              </span>
                            </div>
                          </button>

                          <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition duration-200">
                            {file.webViewLink && (
                              <a 
                                href={file.webViewLink} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white"
                                title="Abrir no Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button 
                              onClick={() => handleDeleteFile(file)}
                              className="p-1 hover:bg-rose-950/40 rounded-md text-slate-500 hover:text-rose-400"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-850">
              <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 text-[10px] text-slate-400 space-y-1">
                <span className="block font-bold text-amber-500 uppercase tracking-widest text-[8px]">Dica Académica</span>
                <p className="leading-relaxed">
                  Os relatórios de simulado ajudam a monitorizar a sua evolução percentual ao longo do tempo. Guarde-os com regularidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
