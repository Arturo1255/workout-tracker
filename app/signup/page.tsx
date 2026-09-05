"use client";
import {useState} from "react"

export default function SignUpForm(){
    const [user, setUser] = useState({
        "username": "",
        "password": "",
        "name": "",
        "email": ""
      });

      const [statusMessage, setStatusMessage] = useState("");
    
    async function handleSubmit(e: React.FormEvent){
        e.preventDefault();
        console.log("Submitting: ", user)
        const response = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
          });
        const data = await response.json();
        console.log(data);
        if (response.ok) {
            setStatusMessage("Account created!");
            setUser({ username: "", password: "", name: "", email: "" })
          } else {
            setStatusMessage(data.error || "Something went wrong");
          }
    }

    return(
        <form onSubmit={handleSubmit}>
            <input
            placeholder="Name"
             value={user.name}
              onChange={(e) => 
              setUser({
                ...user,
                name: e.target.value})}>
            </input>

            <input
            placeholder="Email"
             value={user.email}
              onChange={(e) => 
              setUser({
                ...user,
                email: e.target.value})}>
            </input>

            <input
            placeholder="Username"
             value={user.username}
              onChange={(e) => 
              setUser({
                ...user,
                username: e.target.value})}>
            </input>

            <input
            type="password"
            placeholder="Password"
            value={user.password}
            onChange={(e) => 
              setUser({
                ...user,
                password: e.target.value})}>
            </input>

            <button type="submit">Send</button>

            {statusMessage !== "" && <p>{statusMessage}</p>}
        </form>
    )
    
}
