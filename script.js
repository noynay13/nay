/* =============================================
   NØYNAY — SCHEDULE  |  script.js
   ============================================= */

/* ── DATA MAPS ── */
const COLORMAP = {m:'cm',t:'ct',w:'cw',th:'cth',f:'cf',s:'cs',su:'csu'};
const DAYMAP   = {m:1,t:2,w:3,th:4,f:5,s:6,su:0};
const DAYFL    = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
const DAYS_SHOW= [1,2,3,4,5,6,0];

/* ── PIN: SHA-256 hash (ไม่เก็บ PIN ตรงๆ ใน source) ── */
const PIN_HASHES = [
  '7d72dde03ee6c3ccd5d83cbc866cc4cebf840a2b1be32070cea65d0651ab1fad',
  'a7fda0b61e2047f0f1057d1f5f064c272fd5d490961c531f4df64b0dd354683a'
];
async function hashStr(s){
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}

/* ── DEFAULT COURSES ── */
let courses = [
  {id:1,day:1,start:'08:30',end:'12:30',code:'9012042-54',name:'ระบบคอมพิวเตอร์และสถาปัตยกรรม',nameEn:'Computer System and Architecture',room:'อาคาร4 ห้อง435',teacher:'ดร.ชัยวุฒิ บุญญศิริวัฒน์',credits:3,color:'m'},
  {id:2,day:1,start:'13:30',end:'17:30',code:'0165002-65',name:'ภาษาอังกฤษเพื่อการสื่อสารในศตวรรษที่ 21',nameEn:'English for Communication in the 21st Century',room:'อาคาร36 ห้อง36305',teacher:'เอื้อมพร รุ่งศิริ',credits:3,color:'m'},
  {id:3,day:2,start:'13:30',end:'17:30',code:'9012111-54',name:'ระบบการจัดการฐานข้อมูล',nameEn:'Database Management System',room:'อาคาร4 ห้อง433',teacher:'วิสันต์ พูนชัย',credits:3,color:'t'},
  {id:4,day:3,start:'08:30',end:'12:30',code:'0165005-65',name:'ทักษะภาษาไทยเพื่อการสื่อสาร',nameEn:'Thai Language Skills for Communication',room:'อาคาร35 ห้อง35502',teacher:'กันติทัต การเจริญ',credits:3,color:'w'},
  {id:5,day:4,start:'13:30',end:'17:30',code:'9012011-55',name:'ดิสครีตและทฤษฎีการคำนวณ',nameEn:'Discrete Mathematics and Calculation Theory',room:'อาคาร4 ห้อง434',teacher:'กิพวรรณ นิยมวงศ์',credits:3,color:'th'},
  {id:6,day:5,start:'08:30',end:'12:30',code:'9012041-54',name:'ดิจิทัลเบื้องต้น',nameEn:'Introduction to Digital Concept',room:'อาคาร4 ห้อง435',teacher:'ดร.ชัยวุฒิ บุญญศิริวัฒน์',credits:3,color:'f'},
  {id:7,day:5,start:'13:30',end:'16:30',code:'0365004-65',name:'ฉลาดคิด',nameEn:'Smart Thinking',room:'ส ห้อง145',teacher:'ณัฏฐกฤต ชัยอริยเมรี',credits:3,color:'f'},
];
let nextId=8, editId=null, editMode=false, pinStr='', fq='';

/* ── PERSIST ── */
function save(){
  try{
    localStorage.setItem('sc_c',JSON.stringify(courses));
    localStorage.setItem('sc_id',nextId);
    localStorage.setItem('sc_n',document.getElementById('hero-name').textContent);
    localStorage.setItem('sc_s',document.getElementById('hero-sem').textContent);
  }catch(e){}
}
function load(){
  try{
    const c=localStorage.getItem('sc_c');if(c)courses=JSON.parse(c);
    nextId=parseInt(localStorage.getItem('sc_id')||nextId);
    const n=localStorage.getItem('sc_n'),s=localStorage.getItem('sc_s');
    if(n)document.getElementById('hero-name').textContent=n;
    if(s)document.getElementById('hero-sem').textContent=s;
  }catch(e){}
}

/* ── THEME ── */
function applyTheme(t){
  document.documentElement.setAttribute('data-theme',t);
  const p=document.getElementById('theme-ico');
  p.querySelector('path').setAttribute('d',t==='light'
    ?'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z'
    :'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z');
}
function toggleTheme(){
  const t=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
  applyTheme(t);localStorage.setItem('sc_th',t);
}
(()=>{applyTheme(localStorage.getItem('sc_th')||'dark')})();

/* ── LOGO FALLBACK ── */
document.getElementById('logo-img').onload=()=>{document.getElementById('logo-fb').style.display='none'};
document.getElementById('logo-img').onerror=()=>{document.getElementById('logo-img').style.display='none';document.getElementById('logo-fb').style.display=''};

/* ── EDIT MODE ── */
function toggleEdit(){
  editMode=!editMode;
  document.body.classList.toggle('em',editMode);
  const btn=document.getElementById('edit-btn');
  btn.classList.toggle('on',editMode);
  document.getElementById('edit-lbl').textContent=editMode?'ล็อก':'แก้ไข';
  const ce=editMode?'true':'false';
  document.getElementById('hero-name').contentEditable=ce;
  document.getElementById('hero-sem').contentEditable=ce;
  showToast(editMode?'โหมดแก้ไข — สามารถเพิ่ม/แก้ไขได้':'บันทึกแล้ว ✓');
}

/* ── CLOCK ── */
function tick(){
  const n=new Date();
  document.getElementById('ct').textContent=n.toLocaleTimeString('th-TH',{hour:'2-digit',minute:'2-digit',hour12:false});
  document.getElementById('cd').textContent=n.toLocaleDateString('th-TH',{weekday:'short',day:'numeric',month:'short'});
}
tick();setInterval(tick,1000);

/* ── SCROLL PROGRESS ── */
window.addEventListener('scroll',()=>{
  const e=document.documentElement;
  document.getElementById('scroll-prog').style.transform=`scaleX(${e.scrollTop/(e.scrollHeight-e.clientHeight)||0})`;
});

/* ── HELPERS ── */
function esc(s){return(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function t2m(t){const[h,m]=t.split(':').map(Number);return h*60+m}
function m2t(m){return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')}
function goTo(id){document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})}
function setbn(id){document.querySelectorAll('.bn').forEach(e=>e.classList.remove('on'));document.getElementById(id)?.classList.add('on')}
function showToast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200)}
function ovClick(e,id){if(e.target===document.getElementById(id))document.getElementById(id).classList.remove('op')}

/* ── STATS ── */
function upStats(){
  document.getElementById('s-courses').textContent=courses.length;
  document.getElementById('s-credits').textContent=courses.reduce((a,c)=>a+Number(c.credits||0),0);
  document.getElementById('s-hours').textContent=Math.round(courses.reduce((a,c)=>a+Math.max(0,(t2m(c.end)-t2m(c.start))/60),0));
}

/* ── TIMETABLE RENDER ── */
function renderGrid(){
  const today=new Date().getDay();
  const now=new Date();
  const curMin=now.getHours()*60+now.getMinutes();
  const G_START=8*60, G_END=19*60, SPAN=G_END-G_START, COLS=11;

  let hh=`<div class="th-cell first"></div>`;
  for(let h=8;h<19;h++)hh+=`<div class="th-cell">${String(h).padStart(2,'0')}:00</div>`;
  document.getElementById('tt-head').innerHTML=hh;

  let bh='';
  DAYS_SHOW.forEach(d=>{
    const isToday=d===today;
    bh+=`<div class="tt-row${isToday?' tt-today':''}">`;
    bh+=`<div class="tt-day-label">${DAYFL[d]}</div>`;
    bh+=`<div class="tt-lane">`;
    for(let i=0;i<COLS;i++)bh+=`<div class="lane-cell" onclick="editMode&&openModal(null,${d})"></div>`;

    courses.filter(c=>c.day===d).forEach(c=>{
      const l=Math.max(0,(t2m(c.start)-G_START)/SPAN);
      const r=Math.min(1,(t2m(c.end)-G_START)/SPAN);
      if(r<=0||l>=1)return;
      const isNow=c.day===today&&curMin>=t2m(c.start)&&curMin<t2m(c.end);
      const {cls,style}=getStyle(c);
      bh+=`<div class="cb ${cls}${isNow?' cb-now':''}" style="left:calc(${l*100}% + 3px);width:calc(${(r-l)*100}% - 6px);${style}" onclick="event.stopPropagation();onBlk(${c.id})">
        <div class="cb-room">${esc(c.room||'—')}</div>
        <div class="cb-name">${esc(c.name)}</div>
        <div class="cb-time">${c.start}–${c.end}</div>
        <div class="cb-code">${esc(c.code)}</div>
      </div>`;
    });

    bh+='</div></div>';
  });
  document.getElementById('tt-body').innerHTML=bh;
}

function onBlk(id){editMode?openModal(id):openDetail(id)}

/* ── COURSE CARDS RENDER ── */
function renderCC(q){
  if(q!==undefined)fq=(q||'').toLowerCase();
  const fl=courses.filter(c=>!fq||(c.name+c.code+c.teacher+c.room).toLowerCase().includes(fq));
  let h='';
  if(!fl.length){h=`<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-txt">${fq?'ไม่พบวิชาที่ค้นหา':'ยังไม่มีวิชาเรียน'}</div></div>`;}
  else fl.forEach(c=>{
    const {cls,style}=getStyle(c);
    h+=`<div class="cc ${cls}" style="${style}" onclick="onBlk(${c.id})">
      <div class="cc-cr">${c.credits} cr.</div>
      <div class="cc-code">${esc(c.code)}</div>
      <div class="cc-name">${esc(c.name)}</div>
      <div class="cc-meta">
        <div class="cc-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>${DAYFL[c.day]}</div>
        <div class="cc-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${c.start}–${c.end}</div>
        ${c.room?`<div class="cc-tag"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>${esc(c.room)}</div>`:''}
      </div>
    </div>`;
  });
  h+=`<div class="cc-add" onclick="openModal(null)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg><span>เพิ่มวิชาเรียน</span></div>`;
  document.getElementById('cg').innerHTML=h;
}
function filterCC(q){renderCC(q)}

/* ── EDIT MODAL ── */
function openModal(id,dday){
  if(!editMode){if(id)openDetail(id);return}
  editId=id;
  const isE=id!=null;
  document.getElementById('m-title').textContent=isE?'แก้ไขวิชาเรียน':'เพิ่มวิชาเรียน';
  document.getElementById('m-sub').textContent=isE?'แก้ไขข้อมูลรายวิชา':'กรอกข้อมูลรายวิชา';
  document.getElementById('del-btn').style.display=isE?'block':'none';
  if(isE){
    const c=courses.find(x=>x.id===id);if(!c)return;
    document.getElementById('f-code').value=c.code||'';
    document.getElementById('f-name').value=c.name||'';
    document.getElementById('f-day').value=c.day;
    document.getElementById('f-st').value=c.start||'08:30';
    document.getElementById('f-en2').value=c.end||'12:30';
    document.getElementById('f-room').value=c.room||'';
    document.getElementById('f-teacher').value=c.teacher||'';
    document.getElementById('f-cr').value=c.credits||3;
    document.getElementById('f-col').value=c.color||'m';
    onColChange();
    if(c.color==='custom'&&c.hex){
      document.getElementById('f-rgb').value=c.hex;
      document.getElementById('f-hex').value=c.hex;
      document.getElementById('color-prev').style.background=c.hex;
    }
  } else {
    ['f-code','f-name','f-room','f-teacher'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('f-day').value=dday||1;
    document.getElementById('f-st').value='08:30';document.getElementById('f-en2').value='12:30';
    document.getElementById('f-cr').value=3;document.getElementById('f-col').value='m';
  }
  document.getElementById('m-ov').classList.add('op');
  setTimeout(()=>document.getElementById('f-name').focus(),200);
}
function closeM(){document.getElementById('m-ov').classList.remove('op')}
function saveM(){
  const d={
    code:document.getElementById('f-code').value.trim(),
    name:document.getElementById('f-name').value.trim(),
    day:+document.getElementById('f-day').value,
    start:document.getElementById('f-st').value,
    end:document.getElementById('f-en2').value,
    room:document.getElementById('f-room').value.trim(),
    teacher:document.getElementById('f-teacher').value.trim(),
    credits:+document.getElementById('f-cr').value||3,
    color:document.getElementById('f-col').value,
    hex: document.getElementById('f-col').value==='custom'
    ? document.getElementById('f-rgb').value : null,
  };
  if(!d.name){showToast('กรุณากรอกชื่อวิชา');return}
  if(t2m(d.start)>=t2m(d.end)){showToast('เวลาสิ้นสุดต้องหลังเวลาเริ่ม');return}
  if(editId!=null){const i=courses.findIndex(c=>c.id===editId);if(i>=0)courses[i]={...courses[i],...d};}
  else courses.push({id:nextId++,...d});
  save();renderAll();closeM();showToast('บันทึกเรียบร้อย ✓');
}
function delC(){if(!confirm('ลบวิชานี้?'))return;courses=courses.filter(c=>c.id!==editId);save();renderAll();closeM();showToast('ลบวิชาแล้ว')}

/* ── DETAIL MODAL ── */
function openDetail(id){
  const c=courses.find(x=>x.id===id);if(!c)return;
  document.getElementById('d-code').textContent=c.code;
  document.getElementById('d-name').textContent=c.name;
  const rows=[
    {ico:'📅',lbl:'วัน',val:DAYFL[c.day]},
    {ico:'🕐',lbl:'เวลา',val:`${c.start} – ${c.end}`,mono:true},
    c.room?{ico:'🏛️',lbl:'ห้องเรียน',val:c.room}:null,
    c.teacher?{ico:'👤',lbl:'อาจารย์ผู้สอน',val:c.teacher}:null,
    {ico:'⭐',lbl:'หน่วยกิต',val:`${c.credits} หน่วยกิต`,mono:true},
  ].filter(Boolean);
  document.getElementById('d-body').innerHTML=rows.map(r=>`<div class="dr"><div class="dico">${r.ico}</div><div><div class="dlbl">${r.lbl}</div><div class="dval${r.mono?' mono':''}">${esc(r.val)}</div></div></div>`).join('');
  document.getElementById('d-ov').classList.add('op');
}
function closeD(){document.getElementById('d-ov').classList.remove('op')}

/* ── PIN ── */
function openPin(){pinStr='';updDots();document.getElementById('pin-err').textContent='';document.getElementById('pin-ov').classList.add('op')}
function closePin(){document.getElementById('pin-ov').classList.remove('op')}
function pk(k){
  if(k==='del')pinStr=pinStr.slice(0,-1);
  else if(k==='clr')pinStr='';
  else if(pinStr.length<6)pinStr+=k;
  updDots();
  if(pinStr.length===6)chkPin();
}
function updDots(){document.querySelectorAll('.pd').forEach((d,i)=>{d.classList.toggle('fi2',i<pinStr.length);d.classList.remove('err')})}

async function chkPin(){
  const pd = document.getElementById('pindots');
  const h  = await hashStr(pinStr);
  if(PIN_HASHES.includes(h)){          // ← เปลี่ยนจาก h===PIN_HASH
    pd.classList.add('ok');
    setTimeout(()=>{closePin();pd.classList.remove('ok');window.location.href='card.html'},550);
  } else {
    pd.classList.add('shake');
    document.querySelectorAll('.pd').forEach(d=>d.classList.add('err'));
    document.getElementById('pin-err').textContent='Incorrect PIN — Please try again';
    setTimeout(()=>{pd.classList.remove('shake');pinStr='';updDots();},650);
  }
}

/* ── ZOOM ── */
function openZoom(){
  document.getElementById('zoom-tt-head').innerHTML = document.getElementById('tt-head').innerHTML;
  document.getElementById('zoom-tt-body').innerHTML = document.getElementById('tt-body').innerHTML;
  document.getElementById('zoom-ov').classList.add('op');
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      const inner = document.getElementById('zoom-tt-inner');
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      inner.style.transform = 'none';
      const W = inner.offsetWidth || 700;
      const H = inner.offsetHeight || 200;
      const scale = Math.min(vw / H, vh / W) * 0.92;
      inner.style.transform = `rotate(90deg) scale(${scale})`;
    });
  });
}
function closeZoom(){document.getElementById('zoom-ov').classList.remove('op')}

/* ── RENDER ALL ── */
function renderAll(){
  upStats();renderGrid();renderCC();updateTimeLine();startCountdown();
  /* auto-scroll วันนี้ให้มองเห็น */
  setTimeout(()=>{
    const todayRow=document.querySelector('.tt-row.tt-today');
    if(todayRow)todayRow.scrollIntoView({behavior:'smooth',block:'nearest'});
  },350);
}

/* ── SERVICE WORKER ── */
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

/* ── KEYBOARD SHORTCUTS ── */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeM();closeD();closePin()}
  if(e.ctrlKey&&e.key==='e'){e.preventDefault();toggleEdit()}
  if(e.ctrlKey&&e.key==='k'){e.preventDefault();document.getElementById('search-inp').focus()}
});

/* ── TIME LINE ── */
function updateTimeLine(){
  const G_START=8*60,G_END=19*60,SPAN=G_END-G_START;
  const now=new Date();
  const cur=now.getHours()*60+now.getMinutes();
  const today=now.getDay();
  document.querySelectorAll('.time-line,.time-label').forEach(e=>e.remove());
  if(cur<G_START||cur>G_END||!DAYS_SHOW.includes(today))return;
  const pct=(cur-G_START)/SPAN*100;
  document.querySelectorAll('.tt-row.tt-today .tt-lane').forEach(lane=>{
    const line=document.createElement('div');
    line.className='time-line';
    line.style.left=`${pct}%`;
    const lbl=document.createElement('div');
    lbl.className='time-label';
    lbl.style.left=`${pct}%`;
    lbl.textContent=m2t(cur);
    lane.appendChild(line);
    lane.appendChild(lbl);
  });
}

/* ── CUSTOM COLOR ── */
function onColChange(){
  const v=document.getElementById('f-col').value;
  document.getElementById('fg-custom').style.display=v==='custom'?'block':'none';
}
function onRgbPick(hex){
  document.getElementById('f-hex').value=hex;
  document.getElementById('color-prev').style.background=hex;
}
function onHexType(val){
  if(/^#[0-9a-fA-F]{6}$/.test(val)){
    document.getElementById('f-rgb').value=val;
    document.getElementById('color-prev').style.background=val;
  }
}
function getStyle(c){
  if(c.color==='custom'&&c.hex){
    const h=c.hex,r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16);
    return {cls:'',style:`background:rgba(${r},${g},${b},.15);border-color:rgba(${r},${g},${b},.5);color:${h}`};
  }
  return {cls:COLORMAP[c.color]||'cm',style:''};
}

/* ── NOTIFICATIONS ── */
let notifTimers = [], _midnightTimer = null;

/* Helpers */
function getNotifEnabled(){ return localStorage.getItem('sc_notif_en') !== '0'; }
function getNotifMin(){ return parseInt(localStorage.getItem('sc_notif_min') || 10); }

function loadNotifSettings(){
  const sel = document.getElementById('np-min');
  if(sel) sel.value = getNotifMin();
}

function setNotifMin(v){
  localStorage.setItem('sc_notif_min', v);
  if(Notification.permission === 'granted' && getNotifEnabled()){
    scheduleNotifs();
    showToast(`อัปเดต: แจ้งเตือนก่อนเรียน ${v} นาที`);
  }
}

/* สร้างรายการ notification 7 วันข้างหน้า */
function buildSchedule(){
  const now = new Date(), min = getNotifMin(), items = [];
  for(let d = 0; d < 7; d++){
    const base = new Date(now);
    base.setDate(base.getDate() + d);
    base.setHours(0, 0, 0, 0);
    const dow = base.getDay();
    courses.filter(c => c.day === dow).forEach(c => {
      const [h, m] = c.start.split(':').map(Number);
      const fire = new Date(base);
      fire.setHours(h, m - min, 0, 0);
      const delay = fire.getTime() - now.getTime();
      if(delay <= 0) return;
      items.push({
        timestamp : fire.getTime(),
        delay,
        title : `📚 ${c.name}`,
        body  : `เริ่มในอีก ${min} นาที · ${c.start}–${c.end}${c.room ? ' · ' + c.room : ''}`,
        tag   : `noynay-${c.id}-${base.toISOString().slice(0,10)}`
      });
    });
  }
  return items;
}

/* ตั้ง timer ทั้งใน page และ SW ครอบคลุม 7 วัน */
async function scheduleNotifs(){
  notifTimers.forEach(t => clearTimeout(t)); notifTimers = [];
  if(Notification.permission !== 'granted' || !getNotifEnabled()) return 0;

  const items = buildSchedule();

  /* 1) Local setTimeout — ทำงานตลอดที่ page เปิดอยู่ */
  items.forEach(item => {
    notifTimers.push(setTimeout(() => {
      if(navigator.vibrate) navigator.vibrate([200,100,200]);
      new Notification(item.title, {
        body  : item.body,
        icon  : './icons/icon-192.png',
        tag   : item.tag,
        silent: false
      });
    }, item.delay));
  });

  /* 2) ส่งให้ Service Worker — ทำงานแม้ tab จะ hidden แต่ browser ยังเปิดอยู่ */
  await _sendToSW({ type: 'SCHEDULE_NOTIFS', schedule: items });

  /* 3) Reschedule อัตโนมัติตอนเที่ยงคืน เพื่อดึง window 7 วันใหม่ */
  if(_midnightTimer) clearTimeout(_midnightTimer);
  const tmr = new Date(); tmr.setDate(tmr.getDate() + 1); tmr.setHours(0, 1, 0, 0);
  _midnightTimer = setTimeout(() => scheduleNotifs(), tmr.getTime() - Date.now());

  return items.length;
}

async function _sendToSW(msg){
  if(!('serviceWorker' in navigator)) return;
  try{
    const reg = await navigator.serviceWorker.getRegistration();
    if(reg?.active) reg.active.postMessage(msg);
  }catch(_){}
}

async function toggleNotif(){
  if(!('Notification' in window)){ showToast('Browser ไม่รองรับการแจ้งเตือน'); return; }

  const isOn = Notification.permission === 'granted' && getNotifEnabled();

  if(isOn){
    /* ปิด — ล้าง timer ทั้ง page และ SW + บันทึก flag */
    notifTimers.forEach(t => clearTimeout(t)); notifTimers = [];
    if(_midnightTimer){ clearTimeout(_midnightTimer); _midnightTimer = null; }
    localStorage.setItem('sc_notif_en', '0');
    await _sendToSW({ type: 'CANCEL_NOTIFS' });
    showToast('ปิดแจ้งเตือนแล้ว');
    updateNotifUI(); closeNotifPop(); return;
  }

  if(Notification.permission === 'denied'){
    showToast('กรุณาเปิดสิทธิ์แจ้งเตือนใน Browser Settings');
    closeNotifPop(); return;
  }

  const perm = await Notification.requestPermission();
  if(perm !== 'granted'){ showToast('ไม่ได้รับสิทธิ์แจ้งเตือน'); updateNotifUI(); return; }

  localStorage.setItem('sc_notif_en', '1');
  const cnt = await scheduleNotifs();
  showToast(`เปิดแจ้งเตือนแล้ว · ${cnt} คาบใน 7 วันข้างหน้า`);
  updateNotifUI(); closeNotifPop();
}

function updateNotifUI(){
  const on     = Notification.permission === 'granted' && getNotifEnabled();
  const denied = Notification.permission === 'denied';
  const btn    = document.getElementById('notif-btn');
  const npBtn  = document.getElementById('np-toggle');
  const lbl    = document.getElementById('np-btn-lbl');
  const st     = document.getElementById('np-status');
  if(btn)   btn.classList.toggle('on', on);
  if(npBtn) npBtn.classList.toggle('off-state', on);
  if(lbl)   lbl.textContent = on ? 'ปิดแจ้งเตือน' : 'เปิดแจ้งเตือน';
  if(st){
    st.textContent = on     ? `✓ เปิดอยู่ · แจ้งเตือนก่อน ${getNotifMin()} นาที`
                   : denied ? '⚠ ถูกบล็อกใน Browser Settings'
                   :          'ยังไม่ได้เปิดแจ้งเตือน';
    st.className = 'np-status ' + (on ? 'on' : 'off');
  }
}

function openNotifPop(){
  const pop = document.getElementById('notif-pop');
  const wasOpen = pop.classList.contains('op');
  pop.classList.toggle('op', !wasOpen);
  if(!wasOpen){
    updateNotifUI();
    const today = new Date().getDay();
    const tc = courses.filter(c => c.day === today).sort((a,b) => t2m(a.start) - t2m(b.start));
    const el = document.getElementById('np-today');
    el.innerHTML = '<strong>วันนี้</strong><br>' + (tc.length
      ? tc.map(c => `${c.start} ${c.name}`).join('<br>')
      : 'ไม่มีคาบเรียน');
    el.classList.add('has');
  }
}
function closeNotifPop(){ document.getElementById('notif-pop').classList.remove('op'); }

/* ── INIT ── */
load(); renderAll(); loadNotifSettings(); updateNotifUI();
if(Notification.permission === 'granted' && getNotifEnabled()) scheduleNotifs();
setInterval(updateTimeLine, 60000);

/* Re-schedule เมื่อ SW update หรือ browser เปิดใหม่ */
if('serviceWorker' in navigator){
  navigator.serviceWorker.addEventListener('message', e => {
    if(e.data?.type === 'SW_READY' && Notification.permission === 'granted' && getNotifEnabled())
      scheduleNotifs();
  });
}

/* Re-schedule เมื่อ user กลับมาที่ tab (เช่น กลับมาเปิดหลังข้ามวัน) */
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'visible' && Notification.permission === 'granted' && getNotifEnabled())
    scheduleNotifs();
});

/* ปิด notif pop เมื่อคลิกนอก */
document.addEventListener('click', e => {
  const pop = document.getElementById('notif-pop');
  const btn = document.getElementById('notif-btn');
  if(pop && !pop.contains(e.target) && e.target !== btn && !btn.contains(e.target)) closeNotifPop();
});

/* ══════════════════════════════════════════════
   NEW FEATURES v0.1.2
   ══════════════════════════════════════════════ */

/* ── COUNTDOWN TO NEXT CLASS ── */
let _cdInterval = null;

function _getNextClassInfo(){
  const now = new Date();
  const curMin = now.getHours()*60 + now.getMinutes();
  const today = now.getDay();

  /* คาบวันนี้ที่ยังไม่จบ */
  const todayRem = courses
    .filter(c => c.day===today && t2m(c.end)>curMin)
    .sort((a,b)=>t2m(a.start)-t2m(b.start));

  if(todayRem.length){
    const c = todayRem[0];
    const startMin = t2m(c.start);
    if(curMin >= startMin){
      /* กำลังเรียนอยู่ */
      const remSec = (t2m(c.end)-curMin)*60 - now.getSeconds();
      return {type:'now', course:c, remSec};
    } else {
      /* คาบต่อไปวันนี้ */
      const remSec = (startMin-curMin)*60 - now.getSeconds();
      return {type:'next', course:c, remSec};
    }
  }

  /* หาคาบถัดไปในสัปดาห์ */
  for(let d=1; d<=6; d++){
    const dow = (today+d)%7;
    const cls = courses.filter(c=>c.day===dow).sort((a,b)=>t2m(a.start)-t2m(b.start));
    if(cls.length){
      const c = cls[0];
      const target = new Date(now);
      target.setDate(target.getDate()+d);
      const [h,m] = c.start.split(':').map(Number);
      target.setHours(h,m,0,0);
      const remSec = Math.max(0, Math.floor((target-now)/1000));
      return {type:'future', course:c, remSec, days:d};
    }
  }
  return null;
}

function _fmtTimer(sec){
  if(sec<0) sec=0;
  const h=Math.floor(sec/3600);
  const m=Math.floor((sec%3600)/60);
  const s=sec%60;
  if(h>0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

const _DAY_SHORT=['อา','จ','อ','พ','พฤ','ศ','ส'];

function updateCountdown(){
  const card = document.getElementById('countdown-card');
  if(!card) return;
  const info = _getNextClassInfo();
  if(!info || !courses.length){ card.style.display='none'; return; }

  card.style.display='flex';
  const icon  = document.getElementById('cd-icon');
  const label = document.getElementById('cd-label');
  const name  = document.getElementById('cd-name');
  const meta  = document.getElementById('cd-meta');
  const timer = document.getElementById('cd-timer');

  if(info.type==='now'){
    if(icon)  icon.textContent='🔴';
    if(label) label.textContent='กำลังเรียนอยู่ — เหลืออีก';
    card.classList.add('cd-active');
  } else {
    if(icon)  icon.textContent='📚';
    const dayLabel = info.type==='future'
      ? `คาบต่อไป (${_DAY_SHORT[info.course.day]})`
      : 'คาบต่อไปวันนี้';
    if(label) label.textContent=dayLabel;
    card.classList.remove('cd-active');
  }

  if(name) name.textContent=info.course.name;
  if(meta) meta.textContent=`${info.course.start}–${info.course.end}${info.course.room?' · '+info.course.room:''}`;
  if(timer) timer.textContent=_fmtTimer(info.remSec);

  /* ลด remSec ทีละวินาที */
  info.remSec--;
}

function startCountdown(){
  if(_cdInterval) clearInterval(_cdInterval);
  updateCountdown();
  _cdInterval = setInterval(updateCountdown, 1000);
}

/* ── INSTALL PROMPT ── */
let _deferredInstall = null;

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _deferredInstall = e;
  if(!localStorage.getItem('sc_install_dismissed')){
    document.getElementById('install-banner')?.classList.add('show');
  }
});

window.addEventListener('appinstalled', () => {
  _deferredInstall = null;
  document.getElementById('install-banner')?.classList.remove('show');
  showToast('ติดตั้งแอปเรียบร้อย ✓');
});

async function doInstall(){
  if(!_deferredInstall) return;
  dismissInstall();
  _deferredInstall.prompt();
  const { outcome } = await _deferredInstall.userChoice;
  _deferredInstall = null;
  if(outcome==='accepted') showToast('ติดตั้งแล้ว ✓');
}

function dismissInstall(){
  document.getElementById('install-banner')?.classList.remove('show');
  localStorage.setItem('sc_install_dismissed','1');
}

/* ── PULL-TO-REFRESH ── */
(()=>{
  let startY=0, pulling=false, released=false;
  const THRESHOLD=72;
  const wrap = ()=>document.getElementById('ptr-wrap');
  const txt  = ()=>document.getElementById('ptr-txt');

  document.addEventListener('touchstart', e=>{
    if(window.scrollY===0 && e.touches[0]) startY=e.touches[0].clientY;
    else startY=0;
    pulling=false; released=false;
  },{passive:true});

  document.addEventListener('touchmove', e=>{
    if(!startY || released) return;
    const dy = e.touches[0].clientY - startY;
    if(dy<16) return;
    pulling=true;
    const el=wrap(); const t=txt();
    if(!el) return;
    el.classList.add('ptr-pulling');
    el.classList.remove('ptr-loading');
    if(t) t.textContent = dy>=THRESHOLD ? 'ปล่อยเพื่อรีเฟรช ↑' : 'ดึงเพื่อรีเฟรช ↓';
    /* rotate spinner จาก progress */
    const deg=Math.min(360, (dy/THRESHOLD)*360);
    const svgEl=el.querySelector('svg');
    if(svgEl) svgEl.style.transform=`rotate(${deg}deg)`;
  },{passive:true});

  document.addEventListener('touchend', e=>{
    if(!pulling){startY=0;return;}
    released=true;
    const dy=(e.changedTouches[0]?.clientY||0)-startY;
    const el=wrap(); const t=txt();
    if(dy>=THRESHOLD){
      if(el){ el.classList.add('ptr-loading'); el.classList.remove('ptr-pulling'); }
      if(t) t.textContent='กำลังรีเฟรช...';
      setTimeout(()=>{
        renderAll();
        showToast('รีเฟรชแล้ว ✓');
        if(el){ el.classList.remove('ptr-loading','ptr-pulling'); }
        startY=0; pulling=false; released=false;
      },700);
    } else {
      if(el) el.classList.remove('ptr-pulling','ptr-loading');
      startY=0; pulling=false; released=false;
    }
  },{passive:true});
})();
