"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tintStrong, inputBase } from "@/lib/styles";

export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const result = await signIn("credentials", {
            username,
            password,
            redirect: false,
        });

        if (result?.error) {
            setError("Invalid username or password");
        } else {
            router.push("/");
        }
    }

    return (
        <div className="max-w-md mx-auto mt-12 px-4">
            <h1 className="text-2xl font-bold text-stone-900 mb-6">Log in</h1>

            <form
                onSubmit={handleSubmit}
                className="rounded-lg border border-stone-200 bg-stone-50 p-6 flex flex-col gap-4"
            >
                <div className="flex flex-col gap-1">
                    <label htmlFor="username" className="text-sm font-medium text-stone-700">
                        Username
                    </label>
                    <input
                        id="username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputBase}
                    />
                </div>

                <button type="submit" className={`${tintStrong} rounded-md px-4 py-2`}>
                    Log in
                </button>

                {error && (
                    <p className="p-3 rounded-md text-sm font-medium text-center bg-red-100 text-red-800">
                        {error}
                    </p>
                )}
            </form>

            <p className="mt-4 text-sm text-stone-600 text-center">
                Don't have an account?{" "}
                <Link href="/signup" className="font-medium text-orange-700 hover:text-orange-800 underline">
                    Sign up
                </Link>
            </p>
        </div>
    );
}