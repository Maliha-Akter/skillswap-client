"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AdminDashboard = () => {
    const router = useRouter();
    const [verifying, setVerifying] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTasks: 0,
        totalRevenue: 0,
        activeTasks: 0
    });

    // --- MOCK IDENTITY ---
    // In production, replace this with your actual logged-in user context/state
    const currentUser = {
        email: "admin@test.com",
        role: "admin" 
    };

    useEffect(() => {
        // 1. Structural Access Guard
        if (!currentUser || currentUser.role !== 'admin') {
            alert("Access Denied: Administrative authorization required.");
            router.push('/'); // Boot non-admins back to the home page
            return;
        }

        // 2. Fetch Aggregated Statistics from Backend if Verified
        const fetchAdminStats = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/admin/overview-stats', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // Send the email in the header so our backend middleware can verify it
                        'user-email': currentUser.email 
                    }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    setStats(result.data);
                } else {
                    console.error("Failed to fetch statistics:", result.message);
                }
            } catch (error) {
                console.error("Network communication fault:", error);
            } finally {
                setVerifying(false);
            }
        };

        fetchAdminStats();
    }, [router]);

    // Render loading verification state
    if (verifying) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-mono text-sm tracking-wider animate-pulse">
                Verifying administrative credentials...
            </div>
        );
    }

    // Main Control Panel UI
    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-6 md:p-10">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
                
                {/* Header Header */}
                <div className="border-b border-white/5 pb-5">
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                        🛡️ Admin Control Terminal
                    </h1>
                    <p className="text-zinc-400 text-xs mt-1">
                        Platform monitoring configuration panel • Active Session: {currentUser.email}
                    </p>
                </div>

                {/* Overview Statistics Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* Card 1: Total Users */}
                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 shadow-sm">
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Total Users</p>
                        <h3 className="text-3xl font-semibold text-white mt-2 font-mono">{stats.totalUsers}</h3>
                    </div>

                    {/* Card 2: Total Tasks */}
                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 shadow-sm">
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Total Tasks</p>
                        <h3 className="text-3xl font-semibold text-white mt-2 font-mono">{stats.totalTasks}</h3>
                    </div>

                    {/* Card 3: Active Tasks */}
                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 shadow-sm">
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Active Tasks</p>
                        <h3 className="text-3xl font-semibold text-teal-400 mt-2 font-mono">{stats.activeTasks}</h3>
                    </div>

                    {/* Card 4: Total Revenue */}
                    <div className="bg-zinc-900 border border-white/5 rounded-xl p-5 shadow-sm">
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Total Revenue</p>
                        <h3 className="text-3xl font-semibold text-emerald-400 mt-2 font-mono">
                            ${stats.totalRevenue.toLocaleString()}
                        </h3>
                    </div>

                </div>

                {/* Placeholder for subsequent requirements (Manage Users, Tasks, Transactions tables) */}
                <div className="border border-dashed border-white/10 rounded-xl p-10 text-center text-zinc-500 text-sm">
                    Overview matrix load verified. Ready to attach database display components below.
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;