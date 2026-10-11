"use client";
import { useState, useEffect } from "react";

type WorkoutSet = {
    id: number;
    exerciseId: number;
    reps: number;
    weight: number;
    setNumber: number;
};

type Workout = {
    id: number;
    userId: number;
    date: string;
    notes: string;
    sets: Array<WorkoutSet>;
};

type Exercise = {
    id: number;
    name: string;
    category: string;
    muscleGroup: string;
};

export default function WorkoutList() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(false);
    const [exercisesMap, setExerciseMap] = useState<Record<number, string>>({});

    useEffect(() => {
        async function fetchWorkouts() {
            const [response, exerciseResponse] = await Promise.all([
                fetch("/api/workouts"),
                fetch("/api/exercises"),
            ]);

            if (response.ok && exerciseResponse.ok) {
                const mapData: Exercise[] = await exerciseResponse.json();
                const newMap: Record<number, string> = {};

                mapData.forEach((exercise) => {
                    newMap[exercise.id] = exercise.name;
                });
                setExerciseMap(newMap);

                const data = await response.json();
                setWorkouts(data);
                setLoading(false);
            } else {
                setErrorMessage(true);
            }
        }
        fetchWorkouts();
    }, []);

    if (errorMessage)
        return (
            <p className="max-w-3xl mx-auto mt-12 px-4 text-red-600">
                An error occurred while loading workouts.
            </p>
        );

    if (loading) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-orange-500"></div>

                <p className="text-lg font-semibold text-stone-700">Loading workouts...</p>

                <p className="text-sm text-stone-500">Please wait while we fetch your data.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto mt-12 mb-12 px-4">
            <h1 className="text-2xl font-bold text-stone-900 mb-6">Workout history</h1>

            {workouts.length === 0 && (
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-8 text-center">
                    <p className="font-medium text-stone-800">No workouts yet</p>
                    <p className="text-sm text-stone-600 mt-1">Log your first workout to see it here.</p>
                </div>
            )}

            {workouts.map((workout) => (
                <div
                    className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 mb-6"
                    key={workout.id}
                >
                    <h2 className="text-lg font-semibold text-stone-900">
                        {new Date(workout.date).toLocaleDateString()}
                    </h2>

                    {workout.notes && (
                        <p className="text-sm text-stone-600 mt-1">{workout.notes}</p>
                    )}

                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-stone-200">
                                    <th className="px-4 py-3 text-sm font-semibold text-stone-600">Set</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-stone-600">Exercise</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-stone-600">Weight</th>
                                    <th className="px-4 py-3 text-sm font-semibold text-stone-600">Reps</th>
                                </tr>
                            </thead>
                            <tbody>
                                {workout.sets.map((set) => (
                                    <tr className="border-b border-stone-100 last:border-0" key={set.id}>
                                        <td className="px-4 py-3 text-stone-500 tabular-nums">{set.setNumber}</td>
                                        <td className="px-4 py-3 font-medium text-stone-800">
                                            {exercisesMap[set.exerciseId]}
                                        </td>
                                        <td className="px-4 py-3 text-stone-700 tabular-nums">{set.weight}</td>
                                        <td className="px-4 py-3 text-stone-700 tabular-nums">{set.reps}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
}