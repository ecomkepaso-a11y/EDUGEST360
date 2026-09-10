import { useState } from "react";
import {ArrowLeft,ArrowRight,CheckCircle2,GraduationCap,Mail,ShieldCheck,} from "lucide-react";
import { Link } from "react-router-dom";

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ForgotPassword() {

  // Stores the email or matricule entered by the user
  const [email, setEmail] = useState("");

  // Stores validation errors
  const [error, setError] = useState("");

  // Indicates whether the reset request is being processed
  const [loading, setLoading] = useState(false);

  // Determines whether the confirmation screen is displayed
  const [sent, setSent] = useState(false);


  // ============================================================
  // SUBMIT PASSWORD RESET REQUEST
  // ============================================================

  async function handleSubmit(e) {

    // Prevent the browser from refreshing the page
    e.preventDefault();


    // Make sure the user entered something
    if (!email.trim()) {

      setError(
        "Enter your email or matricule"
      );

      return;
    }


    // Clear previous errors
    setError("");

    // Start loading state
    setLoading(true);


    try {

      // --------------------------------------------------------
      // TODO:
      // Replace this fake delay with your real backend request.
      //
      // Example:
      //
      // await fetch("/api/auth/forgot-password", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ email }),
      // });
      // --------------------------------------------------------

      // Fake delay for UI testing
      await new Promise((resolve) =>
        setTimeout(resolve, 1000)
      );


      // Show confirmation screen
      setSent(true);

    } catch (error) {

      // Log unexpected errors
      console.error(error);

    } finally {

      // Stop loading indicator
      setLoading(false);
    }
  }


  // ============================================================
  // RESEND RESET EMAIL
  // ============================================================

  function resend() {

    // Return to the email input state
    setSent(false);

    // Clear any previous validation error
    setError("");
  }


  // ============================================================
  // PAGE UI
  // ============================================================

  return (

    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#FBF3E7] text-[#2B2118] font-sans">


      {/* ========================================================
          LEFT SIDE
      ======================================================== */}

      <div className="flex flex-col justify-center px-6 py-16 lg:px-14">


        {/* --------------------------------------------------------
            EDUGEST 360 LOGO
        -------------------------------------------------------- */}

        <div className="flex items-center gap-2.5 mb-14">

          <span className="grid place-items-center w-[34px] h-[34px] rounded-[10px] bg-[#D2652F] text-[#FFF5EA]">

            <GraduationCap size={20} />

          </span>

          <span className="font-serif font-semibold text-[19px]">
            Edugest 360
          </span>

        </div>


        {/* Main content */}
        <div className="max-w-[380px] w-full mx-auto">


          {/* ====================================================
              EMAIL INPUT STATE
          ==================================================== */}

          {!sent ? (

            <>

              {/* Security icon */}
              <div className="w-12 h-12 rounded-2xl bg-[#F3DFCF] text-[#D2652F] grid place-items-center mb-6">

                <ShieldCheck size={23} />

              </div>


              {/* Page heading */}
              <h1 className="font-serif font-semibold text-[34px] leading-tight tracking-tight mb-2">
                Forgot your password?
              </h1>


              {/* Explanation */}
              <p className="text-[#8A7C6D] text-[15px] leading-relaxed mb-8">
                No worries. Enter your email or matricule and we'll send you
                instructions to reset your password.
              </p>


              {/* Password reset form */}
              <form
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-5"
              >


                {/* Email field */}
                <label className="flex flex-col gap-1.5">

                  <span className="text-[13px] font-medium text-[#5C4F42]">
                    Email or matricule
                  </span>


                  {/* Input container */}
                  <span
                    className={`flex items-center gap-2.5 bg-white border-[1.5px] rounded-xl px-3.5 h-12 focus-within:border-[#D2652F] focus-within:ring-4 focus-within:ring-[#D2652F]/10 ${
                      error
                        ? "border-[#C94F3F]"
                        : "border-[#EEE2D0]"
                    }`}
                  >

                    {/* Email icon */}
                    <Mail
                      size={17}
                      className="text-[#B4A695]"
                    />


                    {/* Email/matricule input */}
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => {

                        // Update email value
                        setEmail(e.target.value);

                        // Clear error as soon as the user types
                        setError("");
                      }}
                      placeholder="amina@logpom.edu.cm"
                      className="flex-1 bg-transparent outline-none text-[14.5px] placeholder:text-[#C5B8A7]"
                    />

                  </span>


                  {/* Validation error */}
                  {error && (
                    <span className="text-[12.5px] text-[#C94F3F]">
                      {error}
                    </span>
                  )}

                </label>


                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 rounded-xl bg-[#D2652F] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#BD5626] disabled:opacity-70 transition"
                >

                  {/* Loading text */}
                  {loading
                    ? "Sending..."
                    : "Send reset instructions"}


                  {/* Arrow is hidden while loading */}
                  {!loading && (
                    <ArrowRight size={17} />
                  )}

                </button>

              </form>


              {/* Back to login */}
            <Link to="/login"className="font-medium text-[#D2652F] hover:underline">Sign in</Link>
                <ArrowLeft size={15} />
                Back to sign in
            </>

          ) : (

            /* ==================================================
               EMAIL SENT CONFIRMATION STATE
            ================================================== */

            <>

              {/* Success icon */}
              <div className="w-14 h-14 rounded-full bg-[#E2F0E0] text-[#6D9E68] grid place-items-center mb-6">

                <CheckCircle2 size={28} />

              </div>


              {/* Confirmation heading */}
              <h1 className="font-serif font-semibold text-[34px] leading-tight tracking-tight mb-2">
                Check your email
              </h1>


              {/* Security-friendly confirmation message */}
              <p className="text-[#8A7C6D] text-[15px] leading-relaxed">

                If an account is associated with the information you entered,
                we've sent instructions to reset your password.

              </p>


              {/* Show the entered email */}
              <div className="mt-6 p-4 rounded-xl bg-white border border-[#EEE2D0]">

                <p className="text-[13px] text-[#8A7C6D]">
                  Reset instructions sent to
                </p>

                <p className="font-medium text-[14px] mt-1">
                  {email}
                </p>

              </div>


              {/* Resend button */}
              <button
                type="button"
                onClick={resend}
                className="w-full h-12 rounded-xl border border-[#E4D7C7] text-[#5C4F42] font-semibold mt-5 hover:bg-[#F6E9D9] transition"
              >
                Resend email
              </button>


              {/* Back to login */}
           <Link to="/login" className="font-medium text-[#D2652F] hover:underline">Sign in</Link>
                <ArrowLeft size={15} />
                Back to sign in
            </>
          )}
        </div>
      </div>

      {/* ========================================================
          RIGHT HERO PANEL
      ======================================================== */}

      <div className="relative hidden lg:flex items-center justify-center overflow-hidden bg-[#2B2118] p-12">


        {/* Decorative background glow */}
        <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(210,101,47,0.35),transparent_70%)]" />


        <div className="relative max-w-[390px] text-center">


          {/* Security icon */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#3A2D20] border border-[#4B3B2B] text-[#D2652F] grid place-items-center">

            <ShieldCheck size={30} />

          </div>


          {/* Hero heading */}
          <h2 className="font-serif text-[38px] leading-tight font-semibold text-[#F3EAD9] mt-7">
            Your account is safe with us.
          </h2>


          {/* Hero description */}
          <p className="text-[#A99D8C] text-[15px] leading-relaxed mt-5">
            We'll help you securely get back into your Edugest 360
            workspace without exposing your account information.
          </p>


          {/* Security information card */}
          <div className="mt-9 bg-[#34291D] border border-[#453A2B] rounded-2xl p-5 text-left">

            <div className="flex gap-3">

              {/* Mail icon */}
              <div className="w-9 h-9 rounded-xl bg-[#453124] text-[#D2652F] grid place-items-center shrink-0">

                <Mail size={17} />

              </div>


              {/* Card text */}
              <div>

                <p className="text-[14px] font-semibold text-[#F3EAD9]">
                  Secure reset link
                </p>

                <p className="text-[12px] text-[#A99D8C] mt-1">
                  A password reset link will be sent to your registered
                  account.
                </p>

              </div>

            </div>

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