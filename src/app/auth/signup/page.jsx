"use client";

import { useState } from "react";
import { Card, Button, Link, TextField, Label, InputGroup, Input, FieldError } from "@heroui/react";
import { Eye, EyeSlash, Person, At, ShieldKeyhole, Briefcase } from "@gravity-ui/icons";
import { FiImage } from "react-icons/fi";
import { signUp, authClient } from "@/lib/auth-client";
import Lottie from "lottie-react";
import animationData from "@/assets/animation.json";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    // --- Form States ---
    const [role, setRole] = useState(null); // "client" | "freelancer"
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState("");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [fileName, setFileName] = useState(""); // Stores the display name

    const toggleVisibility = () => setIsVisible(!isVisible);


    // Update your validateForm function
    const validateForm = () => {
        let newErrors = {};
        if (!role || role.trim() === "") {
            newErrors.role = "Please select a role to continue.";
        }
        if (name.length < 2) newErrors.name = "Name must be at least 2 characters.";
        if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email address.";

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(password)) {
            newErrors.password = "Must be 6+ chars, 1 number, 1 upper & lower case.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!role) {
            toast.error("Please select a role (Client or Freelancer) to continue.");
            return;
        }
        if (!name.trim()) {
            toast.error("Name is required.");
            return;
        }
        if (!email.trim()) {
            toast.error("Email is required.");
            return;
        }
        if (!password.trim()) {
            toast.error("Password is required.");
            return;
        }
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const { error: authError } = await signUp.email({
                email,
                password,
                name,
                image,
                role,
                // callbackURL: callbackUrl,
                // Add the role here
                // additionalFields: {
                //     role: role, // Ensure this matches your DB schema field name
                // },
            });

            if (authError) {
                toast.error(authError.message || "Signup failed.");
            } else {
                toast.success(`Account created as ${role}!`);
                // router.push(callbackUrl);
                // FORCE LOGOUT: Immediately clear the session
                await authClient.signOut();

                // REDIRECT: Send them to the login page
                router.push("/auth/signin");
                setRole(null);
                setName("");
                setEmail("");
                setPassword("");
                setImage("");
                setErrors({});
            }
        } catch (err) {
            toast.error("An unexpected network error occurred.");
        } finally {
            setIsLoading(false);
        }
        console.log("Sending to Auth:", {
            email,
            name,
            image,
            role, // Check if this holds "client" or "freelancer"
        });
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Set the file name for display
        setFileName(file.name);

        setIsLoading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await response.json();

            if (data.success) {
                setImage(data.data.url); // Keep the URL for your database
                toast.success("File uploaded!");
            } else {
                toast.error("Upload failed");
                setFileName(""); // Clear name if upload fails
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
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
            <section className="flex-1 flex items-center justify-center p-6 bg-zinc-950">
                <div className="relative p-[2px] rounded-[34px] overflow-hidden w-full max-w-md">
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_280deg,#14b8a6_320deg,#facc15_360deg)] animate-border opacity-70"></div>

                    <Card className="relative w-full p-8 shadow-2xl bg-zinc-950/80 backdrop-blur-xl rounded-[32px] border border-white/10">
                        <div className="flex flex-col items-center justify-center gap-1 pb-6 border-b border-zinc-800 mb-6 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight text-white">Create your account</h1>
                            <p className="text-sm text-zinc-400">Join thousands of professionals on TaskHive</p>
                        </div>


                        {/* Role Selection */}
                        {/* Role Selection */}
                        <div className="flex flex-col gap-2 mb-6">
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole("client")}
                                    className={`p-4 rounded-2xl border transition-all ${role === "client" ? 'border-teal-500 bg-teal-500/10' :
                                        errors.role ? 'border-red-500' : 'border-white/10'
                                        }`}
                                >
                                    <span className={role === "client" ? "text-teal-400" : "text-zinc-500"}>Client</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole("freelancer")}
                                    className={`p-4 rounded-2xl border transition-all ${role === "freelancer" ? 'border-teal-500 bg-teal-500/10' :
                                        errors.role ? 'border-red-500' : 'border-white/10'
                                        }`}
                                >
                                    <span className={role === "freelancer" ? "text-teal-400" : "text-zinc-500"}>Freelancer</span>
                                </button>
                            </div>
                            {/* Error Message Display */}
                            {errors.role && <p className="text-[10px] text-red-500 ml-1">{errors.role}</p>}
                        </div>

                        <form onSubmit={handleSignup} className="flex flex-col gap-4">
                            <TextField isRequired name="name" className="flex flex-col gap-1.5">
                                <Label className="text-xs font-medium text-zinc-300">Name</Label>
                                <InputGroup className={`flex items-center gap-2 border rounded-xl px-3 bg-white/5 ${errors.name ? 'border-red-500' : 'border-white/10'}`}>
                                    <Person className="text-zinc-500" size={16} />
                                    <Input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent py-2 text-sm text-white outline-none border-none" />
                                </InputGroup>
                            </TextField>

                            <TextField isRequired name="email" className="flex flex-col gap-1.5">
                                <Label className="text-xs font-medium text-zinc-300">Email Address</Label>
                                <InputGroup className={`flex items-center gap-2 border rounded-xl px-3 bg-white/5 ${errors.email ? 'border-red-500' : 'border-white/10'}`}>
                                    <At className="text-zinc-500" size={16} />
                                    <Input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent py-2 text-sm text-white outline-none border-none" />
                                </InputGroup>
                            </TextField>

                            {/* Avatar Section */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-medium text-zinc-300">Avatar</Label>
                                    <span className="text-[9px] text-zinc-500">Paste URL or upload a file</span>
                                </div>
                                <InputGroup className="flex items-center gap-2 border border-white/10 rounded-xl px-3 bg-white/5">
                                    <FiImage className="text-zinc-500" size={16} />
                                    <Input
                                        // If we have a file name, show it; otherwise, let the user type a URL
                                        placeholder="https://example.com/avatar.png"
                                        value={fileName || image}
                                        onChange={(e) => {
                                            setImage(e.target.value);
                                            setFileName(""); // Clear the file name if the user starts typing a URL
                                        }}
                                        className="w-full bg-transparent py-2 text-sm text-white outline-none border-none"
                                    />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer text-teal-400 text-xs font-medium whitespace-nowrap hover:underline"
                                    >
                                        Upload
                                    </label>
                                </InputGroup>
                            </div>

                            <TextField isRequired name="password" className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center">
                                    <Label className="text-xs font-medium text-zinc-300">Password</Label>
                                    <Link href="/auth/forgot-password" size="sm" className="text-[10px] text-teal-400 hover:underline">Forgot password?</Link>
                                </div>
                                <InputGroup className={`flex items-center gap-2 border rounded-xl px-3 bg-white/5 ${errors.password ? 'border-red-500' : 'border-white/10'}`}>
                                    <ShieldKeyhole className="text-zinc-500" size={16} />
                                    <Input type={isVisible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent py-2 text-sm text-white outline-none border-none" />
                                    <button type="button" onClick={toggleVisibility} className="text-zinc-500">{isVisible ? <EyeSlash size={16} /> : <Eye size={16} />}</button>
                                </InputGroup>
                                {errors.password && <p className="text-[10px] text-red-400">{errors.password}</p>}
                            </TextField>

                            <Button type="submit" className="w-full h-12 rounded-xl font-semibold text-sm text-black bg-gradient-to-r from-teal-400 to-yellow-400 mt-2" isLoading={isLoading}>
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-5 flex flex-col gap-3">
                            <Button onClick={handleGoogleSignup} className="w-full h-12 rounded-xl font-semibold text-sm bg-white/5 border border-white/10 text-white hover:bg-white/10">
                                <FcGoogle size={18} className="mr-2" /> Continue with Google
                            </Button>
                            <p className="text-center text-xs text-zinc-500">
                                Already have an account? <Link href="/auth/signin" className="text-teal-400 hover:underline">Log in</Link>
                            </p>
                        </div>
                    </Card>
                </div>
            </section>

            <section className="hidden lg:flex flex-1 items-center justify-center bg-black overflow-hidden relative">
                <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="w-full max-w-lg z-10">
                    <Lottie animationData={animationData} loop={true} autoplay={true} />
                </div>
            </section>
        </main>
    );
}