import React, { useState } from 'react';
import { ArrowRight, Droplets, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    setError('');
    onSignIn();
  };

  return (
    <main className="min-h-screen bg-[#f3f7f8] text-slate-900 lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-slate-900 lg:block">
        <img
          src="/src/assets/images/water_surface_clean_1792955484968.jpg"
          alt="Sunlight moving across a clean freshwater surface"
          className="absolute inset-0 h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/85 via-sky-950/55 to-cyan-900/25" />
        <div className="relative flex min-h-screen flex-col justify-between p-12 xl:p-16">
          <a href="#login" className="inline-flex w-fit items-center gap-3 text-white" aria-label="AquaSense home">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
              <Droplets className="h-6 w-6 text-cyan-200" />
            </span>
            <span className="text-lg font-semibold tracking-tight">AquaSense</span>
          </a>

          <div className="max-w-xl pb-8">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium tracking-wide text-cyan-50 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              WATER QUALITY INTELLIGENCE
            </span>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
              Clear insights for a healthier water future.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-sky-100/85">
              Assess water samples, explore quality indicators, and make informed decisions with one simple workspace.
            </p>
            <div className="mt-9 flex items-center gap-3 text-sm text-sky-50/90">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <ShieldCheck className="h-4 w-4 text-cyan-200" />
              </span>
              <span>Thoughtful tools for environmental assessment</span>
            </div>
          </div>

          <p className="text-xs text-white/60">© 2026 AquaSense · Water Quality Assessment</p>
        </div>
      </section>

      <section id="login" className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <a href="#login" className="mb-12 inline-flex items-center gap-2.5 text-slate-900 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
              <Droplets className="h-5 w-5" />
            </span>
            <span className="font-semibold tracking-tight">AquaSense</span>
          </a>

          <div className="mb-9">
            <p className="mb-3 text-sm font-semibold text-sky-700">WELCOME BACK</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Sign in to your account</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Access your water quality assessment workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                <button type="button" className="text-xs font-semibold text-sky-700 hover:text-sky-800">Forgot password?</button>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                </button>
              </div>
            </div>

            {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}

            <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-sm text-slate-600">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-sky-600 focus:ring-sky-500" />
              Remember me
            </label>

            <button
              type="submit"
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800 focus:outline-none focus:ring-4 focus:ring-sky-700/20 active:scale-[0.99]"
            >
              Sign in
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            Sign-in is a demo interface. No account credentials are verified or stored.
          </p>
        </div>
      </section>
    </main>
  );
}
