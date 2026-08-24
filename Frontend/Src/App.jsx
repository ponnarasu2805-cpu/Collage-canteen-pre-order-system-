import { useEffect, useMemo, useState } from "react";
import { ShoppingCart, UserRound, Search, X } from "lucide-react";
import { gsap } from "gsap";
import api from "./api";
import ThreeHero from "./components/ThreeHero";
import FoodCard from "./components/FoodCard";
import Auth from "./pages/Auth";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";

const defaultUser=JSON.parse(localStorage.getItem("canteen_user")||"null");

export default function App(){
  const [user,setUser]=useState(defaultUser);
  const [menu,setMenu]=useState([]);
  const [cart,setCart]=useState(JSON.parse(localStorage.getItem("canteen_cart")||"[]"));
  const [search,setSearch]=useState("");
  const [category,setCategory]=useState("All");
  const [auth,setAuth]=useState(false);
  const [cartOpen,setCartOpen]=useState(false);
  const [page,setPage]=useState("home");
  const [showAll,setShowAll]=useState(false);
  const [message,setMessage]=useState("");

  const loadMenu=()=>api.get("/menu").then(r=>setMenu(r.data)).catch(()=>setMessage("Backend not connected. Start the server and MongoDB."));
  useEffect(()=>{loadMenu()},[]);
  useEffect(()=>{localStorage.setItem("canteen_cart",JSON.stringify(cart))},[cart]);

  useEffect(()=>{
    gsap.from(".hero-copy > *",{x:-35,opacity:0,duration:.8,stagger:.1,ease:"power3.out"});
  },[]);

  const categories=["All",...new Set(menu.map(x=>x.category))];
  const filtered=useMemo(()=>menu.filter(x=>(category==="All"||x.category===category)&&x.name.toLowerCase().includes(search.toLowerCase())),[menu,category,search]);
  const visible=showAll?filtered:filtered.slice(0,4);
  const count=cart.reduce((s,x)=>s+x.quantity,0);
  const total=cart.reduce((s,x)=>s+x.price*x.quantity,0);

  const add=item=>{
    setCart(c=>{const found=c.find(x=>x._id===item._id);return found?c.map(x=>x._id===item._id?{...x,quantity:x.quantity+1}:x):[...c,{...item,quantity:1}]});
    setMessage(`${item.name} added to cart`);
    setTimeout(()=>setMessage(""),2200);
  };
  const change=(id,d)=>setCart(c=>c.map(x=>x._id===id?{...x,quantity:x.quantity+d}:x).filter(x=>x.quantity>0));
  const login=data=>{localStorage.setItem("canteen_token",data.token);localStorage.setItem("canteen_user",JSON.stringify(data.user));setUser(data.user);setAuth(false)};
  const logout=()=>{localStorage.clear();setUser(null);setPage("home")};

  const placeOrder=async()=>{
    if(!user){setCartOpen(false);setAuth(true);return}
    if(!cart.length)return;
    try{
      const {data}=await api.post("/orders",{items:cart.map(x=>({menuItem:x._id,quantity:x.quantity})),pickupTime:"ASAP"});
      setCart([]);setCartOpen(false);setPage("orders");setMessage(`Order #${data._id.slice(-6).toUpperCase()} placed!`);
      setTimeout(()=>setMessage(""),3000);
    }catch(err){setMessage(err.response?.data?.message||"Could not place order")}
  };

  return <div>
    <header className="navbar">
      <button className="brand" onClick={()=>setPage("home")}><span className="chef">👨‍🍳</span>Campus<span>Eats</span></button>
      <nav>{["home","menu","orders"].map(p=><button className={page===p?"active":""} key={p} onClick={()=>setPage(p)}>{p==="home"?"Home":p==="menu"?"Menu":"My Orders"}</button>)}{user?.role==="admin"&&<button className={page==="admin"?"active":""} onClick={()=>setPage("admin")}>Admin</button>}</nav>
      <div className="nav-actions">
        <button className="icon-btn" onClick={()=>setAuth(true)} title={user?"Account":"Login"}><UserRound size={19}/></button>
        <button className="icon-btn cart-icon" onClick={()=>setCartOpen(true)}><ShoppingCart size={21}/><b>{count}</b></button>
      </div>
    </header>

    {page==="home"&&<main>
      <section className="hero">
        <div className="hero-copy">
          <div className="pill">✦ Smart Canteen</div>
          <h1>College<br/><span>Canteen</span></h1>
          <p>Pre-order. Skip the queue.<br/>Enjoy your meal.</p>
          <div className="hero-actions"><button className="primary" onClick={()=>{setPage("menu");setTimeout(()=>document.getElementById("menu")?.scrollIntoView({behavior:"smooth"}),50)}}>🛍 Order Now <b>›</b></button><button className="play" onClick={()=>setMessage("Choose food → Add to cart → Place order → Pick up!")}>▶</button><button className="link-btn" onClick={()=>setMessage("Choose food → Add to cart → Place order → Pick up!")}>How It Works</button></div>
        </div>
        <div className="scene"><ThreeHero/><span>3D • SMART • FAST</span></div>
      </section>
      <section className="stats"><article><i>🍔</i><div><strong>50+</strong><span>Menu Items</span><small>Delicious & hygienic</small></div></article><article><i>👥</i><div><strong>500+</strong><span>Students</span><small>Happy customers</small></div></article><article><i>⚡</i><div><strong>Fast Pickup</strong><span>Save time</span><small>Enjoy more</small></div></article></section>
      <MenuSection menu={visible} filtered={filtered} categories={categories} category={category} setCategory={setCategory} search={search} setSearch={setSearch} showAll={showAll} setShowAll={setShowAll} add={add} />
    </main>}

    {page==="menu"&&<main><MenuSection menu={visible} filtered={filtered} categories={categories} category={category} setCategory={setCategory} search={search} setSearch={setSearch} showAll={showAll} setShowAll={setShowAll} add={add} /></main>}
    {page==="orders"&&<Orders user={user} onLoginClick={()=>setAuth(true)}/>}
    {page==="admin"&&<Admin user={user}/>}

    <section className="benefits"><div><b>📱</b><strong>Pre-order Online</strong><span>Order from your phone anytime.</span></div><div><b>◷</b><strong>Save Time</strong><span>Skip the queue and save time.</span></div><div><b>🛡</b><strong>100% Safe</strong><span>Hygienic food and secure.</span></div><div><b>♡</b><strong>Made with ❤️</strong><span>Good food, good mood!</span></div></section>

    {user&&<button className="logout" onClick={logout}>Logout</button>}

    <div className={`cart-drawer ${cartOpen?"open":""}`}><div className="drawer-head"><h2>Your Cart</h2><button onClick={()=>setCartOpen(false)}><X/></button></div>
      <div className="drawer-items">{cart.length?cart.map(x=><div className="cart-row" key={x._id}><span>{x.emoji}</span><div><strong>{x.name}</strong><small>₹{x.price}</small></div><div className="qty"><button onClick={()=>change(x._id,-1)}>−</button><b>{x.quantity}</b><button onClick={()=>change(x._id,1)}>+</button></div></div>):<div className="empty">Your cart is empty 🍽️</div>}</div>
      <div className="drawer-foot"><div><span>Total</span><strong>₹{total}</strong></div><button className="primary full" onClick={placeOrder}>Place Order</button></div>
    </div>
    {cartOpen&&<div className="backdrop" onClick={()=>setCartOpen(false)}/>}
    {auth&&<Auth onLogin={login} onClose={()=>setAuth(false)}/>}
    {message&&<div className="toast">{message}</div>}
    <footer>© 2026 Campus Eats • Full-Stack College Canteen Pre-Order System</footer>
  </div>
}

function MenuSection({menu,filtered,categories,category,setCategory,search,setSearch,showAll,setShowAll,add}){
  return <section className="menu-section" id="menu"><div className="section-head"><div><span>TODAY'S FEATURED</span><h2>Popular Picks</h2></div><div className="search"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search food..."/></div></div>
    <div className="categories">{categories.map(c=><button className={category===c?"selected":""} key={c} onClick={()=>setCategory(c)}>{c}</button>)}</div>
    {filtered.length===0?<div className="empty">No menu items found.</div>:<div className="food-grid">{menu.map(item=><FoodCard key={item._id} item={item} onAdd={add}/>)}</div>}
    {filtered.length>4&&<button className="outline center-btn" onClick={()=>setShowAll(!showAll)}>{showAll?"Show Less":"View Full Menu"} <b>{showAll?"↑":"›"}</b></button>}
  </section>
}
