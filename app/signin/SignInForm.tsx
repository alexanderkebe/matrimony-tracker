"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";

type Mode = "loading" | "signin" | "owner" | "invite" | "reset" | "invalid";
type Lang = "en" | "am";

const COPY = {
  en: {
    headline: "Every detail, beautifully in place.", tagline: "Planning workspace for Hanna’s team", eyebrow: "Your planning workspace",
    signinTitle: "Welcome back", signinText: "Sign in to see your couples and plans.",
    ownerTitle: "Create your owner account", ownerText: "Set up your workspace. You can invite your team after signing in.",
    inviteTitle: "Join the team", inviteText: "You’ve been invited as {role}. Create your account to continue.",
    resetTitle: "Choose a new password", resetText: "Set a new password for {email}. Other devices will be signed out.",
    invalidTitle: "This link can’t be used", invalidText: "It has expired or was already used. Ask the workspace owner for a new link.",
    name: "Full name", email: "Email address", password: "Password", newPassword: "New password", passwordHint: "At least 10 characters.",
    namePlaceholder: "e.g. Hanna Tesfaye", emailPlaceholder: "you@company.com", passwordPlaceholder: "Enter your password", newPasswordPlaceholder: "Create a secure password",
    show: "Show password", hide: "Hide password", signin: "Sign in", create: "Create account", save: "Save and sign in", working: "Please wait…",
    toSignin: "Go to sign in", newTitle: "New to the team?", newText: "Ask the owner for an invite link.", forgotTitle: "Forgot your password?", forgotText: "Ask the owner or an admin for a reset link.",
    roleAdmin: "an admin", rolePlanner: "a planner", privacy: "Couples’ details are only visible to signed-in team members.", failed: "Something went wrong. Please try again."
  },
  am: {
    headline: "እያንዳንዱ ዝርዝር፣ በውበት በቦታው።", tagline: "የሃና ቡድን የዝግጅት መስሪያ", eyebrow: "የዝግጅት መስሪያዎ",
    signinTitle: "እንኳን ደህና መጡ", signinText: "ጥንዶችዎን እና እቅዶችዎን ለማየት ይግቡ።",
    ownerTitle: "የባለቤት መለያዎን ይፍጠሩ", ownerText: "መስሪያዎን ያዘጋጁ። ከገቡ በኋላ ቡድንዎን መጋበዝ ይችላሉ።",
    inviteTitle: "ቡድኑን ይቀላቀሉ", inviteText: "እንደ {role} ተጋብዘዋል። ለመቀጠል መለያዎን ይፍጠሩ።",
    resetTitle: "አዲስ የይለፍ ቃል ይምረጡ", resetText: "ለ{email} አዲስ የይለፍ ቃል ያስገቡ። ሌሎች መሳሪያዎች ይወጣሉ።",
    invalidTitle: "ይህ ሊንክ መጠቀም አይቻልም", invalidText: "ጊዜው አልፏል ወይም ቀድሞ ጥቅም ላይ ውሏል። ከባለቤቱ አዲስ ሊንክ ይጠይቁ።",
    name: "ሙሉ ስም", email: "የኢሜይል አድራሻ", password: "የይለፍ ቃል", newPassword: "አዲስ የይለፍ ቃል", passwordHint: "ቢያንስ 10 ፊደላት።",
    namePlaceholder: "ለምሳሌ ሃና ተስፋዬ", emailPlaceholder: "you@company.com", passwordPlaceholder: "የይለፍ ቃልዎን ያስገቡ", newPasswordPlaceholder: "ጠንካራ የይለፍ ቃል ይፍጠሩ",
    show: "የይለፍ ቃሉን አሳይ", hide: "የይለፍ ቃሉን ደብቅ", signin: "ግባ", create: "መለያ ፍጠር", save: "አስቀምጥና ግባ", working: "እባክዎ ይጠብቁ…",
    toSignin: "ወደ መግቢያ ይሂዱ", newTitle: "ለቡድኑ አዲስ ነዎት?", newText: "ከባለቤቱ የግብዣ ሊንክ ይጠይቁ።", forgotTitle: "የይለፍ ቃልዎን ረሱ?", forgotText: "ከባለቤቱ ወይም ከአስተዳዳሪ የማደሻ ሊንክ ይጠይቁ።",
    roleAdmin: "አስተዳዳሪ", rolePlanner: "እቅድ አውጪ", privacy: "የጥንዶች መረጃ የሚታየው ለገቡ የቡድን አባላት ብቻ ነው።", failed: "ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።"
  }
};

const LANG_KEY = "matrimony-signin-lang";

/** Only same-site paths are allowed as the page to return to. */
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/signin") ? value : "/";
}

export default function SignInForm() {
  const [mode, setMode] = useState<Mode>("loading");
  const [lang, setLang] = useState<Lang>("en");
  const [code, setCode] = useState("");
  const [invite, setInvite] = useState<{ role?: string; email?: string | null }>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const words = COPY[lang];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "am" || saved === "en") setLang(saved);
    } catch { /* the default language is fine */ }
    const params = new URLSearchParams(location.search);
    const inviteCode = params.get("invite"), resetCode = params.get("reset");
    if (inviteCode || resetCode) {
      setCode(inviteCode || resetCode || "");
      fetch(`/api/auth/invite?code=${encodeURIComponent(inviteCode || resetCode || "")}`, { cache: "no-store" })
        .then(async (response) => {
          const result = await response.json().catch(() => ({}));
          if (!response.ok || result.kind !== (inviteCode ? "invite" : "reset")) return setMode("invalid");
          setInvite(result);
          setMode(inviteCode ? "invite" : "reset");
        })
        .catch(() => setMode("invalid"));
      return;
    }
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (response.ok) return location.replace(safeNext(params.get("next")));
        const result = await response.json().catch(() => ({}));
        if (result.error && response.status !== 401) setError(result.error);
        setMode(result.needsOwner ? "owner" : "signin");
      })
      .catch(() => setMode("signin"));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Saved only when chosen, so the remembered language is never overwritten by the default.
  function chooseLanguage(next: Lang) {
    setLang(next);
    try { localStorage.setItem(LANG_KEY, next); } catch { /* not remembered */ }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const action = mode === "signin" ? "signin" : mode === "reset" ? "reset" : "signup";
    const body = mode === "signin" ? { email, password }
      : mode === "reset" ? { code, password }
      : { name, email, password, ...(mode === "invite" ? { invite: code } : {}) };
    try {
      const response = await fetch(`/api/auth/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || words.failed);
      location.replace(safeNext(new URLSearchParams(location.search).get("next")));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : words.failed);
      setBusy(false);
    }
  }

  const role = invite.role === "admin" ? words.roleAdmin : words.rolePlanner;
  const title = { loading: "", signin: words.signinTitle, owner: words.ownerTitle, invite: words.inviteTitle, reset: words.resetTitle, invalid: words.invalidTitle }[mode];
  const text = { loading: "", signin: words.signinText, owner: words.ownerText, invite: words.inviteText.replace("{role}", role),
    reset: words.resetText.replace("{email}", invite.email || ""), invalid: words.invalidText }[mode];
  const creating = mode === "owner" || mode === "invite";

  const icon = (paths: string) => <svg className="auth-icon" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: paths }} />;
  const arrow = '<path d="M4 12h15m-6-6 6 6-6 6"/>';
  const eye = '<path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/>';
  const eyeOff = '<path d="M3 3l18 18M10.6 6.1A9.6 9.6 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.7 3.4M6.5 7.6C4 9.3 2.5 12 2.5 12s3.5 6 9.5 6a9 9 0 0 0 4.1-1M9.9 9.9a2.7 2.7 0 0 0 3.8 3.8"/>';
  const lock = '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5"/>';

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <picture>
          <source srcSet="/assets/signin-table.webp" type="image/webp" />
          <img className="auth-photo" src="/assets/signin-table.jpg" alt="" />
        </picture>
        <img className="auth-wordmark" src="/assets/matrimony-logo-transparent.png" alt="Matrimony — Leading from wedding up to matrimony" />
        <div className="auth-hero-copy">
          <p className="auth-headline">{words.headline}</p>
          <p className="auth-tagline">{words.tagline}</p>
          <span className="auth-signature">Matrimony by Hanna</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-language" role="group" aria-label="Language">
          <button type="button" aria-pressed={lang === "en"} onClick={() => chooseLanguage("en")}>EN</button>
          <button type="button" aria-pressed={lang === "am"} onClick={() => chooseLanguage("am")}>አማ</button>
        </div>
        {mode === "loading" ? <div className="auth-loading" aria-label={words.working} /> : (
          <form className="auth-form" onSubmit={submit} noValidate>
            <p className="auth-eyebrow">{words.eyebrow}</p>
            <h1>{title}</h1>
            <p className="auth-lead">{text}</p>
            {mode === "invalid" ? (
              <a className="auth-submit" href="/signin"><span>{words.toSignin}</span>{icon(arrow)}</a>
            ) : (
              <>
                {creating && (
                  <label className="auth-field">
                    <span>{words.name}</span>
                    <input name="name" autoComplete="name" required placeholder={words.namePlaceholder} value={name} onChange={(event) => setName(event.target.value)} />
                  </label>
                )}
                {mode !== "reset" && (
                  <label className="auth-field">
                    <span>{words.email}</span>
                    <input name="email" type="email" inputMode="email" autoComplete={creating ? "email" : "username"} required placeholder={words.emailPlaceholder} value={email} onChange={(event) => setEmail(event.target.value)} />
                  </label>
                )}
                {mode === "reset" && <input type="hidden" name="username" autoComplete="username" value={invite.email || ""} readOnly />}
                <div className="auth-field">
                  <label htmlFor="authPassword">{mode === "reset" ? words.newPassword : words.password}</label>
                  <span className="auth-password">
                    <input id="authPassword" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      required minLength={mode === "signin" ? undefined : 10} placeholder={mode === "signin" ? words.passwordPlaceholder : words.newPasswordPlaceholder}
                      value={password} onChange={(event) => setPassword(event.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-pressed={showPassword} aria-label={showPassword ? words.hide : words.show} title={showPassword ? words.hide : words.show}>
                      {icon(showPassword ? eyeOff : eye)}
                    </button>
                  </span>
                  {mode !== "signin" && <small>{words.passwordHint}</small>}
                </div>
                {error && <p className="auth-error" role="alert">{error}</p>}
                <button className="auth-submit" type="submit" disabled={busy}>
                  <span>{busy ? words.working : mode === "signin" ? words.signin : mode === "reset" ? words.save : words.create}</span>
                  {icon(arrow)}
                </button>
                {mode === "signin" && (
                  <div className="auth-help">
                    <p><strong>{words.newTitle}</strong>{words.newText}</p>
                    <p><strong>{words.forgotTitle}</strong>{words.forgotText}</p>
                  </div>
                )}
              </>
            )}
            <p className="auth-privacy">{icon(lock)}<span>{words.privacy}</span></p>
          </form>
        )}
      </section>
    </main>
  );
}
