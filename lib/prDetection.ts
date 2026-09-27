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
    notes: string | null,
    sets: Array<WorkoutSet>
};


export function isPR(workouts: Workout[], exerciseId:number, newWeight: number): boolean{
    const workoutMaxWeights :number[] = [];

    workouts.forEach((workout) =>{
        const filterSets = workout.sets.filter((e) => e.exerciseId === exerciseId);
        if (filterSets.length > 0){
            const maxSetsWeight = Math.max(...filterSets.map((set) => set.weight));
            workoutMaxWeights.push(maxSetsWeight)
        }
       
    })

    if (workoutMaxWeights.length === 0) return true;

    const maxWeight = Math.max(...workoutMaxWeights);
    return newWeight > maxWeight;
    
}