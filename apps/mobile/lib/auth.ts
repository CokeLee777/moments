import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as _signOut,
} from 'firebase/auth';
import { auth } from './firebase';

WebBrowser.maybeCompleteAuthSession();

// expo-auth-session v7 does not always auto-derive the reversed client ID on iOS.
// Google iOS OAuth clients require redirect_uri = {reversedClientId}:/oauth2redirect/google
function buildRedirectUri(): string | undefined {
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;
  if (Platform.OS === 'ios' && iosClientId) {
    const reversed = iosClientId.split('.').reverse().join('.');
    return `${reversed}:/oauth2redirect/google`;
  }
  return undefined;
}

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
    redirectUri: buildRedirectUri(),
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
  if (!id_token) throw new Error('Google sign-in did not return an id_token');
  const credential = GoogleAuthProvider.credential(id_token);
  await signInWithCredential(auth, credential);
}

export async function signOut(): Promise<void> {
  await _signOut(auth);
}
