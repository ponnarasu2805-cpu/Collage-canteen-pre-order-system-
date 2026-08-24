import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Environment } from "@react-three/drei";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

function Food3D({ color = "#ff9f43" }) {
  return (
    <div className="food3d">
      <Canvas camera={{ position: [0, 1.8, 5], fov: 45 }}>
        <ambientLight intensity={1.8} />
        <directionalLight position={[3, 4, 5]} intensity={2} />
        <Float speed={2} rotationIntensity={1.2} floatIntensity={1}>
          <mesh rotation={[0.15, 0.4, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 0.35, 64]} />
            <meshStandardMaterial color={color} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.28, 0]}>
            <cylinderGeometry args={[1.05, 1.05, 0.12, 64]} />
            <meshStandardMaterial color="#fff1c1" />
          </mesh>
          <mesh position={[0.2, 0.42, 0.2]} rotation={[0.3, 0.4, 0]}>
            <sphereGeometry args={[0.15, 24, 24]} />
            <meshStandardMaterial color="#e74c3c" />
          </mesh>
          <mesh position={[-0.3, 0.45, -0.2]}>
            <sphereGeometry args={[0.13, 24, 24]} />
            <meshStandardMaterial color="#2ecc71" />
          </mesh>
        </Float>
        <Environment preset="city" />
        <OrbitControls enablePan={false} minDistance={3.2} maxDistance={7} />
      </Canvas>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [view, setView] = useState("home");
  const [selected, setSelected] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [auth, setAuth] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  useEffect(() => { loadMenu(); }, []);
  useEffect(() => { if (user) loadOrders(); }, [user]);

  async function loadMenu() {
    try { setMenu(await api("/menu")); } catch(e) { setMessage(e.message); }
  }
  async function loadOrders() {
    try {
      if (user.role === "admin") {
        setOrders(await api("/orders"));
        setAnalytics(await api("/analytics"));
      } else setOrders(await api("/orders/my"));
    } catch(e) { setMessage(e.message); }
  }

  async function submitAuth(e) {
    e.preventDefault();
    try {
      const path = authMode === "login" ? "/auth/login" : "/auth/register";
      const data = await api(path, { method: "POST", body: JSON.stringify(auth) });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user); setMessage("Welcome!");
    } catch(e) { setMessage(e.message); }
  }

  function logout() {
    localStorage.clear(); setUser(null); setView("home"); setCart([]);
  }

  function addToCart(item) {
    setCart(c => {
      const found = c.find(x => x.menuId === item._id);
      if (found) return c.map(x => x.menuId === item._id ? { ...x, quantity: x.quantity + 1 } : x);
      return [...c, { menuId: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
    setMessage(`${item.name} added to cart`);
  }

  const total = useMemo(() => cart.reduce((s, x) => s + x.price * x.quantity, 0), [cart]);

  async function placeOrder() {
    if (!user) return setView("auth");
    if (!cart.length) return setMessage("Your cart is empty");
    try {
      const pickupTime = new Date(Date.now() + 30 * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const order = await api("/orders", { method: "POST", body: JSON.stringify({ items: cart, pickupTime }) });
      setCart([]); setView("orders"); setMessage(`Order placed! Token: ${order.token}`);
      loadOrders();
    } catch(e) { setMessage(e.message); }
  }

  async function updateStatus(id, status) {
    try { await api(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); loadOrders(); }
    catch(e) { setMessage(e.message); }
  }

  return (
    <div className="app">
      <header>
        <div className="brand" onClick={() => setView("home")}>🍽️ Smart Canteen</div>
        <nav>
          <button onClick={() => setView("menu")}>Menu</button>
          <button onClick={() => setView("orders")}>Orders</button>
          {user?.role === "admin" && <button onClick={() => setView("admin")}>Admin</button>}
          <button className="cartBtn" onClick={() => setView("cart")}>🛒 {cart.reduce((s,x)=>s+x.quantity,0)}</button>
          {user ? <button onClick={logout}>Logout</button> : <button onClick={() => setView("auth")}>Login</button>}
        </nav>
      </header>

      {message && <div className="toast" onClick={() => setMessage("")}>{message}</div>}

      {view === "home" && (
        <main>
          <section className="hero">
            <div>
              <p className="eyebrow">SMART • FAST • QUEUE-FREE</p>
              <h1>Pre-order your food.<br/><span>Skip the queue.</span></h1>
              <p className="lead">A modern campus canteen platform with an interactive 3D food experience.</p>
              <button className="primary" onClick={() => setView("menu")}>Explore Menu →</button>
            </div>
            <Food3D color="#ff8a65" />
          </section>

          <section className="features">
            <article><b>⚡ Faster Pickup</b><p>Order before the break and collect using your digital token.</p></article>
            <article><b>🎨 3D Food View</b><p>Rotate and explore an interactive Three.js food model.</p></article>
            <article><b>📊 Smart Dashboard</b><p>Track orders, status, popular food and canteen revenue.</p></article>
          </section>
        </main>
      )}

      {view === "auth" && (
        <main className="center">
          <form className="card auth" onSubmit={submitAuth}>
            <h2>{authMode === "login" ? "Student Login" : "Create Account"}</h2>
            {authMode === "register" && <input placeholder="Name" value={auth.name} onChange={e=>setAuth({...auth,name:e.target.value})} />}
            <input type="email" placeholder="Email" value={auth.email} onChange={e=>setAuth({...auth,email:e.target.value})} required />
            <input type="password" placeholder="Password (6+ characters)" value={auth.password} onChange={e=>setAuth({...auth,password:e.target.value})} required />
            <button className="primary">{authMode === "login" ? "Login" : "Register"}</button>
            <button type="button" className="link" onClick={()=>setAuthMode(authMode==="login"?"register":"login")}>
              {authMode === "login" ? "Create new account" : "Already have an account? Login"}
            </button>
          </form>
        </main>
      )}

      {view === "menu" && (
        <main className="page">
          <div className="pageTitle"><div><p className="eyebrow">TODAY'S MENU</p><h2>Choose your favourite</h2></div></div>
          <div className="menuGrid">
            {menu.map(item => (
              <article className="foodCard" key={item._id}>
                <div className="emoji">{item.emoji}</div>
                <div className="foodInfo">
                  <span>{item.category}</span><h3>{item.name}</h3><p>{item.description}</p>
                  <div className="foodBottom"><b>₹{item.price}</b><button onClick={()=>{setSelected(item);}}>3D View</button><button className="primary small" onClick={()=>addToCart(item)}>Add</button></div>
                </div>
              </article>
            ))}
          </div>
        </main>
      )}

      {selected && (
        <div className="modal" onClick={()=>setSelected(null)}>
          <div className="modalBox" onClick={e=>e.stopPropagation()}>
            <button className="close" onClick={()=>setSelected(null)}>×</button>
            <h2>{selected.emoji} {selected.name}</h2>
            <Food3D color={selected.color} />
            <p>{selected.description}</p>
            <button className="primary" onClick={()=>{addToCart(selected);setSelected(null)}}>Add ₹{selected.price}</button>
          </div>
        </div>
      )}

      {view === "cart" && (
        <main className="page narrow">
          <h2>Your Cart</h2>
          {!cart.length ? <div className="card empty">Your cart is empty. <button className="link" onClick={()=>setView("menu")}>Browse menu</button></div> :
          <div className="card">
            {cart.map(x=><div className="cartRow" key={x.menuId}><span>{x.name}</span><div><button onClick={()=>setCart(c=>c.map(i=>i.menuId===x.menuId?{...i,quantity:Math.max(1,i.quantity-1)}:i))}>−</button><b>{x.quantity}</b><button onClick={()=>setCart(c=>c.map(i=>i.menuId===x.menuId?{...i,quantity:i.quantity+1}:i))}>+</button></div><b>₹{x.price*x.quantity}</b></div>)}
            <hr/><div className="total"><b>Total</b><b>₹{total}</b></div>
            <button className="primary wide" onClick={placeOrder}>Place Pre-Order</button>
          </div>}
        </main>
      )}

      {view === "orders" && (
        <main className="page narrow">
          <h2>{user?.role === "admin" ? "All Orders" : "My Orders"}</h2>
          {!user ? <div className="card empty">Login to view your orders.</div> :
          orders.map(o => <div className="card order" key={o._id}>
            <div><b>Token {o.token}</b><span className={`status ${o.status.toLowerCase()}`}>{o.status}</span></div>
            <p>{o.items.map(i=>`${i.name} × ${i.quantity}`).join(", ")}</p>
            <p>Pickup: {o.pickupTime} · Total: ₹{o.total}</p>
            {user.role === "admin" && <select value={o.status} onChange={e=>updateStatus(o._id,e.target.value)}>
              {["Placed","Confirmed","Preparing","Ready","Collected","Cancelled"].map(s=><option key={s}>{s}</option>)}
            </select>}
          </div>)}
        </main>
      )}

      {view === "admin" && user?.role === "admin" && (
        <main className="page">
          <p className="eyebrow">ADMIN CONTROL CENTER</p><h2>Canteen Analytics</h2>
          {analytics && <div className="stats"><div><b>{analytics.totalOrders}</b><span>Total Orders</span></div><div><b>₹{analytics.revenue}</b><span>Revenue</span></div><div><b>{analytics.pending}</b><span>Pending</span></div></div>}
          <div className="card">
            <h3>Popular Food</h3>
            {analytics?.popular?.map(([name,count])=><div className="bar" key={name}><span>{name}</span><b>{count}</b></div>)}
          </div>
          <button className="primary" onClick={()=>setView("orders")}>Manage Orders</button>
        </main>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
