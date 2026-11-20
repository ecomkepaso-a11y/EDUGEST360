import { useState } from "react";
import {ArrowLeft,ArrowRight,Building2,Check,GraduationCap,Mail,MapPin,Phone,ShieldCheck,User,Lock,Eye,EyeOff,Users,BookOpen,Sparkles,Map,} from "lucide-react";

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function RegisterInstitution() {
  // 1 = Institution information
  // 2 = Administrator account
  // 3 = Review and create
  const [step, setStep] = useState(1);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Loading state
  const [loading, setLoading] = useState(false);

  // ============================================================
  // FORM STATE
  // ============================================================

  const [form, setForm] = useState({
    // Institution
    schoolName: "",
    schoolCode: "",
    institutionType: "",
    country: "Cameroon",
    region: "",
    city: "",
    address: "",
    schoolEmail: "",
    schoolPhone: "",

    // Administrator
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhone: "",
    password: "",
    confirmPassword: "",

    // Terms
    terms: false,
  });

  const [errors, setErrors] = useState({});

  // ============================================================
  // HANDLE INPUT CHANGES
  // ============================================================

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  }

  // ============================================================
  // VALIDATION
  // ============================================================

  function validateStep() {
    const next = {};

    // ----------------------------------------------------------
    // STEP 1
    // ----------------------------------------------------------

    if (step === 1) {
      if (!form.schoolName.trim()) {
        next.schoolName = "Enter your institution name";
      }

      if (!form.institutionType) {
        next.institutionType = "Select an institution type";
      }

      if (!form.region.trim()) {
        next.region = "Enter your region";
      }

      if (!form.city.trim()) {
        next.city = "Enter your city";
      }

      if (!form.schoolEmail.trim()) {
        next.schoolEmail = "Enter your institution email";
      }

      if (!form.schoolPhone.trim()) {
        next.schoolPhone = "Enter your institution phone";
      }
    }

    // ----------------------------------------------------------
    // STEP 2
    // ----------------------------------------------------------

    if (step === 2) {
      if (!form.adminFirstName.trim()) {
        next.adminFirstName = "Enter your first name";
      }

      if (!form.adminLastName.trim()) {
        next.adminLastName = "Enter your last name";
      }

      if (!form.adminEmail.trim()) {
        next.adminEmail = "Enter your email";
      }

      if (!form.adminPhone.trim()) {
        next.adminPhone = "Enter your phone number";
      }

      if (!form.password) {
        next.password = "Create a password";
      } else if (form.password.length < 8) {
        next.password = "Password must contain at least 8 characters";
      }

      if (!form.confirmPassword) {
        next.confirmPassword = "Confirm your password";
      } else if (form.password !== form.confirmPassword) {
        next.confirmPassword = "Passwords do not match";
      }
    }

    // ----------------------------------------------------------
    // STEP 3
    // ----------------------------------------------------------

    if (step === 3) {
      if (!form.terms) {
        next.terms = "You must accept the terms to continue";
      }
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  }

  // ============================================================
  // NEXT STEP
  // ============================================================

  function nextStep() {
    if (!validateStep()) return;

    setStep((prev) => Math.min(prev + 1, 3));
  }

  // ============================================================
  // PREVIOUS STEP
  // ============================================================

  function previousStep() {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateStep()) return;

    setLoading(true);

    try {
      // TODO:
      // Replace with your real backend API call.

      await new Promise((resolve) => setTimeout(resolve, 1200));

      console.log("Institution registration:", form);

      alert("Institution created successfully!");
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // STEP INFORMATION
  // ============================================================

  const stepInfo = {
    1: {
      title: "Institution",
      subtitle: "Tell us about your school",
      icon: Building2,
    },
    2: {
      title: "Administrator",
      subtitle: "Create your administrator account",
      icon: ShieldCheck,
    },
    3: {
      title: "Review",
      subtitle: "Review everything before creating",
      icon: Check,
    },
  };

  const CurrentIcon = stepInfo[step].icon;

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="min-h-screen bg-[#EDE5D8] text-[#3D3832] font-sans overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[52%_48%]">

        {/* ======================================================
            LEFT — VISUAL BRAND PANEL
        ====================================================== */}

        <div className="relative hidden overflow-hidden lg:flex min-h-screen flex-col bg-[#E9E0D1] px-16 py-10 xl:px-20">

          {/* ==================================================
              BACKGROUND GRID
          ================================================== */}

          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(rgba(91,76,55,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(91,76,55,0.07) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />

          {/* ==================================================
              SOFT LIGHT
          ================================================== */}

          <div className="pointer-events-none absolute -left-32 top-20 h-[520px] w-[520px] rounded-full bg-[#FFFDF8]/80 blur-3xl" />

          <div className="pointer-events-none absolute bottom-[-180px] right-[-120px] h-[500px] w-[500px] rounded-full bg-[#D9B878]/20 blur-3xl" />

          {/* ==================================================
              LOGO
          ================================================== */}

          <div className="relative z-10 flex items-center gap-3">

            <div className="grid h-11 w-11 place-items-center rounded-[13px] bg-[#3F3A34] text-[#F7EBD5] shadow-lg">
              <div className="flex items-end gap-[3px]">
                <span className="h-3 w-[4px] rounded-sm bg-[#F7EBD5]" />
                <span className="h-5 w-[4px] rounded-sm bg-[#F7EBD5]" />
                <span className="h-4 w-[4px] rounded-sm bg-[#D2A454]" />
              </div>
            </div>

            <div>
              <p className="text-[20px] font-semibold tracking-tight text-[#27231F]">
                EDUGEST <span className="text-[#B58A42]">360</span>
              </p>
            </div>

          </div>

          {/* ==================================================
              DECORATIVE EDUCATION OBJECTS
          ================================================== */}

          <div className="relative z-10 flex flex-1 items-center justify-center">

            <div className="relative h-[520px] w-full max-w-[570px]">

              {/* Large central glow */}

              <div className="absolute left-1/2 top-[40%] h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5E9CF]/90 blur-2xl" />

              {/* Golden circle */}

              <div className="absolute left-1/2 top-[25%] h-[90px] w-[90px] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#F4D89D] to-[#C79B4C] shadow-[0_20px_50px_rgba(160,120,50,0.2)]" />

              {/* School building */}

              <div className="absolute left-1/2 top-[37%] -translate-x-1/2">

                {/* Roof */}

                <div
                  className="mx-auto h-0 w-0 border-l-[90px] border-r-[90px] border-b-[85px] border-l-transparent border-r-transparent border-b-[#F8F3EA]"
                  style={{
                    filter:
                      "drop-shadow(0 15px 20px rgba(80,65,45,0.08))",
                  }}
                />

                {/* Building */}

                <div className="relative -mt-1 h-[115px] w-[215px] rounded-[20px] border border-white/70 bg-white/65 shadow-[0_25px_60px_-25px_rgba(70,55,35,0.3)] backdrop-blur-xl">

                  <div className="absolute bottom-0 left-1/2 h-[72px] w-[45px] -translate-x-1/2 rounded-t-[14px] bg-[#423C35]" />

                  <div className="absolute bottom-[22px] left-[30px] h-[38px] w-[28px] rounded-t-[12px] bg-[#D2C9BD]" />

                  <div className="absolute bottom-[22px] right-[30px] h-[38px] w-[28px] rounded-t-[12px] bg-[#D2C9BD]" />

                </div>
              </div>

              {/* Floating card — students */}

              <div className="absolute left-[2%] top-[18%] w-[180px] rotate-[-5deg] rounded-[22px] border border-white/80 bg-white/70 p-4 shadow-[0_25px_50px_-25px_rgba(60,50,35,0.3)] backdrop-blur-xl">

                <div className="flex items-center gap-3">

                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EFE7D9] text-[#A27B3A]">
                    <BookOpen size={19} />
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold text-[#4B443C]">
                      Learning
                    </p>

                    <p className="mt-1 text-[10px] text-[#8B8174]">
                      Connected classrooms
                    </p>
                  </div>

                </div>

              </div>

              {/* Floating card — community */}

              <div className="absolute bottom-[18%] left-[12%] w-[220px] rotate-[2deg] rounded-[22px] border border-white/80 bg-white/70 p-4 shadow-[0_25px_50px_-25px_rgba(60,50,35,0.3)] backdrop-blur-xl">

                <div className="flex items-center gap-3">

                  <div className="flex -space-x-2">

                    <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-[#3F3A34] text-[10px] font-semibold text-white">
                      AD
                    </span>

                    <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-[#9BAA9A] text-[10px] font-semibold text-white">
                      AM
                    </span>

                    <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-[#B79A68] text-[10px] font-semibold text-white">
                      +8
                    </span>

                  </div>

                  <div>
                    <p className="text-[11px] font-semibold text-[#514940]">
                      Your community
                    </p>

                    <p className="mt-1 text-[10px] text-[#8B8174]">
                      Students · Teachers · Parents
                    </p>
                  </div>

                </div>

              </div>

              {/* Floating card — secure */}

              <div className="absolute right-[4%] top-[27%] w-[170px] rotate-[5deg] rounded-[22px] border border-white/80 bg-white/70 p-4 shadow-[0_25px_50px_-25px_rgba(60,50,35,0.3)] backdrop-blur-xl">

                <div className="flex items-center gap-3">

                  <div className="grid h-10 w-10 place-items-center rounded-full border-[5px] border-[#D2A454]/25 text-[#B18A48]">
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <p className="text-[12px] font-semibold text-[#4B443C]">
                      Secure
                    </p>

                    <p className="mt-1 text-[10px] text-[#8B8174]">
                      Protected workspace
                    </p>
                  </div>

                </div>

              </div>

              {/* Small floating sparkle */}

              <div className="absolute right-[17%] bottom-[25%] grid h-11 w-11 place-items-center rounded-full border border-white/70 bg-white/60 text-[#B88D43] shadow-lg backdrop-blur-xl">
                <Sparkles size={17} />
              </div>

            </div>
          </div>

          {/* ==================================================
              BRAND MESSAGE
          ================================================== */}

          <div className="relative z-10 max-w-[560px]">

            <p className="font-label text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B48842]">
              L'école de demain, dès aujourd'hui
            </p>

            <h2 className="mt-4 max-w-[540px] text-[44px] font-medium leading-[1.03] tracking-[-0.045em] text-[#38332D] xl:text-[52px]">

              Votre établissement,
              <br />

              <span className="text-[#8E8376]">
                réinventé.
              </span>

            </h2>

            <p className="mt-5 max-w-[520px] text-[15px] leading-7 text-[#756B60]">
              Une plateforme intelligente pour connecter établissements,
              enseignants, élèves et familles dans un espace unique.
            </p>

            <div className="mt-7 flex flex-wrap gap-7">

              <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#806E58]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B9914A]" />
                Intelligent
              </span>

              <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#806E58]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B9914A]" />
                Humain
              </span>

              <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#806E58]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B9914A]" />
                Sécurisé
              </span>

            </div>

          </div>

        </div>

        {/* ======================================================
            RIGHT — REGISTRATION PANEL
        ====================================================== */}

        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F1EBE2] px-5 py-8 sm:px-8 lg:px-10">

          {/* Background glow */}

          <div className="pointer-events-none absolute right-[-120px] top-[-100px] h-[380px] w-[380px] rounded-full bg-[#E1C78E]/20 blur-3xl" />

          <div className="pointer-events-none absolute bottom-[-150px] left-[-100px] h-[360px] w-[360px] rounded-full bg-white/70 blur-3xl" />

          {/* Mobile logo */}

          <div className="absolute left-6 top-6 flex items-center gap-2.5 lg:hidden">

            <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#3F3A34] text-[#F7EBD5]">
              <GraduationCap size={18} />
            </span>

            <span className="text-[17px] font-semibold tracking-tight text-[#302B25]">
              EDUGEST <span className="text-[#B58A42]">360</span>
            </span>

          </div>

          {/* ==================================================
              GLASS REGISTRATION CARD
          ================================================== */}

          <div className="relative z-10 w-full max-w-[650px] rounded-[32px] border border-white/80 bg-white/65 p-6 shadow-[0_30px_80px_-35px_rgba(70,55,35,0.3)] backdrop-blur-2xl sm:p-8 lg:p-10">

            {/* Header */}

            <div className="flex items-start justify-between gap-5">

              <div>

                <p className="font-label text-[10px] font-semibold uppercase tracking-[0.28em] text-[#B08845]">
                  Créer votre espace
                </p>

                <h1 className="mt-2 text-[32px] font-semibold leading-tight tracking-[-0.035em] text-[#38332D] sm:text-[38px]">
                  Bienvenue sur EDUGEST
                </h1>

                <p className="mt-2 max-w-[470px] text-[14px] leading-6 text-[#82786C]">
                  Configurez votre établissement et créez le premier compte administrateur.
                </p>

              </div>

              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F0E9DD] text-[#B48A45] sm:flex">
                <Building2 size={21} strokeWidth={1.7} />
              </div>

            </div>

            {/* ==================================================
                STEP PROGRESS
            ================================================== */}

            <div className="mt-8">

              <div className="flex items-center">

                {[1, 2, 3].map((item, index) => (
                  <div
                    key={item}
                    className={`flex items-center ${
                      index < 2 ? "flex-1" : ""
                    }`}
                  >

                    <div className="flex flex-col items-center">

                      <div
                        className={`grid h-9 w-9 place-items-center rounded-full border transition-all duration-300 ${
                          step >= item
                            ? "border-[#3F3A34] bg-[#3F3A34] text-[#F7EBD5] shadow-[0_8px_20px_-10px_rgba(50,40,30,0.7)]"
                            : "border-[#DDD3C5] bg-white/60 text-[#9B9083]"
                        }`}
                      >
                        {step > item ? (
                          <Check size={15} strokeWidth={2.5} />
                        ) : (
                          item
                        )}
                      </div>

                      <span
                        className={`mt-1.5 hidden text-[9px] font-semibold uppercase tracking-[0.12em] sm:block ${
                          step >= item
                            ? "text-[#514940]"
                            : "text-[#A1988C]"
                        }`}
                      >
                        {item === 1
                          ? "Établissement"
                          : item === 2
                          ? "Admin"
                          : "Finaliser"}
                      </span>

                    </div>

                    {index < 2 && (
                      <div
                        className={`mx-2 mt-[-17px] h-px flex-1 transition-all duration-300 ${
                          step > item
                            ? "bg-[#B9914A]"
                            : "bg-[#D9D0C4]"
                        }`}
                      />
                    )}

                  </div>
                ))}

              </div>

            </div>

            {/* ==================================================
                CURRENT STEP
            ================================================== */}

            <div className="mt-7 flex items-center gap-3">

              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#F0E8DA] text-[#AE8340]">
                <CurrentIcon size={18} strokeWidth={1.8} />
              </div>

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A18F7A]">
                  Étape {step} sur 3
                </p>

                <h2 className="mt-0.5 text-[16px] font-semibold text-[#484039]">
                  {stepInfo[step].title}
                </h2>

              </div>

            </div>

            {/* ==================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-6"
            >

              {/* =================================================
                  STEP 1
              ================================================= */}

              {step === 1 && (
                <div className="flex flex-col gap-4">

                  <Input
                    label="Nom de l'établissement"
                    name="schoolName"
                    placeholder="Logpom International School"
                    value={form.schoolName}
                    onChange={handleChange}
                    error={errors.schoolName}
                    icon={<Building2 size={16} />}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <Input
                      label="Code établissement"
                      name="schoolCode"
                      placeholder="LIS-001"
                      value={form.schoolCode}
                      onChange={handleChange}
                    />

                    <div className="flex flex-col gap-1.5">

                      <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6C6257]">
                        Type
                      </label>

                      <select
                        name="institutionType"
                        value={form.institutionType}
                        onChange={handleChange}
                        className={`h-[50px] rounded-xl border bg-white/60 px-3.5 text-[14px] text-[#4C443C] outline-none transition focus:border-[#B8914A] focus:bg-white/80 focus:ring-4 focus:ring-[#B8914A]/10 ${
                          errors.institutionType
                            ? "border-red-400"
                            : "border-[#DED5C9]"
                        }`}
                      >

                        <option value="">
                          Select type
                        </option>

                        <option value="primary">
                          Primary
                        </option>

                        <option value="secondary">
                          Secondary
                        </option>

                        <option value="higher">
                          Higher Education
                        </option>

                        <option value="training">
                          Training Center
                        </option>

                      </select>

                      {errors.institutionType && (
                        <ErrorText text={errors.institutionType} />
                      )}

                    </div>

                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <Input
                      label="Région"
                      name="region"
                      placeholder="Littoral"
                      value={form.region}
                      onChange={handleChange}
                      error={errors.region}
                    />

                    <Input
                      label="Ville"
                      name="city"
                      placeholder="Douala"
                      value={form.city}
                      onChange={handleChange}
                      error={errors.city}
                    />

                  </div>

                  <Input
                    label="Adresse"
                    name="address"
                    placeholder="Logpom, Douala"
                    value={form.address}
                    onChange={handleChange}
                    error={errors.address}
                    icon={<MapPin size={16} />}
                  />

                  <Input
                    label="Email officiel"
                    name="schoolEmail"
                    type="email"
                    placeholder="contact@school.cm"
                    value={form.schoolEmail}
                    onChange={handleChange}
                    error={errors.schoolEmail}
                    icon={<Mail size={16} />}
                  />

                  <Input
                    label="Téléphone officiel"
                    name="schoolPhone"
                    placeholder="+237 6XX XXX XXX"
                    value={form.schoolPhone}
                    onChange={handleChange}
                    error={errors.schoolPhone}
                    icon={<Phone size={16} />}
                  />

                </div>
              )}

              {/* =================================================
                  STEP 2
              ================================================= */}

              {step === 2 && (
                <div className="flex flex-col gap-4">

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <Input
                      label="Prénom"
                      name="adminFirstName"
                      placeholder="Amina"
                      value={form.adminFirstName}
                      onChange={handleChange}
                      error={errors.adminFirstName}
                      icon={<User size={16} />}
                    />

                    <Input
                      label="Nom"
                      name="adminLastName"
                      placeholder="Nfor"
                      value={form.adminLastName}
                      onChange={handleChange}
                      error={errors.adminLastName}
                    />

                  </div>

                  <Input
                    label="Email administrateur"
                    name="adminEmail"
                    type="email"
                    placeholder="amina@school.cm"
                    value={form.adminEmail}
                    onChange={handleChange}
                    error={errors.adminEmail}
                    icon={<Mail size={16} />}
                  />

                  <Input
                    label="Numéro de téléphone"
                    name="adminPhone"
                    placeholder="+237 6XX XXX XXX"
                    value={form.adminPhone}
                    onChange={handleChange}
                    error={errors.adminPhone}
                    icon={<Phone size={16} />}
                  />

                  <PasswordInput
                    label="Mot de passe"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    show={showPassword}
                    setShow={setShowPassword}
                  />

                  <PasswordInput
                    label="Confirmer le mot de passe"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    show={showConfirmPassword}
                    setShow={setShowConfirmPassword}
                  />

                  {/* Admin information */}

                  <div className="flex gap-3 rounded-2xl border border-[#DCCDB7]/70 bg-[#F5EEE2]/70 p-4">

                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/80 text-[#B08742]">
                      <ShieldCheck size={17} />
                    </div>

                    <div>

                      <p className="text-[12px] font-semibold text-[#51483F]">
                        Administrator access
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-[#83786B]">
                        This account will become the initial administrator
                        and will manage users, roles and school settings.
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {/* =================================================
                  STEP 3
              ================================================= */}

              {step === 3 && (
                <div className="flex flex-col gap-4">

                  {/* Institution review */}

                  <ReviewCard
                    icon={<Building2 size={17} />}
                    title="Institution"
                  >

                    <Summary
                      label="Name"
                      value={form.schoolName}
                    />

                    <Summary
                      label="Type"
                      value={form.institutionType}
                    />

                    <Summary
                      label="Location"
                      value={`${form.city}, ${form.region}`}
                    />

                    <Summary
                      label="Email"
                      value={form.schoolEmail}
                    />

                    <Summary
                      label="Phone"
                      value={form.schoolPhone}
                    />

                  </ReviewCard>

                  {/* Administrator review */}

                  <ReviewCard
                    icon={<User size={17} />}
                    title="Administrator"
                  >

                    <Summary
                      label="Name"
                      value={`${form.adminFirstName} ${form.adminLastName}`}
                    />

                    <Summary
                      label="Email"
                      value={form.adminEmail}
                    />

                    <Summary
                      label="Phone"
                      value={form.adminPhone}
                    />

                  </ReviewCard>

                  {/* Terms */}

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#DED5C9] bg-white/45 p-4">

                    <input
                      type="checkbox"
                      name="terms"
                      checked={form.terms}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 accent-[#B38A45]"
                    />

                    <span className="text-[11.5px] leading-5 text-[#71675D]">
                      I agree to the Edugest 360 terms of service and confirm
                      that I am authorized to create this institution account.
                    </span>

                  </label>

                  {errors.terms && (
                    <ErrorText text={errors.terms} />
                  )}

                </div>
              )}

              {/* =================================================
                  NAVIGATION
              ================================================= */}

              <div className="mt-6 flex gap-3">

                {step > 1 && (
                  <button
                    type="button"
                    onClick={previousStep}
                    className="flex h-[50px] items-center justify-center gap-2 rounded-xl border border-[#D9CFC2] bg-white/45 px-5 text-[13px] font-semibold text-[#5C544B] transition hover:bg-white/75"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                )}

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex h-[50px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#3F3A34] text-[13px] font-semibold text-[#F9F0DF] shadow-[0_15px_30px_-15px_rgba(50,40,30,0.65)] transition hover:bg-[#332F2A] active:scale-[0.99]"
                  >
                    Continue
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-[50px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#3F3A34] text-[13px] font-semibold text-[#F9F0DF] shadow-[0_15px_30px_-15px_rgba(50,40,30,0.65)] transition hover:bg-[#332F2A] active:scale-[0.99] disabled:opacity-60"
                  >
                    {loading
                      ? "Creating institution..."
                      : "Create institution"}

                    {!loading && <Check size={16} />}
                  </button>
                )}

              </div>

            </form>

            {/* Login */}

            <p className="mt-6 text-center text-[12px] text-[#8A8075]">

              Already have an account?{" "}

              <a
                href="/login"
                className="font-semibold text-[#AE8340] hover:underline"
              >
                Sign in
              </a>

            </p>

            {/* Security */}

            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-[#978C80]">

              <Lock size={12} />

              <span>
                Secure registration & protected data
              </span>

            </div>

          </div>

          {/* Copyright */}

          <p className="absolute bottom-4 right-5 text-[10px] text-[#9A9084] lg:right-8">
            © 2026 EDUGEST 360 · Confidentialité · Assistance
          </p>

        </div>
      </div>
    </div>
  );
}

// ============================================================
// INPUT COMPONENT
// ============================================================

function Input({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon,
}) {
  return (
    <div className="flex flex-col gap-1.5">

      <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6C6257]">
        {label}
      </label>

      <div
        className={`flex h-[50px] items-center gap-2.5 rounded-xl border bg-white/60 px-3.5 transition focus-within:border-[#B8914A] focus-within:bg-white/80 focus-within:ring-4 focus-within:ring-[#B8914A]/10 ${
          error
            ? "border-red-400"
            : "border-[#DED5C9]"
        }`}
      >

        {icon && (
          <span className="shrink-0 text-[#A79A89]">
            {icon}
          </span>
        )}

        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-[#484039] outline-none placeholder:text-[#B3A89A]"
        />

      </div>

      {error && <ErrorText text={error} />}

    </div>
  );
}

// ============================================================
// PASSWORD INPUT
// ============================================================

function PasswordInput({
  label,
  name,
  value,
  onChange,
  error,
  show,
  setShow,
}) {
  return (
    <div className="flex flex-col gap-1.5">

      <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6C6257]">
        {label}
      </label>

      <div
        className={`flex h-[50px] items-center gap-2.5 rounded-xl border bg-white/60 px-3.5 transition focus-within:border-[#B8914A] focus-within:bg-white/80 focus-within:ring-4 focus-within:ring-[#B8914A]/10 ${
          error
            ? "border-red-400"
            : "border-[#DED5C9]"
        }`}
      >

        <Lock
          size={16}
          className="shrink-0 text-[#A79A89]"
        />

        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-[#484039] outline-none placeholder:text-[#B3A89A]"
        />

        <button
          type="button"
          onClick={() => setShow((value) => !value)}
          className="rounded-lg p-1 text-[#A79A89] transition hover:bg-[#EEE7DC] hover:text-[#62594F]"
        >
          {show ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>

      </div>

      {error && <ErrorText text={error} />}

    </div>
  );
}

// ============================================================
// ERROR
// ============================================================

function ErrorText({ text }) {
  return (
    <span className="text-[11px] text-[#C34E43]">
      {text}
    </span>
  );
}

// ============================================================
// REVIEW CARD
// ============================================================

function ReviewCard({
  icon,
  title,
  children,
}) {
  return (
    <div className="rounded-2xl border border-[#DDD4C8] bg-white/55 p-4">

      <div className="mb-3 flex items-center gap-2.5">

        <div className="grid h-8 w-8 place-items-center rounded-lg bg-[#F0E8DA] text-[#AE8340]">
          {icon}
        </div>

        <h3 className="text-[13px] font-semibold text-[#4C443C]">
          {title}
        </h3>

      </div>

      <div className="divide-y divide-[#E7DED2]">
        {children}
      </div>

    </div>
  );
}

// ============================================================
// SUMMARY
// ============================================================

function Summary({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">

      <span className="text-[10px] uppercase tracking-[0.12em] text-[#978C80]">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-[12px] font-medium text-[#514940]">
        {value || "—"}
      </span>

    </div>
  );
}