// utils
const $ = (q, el = document) => el.querySelector(q),
      $$ = (q, el = document) => [...el.querySelectorAll(q)];

// --- Menu
function initMenu(){
  const b = $('.menu__btn');
  if(!b) return;
  const l = $('.menu__list');
  b.addEventListener('click', ()=>{
    const open = l.style.display === 'block';
    l.style.display = open ? 'none' : 'block';
    b.setAttribute('aria-expanded', String(!open));
  });
  document.addEventListener('click', e=>{
    if(!b.contains(e.target) && !l.contains(e.target)) l.style.display = 'none';
  });
}

// --- 30-60-90 Plan
const phaseDetails = {
  "0–30 · Align (JTBD Discovery)": {
    bullets: [
      "JTBD interviews & shadowing (Talent/L&D/Comp/WFP/HR Ops)",
      "Map jobs → pains → outcomes → early ROI levers",
      "Seed backlog; define success metrics & telemetry"
    ]
  },
  "0–30 · Assess (Values & Guardrails)": {
    bullets: [
      "Privacy/DPIA, fairness checks, identity & access guardrails",
      "Approval gates & incident response paths",
      "Governance heatmap and risk tiers"
    ]
  },
  "30–60 · Architect (Product Patterns)": {
    bullets: [
      "Human + AI workflows aligned to JTBD (agent/RAG/analytics)",
      "Eval strategy & model cards; feedback instrumentation",
      "Experience maps; rollout & change approach"
    ]
  },
  "30–60 · Activate (Prototype)": {
    bullets: [
      "Low-code pilots for 2 Quick Wins + 1 Strategic Bet",
      "Weekly demos; stakeholder working sessions",
      "ROI telemetry: time saved, deflection, outcome quality"
    ]
  },
  "60–90 · Adopt (Enable & Scale)": {
    bullets: [
      "Enablement playbooks; manager & HRBP training",
      "Scale patterns via COE; platform/integration hardening",
      "KPI dashboards by sub-org"
    ]
  },
  "60–90 · Assure (Improve)": {
    bullets: [
      "Bias & drift monitoring; red-teaming; audit trails",
      "Feedback loops; incident postmortems; roadmap refresh",
      "Quarterly governance review"
    ]
  }
};

function initPlan(){
  const d = $('#phaseDetail');
  if(!d) return;
  const body = d.querySelector('.plan__content');
  const k = Object.keys(phaseDetails)[0];
  body.innerHTML = `<ul class="bullets">${phaseDetails[k].bullets.map(b=>`<li>${b}</li>`).join('')}</ul>`;
  d.querySelector('h4').textContent = k;
  $$('.plan__phase').forEach(p => p.addEventListener('click', ()=>{
    const key = p.dataset.phase;
    const x = phaseDetails[key];
    body.innerHTML = `<ul class="bullets">${x.bullets.map(b=>`<li>${b}</li>`).join('')}</ul>`;
    d.querySelector('h4').textContent = key;
  }));
}

// --- Impact Matrix
const ideas = [];
function calcScore(i,e,r){ return Math.round((i*2 - (e + r)) * 10) / 10; }

function renderMatrix(){
  const c = $('#impactCanvas'); if(!c) return;
  const ctx = c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
  const pad = 40;
  ctx.globalAlpha = .7;
  ctx.strokeStyle = 'rgba(160,180,220,.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, c.height/2); ctx.lineTo(c.width - pad, c.height/2);
  ctx.moveTo(c.width/2, pad);   ctx.lineTo(c.width/2, c.height - pad);
  ctx.stroke();

  ideas.forEach(it=>{
    const x = pad + (c.width - pad*2) * (it.impact - 1) / 9;
    const y = (c.height - pad) - (c.height - pad*2) * (10 - it.effort) / 9;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI*2);
    const a = Math.min(.85, .15 + it.risk * 0.07);
    ctx.fillStyle = `rgba(239,68,68,${a})`;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = it.score >= 8 ? 'rgba(45,212,191,.9)' :
                      it.score >= 4 ? 'rgba(245,158,11,.9)' :
                                      'rgba(239,68,68,.9)';
    ctx.stroke();
  });
}

function renderImpactTable(){
  const tb = $('#impactTable tbody'); if(!tb) return;
  tb.innerHTML = '';
  ideas.forEach(it=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${it.title}</td><td>${it.impact}</td><td>${it.effort}</td><td>${it.risk}</td><td>${it.score}</td>`;
    tb.appendChild(tr);
  });
}

function addIdea(x){
  x.score = calcScore(x.impact, x.effort, x.risk);
  ideas.push(x);
  renderMatrix();
  renderImpactTable();
}

function seedImpact(){
  [
    {title:'Recruiter Copilot',impact:9,effort:5,risk:6},
    {title:'Onboarding Assistant',impact:8,effort:4,risk:3},
    {title:'Pay Equity Insights',impact:7,effort:7,risk:7},
    {title:'Skills Graph',impact:8,effort:6,risk:4},
    {title:'HR Service Desk Copilot',impact:6,effort:3,risk:3}
  ].forEach(addIdea);
}

function bindImpact(){
  const I = $('#impImpact'), E = $('#impEffort'), R = $('#impRisk');
  if(!I||!E||!R) return;
  const oI = $('#oImp'), oE = $('#oEff'), oR = $('#oRisk');
  [I,E,R].forEach(r => r.addEventListener('input', ()=>{
    oI.textContent = I.value; oE.textContent = E.value; oR.textContent = R.value;
  }));
  $('#impactForm').addEventListener('submit', e=>{
    e.preventDefault();
    const t = $('#impTitle').value.trim(); if(!t) return;
    addIdea({title:t, impact:+I.value, effort:+E.value, risk:+R.value});
    $('#impTitle').value = '';
  });
  seedImpact();
}

// --- HR Tables
const hr = [];
function renderHrTables(){
  const f = $('#hrFilter'), cur = $('#hrCurrent tbody'), fut = $('#hrFuture tbody');
  if(!f||!cur||!fut) return;
  cur.innerHTML = ''; fut.innerHTML = '';
  const v = f.value || 'All';
  hr.filter(r=>v==='All' || r.suborg===v).forEach(r=>{
    const tr = document.createElement('tr');
    const link = r.link ? `<a href="${r.link}" target="_blank" rel="noopener">open</a>` : '';
    tr.innerHTML = `<td>${r.name}</td><td>${r.suborg}</td><td>${r.category}</td><td>${r.status}</td><td>${r.kpis.join(', ')}</td><td>${link}</td>`;
    if(r.window==='Current') cur.appendChild(tr); else fut.appendChild(tr);
  });
}

function seedHr(){
  [
    {name:'Workday Hiring Enhancements',suborg:'Talent',category:'Platform/Integration',status:'Live',window:'Current',kpis:['time-to-hire','req aging']},
    {name:'Recruiter Copilot',suborg:'Talent',category:'Copilot/Agent',status:'Pilot',window:'Current',kpis:['screening throughput','adverse impact %']},
    {name:'Interview Guide Generator',suborg:'Talent',category:'Knowledge/RAG',status:'Idea',window:'Future',kpis:['prep time','interviewer NPS']},
    {name:'Skills Graph & Learning Paths',suborg:'L&D',category:'Analytics/KPI',status:'Pilot',window:'Current',kpis:['skill delta','learning uptake']},
    {name:'Learning Copilot',suborg:'L&D',category:'Copilot/Agent',status:'Idea',window:'Future',kpis:['time saved','content relevance']},
    {name:'Pay Equity Insights',suborg:'Comp',category:'Analytics/KPI',status:'Live',window:'Current',kpis:['pay gap','remediation rate']},
    {name:'Benefits Q&A Agent',suborg:'Comp',category:'Copilot/Agent',status:'Idea',window:'Future',kpis:['deflection','CSAT']},
    {name:'Capacity Forecasting',suborg:'WFP',category:'Analytics/KPI',status:'Live',window:'Current',kpis:['forecast MAPE','fill rate']},
    {name:'Scenario Simulator',suborg:'WFP',category:'Platform/Integration',status:'Idea',window:'Future',kpis:['scenario coverage','decision latency']},
    {name:'HR Service Desk Copilot',suborg:'HR Ops',category:'Automation',status:'Pilot',window:'Current',kpis:['deflection','AHT','FCR']},
    {name:'Policy Assistant',suborg:'HR Ops',category:'Knowledge/RAG',status:'Idea',window:'Future',kpis:['lookup speed','accuracy']}
  ].forEach(i => hr.push({...i, link:''}));
  renderHrTables();
}

function bindHr(){
  const form = $('#hrForm'), f = $('#hrFilter');
  if(!form||!f) return;
  f.addEventListener('change', renderHrTables);
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const item = {
      name: $('#hrName').value.trim(),
      suborg: $('#hrSuborg').value,
      category: $('#hrCategory').value,
      status: $('#hrStatus').value,
      window: $('#hrWindow').value,
      kpis: $('#hrKpis').value ? $('#hrKpis').value.split(',').map(s=>s.trim()).filter(Boolean) : [],
      link: $('#hrLink').value.trim()
    };
    if(!item.name) return;
    hr.push(item);
    form.reset();
    renderHrTables();
  });
  seedHr();
}

// --- Governance Modal Copy
const govCopy = {
  strategy: {
    title: "Strategy (C-Suite)",
    body: ["Define Human + AI vision for HR","Set goals & risk appetite","Fund the roadmap and success metrics"],
     "Approves HR AI North Star + budget."
  },
  standards: {
    title: "Standards (CoE)",
    body: ["Translate strategy into frameworks & playbooks","Publish reusable patterns (RAG, agents, analytics)","Define approval gates & quality bars"],
     "Standard for PII redaction and evals."
  },
  implementation: {
    title: "Implementation (Business Units)",
    body: ["Deliver prioritized use cases","Meet guardrails & standards","Report KPIs and feedback"],
     "Talent ships Recruiter Copilot pilot."
  },
  operations: {
    title: "Operations (BAU)",
    body: ["Support & enablement","Telemetry & adoption","Incident response"],
     "HR Ops maintains Service Desk copilot."
  },
  council: {
    title: "Governance Council",
    body: ["Cross-functional alignment (HR, IT, Data, Legal/Privacy, Security, RAI)","Approve high-risk launches","Review incidents & ROI"],
     "Council reviews bias test results before launch."
  },
  guardrails: {
    title: "Responsible AI Guardrails",
    body: ["Fairness, explainability, privacy","Human-in-the-loop for sensitive decisions","Red-teaming & continuous monitoring"],
     "Hiring models require HIL decision step."
  },
  data: {
    title: "Trusted Data Foundations",
    body: ["PII governance & lineage","Access control & observability","Secure integrations & cost control"],
     "Feature store with audit trails."
  }
};

// --- Governance Modal (FIXED: show "Example:" only once)
function openGov(key){
  const m = $('#govModal'), t = $('#modalTitle'), b = $('#modalBody');
  const d = govCopy[key];
  if(!d) return;

  // strip any leading "Example:" from data to avoid duplication
  const ex = (d.example || '').replace(/^\s*Example:\s*/i, '');

  t.textContent = d.title;
  b.innerHTML = `
    <ul class="bullets">${d.body.map(x=>`<li>${x}</li>`).join('')}</ul>
    <p class="subtle"><strong>Example:</strong> ${ex}</p>
  `;
  m.showModal();
  $('#modalClose').focus();
}

function bindGovHotspots(){
  if(!$('.gov__wrap')) return;
  $$('.hotspot').forEach(h=>{
    h.addEventListener('click', ()=>openGov(h.dataset.key));
    h.addEventListener('keydown', e=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault(); openGov(h.dataset.key);
      }
      // FIX: add missing $ before selector
      if(e.key === 'Escape'){ $('#govModal').close(); }
    });
  });
}

// --- Cadence Carousel
const cadenceCards = [
  {title:"Weekly — People Tech Council Sync", jtbd:["Prioritize & unblock pilots","Review risk & approvals","Track ROI telemetry"], attendees:"Executive Sponsor, People Tech Leads, HR Leaders, Legal/Privacy, Security, Data, RAI SMEs, IT Partners"},
  {title:"Bi-Weekly — Talent Working Session", jtbd:["Reduce time-to-hire","Improve candidate experience","Monitor adverse impact"], attendees:"Talent Lead, Recruiters, People Analytics, IT, RAI"},
  {title:"Bi-Weekly — L&D + Skills", jtbd:["Boost learning uptake","Map skills to roles","Inform career pathways"], attendees:"L&D Lead, People Analytics, COE, IT"},
  {title:"Monthly — Comp & Benefits", jtbd:["Ensure pay equity & compliance","Improve employee clarity on rewards","Evaluate benefits Q&A deflection"], attendees:"Total Rewards, Legal/Privacy, RAI, Data"},
  {title:"Weekly — HR Ops Enablement", jtbd:["Deflect cases","Improve policy discovery","Increase FCR/AHT efficiency"], attendees:"HR Ops Lead, Service Desk, IT, COE, RAI"},
  {title:"Quarterly — Executive Outcome Review", jtbd:["Validate business impact","Refresh roadmap","Budget and platform investments"], attendees:"CPO, Rich, Elle, Finance, IT, Data"}
];

function initCarousel(){
  const track = $('#carTrack'); if(!track) return;
  track.innerHTML = cadenceCards.map(c=>`
    <div class="car__card">
      <div class="card">
        <h3>${c.title}</h3>
        <p><strong>Job-to-Be-Done</strong></p>
        <ul class="bullets">${c.jtbd.map(x=>`<li>${x}</li>`).join('')}</ul>
        <p><strong>Attendees</strong><br/>${c.attendees}</p>
      </div>
    </div>
  `).join('');
  let idx = 0;
  const prev = $('#carPrev'), next = $('#carNext');
  function update(){
    track.style.transform = `translateX(${-idx*100}%)`;
    track.setAttribute('aria-live','polite');
  }
  prev?.addEventListener('click', ()=>{ idx = (idx-1+cadenceCards.length)%cadenceCards.length; update(); });
  next?.addEventListener('click', ()=>{ idx = (idx+1)%cadenceCards.length; update(); });
  document.addEventListener('keydown', e=>{
    if(e.key==='ArrowLeft'){ idx = (idx-1+cadenceCards.length)%cadenceCards.length; update(); }
    if(e.key==='ArrowRight'){ idx = (idx+1)%cadenceCards.length; update(); }
  });
  update();
}

// --- Badges
function badge(level, msg){
  const cls = level==='ok' ? 'badge--ok' : level==='warn' ? 'badge--warn' : 'badge--crit';
  const text = level==='ok' ? 'OK' : level==='warn' ? 'Attention' : 'Critical';
  return `<span class="badge ${cls}" role="status" aria-live="polite"><span class="badge__dot" aria-hidden="true"></span>${text} — ${msg}</span>`;
}

// --- Strategist seed
function seedStrategist(){
  const tbl = $('#aiTracker tbody'); if(!tbl) return;
  [
    ['Recruiter Copilot','Pilot',badge('warn','Adoption lag in Talent, training scheduled')],
    ['Pay Equity Insights','Live',badge('ok','Quarterly review passed, remediation on track')],
    ['Onboarding Assistant','Idea',badge('warn','Awaiting SME sign-off')],
    ['HR Service Desk Copilot','Pilot',badge('ok','Deflection > 22% in HR Ops')]
  ].forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td>`;
    tbl.appendChild(tr);
  });

  const rtbl = $('#riskReg tbody');
  [
    ['Bias in screening','RAI','Add fairness tests',badge('warn','Coverage 72% (<80%)')],
    ['Privacy PIA','Legal','Complete DPIA',badge('crit','Overdue 2 weeks')],
    ['Prompt leakage','Security','DLP rules update',badge('ok','No incidents in 30 days')]
  ].forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td>`;
    rtbl.appendChild(tr);
  });

  const cl = $('#cadenceList');
  if(cl) cl.innerHTML = `<li>Oct 7 — Talent Working Session</li><li>Oct 14 — People Tech Council</li><li>Oct 21 — HR Ops Enablement</li>`;

  const hm = $('#heatmap');
  if(hm) hm.innerHTML = `
    <div>${badge('ok','Privacy PIA on track')}</div>
    <div>${badge('warn','Bias testing below 80%')}</div>
    <div>${badge('ok','Security controls validated')}</div>
    <div>${badge('warn','Model drift signal requires review')}</div>
  `;
}

// --- Council seed
function seedCouncil(){
  const sys = $('#sysHealth'); if(!sys) return;
  sys.innerHTML = [
    badge('ok','Privacy — DPIA coverage 95%'),
    badge('warn','Bias — Coverage 78% (<80%)'),
    badge('ok','Security — SOC2 controls healthy'),
    badge('warn','Drift — Signals in Talent pilot')
  ].map(x=>`<div>${x}</div>`).join('');

  const top = $('#topInitiatives tbody');
  [
    ['Recruiter Copilot',badge('warn','Training gap in Talent')],
    ['Pay Equity Insights',badge('ok','KPI targets met')],
    ['Learning Copilot',badge('warn','Adoption below target')]
  ].forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td>`;
    top.appendChild(tr);
  });

  const esc = $('#escalations');
  if(esc) esc.innerHTML = `
    <li>${badge('crit','Vendor integration blocked — IT exception')}</li>
    <li>${badge('warn','Fairness threshold not met in new model')}</li>
  `;

  const cad = $('#cCadences');
  if(cad) cad.innerHTML = `<li>Oct 14 — Council: Pilot Approvals</li><li>Nov 11 — Council: Quarterly Review</li>`;
}

// --- Pulse seed
function seedPulse(){
  const health = $('#pulseHealth'); if(!health) return;
  health.innerHTML = [
    badge('ok','Recruiter Copilot — 87% satisfied'),
    badge('warn','Learning Copilot — 52% adoption'),
    badge('crit','Pay Equity Insights — 22% fairness concerns')
  ].map(x=>`<div>${x}</div>`).join('');

  const conn = $('#pulseImpact tbody');
  [
    ['Recruiter Copilot','Impact +1 (8 → 9)'],
    ['Learning Copilot','Impact −2 (7 → 5)'],
    ['Pay Equity Insights','Risk ↑ (OK → Attention)']
  ].forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td>`;
    conn.appendChild(tr);
  });
}

// --- Modal wiring
function bindModal(){
  const modal = $('#govModal'); if(!modal) return;
  $('#modalClose').addEventListener('click', ()=>modal.close());
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape' && modal.open) modal.close();
  });
}

// --- AI Dashboard seed
function seedAIDashboard(){
  const models = $('#aiModels tbody');
  if(models){
    [
      ['Recruiter Copilot','Talent','Screening & outreach','Some PII',badge('warn','DPIA complete; enablement lag')],
      ['Pay Equity Insights','Comp','Comp analytics','Sensitive',badge('ok','Approved; quarterly review')],
      ['Service Desk Copilot','HR Ops','Tier-0/1 deflection','Low',badge('ok','Stable >22% deflection')]
    ].forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td>`;
      models.appendChild(tr);
    });
  }
  const evals = $('#aiEvals tbody');
  if(evals){
    [
      ['Bias (Talent)','78%','Pass pending',badge('warn','Below 80% threshold')],
      ['PII Redaction','95%','Pass',badge('ok','Meets standard')],
      ['Accuracy','88%','Pass',badge('warn','Needs SME spot checks')]
    ].forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td>`;
      evals.appendChild(tr);
    });
  }
  const inc = $('#aiIncidents');
  if(inc){
    inc.innerHTML = `
      <li>${badge('crit','Data sharing misconfig in staging — resolved')}</li>
      <li>${badge('warn','Vendor SLA latency spikes — monitoring')}</li>
    `;
  }
  const cost = $('#aiCostBadges');
  if(cost){
    cost.innerHTML = `
      <div>${badge('ok','Token spend within budget')}</div>
      <div>${badge('warn','Latency p95 above target in Talent')}</div>
    `;
  }
  const mon = $('#aiMonitoring');
  if(mon){
    mon.innerHTML = `
      <div>${badge('ok','Drift — green in Comp')}</div>
      <div>${badge('warn','Drift — watchlist in Talent')}</div>
      <div>${badge('ok','Safety — no P0 in 60 days')}</div>
      <div>${badge('ok','Access — least privilege enforced')}</div>
    `;
  }
  const gates = $('#aiApprovals tbody');
  if(gates){
    [
      ['Recruiter Copilot','Launch Gate','Council',badge('warn','Needs bias retest')],
      ['Pay Equity Insights','Quarterly Review','Council',badge('ok','Approved')],
      ['Service Desk Copilot','Pilot Gate','Council',badge('ok','Proceed')]
    ].forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td>`;
      gates.appendChild(tr);
    });
  }
}

// --- Sparklines (canvas)
function drawSparkline(canvas, data){
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const dpr = (window.devicePixelRatio || 1);
  const w = canvas.width  = canvas.clientWidth * dpr;
  const h = canvas.height = canvas.clientHeight * dpr;
  ctx.scale(dpr, dpr);
  ctx.clearRect(0,0,w,h);
  const pad = 4, max = Math.max(...data), min = Math.min(...data);
  const sx = (canvas.clientWidth/(data.length-1));
  const sy = ((canvas.clientHeight-2*pad)/((max-min)||1));
  ctx.lineWidth = 2; ctx.strokeStyle = '#2563eb'; ctx.beginPath();
  data.forEach((v,i)=>{
    const x = i*sx; const y = canvas.clientHeight - pad - (v-min)*sy;
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  });
  ctx.stroke();
}

function attachSparks(){
  const _ad  = [42,45,49,51,55,58,62,66,71,74,79,83];
  const _kpi = [65,63,68,72,70,75,78,81,85,88,90,92];
  const _lat = [420,380,360,390,340,330,350,320,310,300,295,285];
  const _cost= [100,98,97,96,94,93,92,92,91,90,90,89];
  const _sent= [58,59,61,60,63,64,66,67,69,70,72,73];

  const adoption = document.querySelector('#adoptionSpark');
  if(adoption){ drawSparkline(adoption, _ad); setMetricText('adoptionText', _ad); }

  const kpi = document.querySelector('#kpiSpark');
  if(kpi){ drawSparkline(kpi, _kpi); setMetricText('kpiText', _kpi); }

  const latency = document.querySelector('#latencySpark');
  if(latency){ drawSparkline(latency, _lat); setMetricText('latencyText', _lat, 'ms'); }

  const cost = document.querySelector('#costSpark');
  if(cost){ drawSparkline(cost, _cost); setMetricText('costText', _cost, '%'); }

  const sentiment = document.querySelector('#sentimentSpark');
  if(sentiment){ drawSparkline(sentiment, _sent); setMetricText('sentimentText', _sent); }
}
window.addEventListener('resize', attachSparks);

function setMetricText(id, data, unit=''){
  const el = document.getElementById(id);
  if(!el) return;
  const first = data[0], last = data[data.length-1];
  const delta = Math.round((last - first) * 10) / 10;
  const dir = delta > 0 ? '↑' : (delta < 0 ? '↓' : '→');
  el.textContent = `${last}${unit} ${dir} ${Math.abs(delta)}${unit}`;
}

// --- SVG mini charts
function renderBar(el, data){
  const w = el.clientWidth, h = 90, pad = 10;
  el.innerHTML = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width', w); svg.setAttribute('height', h);
  const max = Math.max(...data, 1); const bw = (w - pad*2) / data.length - 4;
  data.forEach((v,i)=>{
    const x = pad + i*(bw+4);
    const bh = (h - pad*2) * (v/max);
    const y = h - pad - bh;
    const rect = document.createElementNS(svg.namespaceURI, 'rect');
    rect.setAttribute('x', x); rect.setAttribute('y', y);
    rect.setAttribute('width', bw); rect.setAttribute('height', bh);
    rect.setAttribute('rx', 3);
    rect.setAttribute('fill', '#60a5fa');
    svg.appendChild(rect);
  });
  el.appendChild(svg);
}

function renderArea(el, data){
  const w = el.clientWidth, h = 90, pad = 10;
  el.innerHTML = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('width', w); svg.setAttribute('height', h);
  const max = Math.max(...data), min = Math.min(...data);
  const sx = (w - pad*2) / (data.length - 1), sy = (h - pad*2) / ((max-min)||1);
  let d = '';
  data.forEach((v,i)=>{
    const x = pad + i*sx;
    const y = h - pad - (v - min) * sy;
    d += (i===0?`M ${x} ${y}`:` L ${x} ${y}`);
  });
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#2563eb');
  path.setAttribute('stroke-width', '2');
  svg.appendChild(path);
  const area = document.createElementNS(svg.namespaceURI, 'path');
  area.setAttribute('d', `${d} L ${pad + (data.length-1)*sx} ${h-pad} L ${pad} ${h-pad} Z`);
  area.setAttribute('fill', 'rgba(37,99,235,.15)');
  svg.appendChild(area);
  el.appendChild(svg);
}

function attachMiniCharts(){
  const map = [
    ['#kpiBar1',[12,14,13,15,16,18,21,23]],
    ['#kpiBar2',[35,33,36,38,41,44,47,52]],
    ['#kpiArea1',[58,59,61,60,63,64,66,67,69,70,72,73]],
    ['#aiBarLatency',[420,380,360,390,340,330,350,320,310,300,295,285]],
    ['#aiBarCost',[100,98,97,96,94,93,92,92,91,90,90,89]]
  ];
  map.forEach(([sel,data])=>{
    const el = document.querySelector(sel);
    if(!el) return;
    if(sel.includes('Area')) renderArea(el, data); else renderBar(el, data);
  });
}
window.addEventListener('resize', attachMiniCharts);

// --- Boot
window.addEventListener('DOMContentLoaded', ()=>{
  initMenu();
  bindModal();
  initPlan();
  bindImpact();
  renderMatrix();
  renderImpactTable();
  bindHr();
  bindGovHotspots();
  initCarousel();
  seedStrategist();
  seedCouncil();
  seedPulse();
  seedAIDashboard();
  attachSparks();
  attachMiniCharts();
});
