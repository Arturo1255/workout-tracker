"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function LoginForm(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        const result = await signIn("credentials",{
            username,
            password,
            redirect: false,
        });

        if(result?.error){
            setError("Invalid login");
        }else{
            router.push("/")
        }
    }

    return(
        <form onSubmit={handleSubmit}>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"/>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password"/>
            <button type="submit">Log In</button>
            {error && <p>{error}</p>}
        </form>
    );


}