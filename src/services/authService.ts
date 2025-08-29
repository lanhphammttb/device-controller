import axios from "axios";
import {
  getToken,
  notifyLogout,
  msUntilExpiry,
  isTokenExpired,
} from "./authToken";

// Configure a shared axios instance
export const api = axios.create();

// Attach Authorization header
api.interceptors.request.use((config) => {
  const t = getToken();
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
  const response = await api.post(
    "http://118.107.77.104:2001/api/device/update-connect-device",
    { maThietBi, ketNoi }
  );
  return response.data;
};
export const updateDevice = async (device: any, token: string) => {
  const payload = {
    ...device,
    kinhDo:
      device.kinhDo === undefined ||
      device.kinhDo === null ||
      device.kinhDo === ""
        ? null
        : String(device.kinhDo),
    viDo:
      device.viDo === undefined || device.viDo === null || device.viDo === ""
        ? null
        : String(device.viDo),
  };
  const response = await api.post(
    "http://118.107.77.104:2001/api/device/update",
    payload
  );
  return response.data;
};
export const fetchDeviceList = async (token: string) => {
  const response = await api.get(
    "http://118.107.77.104:2001/api/device/list?page=1&pageSize=1000"
  );
  return response.data;
};

export const loginApi = async (username: string, password: string) => {
  // Thay đổi endpoint này thành API thật nếu có
  const response = await api.post(
    "https://gateway-ttn.tayninh.gov.vn/oauth/token",
    {
      username,
      password,
    }
  );
  return response.data;
};
