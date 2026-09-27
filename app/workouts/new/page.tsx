"use client";
import {useState} from "react"

type WorkoutSet = {
    exerciseId: number;
    reps: number;
    weight: number;
    setNumber: number;
  };

export default function NewWorkout(){
    const [date, setDate] = useState("");
    const [notes, setNotes] = useState("");
    const [sets, setSets] = useState<WorkoutSet[]>([]);
    const [statusMessage, setStatusMessage] = useState("");

    function addSet(){
        setSets([...sets, {exerciseId: 0, reps:0, weight:0, setNumber:0}]);
    }

    function removeSet(index: number){
        setSets(sets.filter((_,i) => i !== index));
    }

    function updateSet(index: number, field: keyof WorkoutSet, value: number){
        const updated = [...sets];
        updated[index] = {...updated[index], [field]: value};
        setSets(updated);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const response = await fetch("/api/workouts",{
            method:"POST",
            "headers":{"Content-Type": "application/json"},
            "body": JSON.stringify({date, notes, sets}),
        });

        const data = await response.json();
        console.log(data);
        if (response.ok) {
            const newPr = data.prFlags.some((flag: boolean) => flag === true);
            
            if (newPr){
                setStatusMessage("Workout saved! New PR Set!")
            }else{
                setStatusMessage("Workout saved!");
            }

            setDate("");
            setNotes("");
            setSets([]);
          } else {
            setStatusMessage(data.error || "Something went wrong");
          }

        
    }

    return(
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor={'date'}>Date</label>
                <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
                
                <label htmlFor={'notes'}>Notes</label>
                <input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)}/>

                {sets.map((set, index) =>(
                    <div key={index}>
                        <label htmlFor={`exerciseId-${index}`}>Exercise</label>
                        <input id={`exerciseId-${index}`} value={set.exerciseId} onChange={(e) => updateSet(index, "exerciseId", parseInt(e.target.value) || 0)}/>

                        <label htmlFor={`reps-${index}`}>Reps</label>
                        <input id={`reps-${index}`} value={set.reps} onChange={(e) => updateSet(index, "reps", parseInt(e.target.value) || 0)}/>

                        <label htmlFor={`weight-${index}`}>Weight</label>
                        <input id={`weight-${index}`} value={set.weight} onChange={(e) => updateSet(index, "weight", parseInt(e.target.value) || 0)}/>

                        <label htmlFor={`setNumber-${index}`}>Set Number</label>
                        <input id={`setNumber-${index}`} value={set.setNumber} onChange={(e) => updateSet(index, "setNumber", parseInt(e.target.value) || 0)}/>

                        <button type="button" onClick={() => removeSet(index)}>Remove</button>
                    </div>
                ))}
                <button type="button" onClick={addSet}>Add Item</button>
                <button type="submit">Submit Button</button>
            </form>
            {statusMessage !== "" && <p>{statusMessage}</p>}
        </div>
    )
}