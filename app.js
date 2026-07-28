/* 简单节奏游戏逻辑（无外部依赖） */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const scoreEl = document.getElementById('score');
const hitZoneEl = document.getElementById('hitZone');

let w = 800, h = 400;
function resize(){
  // 让 canvas 与 CSS 大小一致并维持高DPI 清晰度
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
  w = rect.width; h = rect.height;
}
window.addEventListener('resize', resize);
resize();

// 游戏状态
let running = false;
let score = 0;
let notes = [];
let lastSpawn = 0;
let spawnInterval = 700; // ms

function startGame(){
  running = true; score = 0; notes = []; lastTime = performance.now(); lastSpawn = 0; scoreEl.textContent = score; startBtn.textContent = '重新开始';
}

function stopGame(){ running = false; }

startBtn.addEventListener('click', ()=>{ startGame(); });

// 输入（触摸/鼠标/键盘）
function handleHit(){
  if(!running) return;
  // 判断最近一个 note 是否在判定区域
  // 判定区域为按钮顶部一定距离内
  const zoneY = h - 60; // 判定线
  let hitIndex = -1; let bestDelta = Infinity;
  for(let i=0;i<notes.length;i++){
    const n = notes[i];
    const delta = Math.abs((n.y) - zoneY);
    if(delta < 40 && delta < bestDelta){ bestDelta = delta; hitIndex = i; }
  }
  if(hitIndex >= 0){
    // 命中
    const n = notes.splice(hitIndex,1)[0];
    const hitScore = Math.max(100 - Math.round(bestDelta*2), 10);
    score += hitScore; scoreEl.textContent = score;
    // 简单反馈动画
    flash( 'hit' );
  } else {
    score = Math.max(0, score - 20); scoreEl.textContent = score; flash('miss');
  }
}

hitZoneEl.addEventListener('click', ()=>{ handleHit(); });
canvas.addEventListener('touchstart', (e)=>{ e.preventDefault(); handleHit(); }, {passive:false});
window.addEventListener('keydown', (e)=>{ if(e.code==='Space' || e.code==='Enter') { e.preventDefault(); handleHit(); }});

// 振动/视觉提示
function flash(type){
  if(navigator.vibrate) navigator.vibrate(type==='hit'?20:60);
  hitZoneEl.style.transition = 'transform 0.08s ease';
  hitZoneEl.style.transform = type==='hit'? 'scale(1.05)' : 'scale(0.95)';
  setTimeout(()=>{ hitZoneEl.style.transform = 'none'; },120);
}

// 游戏循环
let lastTime = performance.now();
function loop(t){
  const dt = t - lastTime; lastTime = t;
  if(running){
    // spawn notes
    lastSpawn += dt;
    if(lastSpawn > spawnInterval){
      lastSpawn = 0;
      spawn();
      // 慢慢加速
      spawnInterval = Math.max(320, spawnInterval * 0.995);
    }
    update(dt);
  }
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function spawn(){
  const laneX = w/2; // 单轨游戏，居中
  notes.push({x: laneX, y: -20, speed: 0.18 + Math.random()*0.08});
}

function update(dt){
  for(let i=notes.length-1;i>=0;i--){
    notes[i].y += notes[i].speed * dt;
    if(notes[i].y > h + 40){ // 跳出
      notes.splice(i,1); score = Math.max(0, score - 30); scoreEl.textContent = score; flash('miss');
    }
  }
}

function draw(){
  // 背景
  ctx.clearRect(0,0,w,h);
  // 轨道效果
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.fillRect(w*0.25, 0, w*0.5, h);

  // 渐变光线
  const grad = ctx.createLinearGradient(0,0,0,h);
  grad.addColorStop(0,'rgba(255,107,107,0.06)');
  grad.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(w*0.25, 0, w*0.5, h);

  // 画判定线
  const zoneY = h - 60;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(w*0.25, zoneY); ctx.lineTo(w*0.75, zoneY); ctx.stroke();

  // 画 notes
  for(const n of notes){
    const nx = n.x; const ny = n.y;
    // 光晕
    const r = 16;
    const grd = ctx.createRadialGradient(nx, ny, r*0.2, nx, ny, r*1.8);
    grd.addColorStop(0, 'rgba(255,107,107,0.95)');
    grd.addColorStop(0.6, 'rgba(255,107,107,0.35)');
    grd.addColorStop(1, 'rgba(255,107,107,0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(nx, ny, r*1.6, 0, Math.PI*2); ctx.fill();
    // 中心圆
    ctx.fillStyle = '#ff6b6b'; ctx.beginPath(); ctx.arc(nx, ny, r, 0, Math.PI*2); ctx.fill();
  }

  // 左右装饰
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  ctx.fillRect(w*0.08, h*0.1, 6, h*0.8);
  ctx.fillRect(w*0.92-6, h*0.1, 6, h*0.8);
}

// 首次提示
hitZoneEl.addEventListener('touchstart', ()=>{})

// === 商店与收益（模拟购买） ===
const storeBtn = document.getElementById('storeBtn');
const dashBtn = document.getElementById('dashBtn');
const storeModal = document.getElementById('storeModal');
const dashModal = document.getElementById('dashModal');
const closeStore = document.getElementById('closeStore');
const closeDash = document.getElementById('closeDash');
const totalRevenueEl = document.getElementById('totalRevenue');
const soldCountEl = document.getElementById('soldCount');
const activeUsersEl = document.getElementById('activeUsers');

let revenue = parseFloat(localStorage.getItem('ktv_revenue') || '0');
let soldCount = parseInt(localStorage.getItem('ktv_sold') || '0');
let premiumUnlocked = JSON.parse(localStorage.getItem('ktv_premium') || 'false');

function openStore(){ storeModal.setAttribute('aria-hidden','false'); }
function closeStoreFn(){ storeModal.setAttribute('aria-hidden','true'); }
function openDash(){ dashModal.setAttribute('aria-hidden','false'); updateDash(); }
function closeDashFn(){ dashModal.setAttribute('aria-hidden','true'); }

storeBtn.addEventListener('click', openStore);
closeStore.addEventListener('click', closeStoreFn);

dashBtn.addEventListener('click', openDash);
closeDash.addEventListener('click', closeDashFn);

// 购买按钮
document.addEventListener('click', (e)=>{
  const btn = e.target.closest && e.target.closest('button.buy');
  if(btn){
    const id = btn.getAttribute('data-id');
    const price = parseFloat(btn.getAttribute('data-price') || '0');
    simulatePurchase(id, price);
  }
});

function simulatePurchase(id, price){
  // 简单的确认与延迟，模拟真实购买流程
  if(!confirm(`确认购买 ${id}：$${price.toFixed(2)} ? (模拟)`)) return;
  // 模拟网络延迟
  setTimeout(()=>{
    revenue += price; soldCount += 1;
    localStorage.setItem('ktv_revenue', revenue.toFixed(2));
    localStorage.setItem('ktv_sold', String(soldCount));
    // 解锁逻辑示例：购买任一包解锁 premium
    premiumUnlocked = true; localStorage.setItem('ktv_premium', JSON.stringify(true));
    alert('购买成功！已解锁高级内容（模拟）。');
    updateDash();
    closeStoreFn();
  }, 700 + Math.random()*800);
}

function updateDash(){
  totalRevenueEl.textContent = revenue.toFixed(2);
  soldCountEl.textContent = soldCount;
  // 活跃用户为模拟数据：根据售出数量和一个随机函数估算
  const active = Math.max(1, Math.round(20 + soldCount * 3 + Math.random()*30));
  activeUsersEl.textContent = active;
}

// 服务工作线程注册（PWA 基础）
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/service-worker.js').then(()=>{
    console.log('ServiceWorker registered');
  }).catch((err)=>{ console.warn('SW register failed', err); });
}

// 小提示： premiumUnlocked 可用于解锁更多歌曲/皮肤（示例中未集成到游戏逻辑）。
