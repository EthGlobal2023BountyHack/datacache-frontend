import { createContext } from 'react';

type UserContextType = [
  {
    user: any;
    isLoading: boolean;
  },
  (data: any) => void,
  () => Promise<void>,
  (arg) => Promise<void>,
];
export const UserContext = createContext<UserContextType>(null);
