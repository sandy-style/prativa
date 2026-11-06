import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { resetPassword } = useAuth();

  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Please enter your six-digit reset code.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword({
        email,
        code,
        newPassword,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: "Password reset successfully. Please sign in.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset your password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl min-h-[680px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-xl">
        {/* Left image section */}
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
              Find your way
              <br />
              back to creating.
            </h1>

            <p className="text-white/75 text-base leading-7 max-w-md">
              Your next idea is waiting. Let's get you back to it.
            </p>
          </div>
        </div>

        {/* Right reset section */}
        <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
          <Link
            to="/login"
            className="flex items-center gap-2 text-sm text-[#77716F] hover:text-[#E5092D] transition mb-10"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>

          <div className="max-w-md w-full mx-auto">
            <div className="w-14 h-14 rounded-full bg-[#FFF0F0] flex items-center justify-center mb-7">
              <LockKeyhole size={26} className="text-[#E5092D]" />
            </div>

            <p className="text-[#E5092D] text-xs font-semibold tracking-[0.25em] uppercase mb-3">
              Account recovery
            </p>

            <h2 className="font-serif text-4xl sm:text-5xl text-[#191919] mb-4">
              Set a new password.
            </h2>

            <p className="text-[#77716F] text-sm leading-7 mb-8">
              Enter the six-digit code sent to your email and choose a new
              password for your account.
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
                  required
                  className="w-full px-4 py-3.5 bg-[#F8F7F4] border border-[#E7E3DD] rounded-lg outline-none focus:border-[#E5092D] focus:ring-1 focus:ring-[#E5092D] transition"
                />
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-[#292524] mb-2"
                >
                  Reset code
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
                  className="w-full px-4 py-3.5 bg-[#F8F7F4] border border-[#E7E3DD] rounded-lg outline-none focus:border-[#E5092D] focus:ring-1 focus:ring-[#E5092D] transition text-center text-xl tracking-[0.5em] font-semibold"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-[#292524] mb-2"
                >
                  New password
                </label>

                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full px-4 py-3.5 pr-12 bg-[#F8F7F4] border border-[#E7E3DD] rounded-lg outline-none focus:border-[#E5092D] focus:ring-1 focus:ring-[#E5092D] transition"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77716F]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-[#292524] mb-2"
                >
                  Confirm new password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full px-4 py-3.5 pr-12 bg-[#F8F7F4] border border-[#E7E3DD] rounded-lg outline-none focus:border-[#E5092D] focus:ring-1 focus:ring-[#E5092D] transition"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#77716F]"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E5092D] hover:bg-[#C90024] disabled:opacity-60 text-white py-3.5 rounded-lg font-medium transition"
              >
                {loading ? "Resetting password..." : "Reset password"}
              </button>
            </form>

            <p className="text-center text-sm text-[#77716F] mt-8">
              Remembered your password?{" "}
              <Link
                to="/login"
                className="text-[#E5092D] font-semibold hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-[#A39C96] mt-10">
            © {new Date().getFullYear()} PRATIVA. Made for the creative spirit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
