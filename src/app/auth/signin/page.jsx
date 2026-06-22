"use client";

import { useState } from "react";
import { Card, Button, Link, TextField, Label, InputGroup, Input } from "@heroui/react";
import { Eye, EyeSlash, At, ShieldKeyhole } from "@gravity-ui/icons";
import { authClient } from "@/lib/auth-client";
import Lottie from "lottie-react";
import animationData from "@/assets/animation.json";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => setIsVisible(!isVisible);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const { error } = await authClient.signIn.email({
                email,
                password,
                callbackURL: callbackUrl,
            });

            if (error) {
                toast.error(error.message || "Login failed.");
            } else {
                toast.success("Welcome back!");
                router.push(callbackUrl);
                router.refresh();
            }
        } catch (err) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: callbackUrl,
            });
        } catch (err) {
            toast.error("Failed to authenticate with Google.");
        }
    };

    return (
        <main className="flex min-h-screen w-full bg-black">
            {/* Animation Section moved to the left */}
            <section className="hidden lg:flex flex-1 items-center justify-center bg-black overflow-hidden relative">
                <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
                <div className="w-full max-w-lg z-10">
                    <Lottie animationData={animationData} loop={true} autoplay={true} />
                </div>
            </section>

            {/* Form Section moved to the right */}
            <section className="flex-1 flex items-center justify-center p-6 bg-zinc-950">
                <div className="relative p-[2px] rounded-[34px] overflow-hidden w-full max-w-md">
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_280deg,#14b8a6_320deg,#facc15_360deg)] animate-border opacity-70"></div>

                    <Card className="relative w-full p-8 shadow-2xl bg-zinc-950/80 backdrop-blur-xl rounded-[32px] border border-white/10">
                        <div className="flex flex-col items-center justify-center gap-1 pb-8 border-b border-zinc-800 mb-8 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight text-white">Log in</h1>
                            <p className="text-sm text-zinc-400">Welcome back to TaskHive</p>
                        </div>

                        <form onSubmit={handleLogin} className="flex flex-col gap-5">
                            <TextField isRequired name="email" className="flex flex-col gap-1.5">
                                <Label className="text-xs font-medium text-zinc-300">Email Address</Label>
                                <InputGroup className="flex items-center gap-2 border border-white/10 rounded-xl px-3 bg-white/5 focus-within:border-teal-500">
                                    <At className="text-zinc-500" size={16} />
                                    <Input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent py-2 text-sm text-white outline-none" />
                                </InputGroup>
                            </TextField>

                            <TextField isRequired name="password" className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-medium text-zinc-300">Password</Label>
                                    <Link href="/auth/forgot-password" size="sm" className="text-[10px] text-teal-400 hover:underline">Forgot password?</Link>
                                </div>
                                <InputGroup className="flex items-center gap-2 border border-white/10 rounded-xl px-3 bg-white/5 focus-within:border-teal-500">
                                    <ShieldKeyhole className="text-zinc-500" size={16} />
                                    <Input type={isVisible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent py-2 text-sm text-white outline-none" />
                                    <button type="button" onClick={toggleVisibility} className="text-zinc-500">{isVisible ? <EyeSlash size={16} /> : <Eye size={16} />}</button>
                                </InputGroup>
                            </TextField>

                            <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-teal-400 to-yellow-400" isLoading={isLoading}>
                                Log In
                            </Button>
                        </form>

                        <div className="mt-6 flex flex-col gap-3">
                            <Button onClick={handleGoogleLogin} className="w-full h-12 rounded-xl font-semibold text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10">
                                <FcGoogle size={18} className="mr-2" /> Continue with Google
                            </Button>
                            <p className="text-center text-xs text-zinc-500 mt-2">
                                Don't have an account? <Link href="/auth/signup" className="text-teal-400 hover:underline">Sign up</Link>
                            </p>
                        </div>
                    </Card>
                </div>
            </section>
        </main>
    );
}