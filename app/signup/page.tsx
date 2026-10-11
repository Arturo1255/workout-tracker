"use client";
import { useState } from "react";
import Link from "next/link";
import { tintStrong, inputBase } from "@/lib/styles";

export default function SignUpForm() {
    const [user, setUser] = useState({
        username: "",
        password: "",
        name: "",
        email: "",
    });

    const [statusMessage, setStatusMessage] = useState("");
    const [isError, setError] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const response = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });
        const data = await response.json();
        if (response.ok) {
            setStatusMessage("Account created! You can log in now.");
            setUser({ username: "", password: "", name: "", email: "" });
            setError(false);
        } else {
            setStatusMessage(data.error || "Something went wrong");
            setError(true);
        }
    }

    return (
        <div className="max-w-md mx-auto mt-12 px-4">
            <h1 className="text-2xl font-bold text-stone-900 mb-6">Sign up</h1>

            <form
                onSubmit={handleSubmit}
                className="rounded-lg border border-stone-200 bg-stone-50 p-6 flex flex-col gap-4"
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor="name" className="text-sm font-medium text-stone-700">
                        Name
                    </label>
                    <input
                        id="name"
                        autoComplete="name"
                        value={user.name}
                        onChange={(e) => setUser({ ...user, name: e.target.value })}
                        className={inputBase}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="email" className="text-sm font-medium text-stone-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        className={inputBase}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="username" className="text-sm font-medium text-stone-700">
                        Username
                    </label>
                    <input
                        id="username"
                        autoComplete="username"
                        value={user.username}
                        onChange={(e) => setUser({ ...user, username: e.target.value })}
                        className={inputBase}
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="password" className="text-sm font-medium text-stone-700">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        value={user.password}
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                        className={inputBase}
                    />
                </div>

                <button type="submit" className={`${tintStrong} rounded-md px-4 py-2`}>
                    Create account
                </button>

                {statusMessage !== "" && (
                    <p
                        className={`p-3 rounded-md text-sm font-medium text-center ${
                            isError ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }`}
                    >
                        {statusMessage}
                    </p>
                )}
            </form>

            <p className="mt-4 text-sm text-stone-600 text-center">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-orange-700 hover:text-orange-800 underline">
                    Log in
                </Link>
            </p>
        </div>
    );
}