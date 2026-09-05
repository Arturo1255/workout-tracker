import { NextResponse } from "next/server";
import {db, ensureDbConnected} from "../../../src/prisma/db";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
    await ensureDbConnected();
    const body = await request.json();

    const username = body.username;
    const plainPassword = body.password;
    const name = body.name;
    const email = body.email;

    if (!username || !plainPassword || !name || !email){
        return NextResponse.json({error: "Missing requried values"}, {status:400})
    }

    const usernameUser = await db.orm.public.User.where({username: username}).first();
    const emailUser = await db.orm.public.User.where({email: email}).first();

    if (usernameUser || emailUser){
        return NextResponse.json({error: "User already exsists" }, {status:409})
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    try {
        const newUser = await db.orm.public.User.create({
            username: username,
            password: hashedPassword,
            name: name,
            email: email
        });
        return NextResponse.json({ success: true }, { status: 201 });
      } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
      }
    
}