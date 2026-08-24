import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeHero() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, el.clientWidth / el.clientHeight, .1, 100);
    camera.position.set(0, 1.1, 8.5);

    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const orange = new THREE.PointLight(0xff8a00, 55, 15);
    orange.position.set(3,4,4); scene.add(orange);
    const blue = new THREE.PointLight(0x3d7bff, 25, 12);
    blue.position.set(-4,2,2); scene.add(blue);

    const group = new THREE.Group();
    scene.add(group);
    const material = (color, metal=.2, rough=.35) =>
      new THREE.MeshStandardMaterial({color, metalness:metal, roughness:rough});

    const platform = new THREE.Mesh(new THREE.CylinderGeometry(2.6,.3,.28,64), material(0x0b1220,.75,.2));
    platform.position.y=-1.7; group.add(platform);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.58,.045,12,96), material(0xff8a00,.8,.2));
    ring.rotation.x=Math.PI/2; ring.position.y=-1.55; group.add(ring);

    const burger = new THREE.Group();
    const top = new THREE.Mesh(new THREE.SphereGeometry(1.18,.42,48), material(0xc96c18,.05,.3));
    top.scale.set(1.35,.58,1); top.position.y=.88; burger.add(top);
    const cheese = new THREE.Mesh(new THREE.BoxGeometry(2.3,.16,2), material(0xffb313,0,.3));
    cheese.position.y=.42; cheese.rotation.y=.12; burger.add(cheese);
    const patty = new THREE.Mesh(new THREE.CylinderGeometry(1.02,1.08,.38,48), material(0x4d2415,0,.8));
    patty.position.y=.22; burger.add(patty);
    const lettuce = new THREE.Mesh(new THREE.TorusGeometry(1.03,.16,12,48), material(0x4e9e24,0,.65));
    lettuce.rotation.x=Math.PI/2; lettuce.position.y=.05; burger.add(lettuce);
    const bottom = new THREE.Mesh(new THREE.CylinderGeometry(1.08,1.18,.35,48), material(0xb75b12,0,.38));
    bottom.position.y=-.3; burger.add(bottom);
    group.add(burger);

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.48,.38,1.45,40), material(0x8e301e,.05,.3));
    cup.position.set(-1.75,.45,.1); cup.rotation.z=-.12; group.add(cup);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(.52,.52,.12,40), material(0xf0e9dc,.1,.25));
    lid.position.set(-1.75,1.18,.1); group.add(lid);

    const friesBox = new THREE.Mesh(new THREE.BoxGeometry(.95,.95,.7), material(0xf04b20,.05,.35));
    friesBox.position.set(1.72,.1,.1); group.add(friesBox);
    for(let i=0;i<11;i++){
      const fry = new THREE.Mesh(new THREE.BoxGeometry(.12,.95,.12), material(0xffc02e,.05,.35));
      fry.position.set(1.45+(i%4)*.18,.72+(i%3)*.08,.02+(i%2)*.12);
      group.add(fry);
    }

    const particles = new THREE.Group();
    for(let i=0;i<24;i++){
      const p = new THREE.Mesh(new THREE.IcosahedronGeometry(.045+Math.random()*.07,1), material(i%2?0xff8a00:0x4b7dff,.3,.25));
      p.position.set((Math.random()-.5)*6,(Math.random()-.1)*4,(Math.random()-.5)*2);
      particles.add(p);
    }
    scene.add(particles);

    let tx=0,ty=0;
    const move=e=>{
      const r=el.getBoundingClientRect();
      tx=((e.clientX-r.left)/r.width-.5)*.45;
      ty=((e.clientY-r.top)/r.height-.5)*.25;
    };
    el.addEventListener("pointermove",move);

    let frame;
    const clock = new THREE.Clock();
    const animate=()=>{
      frame=requestAnimationFrame(animate);
      const t=clock.getElapsedTime();
      burger.rotation.y=t*.25;
      group.rotation.y += (tx-group.rotation.y)*.035;
      group.rotation.x += (-ty-group.rotation.x)*.035;
      group.position.y=Math.sin(t*1.4)*.08;
      particles.rotation.y=t*.08;
      renderer.render(scene,camera);
    };
    animate();

    const resize=()=>{
      camera.aspect=el.clientWidth/el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth,el.clientHeight);
    };
    window.addEventListener("resize",resize);

    return ()=>{
      cancelAnimationFrame(frame);
      window.removeEventListener("resize",resize);
      el.removeEventListener("pointermove",move);
      renderer.dispose();
      el.innerHTML="";
    };
  },[]);

  return <div className="three-canvas" ref={ref}/>;
}
