"use client";
import { useEffect, useState } from "react";
import { tintStandard, tintStrong, tintDanger, inputBase } from "@/lib/styles";

type WorkoutSet = {
    exerciseId: number;
    reps: number;
    weight: number;
    setNumber: number;
};

type Exercise = {
    id: number;
    name: string;
    category: string;
    muscleGroup: string;
};

export default function NewWorkout() {
    const [date, setDate] = useState("");
    const [notes, setNotes] = useState("");
    const [sets, setSets] = useState<WorkoutSet[]>([]);
    const [statusMessage, setStatusMessage] = useState("");
    const [exercisesMap, setExerciseMap] = useState<Exercise[]>([]);
    const [statusType, setStatusType] = useState("");

    function addSet() {
        setSets([...sets, { exerciseId: 0, reps: 0, weight: 0, setNumber: sets.length + 1 }]);
    }

    function removeSet(index: number) {
        const filtered = sets.filter((_, i) => i !== index);
        const renumbered = filtered.map((set, i) => ({ ...set, setNumber: i + 1 }));
        setSets(renumbered);
    }

    function updateSet(index: number, field: keyof WorkoutSet, value: number) {
        const updated = [...sets];
        updated[index] = { ...updated[index], [field]: value };
        setSets(updated);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const response = await fetch("/api/workouts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date, notes, sets }),
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
            const newPr = data.prFlags.some((flag: boolean) => flag === true);

            if (newPr) {
                setStatusMessage("Workout saved! New PR Set!");
                setStatusType("pr");
            } else {
                setStatusMessage("Workout saved!");
                setStatusType("success");
            }

            setDate("");
            setNotes("");
            setSets([]);
        } else {
            setStatusMessage(data.error || "Something went wrong");
            setStatusType("error");
        }
    }

    useEffect(() => {
        async function fetchExercise() {
            const response = await fetch("/api/exercises");

            if (response.ok) {
                const mapData: Exercise[] = await response.json();
                setExerciseMap(mapData);
            } else {
                setStatusMessage("Error occurred while loading exercise options");
                setStatusType("error");
            }
        }
        fetchExercise();
    }, []);

    return (
        <div className="max-w-md mx-auto mt-12 mb-12 px-4">
            <h1 className="text-2xl font-bold mb-6">Log Workout</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="date" className="text-sm font-medium text-stone-700">Date</label>
                        <input
                            id="date"
                            type="date"
                            value={date}
                            className={inputBase}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="notes" className="text-sm font-medium text-stone-700">Notes</label>
                        <textarea
                            id="notes"
                            rows={2}
                            placeholder="Optional"
                            value={notes}
                            className={inputBase}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                {sets.map((set, index) => (
                    <div
                        key={index}
                        className="rounded-lg border border-stone-200 bg-stone-50 p-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
                    >
                        <div className="col-span-2 sm:col-span-4 flex items-center justify-between">
                            <span className="text-xs font-medium text-orange-800 bg-orange-100 border border-orange-200 rounded-full px-2 py-0.5">
                                Set {set.setNumber}
                            </span>
                            <button
                                type="button"
                                className={`${tintDanger} rounded-md px-3 py-1 text-sm`}
                                onClick={() => removeSet(index)}
                            >
                                Remove
                            </button>
                        </div>

                        <div className="flex flex-col gap-1 col-span-2">
                            <label htmlFor={`exerciseId-${index}`} className="text-sm font-medium text-stone-700">Exercise</label>
                            <select
                                id={`exerciseId-${index}`}
                                value={set.exerciseId}
                                onChange={(e) => updateSet(index, "exerciseId", parseInt(e.target.value) || 0)}
                                className={inputBase}
                            >
                                <option key={0} value={0}>Select exercise</option>
                                {exercisesMap.map((exercise) => (
                                    <option key={exercise.id} value={exercise.id}>{exercise.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1 col-span-1">
                            <label htmlFor={`reps-${index}`} className="text-sm font-medium text-stone-700">Reps</label>
                            <input
                                id={`reps-${index}`}
                                value={set.reps}
                                className={inputBase}
                                onChange={(e) => updateSet(index, "reps", parseInt(e.target.value) || 0)}
                            />
                        </div>

                        <div className="flex flex-col gap-1 col-span-1">
                            <label htmlFor={`weight-${index}`} className="text-sm font-medium text-stone-700">Weight</label>
                            <input
                                id={`weight-${index}`}
                                value={set.weight}
                                className={inputBase}
                                onChange={(e) => updateSet(index, "weight", parseInt(e.target.value) || 0)}
                            />
                        </div>
                    </div>
                ))}

                <div className="flex gap-3">
                    <button type="button" className={`${tintStandard} flex-1 px-4 py-2 rounded-md`} onClick={addSet}>
                        Add set
                    </button>
                    <button type="submit" className={`${tintStrong} flex-1 px-4 py-2 rounded-md`}>
                        Save workout
                    </button>
                </div>
            </form>

            {statusMessage !== "" && (
                <p className={`mt-4 p-3 rounded-md font-medium ${statusType === "success" ? "bg-green-100 text-green-800" : statusType === "pr" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                    {statusMessage}
                </p>
            )}
        </div>
    );
}