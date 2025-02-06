import { createContext, useContext, useMemo, useState } from 'react';

// gnb에 로고 파일을 수정하고 싶을 때 사용하는 react context를 만들어보자.

interface InGNBContext {
  logo: string;
  setLogo: (logo: string) => void;
}

const GNBContext = createContext<InGNBContext>({
  logo: '/gnb_main_logo_resize.png',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setLogo: () => {},
});

export const GNBProvider = function ({ children }: { children: React.ReactNode }) {
  const [logo, setLogo] = useState('/gnb_main_logo_resize.png');
  const contextValue = useMemo(() => ({ logo, setLogo }), [logo, setLogo]);
  return <GNBContext.Provider value={contextValue}>{children}</GNBContext.Provider>;
};

export const useGNB = () => useContext(GNBContext);
