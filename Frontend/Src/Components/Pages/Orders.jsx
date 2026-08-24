import { useEffect, useState } from "react";
import api from "../api";

export default function Orders({user,onLoginClick}){
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    if(!user){setLoading(false);return}
    api.get("/orders").then(r=>setOrders(r.data)).catch(console.error).finally(()=>setLoading(false));
  },[user]);
  if(!user) return <section className="page-section center"><h2>My Orders</h2><p className="muted">Login to see your orders.</p><button className="primary" onClick={onLoginClick}>Login</button></section>;
  return <section className="page-section"><div className="section-head"><div><span>ACCOUNT</span><h2>My Orders</h2></div></div>
    {loading?<p>Loading...</p>:orders.length===0?<div className="empty">No orders yet. Your delicious first order is waiting! 🍽️</div>:
    <div className="orders-list">{orders.map(o=><article className="order-card" key={o._id}>
      <div><strong>Order #{o._id.slice(-6).toUpperCase()}</strong><span>{new Date(o.createdAt).toLocaleString()}</span></div>
      <div className="order-items">{o.items.map((i,idx)=><span key={idx}>{i.name} × {i.quantity}</span>)}</div>
      <div className="order-bottom"><b>₹{o.total}</b><span className={`status ${o.status.toLowerCase()}`}>{o.status}</span></div>
    </article>)}</div>}
  </section>
}
