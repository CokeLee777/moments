import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as _signOut,
} from 'firebase/auth';
import { auth } from './firebase';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  });

  return {
    request,
    response,
    signIn: () => promptAsync(),
  };
}

export async function handleGoogleResponse(
  response: ReturnType<typeof Google.useAuthRequest>[1],
): Promise<void> {
  if (response?.type !== 'success') return;
  const { id_token } = response.params;
  const credential = GoogleAuthProvider.credential(id_token);
  await signInWithCredential(auth, credential);
}

export async function signOut(): Promise<void> {
  await _signOut(auth);
}
