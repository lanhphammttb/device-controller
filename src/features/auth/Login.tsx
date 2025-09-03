import React, { useState } from "react";
import { useLogin } from "../../features/auth/useLogin";
import Button from "../../components/ui/Button";

interface LoginProps {
  onSuccess?: (token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { mutate, isPending, isError } = useLogin();
  const [loginToken, setLoginToken] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      { username, password },
      {
        onSuccess: (data) => {
          // Lấy token từ data.NoiDung.Token (theo API của bạn)
          const token = data?.NoiDung?.Token ?? null;
          const status = data?.TrangThaiGui === 0;
          if (token && status) {
            setLoginToken(token);
            onSuccess?.(token);
          } else {
            throw new Error(
              data?.NoiDung?.ThongBao ?? "Đăng nhập không thành công"
            );
          }
        },
      }
    );
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1 className="login-title">Đăng nhập</h1>
        <form onSubmit={handleSubmit} className="form">
          <div className="form__row">
            <label className="form__label">Tài khoản</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form__row">
            <label className="form__label">Mật khẩu</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {isError && (
            <div className="notice notice--danger">Đăng nhập thất bại</div>
          )}
          {loginToken && (
            <div className="notice notice--success">Đăng nhập thành công!</div>
          )}
          <div className="form__row form__row--actions">
            <Button className="btn--primary" type="submit" disabled={isPending}>
              {isPending ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
