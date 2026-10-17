import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

let cachedAccessToken: string | null = null;

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const checkRedirectAuth = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
      }
      return result.user;
    }
  } catch (error) {
    console.warn("Redirect sign-in check:", error);
  }
  return null;
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive');
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  provider.addScope('https://www.googleapis.com/auth/drive.readonly');
  
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }
    return result.user;
  } catch (error: any) {
    // Fall back to redirect if popup is blocked (common on mobile browsers)
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user' || /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await signInWithRedirect(auth, provider);
        return;
      } catch (redirectErr) {
        console.error("Error signing in with redirect", redirectErr);
        throw redirectErr;
      }
    }
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    cachedAccessToken = null;
  } catch (error) {
    console.error("Error signing out", error);
  }
};

