document.addEventListener('DOMContentLoaded', () => {
  // (선택) CSRF
  const CSRF_TOKEN  = document.querySelector('meta[name="_csrf"]')?.getAttribute('content') || '';
  const CSRF_HEADER = document.querySelector('meta[name="_csrf_header"]')?.getAttribute('content') || 'X-CSRF-TOKEN';

  /* ---------------- CES-D 설문 ---------------- */
  const questions = [
    {id:'q1',text:'평소에는 아무렇지도 않던 일들이 귀찮고 성가시게 느껴졌다',rev:false},
    {id:'q2',text:'먹고 싶지 않고 식욕이 없었다',rev:false},
    {id:'q3',text:'가족이나 친구가 도와주어도 울적한 기분을 떨쳐버릴 수 없었다',rev:false},
    {id:'q4',text:'다른 사람들만큼 능력이 있다고 느꼈다',rev:true},
    {id:'q5',text:'무슨 일을 하든 정신을 집중하기가 힘들었다',rev:false},
    {id:'q6',text:'우울했다',rev:false},
    {id:'q7',text:'하는 일마다 힘들게 느껴졌다',rev:false},
    {id:'q8',text:'미래에 대하여 희망적으로 느꼈다',rev:true},
    {id:'q9',text:'내 인생은 실패작이라는 생각이 들었다',rev:false},
    {id:'q10',text:'무서움을 느꼈다',rev:false},
    {id:'q11',text:'잠을 설쳤다 (잠을 잘 이루지 못했다)',rev:false},
    {id:'q12',text:'행복했다',rev:true},
    {id:'q13',text:'평소보다 말을 적게 했다',rev:false},
    {id:'q14',text:'세상에 홀로 있는 듯한 외로움을 느꼈다',rev:false},
    {id:'q15',text:'사람들이 나에게 차갑게 대하는 것 같았다',rev:false},
    {id:'q16',text:'생활이 즐거웠다',rev:true},
    {id:'q17',text:'갑자기 울음이 나왔다',rev:false},
    {id:'q18',text:'슬픔을 느꼈다',rev:false},
    {id:'q19',text:'사람들이 나를 싫어하는 것 같다고 느꼈다',rev:false},
    {id:'q20',text:'도무지 뭘 해나갈 엄두가 나지 않았다',rev:false}
  ];
  const opts = [
    {v:0,label:'극히 드물게 (1일 미만)',desc:'전혀 없었다'},
    {v:1,label:'가끔 (1-2일)',desc:'조금 있었다'},
    {v:2,label:'종종 (3-4일)',desc:'자주 있었다'},
    {v:3,label:'대부분 (5-7일)',desc:'거의 매일'}
  ];

  const qBox = document.getElementById('cesd-question');
  const optBox = document.getElementById('cesd-options');
  const progress = document.getElementById('cesd-progress');
  const stepText = document.getElementById('cesd-step-text');
  const prevBtn = document.getElementById('cesd-prev');
  const nextBtn = document.getElementById('cesd-next');
  const resultWrap = document.getElementById('cesd-result');
  const badge = document.getElementById('cesd-badge');
  const levelTitle = document.getElementById('cesd-level-title');
  const scorebar = document.getElementById('cesd-scorebar');
  const scoreText = document.getElementById('cesd-score-text');
  const desc = document.getElementById('cesd-desc');
  const resetBtn = document.getElementById('cesd-reset');
  const saveBtn = document.getElementById('cesd-save');

  const ans = {};
  let step = 0;

  function renderStep(){
    const q = questions[step];
    stepText.textContent = `${step+1}/${questions.length}`;
    progress.style.width = ((step+1)/questions.length*100) + '%';

    qBox.innerHTML = `
      <div class="mc-muted" style="font-size:13px; margin-bottom:6px;">문항 ${step+1}</div>
      <div style="font-size:16px;">${q.text}</div>
    `;

    optBox.innerHTML = '';
    opts.forEach(o=>{
      const row = document.createElement('label');
      row.className = 'mc-radio-row';
      row.innerHTML = `
        <input type="radio" name="cesd-ans" value="${o.v}" ${ans[q.id]===o.v?'checked':''}>
        <div>
          <div style="font-weight:600; color:#111827;">${o.label}</div>
          <div class="mc-muted" style="font-size:12px;">${o.desc}</div>
        </div>
      `;
      row.querySelector('input').addEventListener('change', e => { ans[q.id] = parseInt(e.target.value,10); });
      optBox.appendChild(row);
    });

    prevBtn.disabled = (step===0);
    nextBtn.textContent = (step===questions.length-1) ? '결과 보기' : '다음';
  }
  renderStep();

  function calcScore(){
    let total = 0;
    questions.forEach(q=>{
      const v = ans[q.id];
      if (v!==undefined) total += q.rev ? (3 - v) : v;
    });
    return total;
  }
  function toLevel(score){
    if(score < 16) return {badge:'정상', color:'#22c55e', desc:'현재 우울 증상이 거의 없는 정상 범위입니다.', reco:'규칙적인 수면/운동, 스트레스 관리를 이어가세요.'};
    if(score < 21) return {badge:'경미한 우울', color:'#f59e0b', desc:'경미한 우울 증상이 있습니다.',                reco:'생활습관 개선과 스트레스 관리, 필요 시 상담을 권장합니다.'};
    if(score < 25) return {badge:'중등도 우울', color:'#ef4444', desc:'중등도의 우울 증상이 나타납니다.',            reco:'전문의 상담을 권장합니다.'};
    return              {badge:'심한 우울',   color:'#ef4444', desc:'심한 우울 증상으로 즉시 전문 치료가 필요합니다.', reco:'지체 없이 정신건강의학과 진료를 받으세요.'};
  }

  nextBtn.addEventListener('click', async ()=>{
    const q = questions[step];
    if (ans[q.id]===undefined){ alert('응답을 선택해 주세요.'); return; }

    if (step < questions.length-1){
      step++; renderStep();
    } else {
      // (옵션) 서버 평가 요청
      let total;
      try{
        const res = await fetch('/api/mental-care/cesd-assessment', {
          method:'POST',
          headers:{ 'Content-Type':'application/json', [CSRF_HEADER]: CSRF_TOKEN },
          body: JSON.stringify({ scores: questions.map(q=> ans[q.id] ?? 0) })
        });
        const data = await res.json();
        total = data.totalScore ?? calcScore();
        desc.textContent = data.interpretation ? `${data.interpretation} • ${data.recommendation||''}` : '';
      }catch(e){
        total = calcScore();
      }

      const lv = toLevel(total);
      levelTitle.textContent = `평가 결과: ${lv.badge}`;
      badge.textContent = lv.badge;
      badge.style.background = lv.color;
      scoreText.textContent = `${total} / 60`;
      scorebar.style.width = (total/60*100) + '%';
      if (!desc.textContent) desc.textContent = lv.desc;
      resultWrap.style.display = 'block';
    }
  });

  prevBtn.addEventListener('click', ()=>{ if(step>0){ step--; renderStep(); }});
  resetBtn.addEventListener('click', ()=>{ for(const k in ans) delete ans[k]; step=0; resultWrap.style.display='none'; renderStep(); });
  saveBtn.addEventListener('click', async ()=>{
    const score = calcScore();
    try{
      const res = await fetch('/api/mental-care/save-assessment', {
        method:'POST',
        headers:{'Content-Type':'application/json', [CSRF_HEADER]: CSRF_TOKEN},
        body: JSON.stringify({ type:'CES-D', score, timestamp: new Date().toISOString() })
      });
      if(res.ok) alert('평가 결과가 저장되었습니다.'); else alert('저장에 실패했습니다.');
    }catch(e){ alert('서버 통신 오류로 저장에 실패했습니다.'); }
  });

  /* ---------------- AI 챗봇 ---------------- */
  const chatList  = document.getElementById('mc-chat-list');
  const chatInput = document.getElementById('mc-chat-input');
  const chatSend  = document.getElementById('mc-chat-send');

  function addMsg(type, content){
    const row = document.createElement('div');
    row.className = 'mc-chat__row';
    const bubble = document.createElement('div');
    bubble.className = 'mc-chat__bubble ' + (type==='user' ? 'mc-chat__bubble--user' : 'mc-chat__bubble--bot');
    bubble.textContent = content;
    const time = document.createElement('div');
    time.className = 'mc-chat__time'; time.textContent = new Date().toLocaleTimeString();
    bubble.appendChild(document.createElement('br')); bubble.appendChild(time);
    row.appendChild(bubble);
    chatList.appendChild(row);
    chatList.scrollTop = chatList.scrollHeight;
  }

  async function sendMessage(text){
    if(!text || !text.trim()) return;
    addMsg('user', text); chatInput.value = '';

    const typing = document.createElement('div');
    typing.className = 'mc-chat__row mc-typing'; typing.id = 'mc-typing';
    typing.innerHTML = '<span class="mc-chat__bubble mc-chat__bubble--bot">…</span>';
    chatList.appendChild(typing); chatList.scrollTop = chatList.scrollHeight;

    try{
      const res = await fetch('/api/mental-care/ai-chat', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', [CSRF_HEADER]: CSRF_TOKEN },
        body: JSON.stringify({ message: text, sessionId: 'web-'+Date.now() })
      });
      const data = await res.json();
      document.getElementById('mc-typing')?.remove();
      addMsg('bot', data.response || '답변 생성에 문제가 발생했습니다.');
    }catch(e){
      document.getElementById('mc-typing')?.remove();
      addMsg('bot', '서버와 통신 중 오류가 발생했습니다.');
    }
  }

  addMsg('bot', '안녕하세요! 저는 LifeCare AI 심리상담사입니다. 😊\n\n요즘 어떤 마음의 어려움이 있으신가요? 편하게 말씀해 주세요.');
  chatSend.addEventListener('click', ()=> sendMessage(chatInput.value));
  chatInput.addEventListener('keypress', (e)=>{ if(e.key==='Enter'){ sendMessage(chatInput.value); } });

  /* ---------------- 지도 (검색 UI 없이 자동) ---------------- */
  const mapContainer = document.getElementById('map-container');
  const listContainer = document.getElementById('nearby-hospitals-list');

  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[m])); }

  function displayNearbyHospitals(){
    if (!mapContainer || !listContainer) return;

    const defaultCenter = new kakao.maps.LatLng(37.5665, 126.9780); // 서울 시청
    const map = new kakao.maps.Map(mapContainer, { center: defaultCenter, level: 5 });
    setTimeout(() => kakao.maps.event.trigger(map, 'resize'), 50);
    const places = new kakao.maps.services.Places();

    function render(list){
      if (!list.length){
        listContainer.innerHTML = '<div class="mc-muted">주변 결과가 없습니다.</div>';
        return;
      }
      const html = list.slice(0,8).map(h => `
        <div class="hospital-item">
          <strong>${escapeHtml(h.place_name || '의료기관')}</strong>
          <div class="mc-muted" style="font-size:13px; margin:6px 0;">${escapeHtml(h.road_address_name || h.address_name || '-')}</div>
          <div class="mc-muted" style="font-size:13px;">${h.phone ? '📞 ' + escapeHtml(h.phone) : ''}</div>
          <div style="display:flex; gap:8px; margin-top:8px;">
            <a class="btn-primary" style="flex:1; text-align:center; text-decoration:none; padding:8px; border-radius:8px; border:1px solid transparent;" target="_blank" rel="noopener"
               href="https://map.kakao.com/link/to/${encodeURIComponent(h.place_name)},${h.y},${h.x}">길찾기</a>
            <a class="btn-secondary" style="flex:1; text-align:center; text-decoration:none; padding:8px; border-radius:8px;"
               target="_blank" rel="noopener" href="https://place.map.kakao.com/${h.id}">상세보기</a>
          </div>
        </div>
      `).join('');
      listContainer.innerHTML = html;
    }

    function markAndFit(list){
      const bounds = new kakao.maps.LatLngBounds();
      list.forEach(h=>{
        if (!h.x || !h.y) return;
        const pos = new kakao.maps.LatLng(h.y, h.x);
        new kakao.maps.Marker({ map, position: pos });
        bounds.extend(pos);
      });
      if (!bounds.isEmpty()) map.setBounds(bounds);
    }

    function search(center){
      const keywords = ['정신건강의학과', '심리상담'];
      const all = new Map();
      let pending = keywords.length;
      keywords.forEach(q=>{
        places.keywordSearch(q, (data, status) => {
          pending--;
          if (status === kakao.maps.services.Status.OK && Array.isArray(data)){
            data.forEach(d=> all.set(d.id, d));
          }
          if (pending===0){
            const list = Array.from(all.values());
            render(list);
            markAndFit(list);
          }
        }, { location: center, radius: 3000, size: 15, sort: kakao.maps.services.SortBy.DISTANCE });
      });
    }

    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition(
        pos => {
          const center = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          map.setCenter(center); search(center);
        },
        _err => { search(defaultCenter); },
        { enableHighAccuracy:true, timeout:8000 }
      );
    } else {
      search(defaultCenter);
    }
  }

  // Kakao SDK를 페이지에서 바로 로드했으므로 곧바로 호출
  displayNearbyHospitals();
});
