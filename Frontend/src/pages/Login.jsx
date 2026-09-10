import { useState } from "react";
import {Mail, Lock, Eye,EyeOff,ArrowRight,GraduationCap,} from "lucide-react";
import { Link } from "react-router-dom";



export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  }

  function validate() {
    const next = {};

    if (!form.email.trim()) {
      next.email = "Enter your email or matricule";
    }

    if (!form.password) {
      next.password = "Enter your password";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      // TODO: Replace this with your real API call
      // Example:
      // await api.post("/auth/login", form);

      await new Promise((resolve) => setTimeout(resolve, 900));

      console.log("Login data:", form);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[minmax(360px,480px)_1fr] bg-[#FBF3E7] text-[#2B2118] font-sans">
      {/* LEFT PANEL */}
      <div className="flex flex-col justify-center px-6 py-16 lg:px-14 lg:py-12">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-14">
          <span className="grid place-items-center w-[34px] h-[34px] rounded-[10px] bg-[#D2652F] text-[#FFF5EA]">
            <GraduationCap size={20} strokeWidth={2.2} />
          </span>

          <span className="font-serif font-semibold text-[19px] tracking-tight">
            Edugest 360
          </span>
        </div>

        <div className="max-w-[380px]">
          {/* Heading */}
          <h1 className="font-serif font-semibold text-[34px] leading-[1.1] tracking-tight mb-2">
            Welcome back
          </h1>

          <p className="text-[#8A7C6D] text-[15px] mb-8">
            Sign in to reach your school workspace.
          </p>

          {/* Login Form */}
          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* Email / Matricule */}
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-[#5C4F42]">
                Email or matricule
              </span>

              <span
                className={`flex items-center gap-2.5 bg-white border-[1.5px] rounded-xl px-3.5 h-12 transition focus-within:border-[#D2652F] focus-within:ring-4 focus-within:ring-[#D2652F]/10 ${
                  errors.email
                    ? "border-[#C94F3F]"
                    : "border-[#EEE2D0]"
                }`}
              >
                <Mail
                  size={17}
                  strokeWidth={1.8}
                  className="text-[#B4A695] shrink-0"
                />

                <input
                  type="text"
                  name="email"
                  autoComplete="username"
                  placeholder="amina@logpom.edu.cm"
                  value={form.email}
                  onChange={handleChange}
                  className="flex-1 bg-transparent outline-none text-[14.5px] placeholder:text-[#C5B8A7] h-full"
                />
              </span>

              {errors.email && (
                <span className="text-[12.5px] text-[#C94F3F]">
                  {errors.email}
                </span>
              )}
            </label>

            {/* Password */}
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-medium text-[#5C4F42]">
                Password
              </span>

              <span
                className={`flex items-center gap-2.5 bg-white border-[1.5px] rounded-xl px-3.5 h-12 transition focus-within:border-[#D2652F] focus-within:ring-4 focus-within:ring-[#D2652F]/10 ${
                  errors.password
                    ? "border-[#C94F3F]"
                    : "border-[#EEE2D0]"
                }`}
              >
                <Lock
                  size={17}
                  strokeWidth={1.8}
                  className="text-[#B4A695] shrink-0"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="password"
                  value={form.password}
                  onChange={handleChange}
                  className="flex-1 bg-transparent outline-none text-[14.5px] placeholder:text-[#C5B8A7] h-full"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="text-[#B4A695] hover:text-[#8A7C6D] p-1 rounded-md"
                >
                  {showPassword ? (
                    <EyeOff size={17} strokeWidth={1.8} />
                  ) : (
                    <Eye size={17} strokeWidth={1.8} />
                  )}
                </button>
              </span>

              {errors.password && (
                <span className="text-[12.5px] text-[#C94F3F]">
                  {errors.password}
                </span>
              )}
            </label>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between -mt-1">
              <label className="flex items-center gap-1.5 text-[13.5px] text-[#5C4F42] cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-[#D2652F] w-3.5 h-3.5"
                />

                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-[#D2652F] hover:underline">Forgot password?</Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 rounded-xl bg-[#D2652F] text-[#FFF5EA] text-[15px] font-semibold flex items-center justify-center gap-2 transition hover:bg-[#BD5626] active:scale-[0.99] disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#D2652F] focus-visible:outline-offset-2"
            >
              {loading ? "Signing in…" : "Sign in"}

              {!loading && (
                <ArrowRight size={17} strokeWidth={2} />
              )}
            </button>
          </form>

          {/* Registration */}
          <p className="mt-7 text-[13.5px] text-[#8A7C6D] text-center">
            New institution?{" "}
            <Link to="/register-institution" className="text-[#D2652F] hover:underline">Register Your Institution</Link>
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden bg-[#2B2118] p-12">
        {/* Background glow */}
        <div className="absolute -top-[20%] -right-[10%] w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(210,101,47,0.35),transparent_70%)]" />

        {/* User card */}
        <div className="relative flex items-center gap-3 w-[260px] bg-[#34291D] border border-[#453A2B] rounded-2xl px-5 py-[18px] mb-4">
          <div className="w-10 h-10 rounded-full shrink-0 bg-gradient-to-br from-[#D2652F] to-[#E08A5C]" />

          <div className="flex flex-col gap-2 flex-1">
            <span className="block h-2 w-4/5 rounded bg-[#6B5C4A]" />
            <span className="block h-2 w-[55%] rounded bg-[#4A3F30]" />
          </div>
        </div>

        {/* Attendance card */}
        <div className="relative flex flex-col gap-1 w-[260px] ml-16 bg-[#34291D] border border-[#453A2B] rounded-2xl px-5 py-[18px]">
          <span className="font-serif text-[30px] font-semibold text-[#7FB17A]">
            100%
          </span>

          <span className="text-[12.5px] text-[#A99D8C]">
            Attendance today
          </span>
        </div>

        {/* Tagline */}
        <p className="relative font-serif italic font-medium text-[20px] text-[#F3EAD9] text-center max-w-[320px] leading-[1.45] mt-10">
          "One workspace for every classroom, cohort, and campus."
        </p>
      </div>
    </div>
  );
}