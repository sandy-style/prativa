import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Check the current user's session.
  const refreshUser = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user/me`, {
        withCredentials: true,
      });

      const currentUser = response.data.user || null;

      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
      }

      return currentUser;
    } catch (error) {
      if (error.response?.status === 401) {
        setUser(null);
        setProfile(null);
        return null;
      }

      throw error;
    }
  }, []);

  // Fetch the logged-in user's profile.
  const refreshProfile = useCallback(async () => {
    setProfileLoading(true);

    try {
      const response = await axios.get(`${API_URL}/api/profile/me`, {
        withCredentials: true,
      });

      const currentProfile = response.data.profile || null;

      setProfile(currentProfile);

      return currentProfile;
    } catch (error) {
      if (error.response?.status === 404) {
        setProfile(null);
        return null;
      }

      if (error.response?.status === 401) {
        setUser(null);
        setProfile(null);
        return null;
      }

      throw error;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  // Load the session and profile when the app starts.
  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await refreshUser();

        if (currentUser) {
          try {
            await refreshProfile();
          } catch (error) {
            console.error("Profile check failed:", error);
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [refreshUser, refreshProfile]);

  // Normal login.
  const login = async (credentials) => {
    const response = await axios.post(
      `${API_URL}/api/user/login`,
      credentials,
      { withCredentials: true },
    );

    if (response.data.user) {
      setUser(response.data.user);
    } else {
      await refreshUser();
    }

    try {
      await refreshProfile();
    } catch (error) {
      console.error("Profile check failed after login:", error);
    }

    return response.data;
  };

  // Google login.
  const googleLogin = async (googleData) => {
    const response = await axios.post(
      `${API_URL}/api/user/google-login`,
      googleData,
      { withCredentials: true },
    );

    if (response.data.user) {
      setUser(response.data.user);
    } else {
      await refreshUser();
    }

    try {
      await refreshProfile();
    } catch (error) {
      console.error("Profile check failed after Google login:", error);
    }

    return response.data;
  };

  // Register a new user.
  const register = async (userData) => {
    const response = await axios.post(
      `${API_URL}/api/user/register`,
      userData,
      { withCredentials: true },
    );

    return response.data;
  };

  // Logout.
  const logout = async () => {
    const response = await axios.post(
      `${API_URL}/api/user/logout`,
      {},
      { withCredentials: true },
    );

    setUser(null);
    setProfile(null);

    return response.data;
  };

  // Email verification.
  const verifyEmail = async (verificationData) => {
    const response = await axios.post(
      `${API_URL}/api/user/verify`,
      verificationData,
      { withCredentials: true },
    );

    if (response.data.user) {
      setUser(response.data.user);

      try {
        await refreshProfile();
      } catch (error) {
        console.error("Profile check failed after verification:", error);
      }
    }

    return response.data;
  };

  // Resend verification code.
  const resendVerification = async (emailData) => {
    const response = await axios.post(`${API_URL}/api/user/resend`, emailData, {
      withCredentials: true,
    });

    return response.data;
  };

  // Send password reset code.
  const forgotPassword = async (emailData) => {
    const response = await axios.post(
      `${API_URL}/api/user/forgot-password`,
      emailData,
      { withCredentials: true },
    );

    return response.data;
  };

  // Reset password.
  const resetPassword = async (passwordData) => {
    const response = await axios.post(
      `${API_URL}/api/user/reset-password`,
      passwordData,
      { withCredentials: true },
    );

    return response.data;
  };

  const value = {
    user,
    profile,

    loading,
    profileLoading,

    isAuthenticated: Boolean(user),
    hasProfile: Boolean(profile),

    login,
    googleLogin,
    register,
    logout,
    refreshUser,
    refreshProfile,

    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook.
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
};

export default AuthContext;
