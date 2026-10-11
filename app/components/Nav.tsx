"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

const linkClass = "text-sm font-medium text-white hover:underline underline-offset-4";

export default function Nav() {
    const { data: session } = useSession();

    return (
        <nav className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-4 bg-orange-500">
            <Link href="/" className="text-lg font-semibold text-white">
                Workout Tracker
            </Link>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <Link href="/" className={linkClass}>
                    Home
                </Link>
                <Link href="/workouts/new" className={linkClass}>
                    Record workout
                </Link>
                <Link href="/workouts" className={linkClass}>
                    View workouts
                </Link>
                <Link href="/progress" className={linkClass}>
                    View progress
                </Link>

                {session ? (
                    <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="text-sm font-medium text-white border border-white/60 rounded-md px-3 py-1 hover:bg-orange-700 transition"
                    >
                        Log Out
                    </button>
                ) : (
                    <>
                        <Link href="/login" className={linkClass}>
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className="text-sm font-medium text-orange-700 bg-white rounded-md px-3 py-1 hover:bg-orange-50 transition"
                        >
                            Sign up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}