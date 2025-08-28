import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../../services/authService";

export const useLogin = () => {
  return useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => loginApi(username, password),
  });
};
