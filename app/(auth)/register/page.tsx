"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) as any });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password, phone: data.phone }),
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.error); return; }
      await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      toast.success("Account created successfully!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/logo.png"
              alt="Fragrance World YEG"
              width={320}
              height={211}
              priority
              className="h-20 w-auto object-contain mx-auto"
            />
          </Link>
        </div>
        <div className="bg-white shadow-luxury p-8">
          <h2 className="font-serif text-2xl text-center mb-1">Create Account</h2>
          <p className="text-gray-500 text-sm text-center mb-6">Join the Fragrance World YEG family</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Full Name</label>
              <input {...register("name")} className="input-luxury" placeholder="Your full name" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Email Address</label>
              <input {...register("email")} type="email" className="input-luxury" placeholder="your@email.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Phone (Optional)</label>
              <input {...register("phone")} className="input-luxury" placeholder="+1 780 000 0000" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Password</label>
              <div className="relative">
                <input {...register("password")} type={showPassword ? "text" : "password"} className="input-luxury pr-10" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-600 mb-1 block">Confirm Password</label>
              <input {...register("confirmPassword")} type="password" className="input-luxury" placeholder="Repeat password" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full btn-gold py-3 disabled:opacity-50">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-gold-500 hover:underline font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
