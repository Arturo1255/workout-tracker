"use client";
import {useState, useEffect} from "react";

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

export default function WorkoutList(){
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(false);
    const [exercisesMap, setExerciseMap] = useState<Record<number,string>>({});

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

    if(errorMessage) return <p>An error occured while loading workouts.</p>;
    if(loading) return <p>Loading Workouts...</p>;

    return(
        <div>
            {workouts.map((workout) => (
                <div key={workout.id}>
                    <h1>Workout - {workout.date}</h1>
                    <p>Recorded Date: {workout.date}</p>
                    <p>Notes: {workout.notes}</p>
                    <h2>Workout Sets:</h2>
                    <table>
                        <thead>
                            <tr>
                            <th>Set Number</th>
                            <th>Exercise</th>
                            <th>Weight</th>
                            <th>Reps</th>
                            </tr>
                        </thead>
                        <tbody>
                        {workout.sets.map((set) => (
                            <tr key={set.id}>
                                <td>{set.setNumber}</td>
                                <td>{exercisesMap[set.exerciseId]}</td>
                                <td>{set.weight}</td>
                                <td>{set.reps}</td>
                            </tr>
                    ))}
                        </tbody>
                    </table>                    
                </div>
            ))}
        </div>

    )
}