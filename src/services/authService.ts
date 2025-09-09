import axios from "axios";
import {
  getToken,
  notifyLogout,
  msUntilExpiry,
  isTokenExpired,
} from "./authToken";

// Configure a shared axios instance
export const api = axios.create({ baseURL: "/api" }); // ✅ same-origin

// Attach Authorization header
api.interceptors.request.use((config) => {
  const t = getToken();
  // If token exists but is expired, trigger logout and block the request
  if (t && isTokenExpired()) {
    notifyLogout();
    return Promise.reject({ message: "Token expired" });
  }
  if (t) {
    config.headers = config.headers || {};
    (config.headers as any)["Authorization"] = `Bearer ${t}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      notifyLogout();
    }
    return Promise.reject(err);
  }
);

// Schedule auto logout based on token expiry
let expiryTimer: number | null = null;
export function scheduleAutoLogout() {
  if (expiryTimer) {
    window.clearTimeout(expiryTimer);
    expiryTimer = null;
  }
  const ms = msUntilExpiry();
  if (ms === null) return; // token might be opaque, skip
  if (isTokenExpired()) {
    notifyLogout();
    return;
  }
  expiryTimer = window.setTimeout(() => notifyLogout(), ms);
}
export const updateConnectDevice = async (
  maThietBi: string,
  ketNoi: boolean,
  token: string
) => {
  const response = await api.post("/device/update-connect-device", {
    maThietBi,
    ketNoi,
  });
  return response.data;
};
export const updateDevice = async (device: any, token: string) => {
  const toStrOrZero = (v: any) => {
    if (v === undefined || v === null) return "0";
    if (typeof v === "string") {
      const t = v.trim();
      return t === "" ? "0" : t;
    }
    return String(v);
  };
  const payload = {
    ...device,
    kinhDo: toStrOrZero(device.kinhDo),
    viDo: toStrOrZero(device.viDo),
  };
  const response = await api.post("/device/update", payload);
  return response.data;
};

export const fetchDeviceList = async () => {
  const { data } = await api.get("/device/list", {
    params: { page: 1, pageSize: 1000 },
  });
  return data;
};

// Login vẫn HTTPS bên ngoài (không mixed content). Nếu dính CORS thì thêm rewrite /auth sau.
export const loginApi = async (username: string, password: string) => {
  const res = await axios.post(
    "https://gateway-ttn.tayninh.gov.vn/oauth/token",
    { username, password }
  );
  return res.data;
};
