const SUPABASE_URL='https://wuflhovtbvocjpalblab.supabase.co';
const SUPABASE_KEY='sb_publishable_58URlpq7aVTG1JyFydodWw_5EiWSPWD';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const DAY=86400000,now=Date.now();
const statusMeta={new:{label:'New',color:'#8996a8'},contacted:{label:'Contacted',color:'#2878ff'},qualified:{label:'Qualified',color:'#7459ec'},nurturing:{label:'Nurturing',color:'#e9a12b'},converted:{label:'Converted',color:'#16a36a'},unqualified:{label:'Unqualified',color:'#e94f64'}};
const seed=[
  {name:'Nadia Pratama',organization:'IPB University',email:'nadia@ipb.ac.id',phone:'081234567890',source:'LinkedIn',status:'qualified',value:85000000,followup:new Date(now+DAY*.2).toISOString(),notes:'Membutuhkan platform career center terintegrasi.',createdAt:new Date(now-DAY*.2).toISOString()},
  {name:'Rizky Maulana',organization:'Yayasan Cendekia',email:'rizky@cendekia.id',phone:'081298765432',source:'Referral',status:'contacted',value:42000000,followup:new Date(now-DAY).toISOString(),notes:'Kirim proposal program leadership semester depan.',createdAt:new Date(now-DAY).toISOString()},
  {name:'Salsa Putri',organization:'SMA Global Mandiri',email:'salsa@global.sch.id',phone:'081277733344',source:'Event',status:'new',value:28000000,followup:new Date(now+DAY*2).toISOString(),notes:'Tertarik dengan program persiapan karier siswa.',createdAt:new Date(now-DAY*2).toISOString()},
  {name:'Arif Rahman',organization:'PT Nusantara Digital',email:'arif@nusantaradigital.id',phone:'081388112233',source:'Website',status:'nurturing',value:120000000,followup:new Date(now+DAY*5).toISOString(),notes:'Diskusi sistem digital dan dashboard analytics.',createdAt:new Date(now-DAY*3).toISOString()},
  {name:'Dinda Maharani',organization:'Universitas Presiden',email:'dinda@president.ac.id',phone:'081512345600',source:'LinkedIn',status:'converted',value:75000000,followup:'',notes:'Client aktif untuk pengembangan website career center.',createdAt:new Date(now-DAY*5).toISOString()},
  {name:'Fajar Hidayat',organization:'Dinas Pendidikan Bogor',email:'fajar@bogorkab.go.id',phone:'081290001122',source:'Referral',status:'qualified',value:95000000,followup:new Date(now+DAY).toISOString(),notes:'Menunggu penjadwalan presentasi konsep.',createdAt:new Date(now-DAY*6).toISOString()},
  {name:'Lia Kurnia',organization:'Komunitas Pemimpin Muda',email:'lia@kpm.id',phone:'082177554433',source:'Instagram',status:'new',value:15000000,followup:new Date(now+DAY*3).toISOString(),notes:'Masuk dari campaign Instagram.',createdAt:new Date(now-DAY*7).toISOString()},
  {name:'Muhammad Akbar',organization:'PT Geo Investama Mandiri',email:'akbar@geoinvestama.co.id',phone:'081311223344',source:'Event',status:'converted',value:60000000,followup:'',notes:'Training SQL dan LIDA.',createdAt:new Date(now-DAY*9).toISOString()},
  {name:'Rani Wulandari',organization:'HSC IPB',email:'rani@hscipb.id',phone:'081234450987',source:'Referral',status:'nurturing',value:48000000,followup:new Date(now+DAY*7).toISOString(),notes:'Pengembangan training management system.',createdAt:new Date(now-DAY*12).toISOString()}
].map(x=>({id:crypto.randomUUID(),...x}));
let leads=(JSON.parse(localStorage.getItem('optima_leads_v2')||'null')||seed).map((x,i)=>({...x,value:Number(x.value)||[85000000,42000000,28000000][i%3],createdAt:x.createdAt||new Date(now-i*DAY).toISOString()}));
let currentUser=JSON.parse(sessionStorage.getItem('optima_user')||'null'),taskFilter='all';
const save=()=>localStorage.setItem('optima_leads_v2',JSON.stringify(leads));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(v)||0).replace('Rp','Rp ');
const date=v=>v?new Date(v).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}):'-';
const dateTime=v=>v?new Date(v).toLocaleString('id-ID',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'-';
const initials=n=>String(n||'O').split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase();
const badge=s=>`<span class="badge ${s}">${statusMeta[s]?.label||s}</span>`;
function toast(message){$('#toast p').textContent=message;$('#toast').classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').classList.remove('show'),2600)}

async function login(email,password){
  const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{method:'POST',headers:{'Content-Type':'application/json','apikey':SUPABASE_KEY},body:JSON.stringify({email,password})});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error_description||data.msg||'Email atau password tidak sesuai.');
  return{name:data.user?.user_metadata?.full_name||email.split('@')[0],email,token:data.access_token,mode:'supabase'};
}
function showApp(user){
  currentUser=user;sessionStorage.setItem('optima_user',JSON.stringify(user));$('#loginView').classList.add('hidden');$('#appView').classList.remove('hidden');
  $('#userName').textContent=user.name||user.email||'Optima User';$('#userRole').textContent=user.mode==='demo'?'Demo Workspace':'CRM Administrator';$('#avatar').textContent=initials(user.name||user.email);
  const hour=new Date().getHours(),salute=hour<11?'Selamat pagi':hour<15?'Selamat siang':hour<18?'Selamat sore':'Selamat malam';$('#greeting').textContent=`${salute}, ${String(user.name||'Tim').split(' ')[0]} 👋`;renderAll();
}
function logout(){sessionStorage.removeItem('optima_user');location.reload()}

const pageMap={dashboard:['RINGKASAN OPERASIONAL','Dashboard','Pantau performa tim dan tindakan prioritas hari ini.'],leads:['CRM DATABASE','CRM Leads','Kelola seluruh prospek, sumber, dan rencana tindak lanjut.'],pipeline:['SALES MANAGEMENT','Sales Pipeline','Pantau pergerakan peluang pada setiap tahapan penjualan.'],followups:['ACTION CENTER','Follow-up','Pastikan setiap peluang ditindaklanjuti tepat waktu.'],clients:['CUSTOMER SUCCESS','Clients','Kelola hubungan dan nilai kerja sama client aktif.'],settings:['WORKSPACE','Pengaturan','Sesuaikan identitas dan preferensi workspace.']};
function setView(name){
  $$('.view').forEach(v=>v.classList.add('hidden'));$(`#${name}View`)?.classList.remove('hidden');$$('.nav').forEach(n=>n.classList.toggle('active',n.dataset.view===name));
  const copy=pageMap[name]||pageMap.dashboard;$('#pageEyebrow').textContent=copy[0];$('#pageTitle').textContent=copy[1];$('#pageSubtitle').textContent=copy[2];
  $('.header-actions').classList.toggle('hidden',name==='settings');closeSidebar();if(name==='pipeline')renderPipeline();if(name==='clients')renderClients();
}
function renderAll(){save();renderDashboard();renderLeads();renderPipeline();renderFollowups();renderClients();const overdue=leads.filter(isOverdue).length;$('#navLeadCount').textContent=leads.length;$('#navOverdueCount').textContent=overdue;$('#welcomeOverdue').textContent=`${overdue} follow-up`;}
function isOverdue(x){return x.followup&&new Date(x.followup)<new Date()&&x.status!=='converted'}
function renderDashboard(){
  const counts=Object.fromEntries(Object.keys(statusMeta).map(s=>[s,leads.filter(x=>x.status===s).length])),overdue=leads.filter(isOverdue).length,total=Math.max(leads.length,1);
  $('#totalLead').textContent=leads.length;$('#qualifiedLead').textContent=counts.qualified;$('#activeClient').textContent=counts.converted;$('#overdueCount').textContent=overdue;$('#qualifiedRate').textContent=`${Math.round(counts.qualified/total*100)}%`;$('#donutTotal').textContent=leads.length;
  const shown=['new','contacted','qualified','nurturing','converted'],segments=[],legend=[];let cursor=0;shown.forEach(s=>{const pct=counts[s]/total*100;segments.push(`${statusMeta[s].color} ${cursor}% ${cursor+pct}%`);cursor+=pct;legend.push(`<div class="legend-row"><i style="background:${statusMeta[s].color}"></i><span>${statusMeta[s].label}</span><b>${counts[s]}</b></div>`)});segments.push(`#e3e8ee ${cursor}% 100%`);$('#pipelineDonut').style.background=`conic-gradient(${segments.join(',')})`;$('#pipelineLegend').innerHTML=legend.join('');
  $('#recentLeads').innerHTML=[...leads].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5).map(x=>`<div class="lead-line clickable" data-detail="${x.id}"><span class="lead-avatar">${initials(x.name)}</span><div><strong>${esc(x.name)}</strong><small>${esc(x.organization||'Individu')} · ${esc(x.source)}</small></div>${badge(x.status)}</div>`).join('')||empty('Belum ada lead.');
  const tasks=leads.filter(x=>x.followup&&x.status!=='converted').sort((a,b)=>new Date(a.followup)-new Date(b.followup)).slice(0,4);$('#todayLabel').textContent=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'short'});$('#todayFollowups').innerHTML=tasks.map(x=>`<div class="task-line"><button class="task-check" data-complete="${x.id}"><svg><use href="#i-check"/></svg></button><div><strong>${esc(x.name)}</strong><small>${esc(x.notes||'Follow-up prospek')}</small></div><span class="task-time">${dateTime(x.followup)}</span></div>`).join('')||empty('Tidak ada follow-up aktif.');
}
function filtered(){const q=$('#searchLead').value.toLowerCase().trim(),status=$('#statusFilter').value,source=$('#sourceFilter').value;return leads.filter(x=>(!q||`${x.name} ${x.organization} ${x.email}`.toLowerCase().includes(q))&&(!status||x.status===status)&&(!source||x.source===source))}
function renderLeads(){
  const rows=filtered();$('#resultCount').textContent=`${rows.length} lead`;$('#tableInfo').textContent=`Menampilkan ${rows.length} dari ${leads.length} data`;
  $('#leadRows').innerHTML=rows.map(x=>`<tr><td><input type="checkbox" aria-label="Pilih ${esc(x.name)}"></td><td class="clickable" data-detail="${x.id}"><div class="row-name"><span class="table-avatar">${initials(x.name)}</span><span>${esc(x.name)}<span class="row-sub">${esc(x.email||x.phone||'-')}</span></span></div></td><td>${esc(x.organization||'-')}</td><td>${badge(x.status)}</td><td>${esc(x.source)}</td><td class="${isOverdue(x)?'task-time':''}">${dateTime(x.followup)}</td><td><button class="mini-button" data-detail="${x.id}">Lihat detail</button></td></tr>`).join('')||`<tr><td colspan="7" class="empty-cell">Data tidak ditemukan. Coba ubah kata kunci atau filter.</td></tr>`;
}
function renderPipeline(){
  const stages=['new','contacted','qualified','nurturing','converted'],active=leads.filter(x=>stages.includes(x.status)),total=active.reduce((s,x)=>s+(Number(x.value)||0),0);
  $('#pipelineSummary').innerHTML=`<article><span>Total pipeline value</span><strong>${money(total)}</strong></article><article><span>Peluang aktif</span><strong>${active.filter(x=>x.status!=='converted').length} leads</strong></article><article><span>Conversion rate</span><strong>${Math.round(leads.filter(x=>x.status==='converted').length/Math.max(leads.length,1)*100)}%</strong></article>`;
  $('#kanbanBoard').innerHTML=stages.map(s=>{const cards=leads.filter(x=>x.status===s);return `<section class="kanban-column"><div class="kanban-head"><i style="background:${statusMeta[s].color}"></i><span>${statusMeta[s].label}</span><b>${cards.length}</b></div>${cards.map(x=>`<article class="kanban-card" data-detail="${x.id}"><strong>${esc(x.name)}</strong><small>${esc(x.organization||'Individu')}</small><div class="card-value"><span>${money(x.value)}</span><span>${date(x.followup)}</span></div></article>`).join('')||empty('Belum ada lead')}</section>`}).join('');
}
function taskGroup(x){if(isOverdue(x))return'overdue';const d=new Date(x.followup),today=new Date();return d.toDateString()===today.toDateString()?'today':'upcoming'}
function renderFollowups(){
  let rows=leads.filter(x=>x.followup&&x.status!=='converted').sort((a,b)=>new Date(a.followup)-new Date(b.followup));if(taskFilter!=='all')rows=rows.filter(x=>taskGroup(x)===taskFilter);
  $('#followupRows').innerHTML=rows.map(x=>{const late=isOverdue(x);return `<tr><td><div class="row-name"><span class="table-avatar">${initials(x.name)}</span><span>${esc(x.name)}<span class="row-sub">${esc(x.organization||'-')}</span></span></div></td><td>${esc(x.notes||'Follow-up prospek')}</td><td class="${late?'task-time':''}">${dateTime(x.followup)}</td><td><span class="priority ${late?'':'normal'}">${late?'Tinggi':'Normal'}</span></td><td>${late?'<span class="badge unqualified">Terlambat</span>':'<span class="badge contacted">Terjadwal</span>'}</td><td><button class="mini-button" data-complete="${x.id}">Selesaikan</button></td></tr>`}).join('')||`<tr><td colspan="6" class="empty-cell">Tidak ada follow-up dalam kategori ini.</td></tr>`;
}
function renderClients(){const clients=leads.filter(x=>x.status==='converted');$('#clientGrid').innerHTML=clients.map(x=>`<article class="panel client-card"><div class="client-card-top"><span class="client-logo">${initials(x.organization||x.name)}</span>${badge('converted')}</div><h3>${esc(x.organization||x.name)}</h3><p>Contact person: ${esc(x.name)}</p><div class="client-meta"><div><span>Nilai kerja sama</span><strong>${money(x.value)}</strong></div><div><span>Sejak</span><strong>${date(x.createdAt)}</strong></div></div></article>`).join('')||empty('Belum ada client aktif.')}
function empty(message){return`<p class="row-sub" style="padding:16px 4px">${message}</p>`}

function openLeadModal(id){
  const form=$('#leadForm');form.reset();form.elements.id.value='';$('#leadModalTitle').textContent='Tambah Lead Baru';
  if(id){const x=leads.find(l=>l.id===id);if(!x)return;$('#leadModalTitle').textContent='Edit Informasi Lead';Object.entries(x).forEach(([k,v])=>{if(form.elements[k])form.elements[k].value=k==='followup'&&v?new Date(v).toISOString().slice(0,16):v})}
  $('#leadDialog').showModal();
}
function openDetail(id){
  const x=leads.find(l=>l.id===id);if(!x)return;$('#drawerName').textContent=x.name;$('#drawerContent').innerHTML=`<div class="drawer-profile"><span class="lead-avatar">${initials(x.name)}</span><h3>${esc(x.name)}</h3><p>${esc(x.organization||'Individu')}</p></div><div class="drawer-actions"><button class="button primary" data-edit="${x.id}">Edit lead</button><button class="button secondary" data-advance="${x.id}">Update status</button></div><section class="drawer-section"><h4>Informasi kontak</h4><div class="info-row"><span>Email</span><b>${esc(x.email||'-')}</b></div><div class="info-row"><span>WhatsApp</span><b>${esc(x.phone||'-')}</b></div><div class="info-row"><span>Sumber</span><b>${esc(x.source)}</b></div><div class="info-row"><span>Status</span><b>${badge(x.status)}</b></div><div class="info-row"><span>Nilai peluang</span><b>${money(x.value)}</b></div><div class="info-row"><span>Follow-up</span><b>${dateTime(x.followup)}</b></div></section><section class="drawer-section"><h4>Catatan terakhir</h4><div class="drawer-note">${esc(x.notes||'Belum ada catatan untuk lead ini.')}</div></section><section class="drawer-section"><button class="link-button danger-text" data-delete="${x.id}">Hapus lead</button></section>`;$('#detailDrawer').classList.add('open');$('#drawerOverlay').classList.add('open');
}
function closeDrawer(){$('#detailDrawer').classList.remove('open');$('#drawerOverlay').classList.remove('open')}
function advance(id){const stages=['new','contacted','qualified','nurturing','converted'];const x=leads.find(l=>l.id===id);if(!x)return;const idx=stages.indexOf(x.status);x.status=stages[Math.min(Math.max(idx,0)+1,stages.length-1)];renderAll();openDetail(id);toast(`Status diperbarui menjadi ${statusMeta[x.status].label}`)}
function complete(id){const x=leads.find(l=>l.id===id);if(!x)return;x.followup='';renderAll();toast('Follow-up ditandai selesai')}
function closeSidebar(){$('#sidebar').classList.remove('open');$('#sidebarOverlay').classList.remove('open')}

$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const button=e.submitter,alert=$('#loginAlert');alert.classList.add('hidden');button.disabled=true;button.querySelector('span').textContent='Memverifikasi...';try{showApp(await login($('#email').value,$('#password').value))}catch(err){alert.textContent=err.message;alert.classList.remove('hidden')}finally{button.disabled=false;button.querySelector('span').textContent='Masuk ke OPTIMA'}});
$('#demoButton').addEventListener('click',()=>showApp({name:'Demo OPTIMA',email:'demo@optima.id',mode:'demo'}));$('#logoutButton').addEventListener('click',logout);
$('#togglePassword').addEventListener('click',()=>{const input=$('#password'),show=input.type==='password';input.type=show?'text':'password';$('#togglePassword').textContent=show?'Sembunyikan':'Lihat'});
$('#forgotButton').addEventListener('click',()=>toast('Hubungi administrator untuk reset password'));
$$('.nav').forEach(n=>n.addEventListener('click',()=>setView(n.dataset.view)));$$('[data-go]').forEach(n=>n.addEventListener('click',()=>setView(n.dataset.go)));
['addLeadButton','quickAdd'].forEach(id=>$(`#${id}`).addEventListener('click',()=>openLeadModal()));
$('#leadForm').addEventListener('submit',e=>{if(e.submitter?.value==='cancel')return;e.preventDefault();const d=Object.fromEntries(new FormData(e.target)),existing=leads.find(x=>x.id===d.id);d.value=Number(d.value)||0;d.followup=d.followup?new Date(d.followup).toISOString():'';if(existing)Object.assign(existing,d);else leads.unshift({...d,id:crypto.randomUUID(),createdAt:new Date().toISOString()});$('#leadDialog').close();renderAll();setView('leads');toast(existing?'Perubahan lead berhasil disimpan':'Lead baru berhasil ditambahkan')});
$('#searchLead').addEventListener('input',renderLeads);$('#statusFilter').addEventListener('change',renderLeads);$('#sourceFilter').addEventListener('change',renderLeads);
document.addEventListener('click',e=>{const detail=e.target.closest('[data-detail]'),completeButton=e.target.closest('[data-complete]'),edit=e.target.closest('[data-edit]'),next=e.target.closest('[data-advance]'),del=e.target.closest('[data-delete]');if(detail)openDetail(detail.dataset.detail);if(completeButton)complete(completeButton.dataset.complete);if(edit){const id=edit.dataset.edit;closeDrawer();openLeadModal(id)}if(next)advance(next.dataset.advance);if(del&&confirm('Hapus lead ini dari data demo?')){leads=leads.filter(x=>x.id!==del.dataset.delete);closeDrawer();renderAll();toast('Lead berhasil dihapus')}});
$$('[data-task-filter]').forEach(b=>b.addEventListener('click',()=>{taskFilter=b.dataset.taskFilter;$$('[data-task-filter]').forEach(x=>x.classList.toggle('active',x===b));renderFollowups()}));
$('#closeDrawer').addEventListener('click',closeDrawer);$('#drawerOverlay').addEventListener('click',closeDrawer);$('#menuButton').addEventListener('click',()=>{$('#sidebar').classList.add('open');$('#sidebarOverlay').classList.add('open')});$('#closeSidebar').addEventListener('click',closeSidebar);$('#sidebarOverlay').addEventListener('click',closeSidebar);
$('#globalSearch').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.value.trim()){setView('leads');$('#searchLead').value=e.target.value;renderLeads()}});document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#globalSearch').focus()}if(e.key==='Escape')closeDrawer()});
$('#exportButton').addEventListener('click',()=>{const fields=['name','organization','email','phone','source','status','value','followup','notes'],csv=[fields.join(','),...leads.map(x=>fields.map(f=>`"${String(x[f]??'').replaceAll('"','""')}"`).join(','))].join('\n'),blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`optima-leads-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);toast('Data CRM berhasil diekspor')});
$('#saveSettings').addEventListener('click',()=>toast('Pengaturan workspace berhasil disimpan'));$('#guideButton').addEventListener('click',()=>toast('Panduan interaktif akan segera tersedia'));$('#notificationButton').addEventListener('click',()=>toast(`${leads.filter(isOverdue).length} follow-up membutuhkan perhatian`));
if(currentUser)showApp(currentUser);
