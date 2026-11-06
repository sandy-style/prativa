import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await forgotPassword({ email });

      setMessage(
        data?.message || "If the account exists, a reset code has been sent.",
      );

      navigate("/reset-password", {
        state: { email },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl min-h-[650px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-xl">
        {/* Left image section */}
        <div className="relative hidden lg:block">
          <img
            src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=85"
            alt="Artist working in a creative studio"
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
              Every ending
              <br />
              has a new beginning.
            </h1>

            <p className="text-white/75 text-base leading-7 max-w-md">
              Sometimes a fresh start is all you need. Let's get you back to
              creating.
            </p>
          </div>
        </div>

        {/* Right form section */}
        <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-[#77716F] hover:text-[#E5092D] transition mb-12"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>

          <div className="max-w-md w-full mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#FFF0F0] flex items-center justify-center mb-7">
              <Mail size={26} className="text-[#E5092D]" />
            </div>

            <p className="text-[#E5092D] text-xs font-semibold tracking-[0.25em] uppercase mb-3">
              Account recovery
            </p>

            <h2 className="font-serif text-4xl sm:text-5xl text-[#191919] mb-4">
              Forgot your password?
            </h2>

            <p className="text-[#77716F] text-sm leading-7 mb-8">
              It happens. Enter the email address associated with your account
              and we'll send you a code to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3.5 bg-[#F8F7F4] border border-[#E7E3DD] rounded-lg outline-none focus:border-[#E5092D] focus:ring-1 focus:ring-[#E5092D] transition"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                  {error}
                </p>
              )}

              {message && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg p-3">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E5092D] hover:bg-[#C90024] disabled:opacity-60 text-white py-3.5 rounded-lg font-medium transition"
              >
                {loading ? "Sending code..." : "Send reset code"}
              </button>
            </form>

            <p className="text-center text-sm text-[#77716F] mt-9">
              Remembered your password?{" "}
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

export default ForgotPassword;
