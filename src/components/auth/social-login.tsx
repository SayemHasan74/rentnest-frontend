"use client";

import Script from "next/script";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { AuthPayload } from "@/types/rentnest";

type GoogleCredentialResponse = {
  credential?: string;
};

type FacebookLoginResponse = {
  authResponse?: {
    accessToken: string;
  };
  status?: string;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, string | number | boolean>,
          ) => void;
        };
      };
    };
    FB?: {
      init: (options: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: FacebookLoginResponse) => void,
        options: { scope: string; return_scopes: boolean },
      ) => void;
    };
  }
}

type SocialLoginProps = {
  disabled: boolean;
  onAuthenticated: (auth: AuthPayload) => void;
  onError: (error: unknown) => void;
  onLoadingChange: (loading: boolean) => void;
};

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
const facebookApiVersion = "v24.0";

export function SocialLogin({
  disabled,
  onAuthenticated,
  onError,
  onLoadingChange,
}: SocialLoginProps) {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const googleInitializedRef = useRef(false);
  const facebookInitializedRef = useRef(false);
  const [providerLoading, setProviderLoading] = useState<"google" | "facebook" | null>(null);

  const setLoading = useCallback(
    (provider: "google" | "facebook" | null) => {
      setProviderLoading(provider);
      onLoadingChange(Boolean(provider));
    },
    [onLoadingChange],
  );

  const finishSocialLogin = useCallback(
    async (request: Promise<AuthPayload>, provider: "google" | "facebook") => {
      setLoading(provider);

      try {
        onAuthenticated(await request);
      } catch (error) {
        onError(error);
        setLoading(null);
      }
    },
    [onAuthenticated, onError, setLoading],
  );

  const initializeGoogle = useCallback(() => {
    if (
      !googleClientId ||
      !window.google ||
      !googleButtonRef.current ||
      googleInitializedRef.current
    ) {
      return;
    }

    googleInitializedRef.current = true;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => {
        if (!response.credential) {
          onError(new Error("Google did not return a sign-in credential."));
          return;
        }

        void finishSocialLogin(
          api.auth.googleLogin({ credential: response.credential }),
          "google",
        );
      },
    });
    window.google.accounts.id.renderButton(googleButtonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "rectangular",
      logo_alignment: "left",
      width: Math.min(400, googleButtonRef.current.clientWidth || 280),
    });
  }, [finishSocialLogin, onError]);

  useEffect(() => {
    initializeGoogle();
  }, [initializeGoogle]);

  const initializeFacebook = () => {
    if (!facebookAppId || !window.FB || facebookInitializedRef.current) {
      return;
    }

    window.FB.init({
      appId: facebookAppId,
      cookie: true,
      xfbml: false,
      version: facebookApiVersion,
    });
    facebookInitializedRef.current = true;
  };

  const handleFacebookLogin = () => {
    if (!window.FB || !facebookInitializedRef.current) {
      onError(new Error("Facebook Login is still loading. Please try again."));
      return;
    }

    window.FB.login(
      (response) => {
        if (!response.authResponse?.accessToken) {
          if (response.status !== "unknown") {
            onError(new Error("Facebook sign-in was not completed."));
          }
          return;
        }

        void finishSocialLogin(
          api.auth.facebookLogin({ accessToken: response.authResponse.accessToken }),
          "facebook",
        );
      },
      { scope: "public_profile,email", return_scopes: true },
    );
  };

  const providersConfigured = Boolean(googleClientId || facebookAppId);

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-300" />
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Or continue with
        </span>
        <span className="h-px flex-1 bg-slate-300" />
      </div>

      <div className="mt-4 grid gap-3">
        {googleClientId ? (
          <>
            <Script
              id="google-identity-services"
              onLoad={initializeGoogle}
              src="https://accounts.google.com/gsi/client"
              strategy="afterInteractive"
            />
            <div
              aria-label="Continue with Google"
              className={`flex min-h-10 w-full justify-center overflow-hidden ${
                disabled ? "pointer-events-none opacity-60" : ""
              }`}
              ref={googleButtonRef}
            />
          </>
        ) : null}

        {facebookAppId ? (
          <>
            <Script
              id="facebook-jssdk"
              onLoad={initializeFacebook}
              src="https://connect.facebook.net/en_US/sdk.js"
              strategy="afterInteractive"
            />
            <button
              className="flex h-10 w-full items-center justify-center gap-3 rounded-md border border-[#1877f2] bg-[#1877f2] px-4 text-sm font-semibold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={disabled || providerLoading !== null}
              onClick={handleFacebookLogin}
              type="button"
            >
              {providerLoading === "facebook" ? (
                <Loader2 className="animate-spin" size={17} aria-hidden="true" />
              ) : (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white font-bold text-[#1877f2]" aria-hidden="true">
                  f
                </span>
              )}
              {providerLoading === "facebook" ? "Connecting..." : "Continue with Facebook"}
            </button>
          </>
        ) : null}

        {!providersConfigured ? (
          <p className="text-center text-xs text-slate-500">
            Social login is unavailable in this environment.
          </p>
        ) : null}

        {providerLoading ? (
          <p
            aria-live="polite"
            className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600"
            role="status"
          >
            <Loader2 className="animate-spin" size={14} aria-hidden="true" />
            Completing {providerLoading === "google" ? "Google" : "Facebook"} sign-in...
          </p>
        ) : null}
      </div>
    </div>
  );
}
