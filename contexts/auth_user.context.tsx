import { createContext, useContext } from 'react';
import { InAuthUser } from '@/hooks/interface/in_auth_user';
import useFirebaseAuth from '../hooks/use_firebase_auth';

interface InAuthUserContext {
  authUser: InAuthUser | null;
  loading: boolean;
  signInWithGoogle: (redirect?: string) => void;
  signInWithTwitter: () => void;
  signOut: () => void;
  isOwner: boolean;
  token: string | null;
  hasPrivilege: (privilege: number) => boolean;
}

const AuthUserContext = createContext<InAuthUserContext>({
  authUser: null,
  loading: true,
  signInWithGoogle: async () => ({ user: null, credential: null }),
  signInWithTwitter: async () => ({ user: null, credential: null }),
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  signOut: () => {},
  isOwner: false,
  token: null,
  hasPrivilege: () => false,
});

export const AuthUserProvider = function ({ children }: { children: React.ReactNode }) {
  const auth = useFirebaseAuth();
  return <AuthUserContext.Provider value={auth}>{children}</AuthUserContext.Provider>;
};
// custom hook to use the authUserContext and access authUser and loading
export const useAuth = () => useContext(AuthUserContext);
