import { GoogleAuthProvider, signInWithRedirect, signOut as _signOut } from 'firebase/auth';
import { auth } from './firebase';

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  await signInWithRedirect(auth, provider);
}

export async function signOut(): Promise<void> {
  await _signOut(auth);
}
