import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PageSEO } from "@/components/PageSEO";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Chrome, Facebook, Apple } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: ""
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isLogin]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(isLogin ? "Login submitted!" : "Registration submitted!");
  };

  return (
    <>
      <PageSEO title={isLogin ? "Login | Watchman Lagos" : "Join Us | Watchman Lagos"} />

      <div className="min-h-screen flex">
        {/* Left Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md"
          >
            <Link href="/" className="flex items-center gap-2 mb-8">
              <div className="w-12 h-12 rounded-full bg-[#8B0000] flex items-center justify-center">
                <span className="text-2xl font-serif font-bold text-white">W</span>
              </div>
              <span className="text-2xl font-semibold text-gray-900">Watchman</span>
            </Link>

            <h1 className="text-3xl font-serif font-semibold text-gray-900 mb-2">
              {isLogin ? "Welcome back" : "Join our family"}
            </h1>
            <p className="text-gray-600 mb-8">
              {isLogin 
                ? "Enter your details to access your account" 
                : "Create an account to get started with us"
              }
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000]"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000]"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000]"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000]"
                    placeholder="+234..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-[#8B0000]" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <Link href="/forgot-password" className="text-[#8B0000] hover:underline">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button type="submit" className="w-full bg-[#8B0000] hover:bg-[#6B0000] text-white py-3 rounded-lg flex items-center justify-center gap-2">
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {isLogin && (
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or continue with</span>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="py-3 flex items-center justify-center gap-2">
                  <Chrome className="w-5 h-5" />
                  Google
                </Button>
                <Button variant="outline" className="py-3 flex items-center justify-center gap-2">
                  <Facebook className="w-5 h-5" />
                  Facebook
                </Button>
              </div>
            )}

            <p className="mt-8 text-center text-gray-600">
              {isLogin ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => setIsLogin(false)} className="text-[#8B0000] font-medium hover:underline">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => setIsLogin(true)} className="text-[#8B0000] font-medium hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </motion.div>
        </div>

        {/* Right Panel - Image */}
        <div className="hidden lg:block flex-1 bg-cover bg-center relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#8B0000]/80 to-[#1A1A1A]/80" />
          <div className="relative z-10 h-full flex items-center justify-center p-12 text-white text-center">
            <div>
              <h2 className="text-4xl font-serif font-semibold mb-4">
                {isLogin ? "Good to see you again!" : "Welcome to the family!"}
              </h2>
              <p className="text-white/80 text-lg mb-8">
                {isLogin 
                  ? "Continue your faith journey with us" 
                  : "Join a community that cares about your spiritual growth"
                }
              </p>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-semibold">500+</p>
                  <p className="text-white/60 text-sm">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-semibold">50+</p>
                  <p className="text-white/60 text-sm">Groups</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-semibold">10+</p>
                  <p className="text-white/60 text-sm">Years</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}