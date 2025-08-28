import { useState } from "react";
import { isAuthed, setToken, clearToken } from "../services/authToken";

export function useAuthState() {
  const [authed, setAuthed] = useState(isAuthed());
  return {
    authed,
    login: (token: string) => {
      setToken(token);
      setAuthed(true);
    },
    logout: () => {
      clearToken();
      setAuthed(false);
    },
  };
}
