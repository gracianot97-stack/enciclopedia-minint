import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App for Workspace Google Drive
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request Workspace Google Drive scopes
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory access token cache
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize the Auth state listener
export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Start Google sign-in popup to get access token with Drive permissions
export const googleSignInDrive = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Falha ao obter o token de acesso do Google Drive.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro de autenticação no Google Drive:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Retrieve current cached token
export const getDriveAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

// Sign out of Google Drive
export const googleSignOutDrive = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

// --- GOOGLE DRIVE API FUNCTIONS ---

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  createdTime?: string;
}

// 1. Fetch files in a specific folder or general Drive files
export const listDriveFiles = async (folderId?: string): Promise<DriveFile[]> => {
  const token = await getDriveAccessToken();
  if (!token) throw new Error("Não autenticado no Google Drive.");

  let query = "trashed = false";
  if (folderId) {
    query += ` and '${folderId}' in parents`;
  }

  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,webViewLink,createdTime)&orderBy=createdTime%20desc`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error?.message || "Falha ao listar ficheiros no Google Drive.");
  }

  const data = await res.json();
  return data.files || [];
};

// 2. Find or Create a dedicated App folder in user's Drive
export const getOrCreateAppFolder = async (folderName: string): Promise<string> => {
  const token = await getDriveAccessToken();
  if (!token) throw new Error("Não autenticado no Google Drive.");

  // Check if folder already exists
  const query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;
  
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }
  }

  // If not exists, create it
  const createUrl = 'https://www.googleapis.com/drive/v3/files';
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });

  if (!createRes.ok) {
    const errData = await createRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || "Falha ao criar pasta no Google Drive.");
  }

  const folder = await createRes.json();
  return folder.id;
};

// 3. Save or Update a text/markdown file on Google Drive
export const saveFileToDrive = async (
  fileName: string,
  content: string,
  mimeType: string = 'text/markdown',
  folderId?: string
): Promise<DriveFile> => {
  const token = await getDriveAccessToken();
  if (!token) throw new Error("Não autenticado no Google Drive.");

  // Search if file with same name already exists in this folder (to update instead of duplicate)
  let query = `name = '${fileName}' and trashed = false`;
  if (folderId) {
    query += ` and '${folderId}' in parents`;
  }
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`;
  
  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });

  let fileId = '';
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      fileId = searchData.files[0].id;
    }
  }

  if (fileId) {
    // File exists, let's update content
    const updateMediaUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
    const updateRes = await fetch(updateMediaUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': mimeType
      },
      body: content
    });

    if (!updateRes.ok) {
      const errData = await updateRes.json().catch(() => ({}));
      throw new Error(errData.error?.message || "Falha ao atualizar conteúdo do ficheiro.");
    }

    return { id: fileId, name: fileName, mimeType };
  } else {
    // File does not exist, let's create metadata first
    const createMetaUrl = 'https://www.googleapis.com/drive/v3/files';
    const metadata: any = {
      name: fileName,
      mimeType: mimeType
    };
    if (folderId) {
      metadata.parents = [folderId];
    }

    const metaRes = await fetch(createMetaUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!metaRes.ok) {
      const errData = await metaRes.json().catch(() => ({}));
      throw new Error(errData.error?.message || "Falha ao criar metadados do ficheiro.");
    }

    const createdFile = await metaRes.json();
    fileId = createdFile.id;

    // Now upload actual content
    const uploadMediaUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
    const uploadRes = await fetch(uploadMediaUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': mimeType
      },
      body: content
    });

    if (!uploadRes.ok) {
      const errData = await uploadRes.json().catch(() => ({}));
      throw new Error(errData.error?.message || "Falha ao enviar conteúdo do ficheiro.");
    }

    return { id: fileId, name: fileName, mimeType };
  }
};

// 4. Download / Fetch content of a file from Drive
export const downloadFileFromDrive = async (fileId: string): Promise<string> => {
  const token = await getDriveAccessToken();
  if (!token) throw new Error("Não autenticado no Google Drive.");

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error("Falha ao descarregar ficheiro do Google Drive.");
  }

  return await res.text();
};

// 5. Delete file
export const deleteFileFromDrive = async (fileId: string): Promise<boolean> => {
  const token = await getDriveAccessToken();
  if (!token) throw new Error("Não autenticado no Google Drive.");

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  return res.ok;
};
