// /js/internalmedicine.js
document.addEventListener('DOMContentLoaded', () => {
  // --- 환경에 맞는 FastAPI 주소 ---
  const API_BASE =
    (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
      ? 'http://127.0.0.1:8000'
      : 'https://<배포시-당신의-fastapi-도메인>';

  // ----- 상태 -----
  let currentStep = 1;
  const totalSteps = 4;
  const surveyData = {
    symptoms: [],
    duration: null,
    severity: null,
    history: []
  };

  // ----- 주요 DOM -----
  const steps = {
    1: document.getElementById('step1'),
    2: document.getElementById('step2'),
    3: document.getElementById('step3'),
    4: document.getElementById('step4'),
    result: document.getElementById('result'),
  };

  const surveyContainer = document.querySelector('.survey-container');
  const progressBar = document.getElementById('progressBar') || document.querySelector('.progress');
  const stepText = document.getElementById('stepText') || document.querySelector('.step-text');
  const progressPercent = document.getElementById('progressPercent');

  // 결과 영역
  const resultContent = document.getElementById('result-content');
  const loadingContainer = document.getElementById('loading-container');

  const resultTitle = document.getElementById('resultTitle');
  const urgencyBadge = document.getElementById('urgencyBadge');
  const riskProgress = document.getElementById('riskProgress');
  const riskScore = document.getElementById('riskScore');
  const resultMessage = document.getElementById('resultMessage');
  const recommendedDepartments = document.getElementById('recommendedDepartments');
  const expectedDisease = document.getElementById('expectedDisease');
  const diseaseProbabilities = document.getElementById('diseaseProbabilities'); // 없으면 자동으로 skip됨

  // ----- 유틸 -----
  const goToMainPage = () => (window.location.href = '/main');
  const restartSurvey = () => window.location.reload();

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const slugUrgency = (urgencyKo) => {
    if (!urgencyKo) return 'normal';
    if (urgencyKo.includes('응급')) return 'critical';
    if (urgencyKo.includes('빠른')) return 'fast';
    return 'normal';
  };

  const updateProgressUI = () => {
    const progress = clamp(Math.round((currentStep / totalSteps) * 100), 0, 100);
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (stepText) stepText.textContent = currentStep <= totalSteps ? `${currentStep}/${totalSteps}` : '결과';
    if (progressPercent) progressPercent.textContent = `${progress}%`;
  };

  const showOnly = (key) => {
    Object.values(steps).forEach((el) => el && (el.style.display = 'none'));
    if (steps[key]) steps[key].style.display = 'block';
    updateProgressUI();
  };

  const updateUI = () => {
    if (currentStep <= totalSteps) {
      showOnly(currentStep);
    } else {
      showOnly('result');
    }
  };

  const renderChips = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return '';
    return `
      <div class="chip-wrap">
        ${arr.map((d) => `<span class="chip">${d}</span>`).join('')}
      </div>
    `;
  };

  const renderProbabilities = (probs) => {
    if (!diseaseProbabilities) return;
    diseaseProbabilities.innerHTML = '';

    if (!Array.isArray(probs) || probs.length === 0) {
      diseaseProbabilities.parentElement.style.display = 'none';
      return;
    }
    diseaseProbabilities.parentElement.style.display = 'block';

    probs.forEach((p) => {
      const row = document.createElement('div');
      row.className = 'prob-row';

      const label = document.createElement('div');
      label.className = 'prob-label';
      label.textContent = p.name ?? '';

      const barWrap = document.createElement('div');
      barWrap.className = 'prob-bar-wrap';

      const bar = document.createElement('div');
      bar.className = 'prob-bar';
      const percent = clamp(Number(p.percent ?? 0), 0, 100);
      bar.style.width = `${percent}%`;

      const val = document.createElement('span');
      val.className = 'prob-val';
      val.textContent = `${percent}%`;

      barWrap.appendChild(bar);
      row.appendChild(label);
      row.appendChild(barWrap);
      row.appendChild(val);
      diseaseProbabilities.appendChild(row);
    });
  };

  const renderResult = (data) => {
    const ed = data?.expectedDisease || {};
    resultTitle.textContent = ed.name || '결과';
    const urgencyClass = slugUrgency(ed.urgency);
    urgencyBadge.textContent = ed.urgency || '';
    urgencyBadge.className = `urgency-badge urgency-${urgencyClass}`;

    const score20 = clamp(parseInt(data?.riskScore ?? 0, 10), 0, 20);
    const percent100 = Math.round((score20 / 20) * 100);
    riskProgress.style.width = `${percent100}%`;
    riskScore.textContent = `${score20}/20 (${percent100}%)`;

    resultMessage.textContent = data?.riskMessage || '';

    recommendedDepartments.innerHTML = renderChips(data?.recommendedDepartments || []);

    const relatedSymptoms = (ed.relatedSymptoms || []).join(', ') || '정보 없음';
    expectedDisease.innerHTML = `
      <div class="disease-card">
        <div class="disease-header">
          <h3>${ed.name ?? ''}</h3>
          <span class="urgency-badge urgency-${urgencyClass}">${ed.urgency ?? ''}</span>
        </div>
        <p><strong>주요 증상:</strong> ${relatedSymptoms}</p>
        <p><strong>추천 진료과:</strong> ${ed.recommendedDepartment ?? ''}</p>
      </div>
    `;

    renderProbabilities(data?.probabilities);

    const btnPrimary = resultContent.querySelector('.btn-primary');
    const btnSecondary = resultContent.querySelector('.btn-secondary');
    if (btnPrimary) btnPrimary.onclick = restartSurvey;
    if (btnSecondary) btnSecondary.onclick = goToMainPage;
  };

  const handleFormSubmission = async () => {
    // 로딩 전환
    resultContent.style.display = 'none';
    loadingContainer.style.display = 'block';

    currentStep = totalSteps + 1;
    updateUI();

    try {
      // ✅ 절대 URL 사용!
      const res = await fetch(`${API_BASE}/internal-medicine/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `서버 오류: ${res.status} ${res.statusText}`);
      }

      const payload = await res.json();

      renderResult(payload);
      loadingContainer.style.display = 'none';
      resultContent.style.display = 'block';
    } catch (err) {
      console.error('진단 오류:', err);
      loadingContainer.innerHTML = `
        <h2>진단 중 오류 발생</h2>
        <p>${(err && err.message) ? err.message : 'AI 진단에 실패했습니다. 잠시 후 다시 시도해주세요.'}</p>
        <div class="button-group">
          <button type="button" class="btn-primary" id="restart-button-error">다시 진단하기</button>
        </div>
      `;
      document.getElementById('restart-button-error')?.addEventListener('click', restartSurvey);
    }
  };

  const handleHistoryCheckboxes = () => {
    const historyCheckboxes = document.querySelectorAll('#historyForm input[name="history"]');
    const noHistoryCheckbox = document.querySelector('#historyForm input[value="none"]');
    if (!noHistoryCheckbox) return;

    historyCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', (e) => {
        if (e.target === noHistoryCheckbox && e.target.checked) {
          historyCheckboxes.forEach((cb) => { if (cb !== noHistoryCheckbox) cb.checked = false; });
        } else if (e.target !== noHistoryCheckbox && e.target.checked) {
          noHistoryCheckbox.checked = false;
        }
      });
    });
  };

  // ----- 병원 지도/리스트 -----
  const initMapAndHospitals = () => {
    const mapContainer = document.getElementById('map-container');
    const listContainer = document.getElementById('nearby-hospitals-list');
    if (!mapContainer || !listContainer) return;

    const displayError = (msg) => {
      listContainer.innerHTML = `<p style="text-align:center; color:#666;">${msg}</p>`;
    };

    const renderHospitals = (map, data) => {
      listContainer.innerHTML = '';
      const bounds = new kakao.maps.LatLngBounds();

      data.forEach((place) => {
        const pos = new kakao.maps.LatLng(place.y, place.x);
        new kakao.maps.Marker({ map, position: pos });
        bounds.extend(pos);

        const div = document.createElement('div');
        div.className = 'hospital-item';
        const phone = place.phone || '전화번호 없음';
        const telHref = place.phone ? `tel:${place.phone.replace(/[^0-9+]/g, '')}` : '#';

        div.innerHTML = `
          <strong>${place.place_name}</strong>
          <div class="details">${place.address_name}</div>
          <div class="contact-info">📞 ${phone}</div>
          <div class="buttons">
            <a class="btn-call" href="${telHref}" ${place.phone ? '' : 'aria-disabled="true"'}>전화</a>
            <a class="btn-directions" href="https://map.kakao.com/link/to/${place.id}" target="_blank" rel="noopener">길찾기</a>
            <a class="btn-detail" href="${place.place_url}" target="_blank" rel="noopener">자세히 보기</a>
          </div>
        `;
        listContainer.appendChild(div);
      });

      if (!bounds.isEmpty()) map.setBounds(bounds);
    };

    const createMap = (center) => new kakao.maps.Map(mapContainer, { center, level: 5 });

    const search = (map, loc) => {
      const places = new kakao.maps.services.Places();
      places.keywordSearch(
        '내과',
        (data, status) => {
          if (status === kakao.maps.services.Status.OK) renderHospitals(map, data);
          else displayError('주변 병원 정보를 찾을 수 없습니다.');
        },
        { location: loc, radius: 10000 }
      );
    };

    const start = (lat, lng) => {
      const loc = new kakao.maps.LatLng(lat, lng);
      const map = createMap(loc);
      search(map, loc);
    };

    const fallbackCenter = () => start(37.5665, 126.9780); // 서울시청 근처

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => start(pos.coords.latitude, pos.coords.longitude),
        () => { displayError('위치 정보 제공에 동의하시면 주변 병원 정보를 볼 수 있습니다.'); fallbackCenter(); }
      );
    } else {
      displayError('이 브라우저는 위치 정보를 지원하지 않습니다.');
      fallbackCenter();
    }
  };

  const initKakao = () => {
    if (window.kakao && kakao.maps && kakao.maps.load) {
      kakao.maps.load(initMapAndHospitals);
    } else {
      const onLoaded = () => {
        window.removeEventListener('kakao:loaded', onLoaded);
        kakao.maps.load(initMapAndHospitals);
      };
      window.addEventListener('kakao:loaded', onLoaded);
    }
  };

  // ----- 이벤트 바인딩 -----
  surveyContainer.addEventListener('click', (e) => {
    const target = e.target;
    let canProceed = true;

    if (target.matches('.btn-next')) {
      if (currentStep === 1) {
        const checked = Array.from(steps[1].querySelectorAll('input[name="symptoms"]:checked'));
        if (checked.length === 0) { alert('증상을 하나 이상 선택해주세요.'); canProceed = false; }
        else { surveyData.symptoms = checked.map((el) => el.value); }
      } else if (currentStep === 2) {
        const checked = steps[2].querySelector('input[name="duration"]:checked');
        if (!checked) { alert('기간을 선택해주세요.'); canProceed = false; }
        else { surveyData.duration = checked.value; }
      } else if (currentStep === 3) {
        const checked = steps[3].querySelector('input[name="severity"]:checked');
        if (!checked) { alert('심각도를 선택해주세요.'); canProceed = false; }
        else { surveyData.severity = checked.value; }
      }

      if (canProceed && currentStep < totalSteps) { currentStep++; updateUI(); }
    } else if (target.matches('.btn-prev')) {
      if (currentStep > 1) { currentStep--; updateUI(); }
      else { goToMainPage(); }
    } else if (target.matches('.btn-submit')) {
      const checked = Array.from(steps[4].querySelectorAll('input[name="history"]:checked'));
      if (checked.length === 0) { alert('병력 유무를 선택해주세요.'); return; }
      surveyData.history = checked.map((el) => el.value);
      handleFormSubmission();
    }
  });

  // 초기화
  handleHistoryCheckboxes();
  updateUI();
  initKakao();
});
