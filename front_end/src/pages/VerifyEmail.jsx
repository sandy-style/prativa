import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { verifyEmail, resendVerification, refreshUser } = useAuth();

  // Email is fixed when the verification page is opened.
  const [email] = useState(location.state?.email || "");

  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Verify email.
  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await verifyEmail({ email, code });

      // Synchronize authentication state after verification.
      try {
        await refreshUser();
      } catch (sessionError) {
        console.error("Session refresh failed:", sessionError);
      }

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Verification failed. Please check your code.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend verification code.
  const handleResend = async () => {
    if (!email.trim()) {
      setError("No verification email was provided. Please register again.");
      return;
    }

    setError("");
    setMessage("");
    setResending(true);

    try {
      const data = await resendVerification({ email });

      setMessage(data.message || "A new verification code has been sent.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to resend the verification code.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl min-h-[650px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-xl">
        {/* Left section */}
        <div className="relative hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=85"
            alt="Artist working on a painting"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />

          <Link
            to="/"
            className="absolute top-8 left-8 text-white text-2xl font-serif tracking-[0.2em]"
          >
            PRATIVA
          </Link>

          <div className="absolute bottom-12 left-10 right-10 text-white">
            <p className="text-sm uppercase tracking-[0.3em] text-[#F0B6A8] mb-4">
              Where talent leaves its mark.
            </p>

            <h1 className="font-serif text-5xl xl:text-6xl leading-tight mb-5">
              Every story
              <br />
              begins somewhere.
            </h1>

            <p className="text-white/75 text-base leading-7 max-w-md">
              Take one small step. Your creative journey is just getting
              started.
            </p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
          <Link
            to="/register"
            className="flex items-center gap-2 text-sm text-[#77716F] hover:text-[#E5092D] transition mb-12"
          >
            <ArrowLeft size={16} />
            Back to registration
          </Link>

          <div className="max-w-md w-full mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#FFF0F0] flex items-center justify-center mb-7">
              <MailCheck size={27} className="text-[#E5092D]" />
            </div>

            <p className="text-[#E5092D] text-xs font-semibold tracking-[0.25em] uppercase mb-3">
              One last step
            </p>

            <h2 className="font-serif text-4xl sm:text-5xl text-[#191919] mb-4">
              Check your inbox.
            </h2>

            <p className="text-[#77716F] text-sm leading-7 mb-8">
              We've sent a six-digit verification code to your email. Enter it
              below to verify your account.
            </p>

            <form onSubmit={handleVerify} className="space-y-5">
              {/* Immutable email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#292524] mb-2"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3.5 bg-[#EFEEE9] border border-[#E7E3DD] rounded-lg outline-none text-[#77716F] cursor-not-allowed"
                />

                <p className="text-xs text-[#A39C96] mt-2">
                  This email address cannot be changed during verification.
                </p>
              </div>

              {/* Verification code */}
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-[#292524] mb-2"
                >
                  Verification code
                </label>

                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full px-4 py-4 bg-[#F8F7F4] border border-[#E7E3DD] rounded-lg outline-none focus:border-[#E5092D] focus:ring-1 focus:ring-[#E5092D] transition text-center text-2xl tracking-[0.6em] font-semibold"
                />
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                  {error}
                </p>
              )}

              {/* Success message */}
              {message && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6 || !email}
                className="w-full bg-[#E5092D] hover:bg-[#C90024] disabled:opacity-60 text-white py-3.5 rounded-lg font-medium transition"
              >
                {loading ? "Verifying..." : "Verify email"}
              </button>
            </form>

            {/* Resend verification */}
            <div className="text-center mt-8">
              <p className="text-sm text-[#77716F] mb-3">
                Didn't receive the code?
              </p>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending || !email}
                className="text-sm text-[#E5092D] font-semibold hover:underline disabled:opacity-60"
              >
                {resending ? "Sending..." : "Resend verification code"}
              </button>
            </div>

            <p className="text-center text-sm text-[#77716F] mt-9">
              Already verified?{" "}
              <Link
                to="/login"
                className="text-[#E5092D] font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-[#A39C96] mt-12">
            © {new Date().getFullYear()} PRATIVA. Made for the creative spirit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
