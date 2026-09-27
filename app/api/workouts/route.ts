import { db, ensureDbConnected } from "@/src/prisma/db";
import { NextResponse } from "next/server";
import {getServerSession} from "next-auth";
import { Temporal } from '@js-temporal/polyfill';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isPR } from "@/lib/prDetection";


type WorkoutSet = {
    id: number
    exerciseId: number;
    reps: number;
    weight: number;
    setNumber: number;
  };

type Workout = {
    id: number;
    userId: number;
    date: string;
    notes: string | null;
    sets: Array<WorkoutSet>
};

export async function GET() {
    const session = await getServerSession(authOptions);

    if(!session || !session.user){
        return NextResponse.json({error:"Unauthroized"}, {status:401});
    }
    
    await ensureDbConnected();
    const workouts = await db.orm.public.Workout.where({userId: parseInt(session.user.id)}).include("sets").all();
    return NextResponse.json(workouts);
    
}


export async function POST(request:Request) {
    const session = await getServerSession(authOptions);
    
    if(!session || !session.user){
        return NextResponse.json({error:"Unauthroized"}, {status:401});
    }
    await ensureDbConnected();
    const body = await request.json();

    type IncommingSet = {
        exerciseId: number;
        reps: number;
        weight: number;
        setNumber: number;
      };

    const date = body.date;
    const notes = body.notes;
    const sets = body.sets;

    if (!date || !sets){
        return NextResponse.json({error:"Missing required values"}, {status:400});
    }
    
    const dateInstant = Temporal.Instant.from(new Date(body.date).toISOString());
    const parsedSets: IncommingSet[] = [];

    for (const set of sets){
        const exerciseId = set.exerciseId;
        const reps = set.reps;
        const weight = set.weight;
        const setNumber = set.setNumber;

        if(!exerciseId || !reps || !weight || !setNumber){
            return NextResponse.json({error:"Mising requried workout set values"}, {status:400});
        }

        parsedSets.push({
            exerciseId: exerciseId,
            reps: reps,
            weight: weight,
            setNumber: setNumber,
        });
    }

    const prFlags:boolean[] = [];
    const exsistingWorkouts = await db.orm.public.Workout.where({userId: parseInt(session.user.id)}).include("sets").all() as unknown as Workout[];

    parsedSets.forEach((set) =>{
        prFlags.push(isPR(exsistingWorkouts, set.exerciseId, set.weight))
    })

    try{
        const workout = await db.orm.public.Workout.create(
            {
                userId: parseInt(session.user.id),
                date: dateInstant,
                notes: notes,
                sets: (sets) => sets.create(parsedSets),
            }
        );

        return NextResponse.json({...workout, "prFlags": prFlags}, {status:201});
    }catch (error){
        console.error(error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });

    }
    
}