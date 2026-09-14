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


 export function getExerciseHistory(workouts: Workout[], exerciseId: number) {
    const history:{date: string; weight: number}[] = [];

    for (const workout of workouts){
        let total = 0;
        const matchSets = workout.sets.filter((e) => e.exerciseId === exerciseId);

        if (matchSets.length > 0){
            matchSets.forEach((set) => total += set.weight);
            history.push({date: workout.date, weight: total/matchSets.length});
        }
    }
    history.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return history
  }


  