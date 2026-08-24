import { useEffect, useState } from "react";
import api from "../api";

const statuses=["Pending","Preparing","Ready","Completed","Cancelled"];
export default function Admin({user}){
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);
  const load=()=>api.get("/orders").then(r=>setOrders(r.data)).finally(()=>setLoading(false));
  useEffect(()=>{if(user?.role==="admin")load();else setLoading(false)},[user]);
  const update=async(id,status)=>{await api.patch(`/orders/${id}/status`,{status});load()};
  if(user?.role!=="admin") return <section className="page-section center"><h2>Admin Dashboard</h2><p className="muted">Admin access required.</p></section>;
  return <section className="page-section"><div className="section-head"><div><span>MANAGEMENT</span><h2>Order Dashboard</h2></div></div>
    {loading?<p>Loading...</p>:<div className="admin-grid">{orders.map(o=><article className="order-card" key={o._id}>
      <div><strong>#{o._id.slice(-6).toUpperCase()} • {o.user?.name}</strong><span>{o.user?.email}</span></div>
      <div className="order-items">{o.items.map((i,idx)=><span key={idx}>{i.name} × {i.quantity}</span>)}</div>
      <div className="order-bottom"><b>₹{o.total}</b><select value={o.status} onChange={e=>update(o._id,e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select></div>
    </article>)}</div>}
  </section>
}
