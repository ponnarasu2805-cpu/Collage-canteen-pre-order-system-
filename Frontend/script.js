const foods = [
  {id:1,name:"Veg Biryani",desc:"Aromatic & Spicy",price:80,emoji:"🍛",tag:"🔥 Popular"},
  {id:2,name:"Veg Sandwich",desc:"Grilled & Delicious",price:50,emoji:"🥪",tag:"⭐ Best Seller"},
  {id:3,name:"Veg Hakka Noodles",desc:"Stir-fried Perfection",price:70,emoji:"🍜",tag:"🔥 Hot"},
  {id:4,name:"Cold Coffee",desc:"Chilled & Refreshing",price:60,emoji:"🥤",tag:"🟢 New"},
  {id:5,name:"Masala Dosa",desc:"Crispy & Fresh",price:55,emoji:"🥞",tag:"⭐ Popular"},
  {id:6,name:"Paneer Roll",desc:"Loaded & Tasty",price:65,emoji:"🌯",tag:"🔥 Hot"},
  {id:7,name:"French Fries",desc:"Crispy & Golden",price:45,emoji:"🍟",tag:"🟢 New"},
  {id:8,name:"Fresh Lime",desc:"Cool & Refreshing",price:30,emoji:"🍋",tag:"⭐ Fresh"}
];

let cart = JSON.parse(localStorage.getItem("campusCart") || "[]");

const grid = document.getElementById("foodGrid");
const cartCount = document.getElementById("cartCount");
const cartPanel = document.getElementById("cartPanel");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const toast = document.getElementById("toast");

function renderFoods(showAll=false){
  grid.innerHTML = (showAll ? foods : foods.slice(0,4)).map(f => `
    <article class="food-card">
      <div class="food-art">${f.emoji}</div>
      <div class="food-info">
        <span class="tag">${f.tag}</span>
        <h3>${f.name}</h3>
        <p>${f.desc}</p>
        <div class="food-bottom">
          <span class="price">₹${f.price}</span>
          <button class="add-btn" onclick="addToCart(${f.id})">+</button>
        </div>
      </div>
    </article>
  `).join("");
  gsap.from(".food-card",{y:35,opacity:0,duration:.65,stagger:.08,ease:"power3.out"});
}
renderFoods();

document.getElementById("viewAll").onclick = function(){
  const expanded = this.dataset.expanded === "true";
  renderFoods(!expanded);
  this.dataset.expanded = String(!expanded);
  this.innerHTML = expanded ? 'View Full Menu <b>›</b>' : 'Show Less <b>↑</b>';
};

function addToCart(id){
  const item = foods.find(f=>f.id===id);
  const existing = cart.find(x=>x.id===id);
  if(existing) existing.qty++;
  else cart.push({...item,qty:1});
  saveCart();
  showToast(`${item.name} added to cart`);
  gsap.fromTo(".cart-button",{scale:1},{scale:1.2,duration:.15,yoyo:true,repeat:1});
}

function saveCart(){
  localStorage.setItem("campusCart",JSON.stringify(cart));
  updateCart();
}
function updateCart(){
  const count = cart.reduce((s,x)=>s+x.qty,0);
  const total = cart.reduce((s,x)=>s+x.price*x.qty,0);
  cartCount.textContent=count;
  cartTotal.textContent=`₹${total}`;
  if(!cart.length){
    cartItems.innerHTML='<div style="text-align:center;color:#8993a5;padding:60px 15px">Your cart is empty.<br><br>🍽️ Add something delicious!</div>';
    return;
  }
  cartItems.innerHTML=cart.map(x=>`
    <div class="cart-row">
      <span class="emoji">${x.emoji}</span>
      <div><strong>${x.name}</strong><small>₹${x.price} each</small></div>
      <div class="qty">
        <button onclick="changeQty(${x.id},-1)">−</button><span>${x.qty}</span><button onclick="changeQty(${x.id},1)">+</button>
      </div>
    </div>`).join("");
}
function changeQty(id,delta){
  const item=cart.find(x=>x.id===id);
  if(!item)return;
  item.qty+=delta;
  if(item.qty<=0)cart=cart.filter(x=>x.id!==id);
  saveCart();
}
updateCart();

function openCart(){cartPanel.classList.add("open");overlay.classList.add("show")}
function closeCart(){cartPanel.classList.remove("open");overlay.classList.remove("show")}
document.getElementById("cartButton").onclick=openCart;
document.getElementById("closeCart").onclick=closeCart;
overlay.onclick=closeCart;

document.getElementById("checkoutBtn").onclick=()=>{
  if(!cart.length){showToast("Add food to your cart first");return}
  const orderId="CE"+Math.floor(100000+Math.random()*900000);
  cart=[];
  saveCart();
  closeCart();
  showToast(`Order ${orderId} placed successfully! 🎉`);
};

document.getElementById("joinBtn").onclick=()=>showToast("Loyalty account feature coming soon ✨");
document.getElementById("howBtn").onclick=()=>showToast("Choose food → Add to cart → Place order → Pick up!");
document.getElementById("howText").onclick=()=>showToast("Choose food → Add to cart → Place order → Pick up!");

function showToast(text){
  toast.textContent=text;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer=setTimeout(()=>toast.classList.remove("show"),2600);
}

/* GSAP page animation */
gsap.from(".navbar",{y:-40,opacity:0,duration:.8,ease:"power3.out"});
gsap.from(".hero-copy > *",{x:-35,opacity:0,duration:.8,stagger:.1,delay:.15,ease:"power3.out"});
gsap.from(".stats article",{y:40,opacity:0,duration:.7,stagger:.12,delay:.5,ease:"power3.out"});
gsap.to(".bg-glow",{x:20,y:-15,duration:5,repeat:-1,yoyo:true,ease:"sine.inOut"});

/* Three.js 3D scene */
const container=document.getElementById("threeScene");
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(38,container.clientWidth/container.clientHeight,.1,100);
camera.position.set(0,1.2,8.8);

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(container.clientWidth,container.clientHeight);
renderer.outputColorSpace=THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff,1.6));
const key=new THREE.PointLight(0xff8a00,55,15);key.position.set(3,4,4);scene.add(key);
const fill=new THREE.PointLight(0x3d7bff,25,12);fill.position.set(-4,2,2);scene.add(fill);

const group=new THREE.Group();scene.add(group);

function mat(color,metal=0.15,rough=.38){return new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough})}

const platform=new THREE.Mesh(new THREE.CylinderGeometry(2.65,.3,0.28,64),mat(0x0b1220,.75,.2));
platform.position.y=-1.72;group.add(platform);
const ring=new THREE.Mesh(new THREE.TorusGeometry(2.62,.045,12,96),mat(0xff8a00,.8,.22));
ring.rotation.x=Math.PI/2;ring.position.y=-1.56;group.add(ring);

function addBurger(){
  const b=new THREE.Group();
  const bunTop=new THREE.Mesh(new THREE.SphereGeometry(1.18,.42,48),mat(0xc96c18,.05,.3));
  bunTop.scale.set(1.35,.58,1);bunTop.position.y=.88;b.add(bunTop);
  const cheese=new THREE.Mesh(new THREE.BoxGeometry(2.3,.16,2.0),mat(0xffb313,0,.3));cheese.position.y=.42;cheese.rotation.y=.12;b.add(cheese);
  const patty=new THREE.Mesh(new THREE.CylinderGeometry(1.02,1.08,.38,48),mat(0x4d2415,0,.8));patty.position.y=.22;b.add(patty);
  const lettuce=new THREE.Mesh(new THREE.TorusGeometry(1.03,.16,12,48),mat(0x4e9e24,0,.65));lettuce.rotation.x=Math.PI/2;lettuce.position.y=.05;b.add(lettuce);
  const bunBottom=new THREE.Mesh(new THREE.CylinderGeometry(1.08,1.18,.35,48),mat(0xb75b12,0,.38));bunBottom.position.y=-.3;b.add(bunBottom);
  return b;
}
const burger=addBurger();burger.position.set(.1,.05,0);group.add(burger);

function addCup(){
  const cup=new THREE.Mesh(new THREE.CylinderGeometry(.48,.38,1.45,40),mat(0x8e301e,.05,.3));
  cup.position.set(-1.75,.45,.1);cup.rotation.z=-.12;group.add(cup);
  const lid=new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.12,40),mat(0xf0e9dc,.1,.25));lid.position.set(-1.75,1.18,.1);group.add(lid);
  const straw=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,1.15,16),mat(0xf1f1f1,.1,.2));straw.position.set(-1.62,1.72,.1);straw.rotation.z=-.13;group.add(straw);
}
addCup();

function addFries(){
  const box=new THREE.Mesh(new THREE.BoxGeometry(.95,.95,.7),mat(0xf04b20,.05,.35));box.position.set(1.72,.1,.1);group.add(box);
  for(let i=0;i<11;i++){
    const fry=new THREE.Mesh(new THREE.BoxGeometry(.12,.95,.12),mat(0xffc02e,.05,.35));
    fry.position.set(1.45+(i%4)*.18,.72+(i%3)*.08,.02+(i%2)*.12);
    fry.rotation.z=(Math.random()-.5)*.18;group.add(fry);
  }
}
addFries();

const particles=new THREE.Group();
for(let i=0;i<26;i++){
  const p=new THREE.Mesh(new THREE.IcosahedronGeometry(.045+Math.random()*.07,1),mat(i%2?0xff8a00:0x4b7dff,.3,.25));
  p.position.set((Math.random()-.5)*6,(Math.random()-.1)*4,(Math.random()-.5)*2);
  particles.add(p);
}
scene.add(particles);

let targetX=0,targetY=0;
container.addEventListener("pointermove",e=>{
  const r=container.getBoundingClientRect();
  targetX=((e.clientX-r.left)/r.width-.5)*.45;
  targetY=((e.clientY-r.top)/r.height-.5)*.25;
});
container.addEventListener("pointerleave",()=>{targetX=0;targetY=0});

const clock=new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const t=clock.getElapsedTime();
  burger.rotation.y=t*.25;
  group.rotation.y += (targetX-group.rotation.y)*.035;
  group.rotation.x += (-targetY-group.rotation.x)*.035;
  group.position.y=Math.sin(t*1.4)*.08;
  particles.rotation.y=t*.08;
  particles.children.forEach((p,i)=>p.position.y += Math.sin(t*.8+i)*.0007);
  renderer.render(scene,camera);
}
animate();

window.addEventListener("resize",()=>{
  const w=container.clientWidth,h=container.clientHeight;
  camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);
});
