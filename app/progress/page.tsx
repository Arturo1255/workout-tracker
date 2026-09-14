"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getExerciseHistory } from "@/lib/chartData";
import {useState, useEffect} from "react";

type progressReading = {
    date: string; 
    weight: number
};

type WorkoutSet = {
    id: number
    exerciseId: number;
    reps: number;
    weight: number;
    setNumber: number;
};

type Workout = {
    id: number,
    userId: number,
    date: string,
    notes: string,
    sets: Array<WorkoutSet>
};

type Exercise = {
    id: number
    name: string,
    category: string,
    muscleGroup: string
}

export default function ProgressChart(){
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(false);
    const [exercisesMap, setExerciseMap] = useState<Record<number,string>>({});
    const [data, setData] = useState<progressReading[]>([]);

    useEffect(() =>{
        async function fetchWorkouts() {
            const [response, exerciseResponse] = await Promise.all([
                fetch("/api/workouts"),
                fetch("/api/exercises"),
              ]);
            
            if(response.ok && exerciseResponse.ok){

                const mapData: Exercise[] = await exerciseResponse.json();
                const newMap: Record<number, string> = {};

                mapData.forEach((exercise) => {
                    newMap[exercise.id] = exercise.name;
                });
                setExerciseMap(newMap);

                const data = await response.json();
                setWorkouts(data);
                setLoading(false);
            }else{
                setErrorMessage(true);
            }
            
        }
        fetchWorkouts();
    }, []);

    function loadChartData(workouts: Workout[], exerciseId: number){
        const history = getExerciseHistory(workouts, exerciseId);
        setData(history);
    }

    if(errorMessage) return <p>An error occured while loading workouts.</p>;
    if(loading) return <p>Loading Workouts...</p>;

    return (
        <div>
            <h1>Average Weight Progress Chart</h1>
            <div>
                <label htmlFor="dropdown">Exercise</label>
                <select id="dropdown" onChange={(e) => loadChartData(workouts, parseInt(e.target.value))}>
                    {Object.entries(exercisesMap).map(([id, name]) => (
                       <option key={id} value={id}>{name}</option>
                    ))}
                </select>
            </div>
            {data.length > 0 && (
                <div>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data ={data}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="date"/>
                        <YAxis/>
                        <Tooltip/>
                        <Line type="monotone" dataKey="weight" stroke="#8884d8"/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
            )}
        </div>
    )
}