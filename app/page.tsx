"use client";
import { useSession } from "next-auth/react";
import { tintStandard, tintStrong, tintCard } from "@/lib/styles";
import Link from "next/link";

export default function HomeScreen() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-orange-500"></div>

        <p className="text-lg font-semibold text-stone-700">Loading page...</p>

        <p className="text-sm text-stone-500">Please wait while the page loads.</p>
      </div>
    );
  }

  if (!session)
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold text-stone-900">Workout Tracker</h1>

        <h2 className="text-lg text-stone-600 mt-2">
          Track your progress. Build your strength.
        </h2>

        <div className="flex flex-col items-center gap-4 mt-8">
          <Link className={`${tintStrong} w-64 px-6 py-3 text-center rounded-md`} href="/signup">
            Sign up
          </Link>
          <Link className={`${tintStandard} w-64 px-6 py-3 text-center rounded-md`} href="/login">
            Log in
          </Link>
        </div>
      </div>
    );

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
      <p className="text-2xl font-semibold text-stone-900">Welcome, {session.user?.name}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 w-full max-w-3xl px-4">
        <Link className={`${tintCard} text-center rounded-xl shadow-sm p-6`} href="/workouts/new">
          Record Workout
        </Link>
        <Link className={`${tintCard} text-center rounded-xl shadow-sm p-6`} href="/workouts">
          View Workouts
        </Link>
        <Link className={`${tintCard} text-center rounded-xl shadow-sm p-6`} href="/progress">
          View Progress
        </Link>
      </div>
    </div>
  );
}