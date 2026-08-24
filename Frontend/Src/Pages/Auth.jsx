import { useState } from "react";
import { UserRound, LockKeyhole, Mail } from "lucide-react";
import api from "../api";

export default function Auth({onLogin, onClose}) {
  const [mode,setMode]=useState("login");
  const [form,setForm]=useState({name:"",email:"",password:""});
  const [error,setError]=useState("");
  const submit=async e=>{
    e.preventDefault(); setError("");
    try{
      const {data}=await api.post(`/auth/${mode}`,form);
      onLogin(data);
    }catch(err){setError(err.response?.data?.message||"Something went wrong");}
  };
  return <div className="modal-backdrop">
    <div className="modal">
      <button className="modal-close" onClick={onClose}>×</button>
      <div className="pill">Campus Eats</div>
      <h2>{mode==="login"?"Welcome back":"Create account"}</h2>
      <p className="muted">{mode==="login"?"Login to place and track orders.":"Join your college canteen."}</p>
      <form onSubmit={submit}>
        {mode==="register" && <label><UserRound size={17}/><input placeholder="Full name" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>}
        <label><Mail size={17}/><input type="email" placeholder="Email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
        <label><LockKeyhole size={17}/><input type="password" minLength="6" placeholder="Password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>
        {error && <div className="error">{error}</div>}
        <button className="primary full">{mode==="login"?"Login":"Register"}</button>
      </form>
      <button className="switch" onClick={()=>{setMode(mode==="login"?"register":"login");setError("")}}>
        {mode==="login"?"New here? Create an account":"Already have an account? Login"}
      </button>
    </div>
  </div>
}
