export const updateConnectDevice = async (
  maThietBi: string,
  ketNoi: boolean,
  token: string
) => {
  const response = await axios.post(
    "http://118.107.77.104:2001/api/device/update-connect-device",
    { maThietBi, ketNoi },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
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
  const response = await axios.post(
    "http://118.107.77.104:2001/api/device/update",
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
export const fetchDeviceList = async (token: string) => {
  const response = await axios.get(
    "http://118.107.77.104:2001/api/device/list?page=1&pageSize=1000",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};
import axios from "axios";

export const loginApi = async (username: string, password: string) => {
  // Thay đổi endpoint này thành API thật nếu có
  const response = await axios.post(
    "https://gateway-ttn.tayninh.gov.vn/oauth/token",
    {
      username,
      password,
    }
  );
  return response.data;
};
