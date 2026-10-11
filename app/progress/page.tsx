"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getExerciseHistory } from "@/lib/chartData";
import { inputBase } from "@/lib/styles";
import { useState, useEffect } from "react";

type progressReading = {
    date: string;
    weight: number;
};

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

export default function ProgressChart() {
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(false);
    const [exercisesMap, setExerciseMap] = useState<Record<number, string>>({});
    const [data, setData] = useState<progressReading[]>([]);

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

    function loadChartData(workouts: Workout[], exerciseId: number) {
        const history = getExerciseHistory(workouts, exerciseId);
        setData(history);
    }

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
        <div className="max-w-4xl mx-auto mt-12 mb-12 px-4">
            <h1 className="text-2xl font-bold text-stone-900 mb-6">Average weight progress</h1>

            <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-stone-700" htmlFor="dropdown">
                    Exercise
                </label>
                <select
                    id="dropdown"
                    defaultValue={0}
                    onChange={(e) => loadChartData(workouts, parseInt(e.target.value))}
                    className={`${inputBase} w-full max-w-xs`}
                >
                    <option value={0}>Select exercise</option>
                    {Object.entries(exercisesMap).map(([id, name]) => (
                        <option key={id} value={id}>
                            {name}
                        </option>
                    ))}
                </select>
            </div>

            {data.length > 0 ? (
                <div className="mt-8 bg-white rounded-lg shadow-sm border border-stone-200 p-4">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                tick={{ fill: "#78716c", fontSize: 12 }}
                                stroke="#d6d3d1"
                            />
                            <YAxis tick={{ fill: "#78716c", fontSize: 12 }} stroke="#d6d3d1" />
                            <Tooltip
                                labelFormatter={(value) => new Date(String(value)).toLocaleDateString()}
                                contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#ea580c"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "#ea580c" }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="mt-8 rounded-lg border border-stone-200 bg-stone-50 p-8 text-center">
                    <p className="font-medium text-stone-800">No data to show yet</p>
                    <p className="text-sm text-stone-600 mt-1">
                        Select an exercise to see your progress.
                    </p>
                </div>
            )}
        </div>
    );
}