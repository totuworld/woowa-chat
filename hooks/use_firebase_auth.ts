import { User, GoogleAuthProvider, TwitterAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState, useEffect, useMemo } from 'react';
import FirebaseAuthClient from '@/models/auth/firebase_auth_client';
import { InAuthUser } from './interface/in_auth_user';
import { memberAddForClient } from '@/models/member/member.client.service';
import isOfType from '@/utils/type_guard';

function formatAuthUser(user: User): InAuthUser {
  return {
    uid: user.uid,
    email: user.email,
    photoURL: user.photoURL,
    displayName: user.displayName,
  };
}

export default function useFirebaseAuth() {
  const [authUser, setAuthUser] = useState<InAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [privileges, setPrivileges] = useState<number[]>([]);
  const isOwner = useMemo(() => privileges.length > 0, [privileges]);

  const authStateChanged = async (authState: User | null) => {
    console.log({ authStateChanged: authState });
    if (!authState) {
      setAuthUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const formattedUser = formatAuthUser(authState);
    setAuthUser(formattedUser);
    setLoading(false);
  };

  const clear = () => {
    setAuthUser(null);
    setLoading(true);
  };

  // const getRedirectResultPostProcess = async () => {
  //   const result = await getRedirectResult(FirebaseAuthClient.getInstance().Auth);
  //   console.info({ getRedirectResultPostProcess: result });
  //   if (result && result.providerId === 'twitter.com') {
  //     const credential = TwitterAuthProvider.credentialFromResult(result);
  //     if (credential) {
  //       const { secret, accessToken } = credential;
  //       console.info(credential);
  //       console.info({ secret, accessToken, uid: result.user.providerData[0].uid });
  //     }
  //   }
  // };

  async function signInWithGoogle(redirect?: string): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      const signInResult = await signInWithPopup(FirebaseAuthClient.getInstance().Auth, provider);

      if (signInResult.user) {
        const idToken = await signInResult.user.getIdToken();
        const { uid, displayName, photoURL, email } = signInResult.user;
        // uid
        // photoURL
        // displayName
        const resp = await memberAddForClient({
          data: {
            uid,
            displayName: displayName || undefined,
            email: email!,
            screenName: email!.split('@')[0],
            photoURL: photoURL || undefined,
            provider: 'google',
          },
          token: idToken,
        });
        if (
          resp.status === 400 &&
          resp.error &&
          resp.error.data &&
          isOfType<{ message: string }>(resp.error.data, 'message')
        ) {
          alert(resp.error.data.message);
          signOut();
        }
        if (resp.status === 200 && resp.payload) {
          console.info('redirect');
          window.location.href = redirect ?? '/list';
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function signInWithTwitter(): Promise<void> {
    const provider = new TwitterAuthProvider();
    try {
      const signInResult = await signInWithPopup(FirebaseAuthClient.getInstance().Auth, provider);
      if (signInResult.user) {
        const credential = TwitterAuthProvider.credentialFromResult(signInResult);
        if (credential === null) {
          return;
        }
        const { accessToken } = credential;
        const { secret } = credential;
        if (accessToken === undefined || secret === undefined) {
          throw new Error();
        }
        const idToken = await signInResult.user.getIdToken();
        const { uid, displayName, photoURL } = signInResult.user;
        // uid
        // photoURL
        // displayName
        const resp = await memberAddForClient({
          data: {
            uid,
            displayName: displayName || undefined,
            screenName: '',
            photoURL: photoURL || undefined,
            provider: 'twitter',
            twitterAuth: {
              accessToken,
              secret,
              uid: signInResult.user.providerData[0].uid,
            },
          },
          token: idToken,
        });
        if (resp.status === 200 && resp.payload) {
          window.location.href = resp.payload;
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  const signOut = () => FirebaseAuthClient.getInstance().Auth.signOut().then(clear);

  useEffect(() => {
    console.log('useEffect');
    // listen for Firebase state change
    const unsubscribe = FirebaseAuthClient.getInstance().Auth.onAuthStateChanged(authStateChanged);
    // getRedirectResultPostProcess();

    // unsubscribe to the listener when unmounting
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authUser === null) return;
    async function getTokenId() {
      const tokenId = await FirebaseAuthClient.getInstance().Auth.currentUser?.getIdToken();
      setToken(tokenId ?? null);
    }
    getTokenId();
  }, [authUser]);

  useEffect(() => {
    if (authUser === null) return;
    if (token === undefined || token === null) return;
    async function checkExist() {
      const resp = await fetch('/api/owner-member.exist', { headers: { authorization: token! } });
      if (resp.status !== 200) {
        return setPrivileges([]);
      }
      const respBody = await resp.json();
      return setPrivileges(resp.status === 200 && respBody.result === true ? respBody.info.privilege : []);
    }
    checkExist();
  }, [authUser, token]);

  const hasPrivilege = (privilege: number) => {
    const index = privileges.findIndex((p) => p === privilege);
    return index !== -1;
  };

  return {
    authUser,
    loading,
    signInWithGoogle,
    signInWithTwitter,
    signOut,
    isOwner,
    token,
    hasPrivilege,
  };
}
