import { db, ensureDbConnected } from "@/src/prisma/db";
import { NextResponse } from "next/server";

export async function GET() {
    await ensureDbConnected();

    const exercises = await db.orm.public.Exercise.all();
    return NextResponse.json(exercises);

}


export async function POST(request: Request) {
    await ensureDbConnected();
    const body = await request.json();
    
    const name = body.name;
    const category = body.category;
    const muscleGroup = body.muscleGroup;

    if (!name || !category || !muscleGroup){
        return NextResponse.json({error:"Missing requried values"}, {status:400});
    }

    const existingExercise = await db.orm.public.Exercise.where({name: name}).first();

    if (existingExercise){
        return NextResponse.json({error:"Exercise already exsists"}, {status:409});
    }

    try {
        const newExercise = await db.orm.public.Exercise.create({
            name: name,
            category: category,
            muscleGroup: muscleGroup
        });
        return NextResponse.json( newExercise, { status: 201 });
      } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
      }
}