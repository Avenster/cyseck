import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getToken, removeToken } from "../utils/auth";
import Footer from "~/components/footer";

interface User {
  name: string;
  email?: string;
  phone?: string;
}

export default function Welcome() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      navigate("/");
      return;
    }

    fetch("http://localhost:3000/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setIsLoading(false);
      })
      .catch(() => {
        removeToken();
        navigate("/");
      });
  }, [navigate]);

  const logout = () => {
    removeToken();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl delay-1000"></div>
        
        <div className="relative z-10 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
          <p className="text-sm text-white/60">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
      <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl delay-1000"></div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
            {/* Header Section */}
            <div className="border-b border-white/10 pb-6">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm">
                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white">
                Welcome back, {user?.name}!
              </h1>
              <p className="mt-2 text-white/60">
                You're successfully logged in to your account
              </p>
            </div>

            {/* Account Details Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">Account Details</h2>
              
              <div className="space-y-3">
                {user?.email && (
                  <div className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                        <svg
                          className="h-5 w-5 text-white/80"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Email Address</p>
                        <p className="text-sm font-medium text-white">{user.email}</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-green-500/20 px-3 py-1">
                      <span className="text-xs font-medium text-green-300">Verified</span>
                    </div>
                  </div>
                )}

                {user?.phone && (
                  <div className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10">
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                        <svg
                          className="h-5 w-5 text-white/80"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-white/40">Phone Number</p>
                        <p className="text-sm font-medium text-white">{user.phone}</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-green-500/20 px-3 py-1">
                      <span className="text-xs font-medium text-green-300">Verified</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-6">
              <button
                onClick={logout}
                className="group w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-white/20 active:scale-[0.98]"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}