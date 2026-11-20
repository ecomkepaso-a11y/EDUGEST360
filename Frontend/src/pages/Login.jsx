import { useState } from "react";
import {Mail,Lock,Eye,EyeOff,ArrowRight,ShieldCheck,BookOpen,Users,GraduationCap,} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { loginRequest } from "../../../Backend/src/api/auth.js";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

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
      next.email = "Veuillez renseigner votre identifiant.";
    }

    if (!form.password) {
      next.password = "Veuillez renseigner votre mot de passe.";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);

    try {
      // The backend expects { login, password }, so the "email" field is sent as login
      const { token, utilisateur } = await loginRequest(
        form.email.trim(),
        form.password
      );

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(utilisateur));

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F1EAE0] text-[#403A34] font-sans">
      <div className="grid min-h-screen lg:grid-cols-[1.04fr_0.96fr]">

        {/* =====================================================
            LEFT SIDE — BRAND / VISUAL
        ====================================================== */}

        <section className="relative hidden min-h-screen overflow-hidden bg-[#E9E0D2] lg:flex">

          {/* Soft background gradients */}

          <div
            className="
              absolute
              -left-32
              top-20
              h-[500px]
              w-[500px]
              rounded-full
              bg-[#D8C7A8]/25
              blur-3xl
            "
          />

          <div
            className="
              absolute
              right-[-160px]
              top-[8%]
              h-[620px]
              w-[620px]
              rounded-full
              bg-white/60
              blur-3xl
            "
          />

          <div
            className="
              absolute
              bottom-[-200px]
              left-[5%]
              h-[500px]
              w-[500px]
              rounded-full
              bg-[#D5C3A6]/20
              blur-3xl
            "
          />

          {/* Very subtle grid */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              opacity-[0.25]
            "
            style={{
              backgroundImage: `
                linear-gradient(rgba(100,85,65,0.12) 1px, transparent 1px),
                linear-gradient(90deg, rgba(100,85,65,0.12) 1px, transparent 1px)
              `,
              backgroundSize: "72px 72px",
            }}
          />

          {/* =================================================
              LOGO
          ================================================== */}

          <div className="absolute left-16 top-5 z-20 flex items-center gap-3">

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-[13px]
                bg-[#3F3A34]
                text-[#F6EBD8]
                shadow-[0_8px_25px_rgba(55,45,35,0.18)]
              "
            >
              <div className="flex h-5 items-end gap-[3px]">
                <span className="h-2.5 w-[4px] rounded-sm bg-[#F6EBD8]" />
                <span className="h-4 w-[4px] rounded-sm bg-[#F6EBD8]" />
                <span className="h-5 w-[4px] rounded-sm bg-[#F6EBD8]" />
              </div>
            </div>

            <div className="flex items-center text-[20px] font-semibold tracking-[-0.04em]">
              <span className="text-[#292521]">EDUGEST</span>
              <span className="ml-1 text-[#B68B43]">360</span>
            </div>
          </div>

          {/* =================================================
              CENTRAL VISUAL
          ================================================== */}

          <div className="absolute left-1/2 top-[43%] z-10 h-[430px] w-[570px] -translate-x-1/2 -translate-y-1/2">

            {/* Large soft circular glow */}

            <div
              className="
                absolute
                left-1/2
                top-[40px]
                h-[330px]
                w-[330px]
                -translate-x-1/2
                rounded-full
                border
                border-white/70
                bg-white/20
                shadow-[inset_0_0_80px_rgba(255,255,255,0.55)]
                backdrop-blur-[3px]
              "
            />

            {/* Golden circle */}

            <div
              className="
                absolute
                left-[235px]
                top-[55px]
                h-[120px]
                w-[120px]
                rounded-full
                bg-gradient-to-br
                from-[#F4D9A0]
                to-[#D9B66B]
                shadow-[0_15px_40px_rgba(181,137,58,0.20)]
              "
            />

            {/* Abstract school / building */}

            <div
              className="
                absolute
                left-[195px]
                top-[145px]
                h-[155px]
                w-[200px]
                rounded-[16px]
                border
                border-white/80
                bg-white/45
                shadow-[0_25px_50px_rgba(80,65,45,0.12)]
                backdrop-blur-xl
              "
            >

              {/* Roof */}

              <div
                className="
                  absolute
                  left-1/2
                  top-[-53px]
                  h-[105px]
                  w-[105px]
                  -translate-x-1/2
                  rotate-45
                  rounded-[8px]
                  bg-white/30
                  border
                  border-white/50
                "
              />

              {/* Door */}

              <div
                className="
                  absolute
                  bottom-0
                  left-1/2
                  h-[77px]
                  w-[31px]
                  -translate-x-1/2
                  rounded-t-[9px]
                  bg-[#3F3A34]
                "
              />

              {/* Windows */}

              <div className="absolute bottom-[28px] left-[36px] h-[52px] w-[28px] rounded-t-[10px] bg-[#C8C0B5]/75" />

              <div className="absolute bottom-[28px] right-[36px] h-[52px] w-[28px] rounded-t-[10px] bg-[#C8C0B5]/75" />
            </div>

            {/* =================================================
                FLOATING CARD — APPRENDRE
            ================================================== */}

            <div
              className="
                absolute
                left-[40px]
                top-[95px]
                flex
                h-[82px]
                w-[175px]
                rotate-[-5deg]
                items-center
                gap-4
                rounded-[22px]
                border
                border-white/80
                bg-white/55
                px-5
                shadow-[0_20px_45px_rgba(75,60,40,0.12)]
                backdrop-blur-xl
              "
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEE6D9]/90">
                <BookOpen
                  size={22}
                  strokeWidth={1.7}
                  className="text-[#4A443D]"
                />
              </div>

              <span className="text-[14px] font-semibold text-[#4A443D]">
                Apprendre
              </span>
            </div>

            {/* =================================================
                FLOATING CARD — ATTENDANCE
            ================================================== */}

            <div
              className="
                absolute
                right-[38px]
                top-[115px]
                flex
                h-[90px]
                w-[168px]
                rotate-[5deg]
                flex-col
                justify-center
                rounded-[21px]
                border
                border-white/80
                bg-white/60
                px-5
                shadow-[0_20px_45px_rgba(75,60,40,0.12)]
                backdrop-blur-xl
              "
            >
              <div className="flex items-center gap-3">

                <div
                  className="
                    relative
                    flex
                    h-[48px]
                    w-[48px]
                    items-center
                    justify-center
                    rounded-full
                  "
                  style={{
                    background:
                      "conic-gradient(#B68B43 0deg 338deg, #E6DED2 338deg 360deg)",
                  }}
                >
                  <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[#F9F6F0]">
                    <span className="text-[12px] font-semibold text-[#5B534A]">
                      94%
                    </span>
                  </div>
                </div>

                <span className="text-[12px] font-medium text-[#756B60]">
                  Présence
                </span>
              </div>
            </div>

            {/* =================================================
                FLOATING CARD — COMMUNITY
            ================================================== */}

            <div
              className="
                absolute
                bottom-[12px]
                right-[68px]
                flex
                h-[110px]
                w-[220px]
                rotate-[-4deg]
                flex-col
                justify-center
                rounded-[22px]
                border
                border-white/80
                bg-white/60
                px-5
                shadow-[0_20px_45px_rgba(75,60,40,0.12)]
                backdrop-blur-xl
              "
            >

              <div className="flex items-center">

                <div className="flex -space-x-2">

                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#403B35] text-[10px] font-semibold text-white">
                    SK
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#83978B] text-[10px] font-semibold text-white">
                    AM
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#BBA27A] text-[10px] font-semibold text-white">
                    +8
                  </span>

                </div>

              </div>

              <div className="mt-3 flex items-center gap-2">
                <Users size={13} className="text-[#918475]" />

                <span className="text-[11px] font-medium text-[#71675C]">
                  Une communauté connectée
                </span>
              </div>
            </div>

            {/* Decorative dots */}

            <span className="absolute left-[130px] top-[48px] h-4 w-4 rounded-full bg-[#B68B43]" />

            <span className="absolute bottom-[55px] left-[315px] h-2 w-2 rounded-full bg-[#B68B43]" />

          </div>

          {/* =================================================
              LEFT BOTTOM TEXT
          ================================================== */}

          <div className="absolute bottom-10 left-16 z-20 max-w-[590px]">

            <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B68B43]">
              L'école de demain, dès aujourd'hui
            </p>

            <h1
              className="
                max-w-[570px]
                text-[46px]
                font-medium
                leading-[0.98]
                tracking-[-0.055em]
                text-[#332D27]
              "
            >
              L’administration scolaire,
              <span className="block text-[#958A7C]">
                réinventée.
              </span>
            </h1>

            <p className="mt-7 max-w-[500px] text-[15px] leading-7 text-[#756B60]">
              Une plateforme intelligente pour connecter établissements,
              enseignants, élèves et familles.
            </p>

            {/* Feature labels */}

            <div className="mt-10 flex items-center gap-8">

              <FeatureLabel text="INTELLIGENT" />

              <FeatureLabel text="HUMAIN" />

              <FeatureLabel text="SÉCURISÉ" />

            </div>

          </div>
        </section>

        {/* =====================================================
            RIGHT SIDE — LOGIN
        ====================================================== */}

        <section className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#F2ECE3] px-5 py-8 sm:px-8 lg:px-14">

          {/* Soft background glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-40
              -top-40
              h-[520px]
              w-[520px]
              rounded-full
              bg-white/70
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-40
              -left-40
              h-[480px]
              w-[480px]
              rounded-full
              bg-[#D8C8AF]/20
              blur-3xl
            "
          />

          {/* Mobile logo */}

          <div className="relative mb-8 flex items-center gap-3 lg:hidden">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-[12px]
                bg-[#3F3A34]
                text-[#F6EBD8]
              "
            >
              <div className="flex h-5 items-end gap-[3px]">
                <span className="h-2.5 w-[4px] rounded-sm bg-[#F6EBD8]" />
                <span className="h-4 w-[4px] rounded-sm bg-[#F6EBD8]" />
                <span className="h-5 w-[4px] rounded-sm bg-[#F6EBD8]" />
              </div>
            </div>

            <div className="text-[19px] font-semibold tracking-[-0.04em]">
              <span className="text-[#292521]">EDUGEST</span>
              <span className="ml-1 text-[#B68B43]">360</span>
            </div>

          </div>

          {/* =================================================
              LOGIN CARD
          ================================================== */}

          <div className="relative mx-auto w-full max-w-[614px]">

            <div
              className="
                rounded-[32px]
                border
                border-white/90
                bg-white/65
                p-7
                shadow-[0_30px_80px_rgba(91,75,55,0.13)]
                backdrop-blur-2xl
                sm:p-10
                lg:p-11
              "
            >

              {/* Card header */}

              <div className="flex items-start justify-between">

                <div>

                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B68B43]">
                    Votre espace sécurisé
                  </p>

                  <h2 className="mt-4 text-[40px] font-semibold leading-none tracking-[-0.045em] text-[#403A34] sm:text-[43px]">
                    Bienvenue
                  </h2>

                  <p className="mt-4 text-[15px] leading-6 text-[#857A6D]">
                    Connectez-vous à votre espace EDUGEST.
                  </p>

                </div>

                {/* Security icon */}

                <div
                  className="
                    hidden
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-[17px]
                    bg-[#EEE7DB]
                    sm:flex
                  "
                >
                  <ShieldCheck
                    size={24}
                    strokeWidth={1.5}
                    className="text-[#B68B43]"
                  />
                </div>

              </div>

              {/* =================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="mt-10 flex flex-col gap-6"
              >

                {/* EMAIL */}

                <label className="flex flex-col gap-2">

                  <span className="text-[13px] font-semibold text-[#5D554C]">
                    Identifiant
                  </span>

                  <span
                    className={`
                      flex
                      h-[64px]
                      items-center
                      gap-3
                      rounded-[17px]
                      border
                      bg-white/65
                      px-5
                      transition-all
                      focus-within:bg-white/85
                      focus-within:shadow-[0_8px_25px_rgba(80,65,45,0.06)]
                      ${
                        errors.email
                          ? "border-red-400 focus-within:border-red-400"
                          : "border-[#DDD5CA] focus-within:border-[#B68B43]"
                      }
                    `}
                  >

                    <Mail
                      size={20}
                      strokeWidth={1.5}
                      className="shrink-0 text-[#A99B89]"
                    />

                    <input
                      type="text"
                      name="email"
                      autoComplete="username"
                      placeholder="Votre identifiant"
                      value={form.email}
                      onChange={handleChange}
                      className="
                        h-full
                        flex-1
                        bg-transparent
                        text-[15px]
                        text-[#403A34]
                        outline-none
                        placeholder:text-[#B4A99C]
                      "
                    />

                  </span>

                  {errors.email && (
                    <span className="px-1 text-[12px] text-red-500">
                      {errors.email}
                    </span>
                  )}

                </label>

                {/* PASSWORD */}

                <label className="flex flex-col gap-2">

                  <span className="text-[13px] font-semibold text-[#5D554C]">
                    Mot de passe
                  </span>

                  <span
                    className={`
                      flex
                      h-[64px]
                      items-center
                      gap-3
                      rounded-[17px]
                      border
                      bg-white/65
                      px-5
                      transition-all
                      focus-within:bg-white/85
                      focus-within:shadow-[0_8px_25px_rgba(80,65,45,0.06)]
                      ${
                        errors.password
                          ? "border-red-400 focus-within:border-red-400"
                          : "border-[#DDD5CA] focus-within:border-[#B68B43]"
                      }
                    `}
                  >

                    <Lock
                      size={20}
                      strokeWidth={1.5}
                      className="shrink-0 text-[#A99B89]"
                    />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      autoComplete="current-password"
                      placeholder="Votre mot de passe"
                      value={form.password}
                      onChange={handleChange}
                      className="
                        h-full
                        flex-1
                        bg-transparent
                        text-[15px]
                        text-[#403A34]
                        outline-none
                        placeholder:text-[#B4A99C]
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                      className="
                        rounded-lg
                        p-1.5
                        text-[#A99B89]
                        transition-colors
                        hover:bg-[#EEE7DB]
                        hover:text-[#6D6255]
                      "
                    >
                      {showPassword ? (
                        <EyeOff
                          size={19}
                          strokeWidth={1.5}
                        />
                      ) : (
                        <Eye
                          size={19}
                          strokeWidth={1.5}
                        />
                      )}
                    </button>

                  </span>

                  {errors.password && (
                    <span className="px-1 text-[12px] text-red-500">
                      {errors.password}
                    </span>
                  )}

                </label>

                {/* REMEMBER / FORGOT */}

                <div className="flex items-center justify-between">

                  <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#70675D]">

                    <input
                      type="checkbox"
                      className="
                        h-4
                        w-4
                        cursor-pointer
                        rounded
                        border-[#CFC5B7]
                        accent-[#403A34]
                      "
                    />

                    <span>Se souvenir de moi</span>

                  </label>

                  <Link
                    to="/forgot-password"
                    className="
                      text-[13px]
                      font-semibold
                      text-[#817366]
                      transition-colors
                      hover:text-[#B68B43]
                    "
                  >
                    Mot de passe oublié ?
                  </Link>

                </div>

                {/* =================================================
                    SERVER ERROR (wrong credentials, inactive account...)
                ================================================== */}

                {serverError && (
                  <div className="rounded-[14px] border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                    {serverError}
                  </div>
                )}

                {/* =================================================
                    LOGIN BUTTON
                ================================================== */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group
                    mt-1
                    flex
                    h-[66px]
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-[17px]
                    bg-[#3F3A34]
                    text-[15px]
                    font-semibold
                    text-white
                    shadow-[0_15px_30px_rgba(57,49,40,0.20)]
                    transition-all
                    hover:bg-[#332F2A]
                    hover:shadow-[0_18px_35px_rgba(57,49,40,0.25)]
                    active:scale-[0.99]
                    disabled:cursor-not-allowed
                    disabled:opacity-70
                  "
                >

                  {loading ? (
                    "Connexion..."
                  ) : (
                    <>
                      <span>Se connecter</span>

                      <ArrowRight
                        size={19}
                        strokeWidth={1.8}
                        className="
                          transition-transform
                          duration-300
                          group-hover:translate-x-1
                        "
                      />
                    </>
                  )}

                </button>

              </form>

              {/* =================================================
                  REGISTER
              ================================================== */}

              <div className="mt-8">

                <div className="flex items-center gap-4">

                  <span className="h-px flex-1 bg-[#DDD5CA]" />

                  <span className="text-[11px] uppercase tracking-[0.15em] text-[#AAA094]">
                    ou
                  </span>

                  <span className="h-px flex-1 bg-[#DDD5CA]" />

                </div>

                <p className="mt-7 text-center text-[13.5px] text-[#857A6D]">

                  Vous n'avez pas encore de compte ?{" "}

                  <Link
                    to="/register-institution"
                    className="
                      font-semibold
                      text-[#B68B43]
                      transition-colors
                      hover:text-[#947035]
                    "
                  >
                    Créer un compte
                  </Link>

                </p>

              </div>

              {/* =================================================
                  SECURITY FOOTER
              ================================================== */}

              <div className="mt-8 flex items-center justify-center gap-2">

                <Lock
                  size={13}
                  strokeWidth={1.5}
                  className="text-[#9E9386]"
                />

                <span className="text-[11px] text-[#9E9386]">
                  Connexion chiffrée et données protégées
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              PAGE FOOTER
          ================================================== */}

          <div className="relative mt-6 text-center">

            <p className="text-[10px] text-[#9B9083] sm:text-[11px]">
              © 2026 EDUGEST 360 · Confidentialité · Assistance
            </p>

          </div>

        </section>
      </div>
    </main>
  );
}

/* =============================================================
   FEATURE LABEL
============================================================= */

function FeatureLabel({ text }) {
  return (
    <div className="flex items-center gap-2">

      <span className="h-1.5 w-1.5 rounded-full bg-[#B68B43]" />

      <span className="text-[10px] font-semibold tracking-[0.18em] text-[#756B60]">
        {text}
      </span>

    </div>
  );
}