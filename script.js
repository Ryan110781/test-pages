// Cursor
const cursor = document.getElementById('custom-cursor');
document.addEventListener('mousemove', e => {
  cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});
const interactiveEls = document.querySelectorAll('a, button, .orb-canvas, .swiper-slide');
interactiveEls.forEach(el=>{
  el.addEventListener('mouseenter',()=>cursor.style.transform+=' scale(1.5)');
  el.addEventListener('mouseleave',()=>cursor.style.transform=cursor.style.transform.replace(' scale(1.5)',''));
});

// Scroll hint
document.querySelector('.scroll-hint').addEventListener('click',()=>document.getElementById('about').scrollIntoView({behavior:'smooth', block:'center'}));
document.getElementById('btn-about').addEventListener('click',()=>document.getElementById('about').scrollIntoView({behavior:'smooth', block:'center'}));

// Swiper
const swiper = new Swiper('.swiper-container', {
  slidesPerView: 1,
  loop: true,
  pagination: { el: '.swiper-pagination', clickable: true },
  autoplay: { delay: 3000, disableOnInteraction: false },
});
document.querySelector('.swiper-container').addEventListener('mouseenter',()=>swiper.autoplay.stop());
document.querySelector('.swiper-container').addEventListener('mouseleave',()=>swiper.autoplay.start());

// VanillaTilt
VanillaTilt.init(document.querySelectorAll(".card"), {
  max: 10,
  speed: 400,
  scale: 1.05
});

// Three.js Orbs
function initOrb(canvasId, iconUrl) {
  const canvas = document.getElementById(canvasId);
  if(!canvas) return;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 3;
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true});
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  
  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const texture = new THREE.TextureLoader().load(iconUrl);
  const material = new THREE.MeshStandardMaterial({map:texture});
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);
  
  const light = new THREE.PointLight(0xffffff,1);
  light.position.set(5,5,5);
  scene.add(light);

  function animate(){
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.005;
    renderer.render(scene, camera);
  }
  animate();
}
initOrb('orb-js','assets/icons/js.png');
initOrb('orb-html','assets/icons/html.png');
initOrb('orb-css','assets/icons/css.png');

// GSAP ScrollTrigger animations
gsap.registerPlugin(ScrollTrigger);
gsap.utils.toArray('.section').forEach(section=>{
  gsap.from(section,{opacity:0,y:50,duration:1,scrollTrigger:{trigger:section,start:'top center',toggleActions:'play none none reverse'}});
});

// Particle background (optional simplified)
