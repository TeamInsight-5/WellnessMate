// /js/surgery.js
document.addEventListener('DOMContentLoaded', () => {
  // === API 기준 주소 ===
  const API_BASE =
    (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
      ? 'http://127.0.0.1:8000'
      : 'https://<배포시-당신의-fastapi-도메인>';
  const ENDPOINT = `${API_BASE}/api/surgery/predict`;

  // --- 상태 ---
  let currentStep = 1;
  const totalSteps = 5;
  const surveyData = {
    injuries: [],
    imageFile: null,
    bleeding: null,
    pain: null,
    status: []
  };

  // --- DOM 캐시 ---
  const steps = {
    1: document.getElementById('step1'),
    2: document.getElementById('step2'),
    3: document.getElementById('step3'),
    4: document.getElementById('step4'),
    5: document.getElementById('step5'),
    result: document.getElementById('result'),
  };
  const guides = {
    default: document.getElementById('guide-default'),
    result: document.getElementById('guide-result'),
  };
  const progressBar = document.querySelector('.progress');
  const stepText   = document.querySelector('.step-text');
  const surveyContainer = document.querySelector('.survey-container');
  const fileInput  = document.getElementById('file-upload-input');
  const dragDropArea = document.getElementById('drag-drop-area');

  const goToMainPage  = () => window.location.href = '/main';
  const restartSurvey = () => window.location.reload();

  // --- UI 업데이트 ---
  const updateUI = () => {
    Object.values(steps).forEach(el => el && (el.style.display = 'none'));
    Object.values(guides).forEach(g => g && (g.style.display = 'none'));

    if (currentStep <= totalSteps) {
      const active = steps[currentStep];
      if (active) {
        active.style.display = 'flex';
        guides.default && (guides.default.style.display = 'block');
      }
      const pct = Math.max(0, Math.min(100, (currentStep / totalSteps) * 100));
      progressBar && (progressBar.style.width = `${pct}%`);
      stepText && (stepText.textContent = `${currentStep}/${totalSteps}`);

      const prevBtn = active?.querySelector('.btn-prev');
      if (prevBtn) prevBtn.disabled = (currentStep === 1);
    } else {
      // 결과 화면
      steps.result.style.display = 'block';
      guides.result && (guides.result.style.display = 'block');
      progressBar && (progressBar.style.width = '100%');
      stepText && (stepText.textContent = '결과');
    }
  };

  // --- 단계 유효성검사 ---
  const validateStep = (step) => {
    const el = steps[step];
    if (!el) return false;

    if (step === 1) {
      const checked = Array.from(el.querySelectorAll('input[name="injury"]:checked'));
      if (checked.length === 0) { alert('외상 종류를 1개 이상 선택해주세요.'); return false; }
      surveyData.injuries = checked.map(i => i.value);
    }
    if (step === 3) {
      const r = el.querySelector('input[name="bleeding"]:checked');
      if (!r) { alert('출혈 정도를 선택해주세요.'); return false; }
      surveyData.bleeding = r.value;
    }
    if (step === 4) {
      const r = el.querySelector('input[name="pain"]:checked');
      if (!r) { alert('통증 및 움직임 정도를 선택해주세요.'); return false; }
      surveyData.pain = r.value;
    }
    if (step === 5) {
      const checked = Array.from(el.querySelectorAll('input[name="status"]:checked'));
      if (checked.length === 0) { alert('현재 상태를 1개 이상 선택해주세요.'); return false; }
      surveyData.status = checked.map(i => i.value);
    }
    return true;
  };

  // --- 결과 렌더 ---
  const renderResult = (data) => {
    const result = steps.result;
    const riskStr = String(data?.risk || '');
    let riskColor = '#f0ad4e'; // 주의
    if (riskStr.includes('매우 높음') || riskStr.includes('위험') || riskStr.includes('응급')) riskColor = '#d9534f';
    else if (riskStr.includes('낮음')) riskColor = '#5cb85c';

    result.innerHTML = `
      <h2>AI 분석 결과</h2>
      <div class="result-card" style="border-left:5px solid ${riskColor}; padding:20px; text-align:left;">
        <h3 style="text-align:center; margin-top:0;">${data?.name || 'AI 통합 분석 결과'}</h3>
        <p><strong>🚨 위험도:</strong> <span style="color:${riskColor}; font-weight:bold;">${data?.risk || '미정'}</span></p>
        <p><strong>🩹 응급처치 가이드:</strong></p>
        <p style="background:#f9f9f9; padding:10px; border-radius:5px; white-space:pre-line;">${data?.first_aid || '정보 없음'}</p>
        <hr style="border:none; border-top:1px solid #eee; margin:15px 0;">
        <p><strong>🩺 예상 질환:</strong> ${data?.expected_disease || '정보 없음'}</p>
        <p><strong>🏥 추천 진료과:</strong> ${data?.recommended_department || '응급의학과'}</p>
      </div>
      <div class="button-group">
        <button type="button" class="btn-primary" id="restart-button">다시 진단하기</button>
        <button type="button" class="btn-secondary" id="main-page-button">메인으로 돌아가기</button>
      </div>
    `;
    document.getElementById('restart-button')?.addEventListener('click', restartSurvey);
    document.getElementById('main-page-button')?.addEventListener('click', goToMainPage);
  };

  // --- 제출 ---
  const submitSurvey = () => {
    const formData = new FormData();
    if (surveyData.imageFile) formData.append('image', surveyData.imageFile);
    formData.append('survey_data', JSON.stringify({
      injuries: surveyData.injuries,
      bleeding: surveyData.bleeding,
      pain: surveyData.pain,
      status: surveyData.status
    }));

    // 디버깅: 실제 전송 키/값 확인
    console.log('[Surgery] POST ->', ENDPOINT);
    for (const [k, v] of formData.entries()) {
      console.log('  ', k, (v instanceof File) ? `File(${v.name}, ${v.type}, ${v.size}B)` : v);
    }

    // 결과 로딩 화면
    currentStep = totalSteps + 1;
    updateUI();
    steps.result.innerHTML = `
      <div style="text-align:center; padding:40px 0; display:flex; flex-direction:column; gap:16px; align-items:center;">
        <p style="font-weight:bold; font-size:1.1rem;">AI가 분석을 진행 중입니다...</p>
        <div class="progress-container" style="width:80%; background:#e9ecef; border-radius:5px;">
          <div id="loading-progress-bar" style="width:0%; height:20px; background:var(--primary-color, #d9534f); border-radius:5px; text-align:center; line-height:20px; color:#fff; font-size:12px; transition:width .4s ease;">0%</div>
        </div>
      </div>
    `;

    const bar = document.getElementById('loading-progress-bar');
    let pct = 0;
    const tick = setInterval(() => {
      pct = pct < 60 ? pct + 2 : (pct < 90 ? pct + 1 : pct);
      bar.style.width = pct + '%';
      bar.textContent = pct + '%';
    }, 120);

    // 타임아웃(90초) — 서버/LLM 지연 대비
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    fetch(ENDPOINT, { method: 'POST', body: formData, signal: controller.signal })
      .then(async (res) => {
        clearTimeout(timeout);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.detail || `서버 오류: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        clearInterval(tick);
        bar.style.width = '100%';
        bar.textContent = '100%';
        setTimeout(() => renderResult(data), 400);
      })
      .catch((err) => {
        clearInterval(tick);
        clearTimeout(timeout);
        console.error('AI 분석 요청 실패:', err);
        steps.result.innerHTML = `
          <div class="error-message" style="text-align:center; padding:40px 0;">
            <h3>진단 중 오류 발생</h3>
            <p>${err.name === 'AbortError' ? '요청 시간이 초과되었습니다. 다시 시도해주세요.' : err.message}</p>
            <button type="button" class="btn-primary" id="restart-button">다시 진단하기</button>
          </div>
        `;
        document.getElementById('restart-button')?.addEventListener('click', restartSurvey);
      });
  };

  // --- 파일 처리 ---
  const handleFiles = (files) => {
    if (!files?.length) return;
    const file = files[0];
    // 간단한 용량 체크(10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 용량이 10MB를 초과합니다.');
      return;
    }
    surveyData.imageFile = file;

    if (dragDropArea) {
      const icon = dragDropArea.querySelector('i');
      icon && (icon.style.display = 'none');
      const p = dragDropArea.querySelector('p');
      p && (p.textContent = `✅ 선택된 파일: ${file.name}`);
    }
  };

  // --- 병원 지도(Kakao) ---
  const displayNearbyHospitals = () => {
    const mapContainer = document.getElementById('map-container');
    const listContainer = document.querySelector('.hospital-grid');
    if (!mapContainer || !listContainer) return;

    const displayError = (msg) =>
      listContainer.innerHTML = `<p style="grid-column:1 / -1; text-align:center; color:#888;">${msg}</p>`;

    const renderList = (map, data) => {
      listContainer.innerHTML = '';
      const bounds = new kakao.maps.LatLngBounds();
      data.forEach(place => {
        const pos = new kakao.maps.LatLng(place.y, place.x);
        new kakao.maps.Marker({ map, position: pos });
        bounds.extend(pos);

        const div = document.createElement('div');
        div.className = 'hospital-item';
        div.innerHTML = `
          <strong>${place.place_name}</strong>
          <div class="details">${place.address_name}</div>
          <div class="details">📞 ${place.phone || '전화번호 없음'}</div>
          <div class="buttons">
            <a class="btn btn-primary" href="https://map.kakao.com/link/to/${place.id}" target="_blank" rel="noopener">길찾기</a>
            <a class="btn btn-secondary" href="${place.place_url}" target="_blank" rel="noopener">상세보기</a>
          </div>
        `;
        listContainer.appendChild(div);
      });
      if (!bounds.isEmpty()) map.setBounds(bounds);
    };

    const startMap = (lat, lng) => {
      const center = new kakao.maps.LatLng(lat, lng);
      const map = new kakao.maps.Map(mapContainer, { center, level: 5 });
      new kakao.maps.Marker({ map, position: center });
      const places = new kakao.maps.services.Places();
      places.keywordSearch('응급실',
        (data, status) => {
          if (status === kakao.maps.services.Status.OK) renderList(map, data);
          else displayError('주변 응급실 정보를 찾을 수 없습니다.');
        },
        { location: center, radius: 10000, sort: kakao.maps.services.SortBy.DISTANCE }
      );
    };

    const fallback = () => startMap(37.5665, 126.9780); // 서울시청

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => startMap(pos.coords.latitude, pos.coords.longitude),
        () => { displayError('위치 권한을 허용하면 주변 응급 병원을 볼 수 있어요.'); fallback(); }
      );
    } else {
      displayError('이 브라우저는 위치 정보를 지원하지 않습니다.');
      fallback();
    }
  };

  // Kakao SDK 로드 타이밍
  const initKakao = () => {
    if (window.kakao?.maps?.load) {
      kakao.maps.load(displayNearbyHospitals);
    } else {
      window.addEventListener('load', () => {
        if (window.kakao?.maps?.load) kakao.maps.load(displayNearbyHospitals);
      });
    }
  };

  // --- 이벤트 바인딩 ---
  surveyContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    if (btn.classList.contains('btn-next')) {
      if (validateStep(currentStep) && currentStep < totalSteps) {
        currentStep += 1;
        updateUI();
      }
    }
    if (btn.classList.contains('btn-prev')) {
      if (currentStep > 1) { currentStep -= 1; updateUI(); }
      else { goToMainPage(); }
    }
    if (btn.classList.contains('btn-submit')) {
      if (validateStep(currentStep)) submitSurvey();
    }
  });

  document.getElementById('upload-photo-button')?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => handleFiles(fileInput.files));

  if (dragDropArea) {
    ['dragenter','dragover','dragleave','drop'].forEach(ev => {
      dragDropArea.addEventListener(ev, (e) => { e.preventDefault(); e.stopPropagation(); });
    });
    ['dragenter','dragover'].forEach(ev => {
      dragDropArea.addEventListener(ev, () => dragDropArea.style.backgroundColor = '#f0f8ff');
    });
    ['dragleave','drop'].forEach(ev => {
      dragDropArea.addEventListener(ev, () => dragDropArea.style.backgroundColor = 'transparent');
    });
    dragDropArea.addEventListener('drop', (e) => handleFiles(e.dataTransfer?.files));
  }

  // --- 초기화 ---
  if (typeof Swiper !== 'undefined') {
    new Swiper('.photo-guide-slider', {
      navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
      loop: true
    });
  }
  updateUI();
  initKakao();
});
