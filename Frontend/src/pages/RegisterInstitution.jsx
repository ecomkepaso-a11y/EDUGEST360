import { useState } from "react";
import {ArrowLeft,ArrowRight,Building2,Check,GraduationCap,Mail,MapPin,Phone,ShieldCheck,User,Lock,Eye,EyeOff,} from "lucide-react";

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function RegisterInstitution() {

  // Controls which registration step is currently displayed
  // 1 = Institution information
  // 2 = Administrator account
  // 3 = Review and create
  const [step, setStep] = useState(1);

  // Controls password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Controls confirmation-password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Indicates whether the registration request is being processed
  const [loading, setLoading] = useState(false);


  // ============================================================
  // FORM STATE
  // ============================================================

  // Stores all information entered during institution registration
  const [form, setForm] = useState({

    // Institution information
    schoolName: "",
    schoolCode: "",
    institutionType: "",
    country: "Cameroon",
    region: "",
    city: "",
    address: "",
    schoolEmail: "",
    schoolPhone: "",

    // Administrator information
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminPhone: "",
    password: "",
    confirmPassword: "",

    // Terms and conditions
    terms: false,
  });


  // Stores validation errors for individual fields
  const [errors, setErrors] = useState({});


  // ============================================================
  // HANDLE INPUT CHANGES
  // ============================================================

  function handleChange(e) {

    // Get the input name, value, type and checkbox state
    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    // Update only the field that changed
    setForm((prev) => ({
      ...prev,

      // Checkboxes use "checked", other inputs use "value"
      [name]: type === "checkbox" ? checked : value,
    }));

    // If the field previously had an error,
    // remove that error when the user starts correcting it
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  }


  // ============================================================
  // VALIDATE CURRENT STEP
  // ============================================================

  function validateStep() {

    // Object that will contain validation errors
    const next = {};


    // ------------------------------------------------------------
    // STEP 1 VALIDATION
    // ------------------------------------------------------------

    if (step === 1) {

      // Institution name is required
      if (!form.schoolName.trim()) {
        next.schoolName = "Enter your institution name";
      }

      // Institution type is required
      if (!form.institutionType) {
        next.institutionType = "Select an institution type";
      }

      // Region is required
      if (!form.region.trim()) {
        next.region = "Enter your region";
      }

      // City is required
      if (!form.city.trim()) {
        next.city = "Enter your city";
      }

      // Institution email is required
      if (!form.schoolEmail.trim()) {
        next.schoolEmail = "Enter your institution email";
      }

      // Institution phone is required
      if (!form.schoolPhone.trim()) {
        next.schoolPhone = "Enter your institution phone";
      }
    }


    // ------------------------------------------------------------
    // STEP 2 VALIDATION
    // ------------------------------------------------------------

    if (step === 2) {

      // Administrator first name
      if (!form.adminFirstName.trim()) {
        next.adminFirstName = "Enter your first name";
      }

      // Administrator last name
      if (!form.adminLastName.trim()) {
        next.adminLastName = "Enter your last name";
      }

      // Administrator email
      if (!form.adminEmail.trim()) {
        next.adminEmail = "Enter your email";
      }

      // Administrator phone
      if (!form.adminPhone.trim()) {
        next.adminPhone = "Enter your phone number";
      }

      // Password must exist
      if (!form.password) {
        next.password = "Create a password";
      }

      // Password must contain at least 8 characters
      else if (form.password.length < 8) {
        next.password =
          "Password must contain at least 8 characters";
      }

      // Confirm password
      if (!form.confirmPassword) {
        next.confirmPassword = "Confirm your password";
      }

      // Passwords must match
      else if (form.password !== form.confirmPassword) {
        next.confirmPassword = "Passwords do not match";
      }
    }


    // ------------------------------------------------------------
    // STEP 3 VALIDATION
    // ------------------------------------------------------------

    if (step === 3) {

      // User must accept the terms
      if (!form.terms) {
        next.terms =
          "You must accept the terms to continue";
      }
    }


    // Save all validation errors
    setErrors(next);

    // Return true when there are no errors
    return Object.keys(next).length === 0;
  }


  // ============================================================
  // MOVE TO NEXT STEP
  // ============================================================

  function nextStep() {

    // Do not continue if the current step contains errors
    if (!validateStep()) return;

    // Move to the next step
    // Math.min prevents the value from going above 3
    setStep((prev) => Math.min(prev + 1, 3));
  }


  // ============================================================
  // MOVE TO PREVIOUS STEP
  // ============================================================

  function previousStep() {

    // Move one step backward
    // Math.max prevents the value from going below 1
    setStep((prev) => Math.max(prev - 1, 1));
  }


  // ============================================================
  // SUBMIT REGISTRATION
  // ============================================================

  async function handleSubmit(e) {

    // Prevent browser from refreshing the page
    e.preventDefault();

    // Validate the final step
    if (!validateStep()) return;

    // Show loading state
    setLoading(true);

    try {

      // ----------------------------------------------------------
      // TODO:
      // Replace this fake delay with your real backend API call.
      //
      // Example:
      //
      // const response = await fetch(
      //   "/api/auth/register-institution",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(form),
      //   }
      // );
      //
      // const data = await response.json();
      // ----------------------------------------------------------

      // Fake delay for testing the UI
      await new Promise((resolve) =>
        setTimeout(resolve, 1200)
      );

      // Display submitted information in the console
      console.log(
        "Institution registration:",
        form
      );

      // Temporary success message
      alert("Institution created successfully!");

    } catch (error) {

      // Display backend/network errors in the console
      console.error(
        "Registration error:",
        error
      );

    } finally {

      // Always remove loading state
      // whether the request succeeds or fails
      setLoading(false);
    }
  }


  // ============================================================
  // PAGE UI
  // ============================================================

  return (

    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[minmax(420px,560px)_1fr] bg-[#FBF3E7] text-[#2B2118] font-sans">


      {/* ========================================================
          LEFT PANEL
          Contains the registration form
      ======================================================== */}

      <div className="flex flex-col px-6 py-10 lg:px-14 lg:py-10 overflow-y-auto">


        {/* --------------------------------------------------------
            EDUGEST 360 LOGO
        -------------------------------------------------------- */}

        <div className="flex items-center gap-2.5 mb-10">

          {/* Logo icon */}
          <span className="grid place-items-center w-[34px] h-[34px] rounded-[10px] bg-[#D2652F] text-[#FFF5EA]">

            <GraduationCap
              size={20}
              strokeWidth={2.2}
            />

          </span>


          {/* Application name */}
          <span className="font-serif font-semibold text-[19px] tracking-tight">
            Edugest 360
          </span>

        </div>


        {/* Main form container */}
        <div className="max-w-[440px] w-full mx-auto">


          {/* ------------------------------------------------------
              PAGE HEADER
          ------------------------------------------------------ */}

          <div className="mb-8">

            <h1 className="font-serif font-semibold text-[32px] leading-tight tracking-tight mb-2">
              Set up your institution
            </h1>

            <p className="text-[#8A7C6D] text-[14.5px] leading-relaxed">
              Create your school workspace and become its first administrator.
            </p>

          </div>


          {/* ------------------------------------------------------
              REGISTRATION PROGRESS INDICATOR
          ------------------------------------------------------ */}

          <div className="flex items-center mb-9">

            {[1, 2, 3].map((item, index) => (

              <div
                key={item}
                className="flex items-center flex-1 last:flex-none"
              >

                {/* Number/check circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition ${
                    step >= item
                      ? "bg-[#D2652F] text-white"
                      : "bg-[#EDE1D1] text-[#9B8C7B]"
                  }`}
                >

                  {/* Show check when this step has already been completed */}
                  {step > item ? (
                    <Check size={17} />
                  ) : (
                    item
                  )}

                </div>


                {/* Connector between steps */}
                {index < 2 && (
                  <div
                    className={`h-[2px] flex-1 mx-2 transition ${
                      step > item
                        ? "bg-[#D2652F]"
                        : "bg-[#E5D8C7]"
                    }`}
                  />
                )}

              </div>

            ))}

          </div>


          {/* ------------------------------------------------------
              CURRENT STEP TITLE
          ------------------------------------------------------ */}

          <div className="flex items-center gap-2 mb-5">

            {/* Step icon */}
            <div className="w-8 h-8 rounded-lg bg-[#F3DFCF] text-[#D2652F] grid place-items-center">

              {step === 1 && <Building2 size={17} />}

              {step === 2 && <ShieldCheck size={17} />}

              {step === 3 && <Check size={17} />}

            </div>


            {/* Step number and title */}
            <div>

              <p className="text-[13px] text-[#9A8B7B]">
                Step {step} of 3
              </p>

              <h2 className="font-semibold text-[17px]">

                {step === 1 &&
                  "Institution information"}

                {step === 2 &&
                  "Administrator account"}

                {step === 3 &&
                  "Review & create"}

              </h2>

            </div>

          </div>


          {/* ======================================================
              REGISTRATION FORM
          ====================================================== */}

          <form
            onSubmit={handleSubmit}
            noValidate
          >


            {/* ====================================================
                STEP 1 — INSTITUTION INFORMATION
            ==================================================== */}

            {step === 1 && (

              <div className="flex flex-col gap-4">


                {/* Institution name */}
                <Input
                  label="Institution name"
                  name="schoolName"
                  placeholder="Logpom International School"
                  value={form.schoolName}
                  onChange={handleChange}
                  error={errors.schoolName}
                  icon={<Building2 size={17} />}
                />


                {/* Institution code + type */}
                <div className="grid grid-cols-2 gap-3">

                  <Input
                    label="Institution code"
                    name="schoolCode"
                    placeholder="LIS-001"
                    value={form.schoolCode}
                    onChange={handleChange}
                  />


                  {/* Institution type dropdown */}
                  <div className="flex flex-col gap-1.5">

                    <label className="text-[13px] font-medium text-[#5C4F42]">
                      Institution type
                    </label>

                    <select
                      name="institutionType"
                      value={form.institutionType}
                      onChange={handleChange}
                      className={`h-12 rounded-xl bg-white border-[1.5px] px-3.5 outline-none text-[14px] ${
                        errors.institutionType
                          ? "border-[#C94F3F]"
                          : "border-[#EEE2D0]"
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
                      <ErrorText
                        text={errors.institutionType}
                      />
                    )}

                  </div>

                </div>


                {/* Region + city */}
                <div className="grid grid-cols-2 gap-3">

                  <Input
                    label="Region"
                    name="region"
                    placeholder="Littoral"
                    value={form.region}
                    onChange={handleChange}
                    error={errors.region}
                  />

                  <Input
                    label="City"
                    name="city"
                    placeholder="Douala"
                    value={form.city}
                    onChange={handleChange}
                    error={errors.city}
                  />

                </div>


                {/* Institution address */}
                <Input
                  label="Address"
                  name="address"
                  placeholder="Logpom, Douala"
                  value={form.address}
                  onChange={handleChange}
                  icon={<MapPin size={17} />}
                />


                {/* Official institution email */}
                <Input
                  label="Official email"
                  name="schoolEmail"
                  type="email"
                  placeholder="contact@school.cm"
                  value={form.schoolEmail}
                  onChange={handleChange}
                  error={errors.schoolEmail}
                  icon={<Mail size={17} />}
                />


                {/* Official institution phone */}
                <Input
                  label="Official phone"
                  name="schoolPhone"
                  placeholder="+237 6XX XXX XXX"
                  value={form.schoolPhone}
                  onChange={handleChange}
                  error={errors.schoolPhone}
                  icon={<Phone size={17} />}
                />

              </div>
            )}


            {/* ====================================================
                STEP 2 — ADMINISTRATOR ACCOUNT
            ==================================================== */}

            {step === 2 && (

              <div className="flex flex-col gap-4">


                {/* First name + last name */}
                <div className="grid grid-cols-2 gap-3">

                  <Input
                    label="First name"
                    name="adminFirstName"
                    placeholder="Amina"
                    value={form.adminFirstName}
                    onChange={handleChange}
                    error={errors.adminFirstName}
                    icon={<User size={17} />}
                  />

                  <Input
                    label="Last name"
                    name="adminLastName"
                    placeholder="Nfor"
                    value={form.adminLastName}
                    onChange={handleChange}
                    error={errors.adminLastName}
                  />

                </div>


                {/* Administrator email */}
                <Input
                  label="Administrator email"
                  name="adminEmail"
                  type="email"
                  placeholder="amina@school.cm"
                  value={form.adminEmail}
                  onChange={handleChange}
                  error={errors.adminEmail}
                  icon={<Mail size={17} />}
                />


                {/* Administrator phone */}
                <Input
                  label="Phone number"
                  name="adminPhone"
                  placeholder="+237 6XX XXX XXX"
                  value={form.adminPhone}
                  onChange={handleChange}
                  error={errors.adminPhone}
                  icon={<Phone size={17} />}
                />


                {/* Administrator password */}
                <PasswordInput
                  label="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  error={errors.password}
                  show={showPassword}
                  setShow={setShowPassword}
                />


                {/* Confirm password */}
                <PasswordInput
                  label="Confirm password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  show={showConfirmPassword}
                  setShow={setShowConfirmPassword}
                />


                {/* Information box explaining administrator permissions */}
                <div className="rounded-xl bg-[#F6E9D9] p-3.5 text-[12.5px] text-[#725F4E]">

                  <strong className="text-[#4D3D30]">
                    Administrator access
                  </strong>

                  <br />

                  This account will become the initial administrator of your
                  institution and will be able to manage users, roles and
                  school settings.

                </div>

              </div>
            )}


            {/* ====================================================
                STEP 3 — REVIEW & CREATE
            ==================================================== */}

            {step === 3 && (

              <div className="flex flex-col gap-4">


                {/* Summary card */}
                <div className="rounded-2xl bg-white border border-[#EEE2D0] p-5">


                  {/* Institution summary */}
                  <h3 className="font-semibold mb-4">
                    Institution
                  </h3>

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


                  {/* Separator */}
                  <div className="border-t border-[#EEE2D0] my-4" />


                  {/* Administrator summary */}
                  <h3 className="font-semibold mb-4">
                    Administrator
                  </h3>

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

                </div>


                {/* Terms and conditions */}
                <label className="flex gap-3 items-start cursor-pointer">

                  <input
                    type="checkbox"
                    name="terms"
                    checked={form.terms}
                    onChange={handleChange}
                    className="mt-1 accent-[#D2652F]"
                  />

                  <span className="text-[13px] leading-relaxed text-[#6E6052]">
                    I agree to the Edugest 360 terms of service and confirm
                    that I am authorized to create this institution account.
                  </span>

                </label>


                {/* Terms validation error */}
                {errors.terms && (
                  <ErrorText text={errors.terms} />
                )}

              </div>
            )}


            {/* ====================================================
                FORM NAVIGATION BUTTONS
            ==================================================== */}

            <div className="flex gap-3 mt-7">


              {/* Back button only appears after step 1 */}
              {step > 1 && (

                <button
                  type="button"
                  onClick={previousStep}
                  className="h-12 px-5 rounded-xl border border-[#E4D7C7] text-[#5C4F42] font-semibold flex items-center gap-2 hover:bg-[#F6E9D9] transition"
                >

                  <ArrowLeft size={17} />

                  Back

                </button>

              )}


              {/* Continue button for steps 1 and 2 */}
              {step < 3 ? (

                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 h-12 rounded-xl bg-[#D2652F] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#BD5626] transition"
                >

                  Continue

                  <ArrowRight size={17} />

                </button>

              ) : (

                /* Final button for creating the institution */
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 rounded-xl bg-[#D2652F] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#BD5626] disabled:opacity-70 transition"
                >

                  {loading
                    ? "Creating institution..."
                    : "Create institution"}

                  {!loading && (
                    <Check size={17} />
                  )}

                </button>

              )}

            </div>

          </form>


          {/* ------------------------------------------------------
              LINK BACK TO LOGIN
          ------------------------------------------------------ */}

          <p className="text-center text-[13.5px] text-[#8A7C6D] mt-7">

            Already have an account?{" "}

            <a
              href="/login"
              className="font-medium text-[#D2652F] hover:underline"
            >
              Sign in
            </a>

          </p>

        </div>

      </div>


      {/* ========================================================
          RIGHT HERO PANEL
      ======================================================== */}

      <div className="relative hidden lg:flex flex-col justify-center items-center overflow-hidden bg-[#2B2118] p-12">


        {/* Decorative orange glow */}
        <div className="absolute -top-[15%] -right-[10%] w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(210,101,47,0.32),transparent_70%)]" />


        <div className="relative max-w-[420px]">


          {/* Small badge */}
          <div className="inline-flex items-center gap-2 bg-[#3A2D20] border border-[#4B3B2B] rounded-full px-3.5 py-2 mb-7">

            <ShieldCheck
              size={15}
              className="text-[#D2652F]"
            />

            <span className="text-[12px] text-[#C8B9A7]">
              Institution onboarding
            </span>

          </div>


          {/* Hero heading */}
          <h2 className="font-serif text-[42px] leading-[1.08] font-semibold text-[#F3EAD9]">
            Everything your institution needs.
          </h2>


          {/* Hero description */}
          <p className="text-[#A99D8C] mt-5 text-[15px] leading-relaxed">
            Build your school's digital workspace, manage your community,
            and bring every classroom together in one place.
          </p>


          {/* Feature cards */}
          <div className="mt-10 space-y-3">


            {/* Community management */}
            <Feature
              icon={<User size={18} />}
              title="Manage your community"
              text="Students, teachers, parents and staff."
            />


            {/* School workspace */}
            <Feature
              icon={<Building2 size={18} />}
              title="One school workspace"
              text="Everything connected to your institution."
            />


            {/* Role-based access */}
            <Feature
              icon={<ShieldCheck size={18} />}
              title="Role-based access"
              text="Give every user the right permissions."
            />

          </div>


          {/* Closing tagline */}
          <p className="font-serif italic text-[17px] text-[#F3EAD9] mt-10">
            "One workspace for every classroom, cohort, and campus."
          </p>

        </div>

      </div>

    </div>
  );
}


// ============================================================
// REUSABLE INPUT COMPONENT
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

      {/* Input label */}
      <label className="text-[13px] font-medium text-[#5C4F42]">
        {label}
      </label>


      {/* Input container */}
      <div
        className={`flex items-center gap-2.5 bg-white border-[1.5px] rounded-xl px-3.5 h-12 transition focus-within:border-[#D2652F] focus-within:ring-4 focus-within:ring-[#D2652F]/10 ${
          error
            ? "border-[#C94F3F]"
            : "border-[#EEE2D0]"
        }`}
      >

        {/* Optional icon */}
        {icon && (
          <span className="text-[#B4A695] shrink-0">
            {icon}
          </span>
        )}


        {/* Actual input */}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[#C5B8A7] h-full"
        />

      </div>


      {/* Validation error */}
      {error && (
        <ErrorText text={error} />
      )}

    </div>
  );
}


// ============================================================
// PASSWORD INPUT COMPONENT
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

      {/* Password label */}
      <label className="text-[13px] font-medium text-[#5C4F42]">
        {label}
      </label>


      {/* Password input container */}
      <div
        className={`flex items-center gap-2.5 bg-white border-[1.5px] rounded-xl px-3.5 h-12 focus-within:border-[#D2652F] focus-within:ring-4 focus-within:ring-[#D2652F]/10 ${
          error
            ? "border-[#C94F3F]"
            : "border-[#EEE2D0]"
        }`}
      >

        {/* Lock icon */}
        <Lock
          size={17}
          className="text-[#B4A695]"
        />


        {/* Password field */}
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder="••••••••"
          className="flex-1 bg-transparent outline-none text-[14px]"
        />


        {/* Show/hide password button */}
        <button
          type="button"
          onClick={() =>
            setShow((value) => !value)
          }
          className="text-[#B4A695] hover:text-[#8A7C6D]"
        >

          {show ? (
            <EyeOff size={17} />
          ) : (
            <Eye size={17} />
          )}

        </button>

      </div>


      {/* Password validation error */}
      {error && (
        <ErrorText text={error} />
      )}

    </div>
  );
}


// ============================================================
// ERROR MESSAGE COMPONENT
// ============================================================

function ErrorText({ text }) {

  return (
    <span className="text-[12px] text-[#C94F3F]">
      {text}
    </span>
  );
}


// ============================================================
// REVIEW SUMMARY COMPONENT
// ============================================================

function Summary({ label, value }) {

  return (

    <div className="flex justify-between gap-4 py-2 text-[13px]">

      <span className="text-[#958676]">
        {label}
      </span>

      <span className="font-medium text-right text-[#42362C]">
        {value || "—"}
      </span>

    </div>
  );
}


// ============================================================
// HERO FEATURE CARD
// ============================================================

function Feature({
  icon,
  title,
  text,
}) {

  return (

    <div className="flex items-center gap-4 bg-[#34291D] border border-[#453A2B] rounded-2xl p-4">

      {/* Feature icon */}
      <div className="w-10 h-10 rounded-xl bg-[#453124] text-[#D2652F] grid place-items-center shrink-0">
        {icon}
      </div>


      {/* Feature text */}
      <div>

        <p className="text-[14px] font-semibold text-[#F3EAD9]">
          {title}
        </p>

        <p className="text-[12px] text-[#A99D8C] mt-0.5">
          {text}
        </p>

      </div>

    </div>
  );
}