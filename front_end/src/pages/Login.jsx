import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
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
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl min-h-[680px] grid grid-cols-1 lg:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-xl">
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
              Your talent
              <br />
              deserves a stage.
            </h1>

            <p className="text-white/75 text-base leading-7 max-w-md">
              Every voice, every vision, every stroke and every word has
              somewhere to belong.
            </p>
          </div>
        </div>

        {/* Right login section */}
        <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-[#77716F] hover:text-[#E5092D] transition mb-12"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div className="max-w-md w-full mx-auto">
            <div className="mb-9">
              <p className="text-[#E5092D] text-xs font-semibold tracking-[0.25em] uppercase mb-3">
                Welcome back
              </p>

              <h2 className="font-serif text-4xl sm:text-5xl text-[#191919] mb-4">
                Sign in.
              </h2>

              <p className="text-[#77716F] text-sm">
                Pick up where your creativity left off.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3.5 bg-[#F8F7F4] border border-[#E7E3DD] rounded-lg outline-none focus:border-[#E5092D] focus:ring-1 focus:ring-[#E5092D] transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-[#292524]"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#E5092D] hover:underline"
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
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="flex items-center gap-4 my-7">
              <div className="h-px flex-1 bg-[#E7E3DD]" />
              <span className="text-xs text-[#99918B]">OR CONTINUE WITH</span>
              <div className="h-px flex-1 bg-[#E7E3DD]" />
            </div>

            <div className="flex justify-center">
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

            <p className="text-center text-sm text-[#77716F] mt-9">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#E5092D] font-semibold hover:underline"
              >
                Create one
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

export default Login;
