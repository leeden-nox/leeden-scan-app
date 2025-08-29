import { LocalStorage, SessionStorage } from "../constants/Storage";


const getHeader = () => {
  let accessToken = localStorage.getItem(LocalStorage.ACCESS_TOKEN);
  return {
    headers: {
      "Content-Type": "application/json",
      division: sessionStorage.getItem(SessionStorage.BRANCH_CODE),
      ...(accessToken ? { "auth-token": accessToken } : null),
    },
  };
};

export const getBaseUrl = () => {
  let moduleAPI = sessionStorage.getItem(SessionStorage.MODULE_API);
  let moduleKey = sessionStorage.getItem(SessionStorage.MODULE_PUBLIC_KEY);
  return {
    baseURL: moduleAPI || import.meta.env.VITE_PUBLIC_LMS_API_URL,
    LMSModuleAPI: moduleAPI,
    LMSModulePublicKey: moduleKey,
    LMSPublicKey: localStorage.getItem(LocalStorage.PUBLIC_KEY),
  };
};

const commonConfig = () => ({ ...getBaseUrl(), ...getHeader() });

export const APIHelper = {
  getConfig: (url) => {
    return { ...commonConfig(), url, method: "GET" };
  },
  postConfig: (url, data) => {
    return { ...commonConfig(), url, method: "POST", data };
  },
};