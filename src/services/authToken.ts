export const KEY = "cd_token";
export const getToken = () => localStorage.getItem(KEY);
export const setToken = (t: string) => localStorage.setItem(KEY, t);
export const clearToken = () => localStorage.removeItem(KEY);
export const isAuthed = () => {
  const t = getToken();
  if (!t) return false;
  // If token is a JWT and expired, clear it and treat as unauthenticated
  if (isTokenExpired()) {
    try {
      clearToken();
    } catch {}
    return false;
  }
  return true;
};

// Try to decode JWT payload safely
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payload)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Public helpers to read claims & user info from the JWT
export interface UserClaims {
  id?: string;
  email?: string;
  name?: string;
  exp?: number; // seconds since epoch
  nbf?: number; // seconds since epoch
  // Full raw claims for advanced uses
  raw?: any;
}

export function getTokenClaims(token?: string): any | null {
  const t = token ?? getToken();
  if (!t) return null;
  return decodeJwtPayload(t);
}

export function getUserClaims(token?: string): UserClaims | null {
  const claims = getTokenClaims(token);
  if (!claims) return null;
  const emailClaim =
    claims[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    ] ??
    claims.email ??
    claims.mail;
  const nameClaim =
    claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ??
    claims.name ??
    claims.preferred_username ??
    claims.sub;
  const idClaim = claims.id ?? claims.userId ?? claims.uid ?? claims.sub;
  const exp = typeof claims.exp === "number" ? claims.exp : undefined;
  const nbf = typeof claims.nbf === "number" ? claims.nbf : undefined;
  return {
    id: idClaim,
    email: emailClaim,
    name: nameClaim,
    exp,
    nbf,
    raw: claims,
  };
}

// Returns the full decoded JWT claims (or null). Useful when you need all fields
export function decodeToken(token?: string): any | null {
  return getTokenClaims(token);
}

export function getTokenExpiryMs(): number | null {
  const t = getToken();
  if (!t) return null;
  const payload = decodeJwtPayload(t);
  // exp in seconds
  const exp = payload?.exp;
  if (!exp || typeof exp !== "number") return null;
  return exp * 1000;
}

export function isTokenExpired(nowMs: number = Date.now()): boolean {
  const expMs = getTokenExpiryMs();
  return !!expMs && nowMs >= expMs;
}

export function msUntilExpiry(nowMs: number = Date.now()): number | null {
  const expMs = getTokenExpiryMs();
  if (!expMs) return null;
  return Math.max(0, expMs - nowMs);
}

// Global auth events to notify app to logout from anywhere (e.g., interceptors)
const LOGOUT_EVENT = "auth:logout";
export function notifyLogout() {
  try {
    window.dispatchEvent(new Event(LOGOUT_EVENT));
  } catch {}
}
export const onLogoutEvent = (handler: () => void) => {
  const fn = () => handler();
  window.addEventListener(LOGOUT_EVENT, fn);
  return () => window.removeEventListener(LOGOUT_EVENT, fn);
};
