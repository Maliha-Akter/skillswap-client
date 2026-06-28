"use client";
import React, { useState, useEffect } from 'react';
import { FaSearch, FaUser, FaBan, FaCheckCircle, FaUserShield, FaUsers } from 'react-icons/fa';
import { authClient } from "@/lib/auth-client";
import { useRouter } from 'next/navigation';

// Reusable Top Filter Row Component
const TopFilterSection = ({ title, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2">
        <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider min-w-[100px]">{title}:</h3>
        <div className="flex flex-wrap items-center gap-4">{children}</div>
    </div>
);

// Individual Table Row Component replacing the old UserCard
const UserTableRow = ({ user, onToggleBlock }) => {
    const [actionLoading, setActionLoading] = useState(false);

    const handleAction = async () => {
        setActionLoading(true);
        await onToggleBlock(user._id, user.isBlocked);
        setActionLoading(false);
    };

    return (
        <tr className={`border-b border-white/5 transition-colors duration-200 ${user.isBlocked ? 'bg-red-950/5 opacity-70' : 'hover:bg-zinc-900/40'}`}>
            {/* Avatar & Name */}
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    {/* ✅ FIX: Check if image exists AND starts like a valid path/URL */}
                    {user.image && (user.image.startsWith('http') || user.image.startsWith('/')) ? (
                        <img
                            src={user.image}
                            alt={user.name}
                            className={`w-9 h-9 rounded-full object-cover border ${user.isBlocked ? 'border-red-500/30' : 'border-white/10'}`}
                        />
                    ) : (
                        <div className={`w-9 h-9 rounded-full border flex items-center justify-center text-zinc-400 ${user.isBlocked ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-white/5 border-white/10'}`}>
                            <FaUser className="text-xs" />
                        </div>
                    )}
                    <span className="text-white font-medium text-sm block truncate max-w-[180px]" title={user.name}>
                        {user.name}
                    </span>
                </div>
            </td>

            {/* Email Address */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400 font-mono">
                <span className="truncate block max-w-[220px]" title={user.email}>
                    {user.email}
                </span>
            </td>

            {/* Platform Role Tag */}
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-mono tracking-wider uppercase font-bold inline-block ${user.role === 'admin' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    user.role === 'freelancer' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-teal-500/10 border-teal-500/20 text-teal-400'
                    }`}>
                    {user.role || 'client'}
                </span>
            </td>

            {/* Access Status Badge */}
            <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex items-center gap-1.5">
                    {user.isBlocked ? (
                        <>
                            <FaBan className="text-red-400 text-xs animate-pulse" />
                            <span className="text-red-400 font-semibold tracking-wide text-xs">Blocked</span>
                        </>
                    ) : (
                        <>
                            <FaCheckCircle className="text-emerald-400 text-xs" />
                            <span className="text-emerald-400 font-semibold tracking-wide text-xs">Active</span>
                        </>
                    )}
                </div>
            </td>

            {/* Action Operations */}
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                {user.role === 'admin' ? (
                    <span className="text-[11px] font-medium text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-xl border border-white/5 inline-block min-w-[105px] text-center select-none">
                        Protected
                    </span>
                ) : (
                    <button
                        onClick={handleAction}
                        disabled={actionLoading}
                        className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all border shadow-sm cursor-pointer disabled:opacity-50 min-w-[105px] text-center ${user.isBlocked
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                            : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-black'
                            }`}
                    >
                        {actionLoading ? 'Updating...' : user.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                )}
            </td>
        </tr>
    );
};

// Core Dashboard View Container
const ManageUsersPage = () => {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { data: session } = authClient.useSession();
    const currentUser = session?.user;

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");

    console.log("==> [FRONTEND TRACE 1: RENDER] Current Component State:", {
        hasSession: !!session,
        userEmail: currentUser?.email,
        userRole: currentUser?.role,
        selectedRole,
        debouncedSearch: `"${debouncedSearch}"`
    });

    const handleReset = () => {
        setSearchQuery("");
        setSelectedRole("all");
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const fetchUsers = async () => {
        try {
            console.log("==> [FRONTEND TRACE 3: fetchUsers START] Preparing API call...");
            if (!searchQuery && users.length === 0) setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (debouncedSearch) params.append("search", debouncedSearch);
            if (selectedRole && selectedRole !== "all") params.append("role", selectedRole);

            const targetUrl = `http://localhost:8080/api/admin/users?${params.toString()}`;
            console.log(`==> [FRONTEND TRACE 4: URL] Target URL configured: ${targetUrl}`);

            const tokenData = await authClient.token();
            console.log("==> [FRONTEND TRACE 5: TOKEN] Token retrieval response structure:", tokenData);

            // Parse token safely out from wrapping structures
            const actualToken = tokenData?.token || tokenData?.data?.token || tokenData?.token?.token;

            if (!actualToken) {
                console.warn("⚠️ ==> [FRONTEND TRACE 5a: GUARD TRIGGERED] Authorization token string not found inside layout data.");
                return;
            }

            console.log("🚀 ==> [FRONTEND TRACE 6: FETCH] Sending request to server node...");
            const response = await fetch(targetUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${actualToken}`
                }
            });

            console.log(`==> [FRONTEND TRACE 7: RESPONSE] HTTP Status received: ${response.status}`);
            const result = await response.json();
            console.log("==> [FRONTEND TRACE 8: BODY] Parsed Response Data:", result);

            if (response.ok && result.success) {
                setUsers(result.data);
            } else {
                throw new Error(result.message || "Failed to load system ledger.");
            }
        } catch (err) {
            console.error("❌ ==> [FRONTEND TRACE ERROR] fetchUsers crashed:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("==> [FRONTEND TRACE 2: useEffect TRIGGERED] Dependencies changed.");

        if (currentUser && currentUser.role !== 'admin') {
            console.warn(`🛑 ==> Unauthorized: Logged-in user role is "${currentUser.role}", redirecting...`);
            router.push('/unauthorized');
            return;
        }

        if (currentUser?.email) {
            console.log(`✅ ==> Email "${currentUser.email}" found. Invoking fetchUsers().`);
            fetchUsers();
        } else {
            console.warn("⏳ ==> Cannot invoke fetchUsers(): currentUser.email is empty or missing.");
        }
    }, [currentUser, debouncedSearch, selectedRole, router]);

    const handleToggleBlock = async (userId, currentBlockStatus) => {
        try {
            console.log(`==> [FRONTEND BLOCK START] Target ID: ${userId}, Current Status: ${currentBlockStatus}`);
            const targetUrl = `http://localhost:8080/api/admin/users/${userId}/block`;
            const tokenData = await authClient.token();

            const actualToken = tokenData?.token || tokenData?.data?.token || tokenData?.token?.token;

            if (!actualToken) {
                alert("Session expired or token invalid. Refreshing application...");
                return;
            }

            const response = await fetch(targetUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${actualToken}`
                },
                body: JSON.stringify({ isBlocked: !currentBlockStatus })
            });

            const result = await response.json();
            console.log("==> [FRONTEND BLOCK RESPONSE]:", result);

            if (response.ok && result.success) {
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user._id === userId ? { ...user, isBlocked: !currentBlockStatus } : user
                    )
                );
            } else {
                alert(`Operation failed: ${result.message}`);
            }
        } catch (err) {
            console.error("==> Block/Unblock Exception Error:", err);
            alert("Critical system error handling requested permission update.");
        }
    };

    return (
        <div className="p-6 md:p-10 bg-zinc-950 min-h-screen text-zinc-100 flex flex-col gap-6 max-w-7xl mx-auto">

            {/* HEADER BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        <FaUserShield className="text-teal-400" /> Manage Users
                    </h1>
                    <p className="text-sm text-zinc-400 mt-1">Audit permissions, adjust access roles, or terminate active session authorizations</p>
                </div>
            </div>

            {/* SEARCH CONTROL BAR */}
            <div className="relative flex items-center w-full bg-zinc-900/20 p-1.5 rounded-2xl border border-white/5 shadow-2xl">
                <FaSearch className="absolute left-6 text-zinc-500 text-sm" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name or email address..."
                    className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 placeholder:text-zinc-600 transition-colors"
                />
            </div>

            {/* FILTER PANEL */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col gap-2 shadow-2xl">
                <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-3">
                    <h2 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                        <FaUsers className="text-zinc-400" /> Dynamic Filtering Pipeline
                    </h2>
                    <button
                        onClick={handleReset}
                        className="text-red-400 text-xs font-semibold hover:text-red-300 transition-colors bg-transparent border-none cursor-pointer"
                    >
                        Clear Filters
                    </button>
                </div>

                <TopFilterSection title="Account Role">
                    {['all', 'client', 'freelancer', 'admin'].map((role) => (
                        <label key={role} className={`flex items-center gap-2 text-xs cursor-pointer px-3 py-1.5 rounded-xl border transition-all capitalize select-none font-medium ${selectedRole === role
                            ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                            : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:text-zinc-200'
                            }`}>
                            <input
                                type="radio"
                                name="role-filter"
                                checked={selectedRole === role}
                                onChange={() => setSelectedRole(role)}
                                className="hidden"
                            />
                            {role}
                        </label>
                    ))}
                </TopFilterSection>
            </div>

            {/* LIVE DB USERS DISPLAY (REFACTORED TABLE VIEW) */}
            {!currentUser?.email ? (
                <div className="text-center py-16 text-zinc-500 text-sm animate-pulse tracking-wide font-mono">
                    Verifying administrative encryption channel tokens...
                </div>
            ) : loading ? (
                <div className="text-center py-16 text-zinc-500 text-sm animate-pulse tracking-wide font-mono">
                    Pulling latest secure accounts registration ledger matrix...
                </div>
            ) : error ? (
                <div className="text-center py-16 text-red-400 text-sm font-mono bg-red-950/10 border border-red-500/10 rounded-2xl">
                    ⚠️ System Exception: {error}
                </div>
            ) : users.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl font-mono">
                    No registered cluster profiles found matching active search string queries.
                </div>
            ) : (
                <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/30 backdrop-blur-md shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-zinc-900/80 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email Address</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <UserTableRow
                                    key={user._id}
                                    user={user}
                                    onToggleBlock={handleToggleBlock}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ManageUsersPage;