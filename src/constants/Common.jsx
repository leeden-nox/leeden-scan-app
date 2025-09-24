import { useEffect, useState } from "react";
import { LocalStorage, SessionStorage } from "./Storage";
import { Flex, notification, Spin } from "antd";
import axios from "axios";
import onScan from "onscan.js";
import jwt_decode from "jwt-decode";
import _ from "lodash";

export function RemoveLocalStorageOnLogout() {
  localStorage.removeItem(LocalStorage.ACCESS_TOKEN);
  localStorage.removeItem(LocalStorage.FIRST_TIME_LOGIN);
  localStorage.removeItem(LocalStorage.MODULE_GRANT);
  sessionStorage.removeItem(SessionStorage.MODULE_API);
  sessionStorage.removeItem(SessionStorage.MODULE_VIEWER_API);
  sessionStorage.removeItem(SessionStorage.MODULE_PUBLIC_KEY);
  sessionStorage.removeItem(SessionStorage.BRANCH_CODE);
  sessionStorage.removeItem(SessionStorage.DEFAULT_CURRENCY_CODE);
  sessionStorage.removeItem(SessionStorage.USER_DIMENSION);
  sessionStorage.removeItem(SessionStorage.DIMENSION_CONFIG);
}

export const ErrorPrinter = (error) => {
  let msg = "An error occurred";

  try {
    if (error.response?.status === 503) {
      msg = "Server overloaded, please try again later.";
    }
    if (error.response.data.Response) msg = error.response.data.Response;
    if (error.response.data.Message) msg = error.response.data.Message;
  } catch (e) {
    console.log(e);
  }

  notification.error({
    message: "Error",
    description: msg,
    placement: "bottomRight",
  });

  if (msg === "Invalid access token.") {
    RemoveLocalStorageOnLogout();
  }
};

export const SpinLoading = () => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const handler = (event) => {
      setLoading(event.detail.active);
    };
    window.addEventListener("loading", handler);
    return () => window.removeEventListener("loading", handler);
  }, []);

  if (!loading) return null;

  return (
    <Flex
      style={{
        height: "100vh",
        width: "100vw",
        marginTop: "50%",
        marginLeft: "50%",
      }}
    >
      <Spin spinning={loading} />
    </Flex>
  );
};
export const SpinLoadingByUseState = ({ loading = false }) => {
  if (!loading) return null;

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999, // Highest priority
      }}
    >
      <Spin spinning={loading} size="large" />
    </Flex>
  );
};

export const AxiosWithLoading = async (config) => {
  try {
    window.dispatchEvent(
      new CustomEvent("loading", {
        detail: { active: true },
      })
    );
    const response = await axios(config);
    return response;
  } catch (error) {
    ErrorPrinter(error);
    throw error;
  } finally {
    window.dispatchEvent(
      new CustomEvent("loading", {
        detail: { active: false },
      })
    );
  }
};

export const ScanListener = ({ onScanDetected }) => {
  // Simple debounce helper
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  useEffect(() => {
    const debouncedScan = debounce(onScanDetected, 100);

    onScan.attachTo(document, {
      suffixKeyCodes: [13], // Enter key as scan terminator
      reactToPaste: true,
      onScan: debouncedScan,
      minLength: 3, // Minimum length of scanned input
      keyCodeMapper: function (event) {
        // Include hyphen key codes
        if ([45, 173, 189].includes(event.which)) {
          return "-";
        }
        // Fallback to default decoder
        return onScan.decodeKeyEvent(event);
      },
    });

    return () => {
      onScan.detachFrom(document);
    };
  }, [onScanDetected]);

  return null; // No visual UI needed
};

export const decode = (token) => {
  try {
    return jwt_decode(token);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

export const decodeAccessToken = () => {
  let accessToken = localStorage.getItem(LocalStorage.ACCESS_TOKEN);
  if (!accessToken) return null;

  return decode(accessToken);
};

export const getUsernamefromToken = () => {
  let user = decodeAccessToken();
  if (user) return user.unique_name;
  else return null;
};

export const getEmailfromToken = () => {
  let user = decodeAccessToken();
  if (user) return user.email;
  else return null;
};

export const switchBranch = (code) => {
  let branches =
    JSON.parse(localStorage.getItem(LocalStorage.MODULE_GRANT)) || null;
  if (!branches) return null;
  let select = _.find(branches, function (o) {
    return o.DivisionBranchCode === code;
  });
  manageSessionBySwitchBranch(select);
};

export const manageSessionBySwitchBranch = (select) => {
  sessionStorage.setItem(SessionStorage.MODULE_API, select.LMSURI);
  sessionStorage.setItem(
    SessionStorage.MODULE_VIEWER_API,
    select.LMSViewerURI || ""
  );
  sessionStorage.setItem(SessionStorage.BRANCH_CODE, select.DivisionBranchCode);
  sessionStorage.setItem(
    SessionStorage.DEFAULT_CURRENCY_CODE,
    select.DefaultCurrencyCode
  );
  sessionStorage.setItem(
    SessionStorage.DIVISION_BRANCH_NAME,
    select.DivisionBranchName
  );
  sessionStorage.removeItem(SessionStorage.USER_DIMENSION);
  sessionStorage.removeItem(SessionStorage.DIMENSION_CONFIG);
};

let audio = new Audio("/sounds/success.mp3");
let errorAudio = new Audio("/sounds/error.wav");
export const playSound = () => {
  audio.play();
};
export const playErrorSound = () => {
  errorAudio.play();
};
