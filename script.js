/* ======================
   Util & env checks
   ====================== */
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

/* ======================
   Particle background (canvas)
   simple particle system with mouse repel
   ====================== */
(function initParticles(){
  const canvas = document.getElementById('bg-particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = canvas.width = innerWidth;
  let h = canvas.height = innerHeight;
  const particles = [];
  const COUNT = Math.round((w*h)/60000); // density
  const mouse = { x: -9999, y: -9999, radius: Math.min(160, Math.max(80, (w+h)/12)) };

  function rand(min,max){return Math.random()*(max-min)+min}
  function create(){
    for(let i=0;i<Math.max(30,COUNT);i++){
      particles.push({
        x: rand(0,w),
        y: rand(0,h),
        vx: rand(-0.3,0.3),
        vy: rand(-0.3,0.3),
        r: rand(1,2.4),
        hue: rand(200,225),
        mass: rand(0.8,1.6)
      });
    }
  }
  create();

  function resize(){
    w = canvas.width = innerWidth;
    h = canvas.height = innerHeight;
  }
  window.addEventListener('resize', () => { resize(); });

  function step(){
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      // move
      p.x += p.vx * p.mass;
      p.y += p.vy * p.mass;

      // wrap
      if(p.x < -20) p.x = w + 20;
      if(p.x > w + 20) p.x = -20;
      if(p.y < -20) p.y = h + 20;
      if(p.y > h + 20) p.y = -20;

      // mouse repel
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < mouse.radius){
        const angle = Math.atan2(dy,dx);
        const force = (1 - (dist / mouse.radius)) * 0.9;
        p.x += Math.cos(angle) * force * 6;
        p.y += Math.sin(angle) * force * 6;
      }

      // draw
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 90%, 60%, 0.10)`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }
    if(!prefersReduced) requestAnimationFrame(step);
  }

  if(!prefersReduced) step();

  // mouse move
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', ()=>{ mouse.x = -9999; mouse.y = -9999; });
})();

/* ======================
   Custom Cursor
   - hidden on touch or reduced-motion
   - lerp follow
   ====================== */
(function initCursor(){
  const el = document.getElementById('custom-cursor');
  if(!el) return;
  if(isTouch || prefersReduced) { el.style.display = 'none'; return; }
  el.style.display = 'block';

  let mx = 0, my = 0, cx = 0, cy = 0, raf;
  const SPEED = 0.16;

  document.addEventListener('mousemove', (e)=>{
    mx = e.clientX; my = e.clientY;
    if(!raf) loop();
  });

  function loop(){
    cx += (mx - cx) * SPEED;
    cy += (my - cy) * SPEED;
    el.style.left = cx + 'px';
    el.style.top = cy + 'px';
    raf = requestAnimationFrame(loop);
  }

  // enlarge cursor when hovering interactive elements
  const interactive = document.querySelectorAll('a, button, .orb-canvas, .swiper-slide, .card');
  interactive.forEach(node=>{
    node.addEventListener('mouseenter', ()=> el.classList.add('cursor--big'));
    node.addEventListener('mouseleave', ()=> el.classList.remove('cursor--big'));
    // accessibility: show keyboard focus style when focused
    node.addEventListener('focus', ()=> el.classList.add('cursor--big'));
    node.addEventListener('blur', ()=> el.classList.remove('cursor--big'));
  });
})();

/* ======================
   Button ripple effect
   create ripple span at click position
   ====================== */
(function initRipples(){
  document.addEventListener('pointerdown', function(e){
    const btn = e.target.closest('.btn');
    if(!btn) return;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const size = Math.max(rect.width, rect.height) * 0.9;
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    btn.appendChild(ripple);
    setTimeout(()=> ripple.remove(), 650);
  }, {passive:true});
})();

/* ======================
   Scroll hint and about button action
   - both call smooth center scroll
   - use GSAP to animate per requirement
   ====================== */
(function initScrollTriggers(){
  const about = document.getElementById('about');
  const heroScroll = document.querySelector('.scroll-hint');
  const btnAbout = document.getElementById('btn-about');

  function centerScrollTo(el){
    if(prefersReduced){
      el.scrollIntoView({behavior:'auto', block:'center'});
      return;
    }
    // animate scroll using GSAP
    const top = el.getBoundingClientRect().top + window.pageYOffset - (window.innerHeight - el.clientHeight)/2;
    gsap.to(window, {duration: 1.05, scrollTo: top, ease: "power3.out"});
  }

  if(heroScroll) heroScroll.addEventListener('click', ()=> centerScrollTo(about));
  if(btnAbout) btnAbout.addEventListener('click', ()=> centerScrollTo(about));
})();

/* ======================
   Swiper init (autoplay, pause on hover)
   - disable autoplay if prefers-reduced-motion
   ====================== */
let mySwiper = null;
(function initSwiper(){
  const opts = {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: { el: '.swiper-pagination', clickable: true },
  };
  if(!prefersReduced){
    opts.autoplay = { delay: 3500, disableOnInteraction: false };
    opts.speed = 950;
  }
  // wait for Swiper script loaded
  function tryInit(){
    if(typeof Swiper === 'undefined'){ return setTimeout(tryInit, 120); }
    mySwiper = new Swiper('.swiper-container', opts);
    const sc = document.querySelector('.swiper-container');
    sc && sc.addEventListener('mouseenter', ()=> mySwiper && mySwiper.autoplay && mySwiper.autoplay.stop());
    sc && sc.addEventListener('mouseleave', ()=> mySwiper && mySwiper.autoplay && mySwiper.autoplay.start());
  }
  tryInit();
})();

/* ======================
   VanillaTilt init for cards
   ====================== */
(function initTilt(){
  if(typeof VanillaTilt !== 'undefined'){
    const els = document.querySelectorAll('.card');
    VanillaTilt.init(els, { max: 10, speed: 400, scale: 1.03, glare: false, 'max-glare': 0.12 });
  }
})();

/* ======================
   GSAP animations: reveal each section + glow when centered
   ====================== */
(function initGSAP(){
  if(prefersReduced || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.section').forEach((sec)=>{
    gsap.fromTo(sec.querySelectorAll('.section-title, .hero-title, .hero-tagline, .card, .proj-card, .orb-canvas'),
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.9, ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: sec,
          start: "top center",
          end: "bottom center",
          toggleActions: "play reverse play reverse",
          onEnter: ()=> sec.classList.add('in-center'),
          onLeave: ()=> sec.classList.remove('in-center'),
          onEnterBack: ()=> sec.classList.add('in-center'),
          onLeaveBack: ()=> sec.classList.remove('in-center'),
        }
      });
  });
})();

/* ======================
   Three.js Orbs (single renderer managing multiple scenes)
   - each orb: sphere with icon texture as decal-like
   - hover: scale + emissive/glow (simulated)
   - click: quick scale + highlight
   - fallback: draw simple circle and icon via 2D canvas
   ====================== */
(function initOrbs(){
  const orbInfos = [
    { id: 'orb-js', icon: 'assets/icons/js.png' },
    { id: 'orb-html', icon: 'assets/icons/html.png' },
    { id: 'orb-css', icon: 'assets/icons/css.png' },
  ];

  // Quick WebGL availability check
  function webglAvailable(){
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch(e){ return false; }
  }

  if(!webglAvailable()){
    // fallback 2D circles with icons
    orbInfos.forEach(info=>{
      const c = document.getElementById(info.id);
      if(!c) return;
      const ctx = c.getContext('2d');
      const draw = () => {
        const w=c.width, h=c.height;
        ctx.clearRect(0,0,w,h);
        const cx=w/2, cy=h/2, r=Math.min(w,h)/2 - 10;
        // shadow
        ctx.beginPath();
        ctx.arc(cx,cy,r,0,Math.PI*2);
        const grad = ctx.createRadialGradient(cx-20,cy-20, r*0.1, cx,cy, r*1.2);
        grad.addColorStop(0, 'rgba(122,162,247,0.25)');
        grad.addColorStop(1, 'rgba(10,16,30,0.12)');
        ctx.fillStyle = grad;
        ctx.fill();

        // icon
        const img = new Image();
        img.src = info.icon;
        img.onload = ()=> {
          const size = r*1.1;
          ctx.drawImage(img, cx - size/2, cy - size/2, size, size);
        }
      };
      draw();
      // simple hover/click: add pointer events via CSS outside
    });
    return;
  }

  // Use one renderer and multiple scenes via viewports (for simplicity, separate canvases used)
  orbInfos.forEach(info => {
    const canvas = document.getElementById(info.id);
    if(!canvas) return;

    // ensure high DPI
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * DPR;
    canvas.height = canvas.clientHeight * DPR;
    canvas.style.width = canvas.clientWidth + 'px';
    canvas.style.height = canvas.clientHeight + 'px';

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: false });
    renderer.setPixelRatio(DPR);
    renderer.setSize(canvas.width, canvas.height, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 2.6;

    // lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222244, 0.8);
    scene.add(hemi);
    const pLight = new THREE.PointLight(0xffffff, 0.85);
    pLight.position.set(3,3,3);
    scene.add(pLight);

    // sphere
    const geom = new THREE.SphereGeometry(0.95, 64, 64);
    const texture = new THREE.TextureLoader().load(info.icon);
    texture.encoding = THREE.sRGBEncoding;
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.15,
      roughness: 0.45,
      emissive: 0x0a2a40,
      emissiveIntensity: 0.06,
    });
    const sphere = new THREE.Mesh(geom, mat);
    scene.add(sphere);

    // subtle environment reflection: add small ambient cube-like light effect
    const envLight = new THREE.AmbientLight(0x4370a6, 0.06);
    scene.add(envLight);

    // interaction state
    let hover = false;
    let animTimeout;

    // pointer events on canvas
    canvas.style.cursor = 'pointer';
    canvas.addEventListener('mouseenter', ()=> hover=true);
    canvas.addEventListener('mouseleave', ()=> hover=false);
    canvas.addEventListener('click', ()=>{
      // quick scale animation
      gsap.to(sphere.scale, { x:1.14, y:1.14, z:1.14, duration: 0.12, yoyo:true, repeat:1, ease:'power2.out' });
      // flash emissive
      gsap.to(mat, { emissiveIntensity: 0.6, duration: 0.08, yoyo:true, repeat:1, ease:'power1.inOut' });
    });

    // animation loop
    let rot = Math.random() > 0.5 ? 1 : -1;
    function render(){
      // rotate slowly
      sphere.rotation.y += 0.004 * rot;
      sphere.rotation.x += 0.001 * rot;

      // hover effect: scale & glow
      if(hover){
        sphere.scale.lerp(new THREE.Vector3(1.06,1.06,1.06), 0.12);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.28, 0.06);
      } else {
        sphere.scale.lerp(new THREE.Vector3(1,1,1), 0.06);
        mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, 0.06, 0.04);
      }

      renderer.render(scene, camera);
      requestAnimationFrame(render);
    }
    render();

    // responsive handling
    window.addEventListener('resize', ()=> {
      const DPR = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * DPR;
      canvas.height = canvas.clientHeight * DPR;
      renderer.setPixelRatio(DPR);
      renderer.setSize(canvas.width, canvas.height, false);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    });
  });

})();

/* ======================
   Accessibility helpers
   - ensure interactive elements are focusable & aria-labeled (done in HTML)
   ====================== */
(function ensureFocus(){
  // ensure swiper slides are keyboard focusable
  document.querySelectorAll('.swiper-slide').forEach((s)=> s.setAttribute('tabindex','0'));
})();

/* ======================
   End of script
   ====================== */
