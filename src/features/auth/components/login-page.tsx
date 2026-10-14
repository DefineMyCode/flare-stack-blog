import { Link } from "@tanstack/react-router";
import { Check, CircleAlert, Loader2 } from "lucide-react";
import { type ReactNode } from "react";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { GithubIcon } from "@/components/common/brand-icon";
import type { useLoginForm } from "../hooks/use-login-form";
import type { useSocialLogin } from "../hooks/use-social-login";
import { Callout } from "@/components/ui/callout";
import { StatusText } from "@/components/ui/status-text";
import { m } from "@/paraglide/messages";

interface LoginPageProps {
  isEmailConfigured: boolean;
  loginForm: ReturnType<typeof useLoginForm> & { turnstilePending: boolean };
  socialLogin: ReturnType<typeof useSocialLogin>;
  turnstileElement: ReactNode;
}

export function LoginPage({
  isEmailConfigured,
  loginForm,
  socialLogin,
  turnstileElement,
}: LoginPageProps) {
  const {
    register,
    errors,
    handleSubmit,
    loginStep,
    isSubmitting,
    turnstilePending,
    loginError,
    resendFeedback,
    isResending,
    resendVerification,
  } = loginForm;
  const busy =
    isSubmitting ||
    loginStep !== "IDLE" ||
    socialLogin.isLoading ||
    isResending;
  return (
    <div className="auth-page">
      <header className="auth-heading">
        <h1>{m.login_title()}</h1>
        <p>{m.login_welcome_back()}</p>
      </header>
      <button
        type="button"
        onClick={socialLogin.handleGithubLogin}
        disabled={busy}
        className={`auth-action ${isEmailConfigured ? "fuwari-btn-regular" : "fuwari-btn-primary"}`}
      >
        {socialLogin.isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <GithubIcon size={18} />
        )}
        {socialLogin.isLoading
          ? m.login_social_connecting()
          : m.login_github_continue()}
      </button>
      {socialLogin.errorMessage && (
        <StatusText error>{socialLogin.errorMessage}</StatusText>
      )}
      {isEmailConfigured && (
        <>
          <div className="auth-divider">
            <span>{m.login_email_alternative()}</span>
          </div>
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <FormField
              label={m.login_email_address()}
              error={errors.email?.message}
              required
            >
              <Input
                {...register("email")}
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={m.login_email_placeholder()}
                disabled={busy}
              />
            </FormField>
            <FormField
              label={m.login_password()}
              error={errors.password?.message}
              required
              action={
                <Link to="/forgot-password" className="auth-field-link">
                  {m.login_forgot_password_fuwari()}
                </Link>
              }
            >
              <PasswordInput
                {...register("password")}
                autoComplete="current-password"
                placeholder={m.login_password_placeholder()}
                disabled={busy}
              />
            </FormField>
            {loginError && (
              <Callout
                className="auth-feedback"
                tone="danger"
                icon={CircleAlert}
                role="alert"
                action={
                  loginError.unverified && (
                    <button
                      type="button"
                      onClick={resendVerification}
                      disabled={busy || turnstilePending}
                    >
                      {isResending ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : null}
                      {m.login_resend_verification()}
                    </button>
                  )
                }
              >
                {loginError.message}
              </Callout>
            )}
            {resendFeedback && (
              <p className="auth-note" role="status">
                {resendFeedback}
              </p>
            )}
            <div className="auth-verification">{turnstileElement}</div>
            <button
              type="submit"
              className="auth-action fuwari-btn-primary"
              disabled={busy || turnstilePending}
            >
              {loginStep === "VERIFYING" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : loginStep === "SUCCESS" ? (
                <Check size={16} />
              ) : null}
              {loginStep === "VERIFYING"
                ? m.login_submitting()
                : loginStep === "SUCCESS"
                  ? m.login_toast_success()
                  : m.login_email_submit()}
            </button>
          </form>
          <footer className="auth-register">
            {m.login_no_account()}{" "}
            <Link to="/register">{m.login_email_register()}</Link>
          </footer>
        </>
      )}
    </div>
  );
}
