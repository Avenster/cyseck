import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { isAuthenticated, setToken } from "../utils/auth";
import Footer from "~/components/footer";

export default function Verify() {
  const [otp, setOtp] = useState<string>("");
  const [identifier, setIdentifier] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      if (await isAuthenticated()) {
        navigate("/welcome");
        return;
      }

      const id = localStorage.getItem("auth_identifier");
      if (!id) navigate("/");
      else setIdentifier(id);
    };

    check();
  }, [navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3000/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, otp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setToken(data.token);
      localStorage.removeItem("auth_identifier");

      navigate("/welcome");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20"></div>
      <div className="absolute left-1/4 top-1/4 h-96 w-96 animate-pulse rounded-full bg-purple-500/10 blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-pulse rounded-full bg-blue-500/10 blur-3xl delay-1000"></div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <form 
            onSubmit={handleSubmit} 
            className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Verify OTP</h2>
              <p className="mt-2 text-sm text-white/60">
                Enter the 6-digit code sent to{" "}
                <span className="font-medium text-white/80">{identifier}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="otp" className="sr-only">
                  OTP Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="000000"
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-4 text-center text-2xl tracking-widest text-white placeholder-white/30 backdrop-blur-sm transition-all focus:border-white/40 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="animate-shake rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otp.length !== 6}
                className="w-full rounded-xl bg-white px-4 py-3 font-semibold text-black transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-white/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  "Verify"
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-medium text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
              >
                Back to Login
              </button>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                className="text-sm text-white/60 transition-colors hover:text-white/80"
              >
                Didn't receive a code? <span className="font-semibold text-white">Resend</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}