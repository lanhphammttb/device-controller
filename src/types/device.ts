export type Device = {
  baseUrl: string;
  mqttUrl: string;
  username: string;
  password: string;
  maThietBi: string;
  tenThietBi: string;
  maNhaCungCap: string;
  tenNhaCungCap: string;
  nguonID: string;
  tenNguon: string;
  dichID: string;
  tenDich: string;
  ketNoi: boolean;
  kinhDo?: string | null;
  viDo?: string | null;
};
