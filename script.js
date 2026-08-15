// ---- intro loader (binary theme) ----
(function(){
  const html=document.documentElement;
  const loader=document.getElementById('pageLoader');
  if(!loader) return;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const PROGRESS_DURATION = 1850; // matches loader-fill delay(.35s)+duration(1.5s)

  let stopMatrix = null;

  // -- matrix-style binary rain on canvas --
  function startMatrixRain(canvas){
    if(!canvas || !canvas.getContext) return null;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const fontSize = 15;
    let cols = 0, drops = [];

    function resize(){
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.max(1, Math.floor(w / fontSize));
      drops = new Array(cols).fill(0).map(() => Math.random() * -40);
    }
    resize();
    window.addEventListener('resize', resize);

    let raf;
    function draw(){
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.fillStyle = 'rgba(13,7,7,0.16)';
      ctx.fillRect(0, 0, w, h);
      ctx.font = fontSize + 'px "JetBrains Mono", monospace';
      ctx.textBaseline = 'top';
      for(let i=0; i<cols; i++){
        const char = Math.random() > 0.5 ? '1' : '0';
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        const isBright = Math.random() > 0.94;
        ctx.fillStyle = isBright ? 'rgba(255,140,110,0.95)' : 'rgba(225,29,46,0.5)';
        ctx.fillText(char, x, y);
        if(y > h && Math.random() > 0.975){ drops[i] = 0; }
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    return function stop(){
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }

  // -- letters decode from random 0/1 into the real character --
  function decodeLetters(){
    const letters = document.querySelectorAll('.loader-letter');
    letters.forEach(el=>{
      const final = el.textContent;
      const i = parseFloat(getComputedStyle(el).getPropertyValue('--i')) || 0;
      const delay = i * 45 + 150;
      const scrambleDuration = 300;
      const startTime = performance.now() + delay;
      function tick(now){
        if(now < startTime){ requestAnimationFrame(tick); return; }
        const elapsed = now - startTime;
        if(elapsed < scrambleDuration){
          el.textContent = Math.random() > 0.5 ? '1' : '0';
          requestAnimationFrame(tick);
        } else {
          el.textContent = final;
        }
      }
      requestAnimationFrame(tick);
    });
  }

  // -- percentage + binary counter synced to the progress bar --
  function animateProgress(duration){
    const percentEl = document.getElementById('loaderPercent');
    const binaryEl = document.getElementById('loaderBinary');
    if(!percentEl || !binaryEl) return;
    const start = performance.now();
    function ease(t){ return 1 - Math.pow(1 - t, 3); }
    function frame(now){
      const t = Math.min((now - start) / duration, 1);
      const val = Math.round(ease(t) * 100);
      percentEl.textContent = String(val).padStart(2,'0') + '%';
      binaryEl.textContent = val.toString(2).padStart(8,'0');
      if(t < 1){ requestAnimationFrame(frame); }
    }
    requestAnimationFrame(frame);
  }

  function finishLoad(){
    loader.classList.add('is-done');
    html.classList.remove('is-loading');
    // reveal the hero section right as the loader clears, staggered via
    // each element's reveal-delay-x class, instead of instantly appearing
    document.querySelectorAll('.hero-reveal').forEach(el=>el.classList.add('in'));
    setTimeout(()=>{
      if(stopMatrix) stopMatrix();
      loader.remove();
    }, 900);
  }

  if(!reduceMotion){
    const canvas = document.getElementById('loaderMatrix');
    stopMatrix = startMatrixRain(canvas);
    decodeLetters();
    animateProgress(PROGRESS_DURATION);
  }

  window.addEventListener('load', ()=>{
    setTimeout(finishLoad, 1650);
  });
  // fallback in case 'load' is slow or already fired
  setTimeout(finishLoad, 4000);
})();

// ---- custom cursor ----
const dot=document.getElementById('cursorDot'), ring=document.getElementById('cursorRing');
let rx=0,ry=0,mx=0,my=0;
window.addEventListener('mousemove', e=>{
  mx=e.clientX; my=e.clientY;
  dot.style.left=mx+'px'; dot.style.top=my+'px';
});
(function loop(){ rx+=(mx-rx)*0.18; ry+=(my-ry)*0.18; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(loop); })();
document.querySelectorAll('a,button,.project-card,.skill-card,.stat').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ring.style.width='54px';ring.style.height='54px';ring.style.borderColor='var(--accent-2)';});
  el.addEventListener('mouseleave',()=>{ring.style.width='34px';ring.style.height='34px';ring.style.borderColor='var(--accent)';});
});

// ---- click ripple animation ----
window.addEventListener('mousedown', e=>{
  ring.style.width='26px';ring.style.height='26px';
  const ripple=document.createElement('div');
  ripple.className='click-ripple';
  ripple.style.left=e.clientX+'px';
  ripple.style.top=e.clientY+'px';
  document.body.appendChild(ripple);
  ripple.addEventListener('animationend', ()=>ripple.remove());
});
window.addEventListener('mouseup', ()=>{
  ring.style.width='34px';ring.style.height='34px';
});

// ---- navbar scroll state + active link ----
const navbar=document.getElementById('navbar');
const sections=document.querySelectorAll('section[id]');
const navLinksAll=document.querySelectorAll('.nav-link');
window.addEventListener('scroll', ()=>{
  navbar.classList.toggle('scrolled', window.scrollY>40);
  let current='';
  sections.forEach(sec=>{
    const top=sec.offsetTop-140;
    if(window.scrollY>=top) current=sec.getAttribute('id');
  });
  navLinksAll.forEach(l=>{
    l.classList.toggle('active', l.dataset.target===current);
  });
});

// ---- mobile menu ----
const burger=document.getElementById('burger');
const mobileMenu=document.getElementById('mobileMenu');
burger.addEventListener('click', ()=>{
  burger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.m-link').forEach(l=>l.addEventListener('click',()=>{
  burger.classList.remove('open'); mobileMenu.classList.remove('open');
}));

// ---- typed role text ----
const roles=['Full-Stack Developer','UI/UX Enthusiast','Problem Solver','Open Source Contributor'];
const typedEl=document.getElementById('typed');
let ri=0, ci=0, deleting=false;
function typeLoop(){
  const word=roles[ri];
  if(!deleting){
    typedEl.textContent=word.slice(0,ci+1); ci++;
    if(ci===word.length){ deleting=true; setTimeout(typeLoop,1400); return; }
  } else {
    typedEl.textContent=word.slice(0,ci-1); ci--;
    if(ci===0){ deleting=false; ri=(ri+1)%roles.length; }
  }
  setTimeout(typeLoop, deleting?40:80);
}
typeLoop();

// ---- reveal on scroll ----
const io=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
},{threshold:0.15});
document.querySelectorAll('.reveal:not(.in):not(.hero-reveal)').forEach(el=>io.observe(el));

// ---- skill bars ----
const bars=document.querySelectorAll('.bar-fill');
const bio=new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.style.width=e.target.dataset.width+'%';
      bio.unobserve(e.target);
    }
  });
},{threshold:0.3});
bars.forEach(b=>bio.observe(b));

// ---- 3d tilt on project cards ----
const projectCards=document.querySelectorAll('.project-card');
projectCards.forEach(card=>{
  card.addEventListener('mousemove', (e)=>{
    const r=card.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width-0.5;
    const py=(e.clientY-r.top)/r.height-0.5;
    card.style.transform=`perspective(700px) rotateY(${px*8}deg) rotateX(${-py*8}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', ()=>{ card.style.transform='perspective(700px) rotateY(0) rotateX(0) translateY(0)'; });
});

// ---- project demo video modal (YouTube) ----
(function(){
  const modal=document.getElementById('videoModal');
  const backdrop=document.getElementById('videoModalBackdrop');
  const closeBtn=document.getElementById('videoModalClose');
  const player=document.getElementById('videoModalPlayer');
  const titleEl=document.getElementById('videoModalTitle');
  if(!modal) return;

  const openModal=(ytId,title)=>{
    titleEl.textContent=title||'Demo Proyek';
    player.src=`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`;
    modal.classList.add('is-open');
    document.body.style.overflow='hidden';
  };
  const closeModal=()=>{
    modal.classList.remove('is-open');
    document.body.style.overflow='';
    player.src='';
  };

  document.querySelectorAll('.link-demo[data-yt]').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
      e.preventDefault();
      openModal(btn.dataset.yt, btn.dataset.title);
    });
  });
  backdrop.addEventListener('click',closeModal);
  closeBtn.addEventListener('click',closeModal);
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeModal(); });
})();

// ---- contact form ----
const form=document.getElementById('contactForm');
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const btn=form.querySelector('.submit-btn');
  const nameVal=form.querySelector('#name').value.trim();
  const emailVal=form.querySelector('#email').value.trim();
  const messageVal=form.querySelector('#message').value.trim();

  const toEmail='abdurrahmanaiman777@gmail.com';
  const subject=`Pesan dari Portofolio — ${nameVal}`;
  const body=`Nama: ${nameVal}\nEmail: ${emailVal}\n\nPesan:\n${messageVal}`;

  const gmailUrl=`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(gmailUrl,'_blank','noopener');

  btn.classList.add('sent');
  setTimeout(()=>{ btn.classList.remove('sent'); form.reset(); }, 2400);
});

// ---- scroll-scrubbed background image sequence ----
(function(){
  const canvas=document.getElementById('bgCanvas');
  const ctx=canvas.getContext('2d');
  const scrubFill=document.getElementById('scrubFill');

  const FRAME_COUNT = 179;
  const FRAME_PATH = i => `frames/ezgif-frame-${String(i).padStart(3,'0')}.jpg`;

  const images = new Array(FRAME_COUNT);
  let loadedCount = 0;
  let ready = false;
  let currentFrame = -1;
  let ticking = false;

  function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawFrame(Math.max(currentFrame,0), true);
  }

  function drawFrame(index, force){
    index = Math.min(Math.max(index,0), FRAME_COUNT-1);
    if(index===currentFrame && !force) return;
    const img = images[index];
    if(!img || !img.complete || !img.naturalWidth) return;
    currentFrame = index;

    // cover-fit draw (like object-fit:cover)
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw/iw, ch/ih);
    const dw = iw*scale, dh = ih*scale;
    const dx = (cw-dw)/2, dy = (ch-dh)/2;
    ctx.clearRect(0,0,cw,ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function updateScrub(){
    ticking=false;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(Math.max(window.scrollY / docHeight, 0), 1) : 0;

    if(scrubFill) scrubFill.style.width = (progress*100)+'%';

    const targetIndex = Math.round(progress * (FRAME_COUNT-1));
    drawFrame(targetIndex, false);
  }

  window.addEventListener('scroll', ()=>{
    if(!ticking){
      requestAnimationFrame(updateScrub);
      ticking=true;
    }
  }, {passive:true});

  window.addEventListener('resize', resizeCanvas);

  // preload all frames; draw frame 1 as soon as it's available so the
  // background isn't blank while the rest of the sequence streams in
  resizeCanvas();
  for(let i=1;i<=FRAME_COUNT;i++){
    const img=new Image();
    img.onload = ()=>{
      loadedCount++;
      images[i-1]=img;
      if(i===1) drawFrame(0, true);
      if(loadedCount===FRAME_COUNT){ ready=true; updateScrub(); }
    };
    img.onerror = ()=>{ loadedCount++; };
    img.src = FRAME_PATH(i);
    images[i-1]=img;
  }

  window.addEventListener('load', updateScrub);
})();