import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(formData);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to log in. Please try again.",
      );

      if (err.response?.data?.needsVerification) {
        navigate("/verify-email", {
          state: { email: formData.email },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (googleResponse) => {
    if (!googleResponse?.credential) {
      setError("Google login failed. Please try again.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await googleLogin({
        credential: googleResponse.credential,
      });

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Google login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-[#050A30] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      {/* Main container */}
      <div className="relative z-10 w-full max-w-6xl min-h-[680px] grid grid-cols-1 lg:grid-cols-2 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_20px_70px_rgba(5,10,48,0.10)]">
        {/* LEFT: Creative image section */}
        <div className="relative hidden lg:block overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=85"
            alt="Artist working in a creative studio"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Image overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050A30] via-[#050A30]/40 to-[#050A30]/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />

          {/* Brand */}
          <Link to="/" className="absolute top-9 left-9 group">
            <span className="font-['Orbitron'] text-2xl font-bold tracking-[0.2em] text-white">
              PRATIVA
            </span>

            <div className="h-[2px] w-0 group-hover:w-full bg-[#FF4DB8] transition-all duration-500" />
          </Link>

          {/* Image caption */}
          <div className="absolute bottom-14 left-10 right-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-px bg-[#FF4DB8]" />

              <p className="text-xs uppercase tracking-[0.3em] text-[#FF91C8] font-semibold">
                A Universe of Creativity
              </p>
            </div>

            <h1 className="font-['Orbitron'] text-4xl xl:text-5xl leading-[1.3] font-semibold mb-6 text-white">
              Your talent
              <br />
              deserves its
              <br />
              <span className="text-[#FF4DB8]">own universe.</span>
            </h1>

            <p className="text-white/75 text-sm leading-7 max-w-md">
              Every voice, every vision, every stroke and every word has
              somewhere to belong. Find your space. Share your world.
            </p>

            <div className="flex items-center gap-3 mt-10">
              <div className="w-2 h-2 rounded-full bg-[#FF789A]" />

              <span className="text-[10px] tracking-[0.25em] uppercase text-white/65">
                Made for the creative spirit
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Login section */}
        <div className="relative flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-14 xl:px-16 bg-white">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#FF4DB8] transition-colors mb-12 w-fit"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div className="max-w-md w-full mx-auto">
            {/* Heading */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <Sparkles size={15} className="text-[#FF4DB8]" />

                <p className="text-[#E83D98] text-[10px] font-semibold tracking-[0.3em] uppercase">
                  Welcome back
                </p>
              </div>

              <h2 className="font-['Orbitron'] text-3xl sm:text-4xl text-[#050A30] font-semibold mb-4">
                Sign in<span className="text-[#FF4DB8]">.</span>
              </h2>

              <p className="text-gray-500 text-sm leading-6">
                Pick up where your creativity left off.
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-[#050A30]/80 mb-2.5 tracking-wide"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3.5 bg-[#F8F7F4] border border-gray-200 rounded-lg text-[#050A30] text-sm placeholder:text-gray-400 outline-none focus:border-[#FF4DB8] focus:ring-1 focus:ring-[#FF4DB8]/30 transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <label
                    htmlFor="password"
                    className="text-xs font-medium text-[#050A30]/80 tracking-wide"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#E83D98] hover:text-[#C52D7C] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full px-4 py-3.5 pr-12 bg-[#F8F7F4] border border-gray-200 rounded-lg text-[#050A30] text-sm placeholder:text-gray-400 outline-none focus:border-[#FF4DB8] focus:ring-1 focus:ring-[#FF4DB8]/30 transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E83D98] transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p
                  role="alert"
                  className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3"
                >
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FF4DB8] hover:bg-[#E83D98] disabled:opacity-60 text-white py-3.5 rounded-lg font-semibold text-sm tracking-wide transition-colors duration-300"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-8">
              <div className="h-px flex-1 bg-gray-200" />

              <span className="text-[10px] tracking-[0.2em] text-gray-400">
                OR CONTINUE WITH
              </span>

              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Google login */}
            <div className="flex justify-center w-full overflow-hidden">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google login was unsuccessful.")}
                theme="outline"
                shape="rectangular"
                size="large"
                width="350"
                text="continue_with"
              />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-gray-500 mt-9">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#E83D98] font-semibold hover:text-[#C52D7C] transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] tracking-wide text-gray-400 mt-12">
            © {new Date().getFullYear()} PRATIVA. Made for the creative spirit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
