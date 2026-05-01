import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as _signOut,
} from 'firebase/auth';
import { auth } from './firebase';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
});

export async function signInWithGoogle(): Promise<void> {
  await GoogleSignin.hasPlayServices();
  const { data } = await GoogleSignin.signIn();
  if (!data?.idToken) throw new Error('Google sign-in did not return an idToken');
  const credential = GoogleAuthProvider.credential(data.idToken);
  await signInWithCredential(auth, credential);
}

export async function signOut(): Promise<void> {
  await GoogleSignin.signOut();
  await _signOut(auth);
}
