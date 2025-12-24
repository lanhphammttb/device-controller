export interface SourceInfo {
  id: string;          // nguonID (H53.183)
  name: string;        // tenNguon
  dichID: string;      // H53
}

export interface DestinationInfo {
  id: string;          // dichID (H53)
  name: string;        // tenDich
  baseUrl: string;
  mqttUrl: string;
  username: string;
  password: string;
}

export interface ImportDraft {
  maThietBi: string;
  tenThietBi: string;

  nguonID: string;
  tenNguon: string;

  dichID: string;
  tenDich: string;

  baseUrl: string;
  mqttUrl: string;
  username: string;
  password: string;

  viDo?: string;
  kinhDo?: string;
}
