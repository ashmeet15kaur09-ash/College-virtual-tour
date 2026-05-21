
// ─── THEME ───
function toggleTheme() {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', html.dataset.theme);
}
(function() {
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.dataset.theme = saved;
})();

// ─── MOBILE NAV ───
function toggleMobileNav() {
  const nav = document.getElementById('mobileNav');
  nav.classList.toggle('open');
}

// ─── BACK TO TOP ───
const backTop = document.getElementById('backTop');
if (backTop) {
  window.addEventListener('scroll', () => {
    backTop.classList.toggle('show', window.scrollY > 400);
  });
}

// ─── SCROLL REVEAL ───
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.1 });
revealEls.forEach(el => observer.observe(el));

// ─── MAP TOOLTIP ───
let tooltipTimeout;
function showTooltip(pin, name, icon, desc, tag) {
  clearTimeout(tooltipTimeout);
  document.querySelectorAll('.map-pin.active').forEach(p => {
    if (p !== pin) p.classList.remove('active');
  });
  pin.classList.toggle('active');

  const tooltip = document.getElementById('mapTooltip');
  if (!tooltip) return;
  tooltip.innerHTML = `<strong>${icon} ${name}</strong><span class="map-tooltip-tag">${tag}</span><p style="margin-top:6px;color:var(--text2);font-size:0.82rem">${desc}</p>`;
  
  const map = document.getElementById('campusMap');
  const pinRect = pin.getBoundingClientRect();
  const mapRect = map.getBoundingClientRect();
  const tooltipWidth = Math.min(300, window.innerWidth - 40);
  
  let left = pinRect.left - mapRect.left + pinRect.width / 2 - tooltipWidth / 2;
  let top = pinRect.top - mapRect.top - 12;
  
  left = Math.min(Math.max(left, 10), Math.max(10, mapRect.width - tooltipWidth - 10));
  if (top < 80) top = pinRect.bottom - mapRect.top + 12;
  
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  tooltip.style.display = 'block';
}
function hideTooltip() {
  tooltipTimeout = setTimeout(() => {
    const tooltip = document.getElementById('mapTooltip');
    if (tooltip) tooltip.style.display = 'none';
    document.querySelectorAll('.map-pin.active').forEach(p => p.classList.remove('active'));
  }, 400);
}
const campusMapEl = document.getElementById('campusMap');
if (campusMapEl) {
  campusMapEl.addEventListener('mouseleave', () => {
    const tooltip = document.getElementById('mapTooltip');
    if (tooltip) tooltip.style.display = 'none';
    document.querySelectorAll('.map-pin.active').forEach(p => p.classList.remove('active'));
  });
}

document.addEventListener('click', (event) => {
  if (!event.target.closest('.map-pin') && !event.target.closest('.map-tooltip')) {
    const tooltip = document.getElementById('mapTooltip');
    if (tooltip) tooltip.style.display = 'none';
    document.querySelectorAll('.map-pin.active').forEach(p => p.classList.remove('active'));
  }
});

// ─── CLASSROOM SEARCH ───
const rooms = [
  { name:'CS Lab 1', loc:'Block A, Room 101', type:'Lab', icon:'🖥', info:'50 systems, Ubuntu & Windows dual boot' },
  { name:'CS Lab 2', loc:'Block A, Room 102', type:'Lab', icon:'🖥', info:'GPU workstations for Deep Learning' },
  { name:'CS Lab 3', loc:'Block A, Room 103', type:'Lab', icon:'🖥', info:'Web & Mobile dev lab' },
  { name:'AI/ML Lab', loc:'Block B, Room 201', type:'Lab', icon:'🤖', info:'NVIDIA GPUs, Jupyter, TensorFlow pre-installed' },
  { name:'Electronics Lab', loc:'Block C, Room 301', type:'Lab', icon:'⚡', info:'Oscilloscopes, PCB design workstations' },
  { name:'Physics Lab', loc:'Block D, Room 401', type:'Lab', icon:'🔬', info:'Optics, heat, and modern physics experiments' },
  { name:'Chemistry Lab', loc:'Block D, Room 402', type:'Lab', icon:'⚗️', info:'Wet lab with fume hoods and safety gear' },
  { name:'Room 204', loc:'Block A, 2nd Floor', type:'Classroom', icon:'🏫', info:'60-seat lecture hall with projector' },
  { name:'Room 205', loc:'Block A, 2nd Floor', type:'Classroom', icon:'🏫', info:'Tutorial room, 30 seats' },
  { name:'Seminar Hall 1', loc:'Auditorium Block', type:'Hall', icon:'🎭', info:'200-seat seminar hall, AV equipped' },
  { name:'Seminar Hall 2', loc:'Auditorium Block', type:'Hall', icon:'🎭', info:'100-seat hall, video conferencing' },
  { name:'Library', loc:'Central Block, Ground Floor', type:'Facility', icon:'📚', info:'Books, journals, digital resources' },
  { name:'Cafeteria', loc:'South Campus', type:'Facility', icon:'🍽', info:'Multi-cuisine food court, 500 seats' },
  { name:'Medical Center', loc:'Near Hostel Gate', type:'Facility', icon:'🏥', info:'24/7 clinic, ambulance service' },
  { name:'Prof. Sharma Office', loc:'Block A, Room 204A', type:'Office', icon:'👨‍🏫', info:'HOD CSE — appointment needed' },
  { name:'Prof. Meena Office', loc:'Block B, Room 301A', type:'Office', icon:'👩‍🏫', info:'HOD AI/ML — walk-in: Mon 10-12' },
  { name:'Exam Cell', loc:'Admin Block, Ground Floor', type:'Office', icon:'📝', info:'Exams, result & certificate queries' },
  { name:'Hostel Office', loc:'Boys Hostel Block', type:'Office', icon:'🏠', info:'Warden office, room allotment' },
];

function doSearch() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const resultsDiv = document.getElementById('searchResults');
  if(!q) { resultsDiv.classList.remove('show'); return; }
  
  const matches = rooms.filter(r =>
    r.name.toLowerCase().includes(q) ||
    r.loc.toLowerCase().includes(q) ||
    r.type.toLowerCase().includes(q) ||
    r.info.toLowerCase().includes(q)
  );
  
  if(matches.length === 0) {
    resultsDiv.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text2)">😕 No results found for "<strong>${q}</strong>" — try a room number, lab name, or facility.</div>`;
  } else {
    resultsDiv.innerHTML = matches.map(r => `
      <div class="result-item">
        <div class="result-icon">${r.icon}</div>
        <div class="result-info">
          <div class="result-name">${r.name}</div>
          <div class="result-loc">📍 ${r.loc} · ${r.info}</div>
        </div>
        <div class="result-tag">${r.type}</div>
      </div>
    `).join('');
  }
  resultsDiv.classList.add('show');
}

function handleSearch(e) {
  if(e.key === 'Enter') doSearch();
  if(document.getElementById('searchInput').value.trim() === '') {
    document.getElementById('searchResults').classList.remove('show');
  }
}

// ─── EMERGENCY CALL BUTTONS ───
document.querySelectorAll('.emergency-call').forEach(btn => {
  btn.addEventListener('click', function() {
    const name = this.closest('.emergency-item').querySelector('.emergency-name').textContent;
    const num = this.closest('.emergency-item').querySelector('.emergency-num').textContent;
    alert(`📞 Calling ${name}\n${num}\n\n(This is a demo — in real use, this would dial the number.)`);
  });
});