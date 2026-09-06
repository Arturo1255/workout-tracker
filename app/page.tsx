"use client";
import {signOut, useSession} from "next-auth/react"
import Link from "next/link";

export default function HomeScreen(){
  const {data: session, status} = useSession();

  if(status === "loading") return <p>Loading...</p>;

  if(!session) return (
    <div>
      <Link href="/login">Log In</Link>
      <Link href="/signup">Sign Up</Link>
    </div>
  
  );

  return (
  <div>
    <p>Welcome, {session.user?.name}</p>
    <button onClick={() => signOut()}>Log Out</button>
  </div>
  );



}