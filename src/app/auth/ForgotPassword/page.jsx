"use client";

import { useState } from "react";
import { Card, Button, Link, TextField, Label, InputGroup, Input } from "@heroui/react";
import { At, ArrowLeft } from "@gravity-ui/icons";
import Lottie from "lottie-react";
import animationData from "@/assets/animation.json";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Add your logic here
        setTimeout(() => setIsLoading(false), 2000);
    };

    return (
        <main className="flex min-h-screen w-full bg-black">
            <section className="flex-1 flex items-center justify-center p-6 bg-zinc-950">
                <div className="relative p-[2px] rounded-[34px] overflow-hidden w-full max-w-md">
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_280deg,#14b8a6_320deg,#facc15_360deg)] animate-border opacity-70"></div>

                    <Card className="relative w-full p-8 shadow-2xl bg-zinc-950/80 backdrop-blur-xl rounded-[32px] border border-white/10">
                        {/* Header */}
                        <div className="flex flex-col items-center justify-center gap-1 pb-6 mb-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight text-white">Reset password</h1>
                            <p className="text-sm text-zinc-400">Enter your email to receive a reset link</p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <TextField isRequired name="email" className="flex flex-col gap-1.5">
                                <Label className="text-xs font-medium text-zinc-300">Email Address</Label>
                                <InputGroup className="flex items-center gap-2 border border-white/10 rounded-xl px-3 bg-white/5 focus-within:border-teal-500 transition-colors">
                                    <At className="text-zinc-500" size={16} />
                                    <Input 
                                        type="email" 
                                        placeholder="you@example.com" 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        className="w-full bg-transparent py-2 text-sm text-white outline-none border-none" 
                                    />
                                </InputGroup>
                            </TextField>

                            <Button 
                                type="submit" 
                                className="w-full h-12 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-teal-400 to-yellow-400" 
                                isLoading={isLoading}
                            >
                                Send Reset Link
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link href="/auth/signin" className="inline-flex items-center text-xs text-zinc-500 hover:text-white transition-colors">
                                <ArrowLeft size={14} className="mr-1" /> Back to Login
                            </Link>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Animation Side */}
            <section className="hidden lg:flex flex-1 items-center justify-center bg-black overflow-hidden relative">
                <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
                <div className="w-full max-w-lg z-10">
                    <Lottie animationData={animationData} loop={true} autoplay={true} />
                </div>
            </section>
        </main>
    );
}