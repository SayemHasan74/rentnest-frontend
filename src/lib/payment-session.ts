const CHECKOUT_SESSION_KEY = "rentnest_checkout_session_id";

const isBrowser = () => typeof window !== "undefined";

export const storeCheckoutSessionId = (sessionId: string) => {
  if (isBrowser()) {
    window.sessionStorage.setItem(CHECKOUT_SESSION_KEY, sessionId);
  }
};

export const getCheckoutSessionId = () => {
  if (!isBrowser()) {
    return null;
  }

  return window.sessionStorage.getItem(CHECKOUT_SESSION_KEY);
};

export const clearCheckoutSessionId = () => {
  if (isBrowser()) {
    window.sessionStorage.removeItem(CHECKOUT_SESSION_KEY);
  }
};
