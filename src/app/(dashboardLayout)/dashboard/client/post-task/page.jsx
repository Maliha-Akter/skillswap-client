"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { Button, Input, TextArea, Card } from "@heroui/react";
import { FaBriefcase, FaDollarSign, FaCalendarAlt, FaLayerGroup } from "react-icons/fa";
import PageHeader from "@/components/PageHeader";
import { toast } from "react-toastify";
import { useSession } from "@/lib/auth-client";

const PostTask = () => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { data: session } = useSession();

    const categories = [
        { label: "Design", value: "Design" },
        { label: "Writing", value: "Writing" },
        { label: "Development", value: "Development" },
        { label: "Marketing", value: "Marketing" },
        { label: "Other", value: "Other" }
    ];

    const onSubmitTask = async (data) => {
        try {
            const formattedData = {
                title: data.title,
                category: data.category,
                description: data.description,
                budget: parseFloat(data.budget),
                deadline: data.deadline,
                client_email: session?.user?.email,
            };

            const res = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formattedData),
            });

            if (!res.ok) throw new Error("Failed to post task");

            toast.success("Task published successfully!");
            reset();
        } catch (error) {
            toast.error(error.message || "Failed to post the task.");
        }
    };

    // Reusable input wrapper classes
    const inputClasses = {
        label: "text-zinc-300 text-sm font-medium mb-1.5 block",
        inputWrapper: "h-11 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus-within:!border-amber-500/80 transition-all duration-200 rounded-xl px-4",
        input: "text-sm placeholder:text-zinc-600",
    };

    // Safely extract properties from registration to prevent forwarding props to DOM elements
    const titleRegister = register("title", { required: "Task title is required" });
    const deadlineRegister = register("deadline", { required: "Deadline date is required" });
    const budgetRegister = register("budget", {
        required: "Budget is required",
        min: { value: 5, message: "Minimum budget is $5" }
    });
    const descriptionRegister = register("description", {
        required: "Description is required",
        minLength: { value: 20, message: "Please provide at least 20 characters" }
    });

    return (
        <div className="min-h-screen text-zinc-100 max-w-5xl mx-auto px-4 py-6">
            <PageHeader
                title="Post a New Task"
                description="Describe your task and set a budget to find skilled freelancers across our community network."
            />

            <div className="mt-8">
                <Card className="border border-zinc-800/70 bg-zinc-900/30 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-10">
                    <form onSubmit={handleSubmit(onSubmitTask)} className="space-y-8">

                        {/* ====== SECTION 1: Basic Information ====== */}
                        <div>
                            <h3 className="text-lg font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
                                <span className="w-1 h-6 bg-linear-to-br from-teal-400 to-yellow-400 rounded-full"></span>
                                Basic Information
                            </h3>
                            <p className="text-sm text-zinc-400 mt-1 ml-3">Provide the core details of your task.</p>

                            <div className="mt-5 space-y-6">
                                {/* Task Title - Full width */}
                                <div>
                                    <label className="text-zinc-300 text-sm font-medium mb-1.5 block">Task Title</label>
                                    <Input
                                        type="text"
                                        label="Task Title"
                                        labelplacement="outside"
                                        placeholder="e.g., Design a landing page for my startup"
                                        variant="flat"
                                        startcontent={<FaBriefcase className="text-zinc-500 text-sm flex-shrink-0" />}
                                        name={titleRegister.name}
                                        onChange={titleRegister.onChange}
                                        onBlur={titleRegister.onBlur}
                                        ref={titleRegister.ref}
                                        className="w-full"
                                        classnames={inputClasses}
                                    />
                                    {errors.title && <p className="text-red-400 text-xs font-medium mt-1.5 px-1">⚠️ {errors.title.message}</p>}
                                </div>

                                {/* Category & Deadline - Two columns */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-zinc-300 text-sm font-medium mb-1.5 block">Category</label>
                                        <div className="relative flex items-center bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus-within:border-amber-500/80 rounded-xl h-11 px-4 transition-all duration-200">
                                            <FaLayerGroup className="text-zinc-500 text-sm mr-3 flex-shrink-0" />
                                            <select
                                                {...register("category", { required: "Please select a category" })}
                                                className="w-full bg-transparent text-zinc-100 text-sm outline-none cursor-pointer appearance-none pr-6"
                                                defaultValue=""
                                            >
                                                <option value="" disabled className="bg-zinc-950 text-zinc-500">Select a category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.value} value={cat.value} className="bg-zinc-900 text-zinc-100">
                                                        {cat.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 pointer-events-none text-zinc-500 text-[10px]">▼</div>
                                        </div>
                                        {errors.category && <p className="text-red-400 text-xs font-medium mt-1.5 px-1">⚠️ {errors.category.message}</p>}
                                    </div>

                                    <div>
                                        <label className="text-zinc-300 text-sm font-medium mb-1.5 block">Deadline</label>
                                        <Input
                                            type="date"
                                            label="Deadline"
                                            labelplacement="outside"
                                            variant="flat"
                                            startcontent={<FaCalendarAlt className="text-zinc-500 text-sm flex-shrink-0" />}
                                            name={deadlineRegister.name}
                                            onChange={deadlineRegister.onChange}
                                            onBlur={deadlineRegister.onBlur}
                                            ref={deadlineRegister.ref}
                                            className="w-full"
                                            classnames={{
                                                ...inputClasses,
                                                input: "text-sm text-zinc-300"
                                            }}
                                        />
                                        {errors.deadline && <p className="text-red-400 text-xs font-medium mt-1.5 px-1">⚠️ {errors.deadline.message}</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ====== SECTION 2: Budget & Requirements ====== */}
                        <div className="pt-4 border-t border-zinc-800/60">
                            <h3 className="text-lg font-semibold text-zinc-100 tracking-tight flex items-center gap-2">
                                <span className="w-1 h-6 bg-linear-to-br from-teal-400 to-yellow-400 rounded-full"></span>
                                Budget & Requirements
                            </h3>
                            <p className="text-sm text-zinc-400 mt-1 ml-3">Define the financial scope and detailed description.</p>

                            <div className="mt-5 space-y-6">
                                {/* Budget - 1/3 width */}
                                <div className="max-w-xs">
                                    <label className="text-zinc-300 text-sm font-medium mb-1.5 block">Budget (USD)</label>
                                    <Input
                                        type="number"
                                        label="Budget (USD)"
                                        labelplacement="outside"
                                        placeholder="500"
                                        variant="flat"
                                        startcontent={<FaDollarSign className="text-zinc-500 text-sm flex-shrink-0" />}
                                        name={budgetRegister.name}
                                        onChange={budgetRegister.onChange}
                                        onBlur={budgetRegister.onBlur}
                                        ref={budgetRegister.ref}
                                        className="w-full"
                                        classnames={inputClasses}
                                    />
                                    {errors.budget && <p className="text-red-400 text-xs font-medium mt-1.5 px-1">⚠️ {errors.budget.message}</p>}
                                </div>

                                {/* Description - Full width */}
                                <div>
                                    <label className="text-zinc-300 text-sm font-medium mb-1.5 block">Description</label>
                                    <TextArea
                                        label="Description"
                                        labelplacement="outside"
                                        variant="flat"
                                        placeholder="Provide a detailed outline of the work tasks, delivery items, and requirements..."
                                        minrows={5}
                                        name={descriptionRegister.name}
                                        onChange={descriptionRegister.onChange}
                                        onBlur={descriptionRegister.onBlur}
                                        ref={descriptionRegister.ref}
                                        className="w-full"
                                        classnames={{
                                            label: "text-zinc-300 text-sm font-medium mb-1.5 block",
                                            inputWrapper: "bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus-within:!border-amber-500/80 transition-all duration-200 rounded-xl p-4 h-auto",
                                            input: "text-sm placeholder:text-zinc-600 leading-relaxed resize-none",
                                        }}
                                    />
                                    {errors.description && <p className="text-red-400 text-xs font-medium mt-1.5 px-1">⚠️ {errors.description.message}</p>}
                                </div>
                            </div>
                        </div>

                        {/* ====== ACTION BUTTONS ====== */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-800/60">
                            <Button
                                type="button"
                                variant="light"
                                onClick={() => reset()}
                                className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 font-medium h-11 px-6 transition-colors duration-200"
                                radius="xl"
                            >
                                Reset
                            </Button>
                            <Button
                                type="submit"
                                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold h-11 px-8 shadow-md shadow-amber-500/5 hover:shadow-amber-500/10 active:scale-[0.98] transition-all duration-200"
                                radius="xl"
                            >
                                Publish Task
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default PostTask;