import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useToast } from '@/hooks/use-toast';


export default function ForgetPassword() {
  const [payload, setPayload] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayload((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/auth/forget-password", payload);

      toast({
        title: "Success!",
        description: "Password reset link has been sent to your email.",
        className: "bg-green-50",
      });

      setTimeout(() => {
        router.push("/auth/forget-password/success");
      }, 2000);

    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "An error occurred. Please try again.";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });

      console.error(
        "Submit Error:",
        err.response ? err.response.data : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-500 p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Forgot Password</h2>
          <p className="text-gray-500 mt-2">
            Enter your email to receive a reset link.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              onChange={handleChange}
              value={payload.email}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Remember your password?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:underline transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}