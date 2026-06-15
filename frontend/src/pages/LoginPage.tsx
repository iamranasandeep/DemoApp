import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { login } from "../slices/authSlice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password123");

  useEffect(() => {
    if (auth.token) {
      navigate("/dashboard", { replace: true });
    }
  }, [auth.token, navigate]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void dispatch(login({ username, password }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.25),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(34,197,94,0.2),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(249,115,22,0.18),transparent_30%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 md:grid-cols-2">
        <section>
          <p className="mb-4 inline-block rounded-full border border-sky-300/50 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-200">Inventory Intelligence</p>
          <h1 className="text-4xl font-black leading-tight md:text-5xl">Control Stock Across Warehouses in Real Time</h1>
          <p className="mt-4 max-w-md text-slate-300">Track product flows, validate stock-outs, and run single or bulk movements from one centralized dashboard.</p>
        </section>

        <section className="rounded-3xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
          <h2 className="mb-1 text-2xl font-bold">Login</h2>
          <p className="mb-6 text-sm text-slate-400">Use your inventory operator credentials</p>

          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Username</label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 outline-none transition focus:border-sky-400"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Password</label>
              <input
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 outline-none transition focus:border-sky-400"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 px-4 py-2 font-semibold text-white transition hover:brightness-110"
              type="submit"
              disabled={auth.loading}
            >
              {auth.loading ? "Signing in..." : "Sign In"}
            </button>
            {auth.error && <p className="text-sm text-rose-400">{auth.error}</p>}
          </form>

          <p className="mt-6 text-xs text-slate-500">
            After login, continue to <Link className="text-sky-300" to="/dashboard">Dashboard</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
