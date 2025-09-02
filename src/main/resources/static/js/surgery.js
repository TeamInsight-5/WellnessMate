document.addEventListener('DOMContentLoaded', () => {

  // --- 상태 변수 및 상수 정의 ---
  let currentStep = 1;
  const totalSteps = 5;
  const surveyData = {
    injuries: [],
    imageFile: null,
    bleeding: null,
    pain: null,
    status: []
  };

  // --- 주요 DOM 요소 선택 ---
  const steps = {
    1: document.getElementById('step1'),
    2: document.getElementById('step2'),
    3: document.getElementById('step3'),
    4: document.getElementById('step4'),
    5: document.getElementById('step5'),
    result: document.getElementById('result')
  };
  const guides = {
    default: document.getElementById('guide-default'),
    step2: document.getElementById('guide-step2'),
    result: document.getElementById('guide-result')
  };
  const progressBar = document.querySelector('.progress');
  const stepText = document.querySelector('.step-text');
  const surveyContainer = document.querySelector('.survey-container');
  const fileInput = document.getElementById('file-upload-input');
  const dragDropArea = document.getElementById('drag-drop-area');

  // --- 유틸: Kakao SDK 준비 대기 ---
  function whenKakaoReady(cb, tries = 0) {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) return cb();
    if (tries > 50) return cb(new Error('Kakao SDK not ready'));
    setTimeout(() => whenKakaoReady(cb, tries + 1), 100);
  }

  // --- 함수 정의 ---
  const goToMainPage = () => window.location.href = '/'; // 필요 시 '/main'으로 교체
  const restartSurvey = () => window.location.reload();

  const updateUI = () => {
    Object.values(steps).forEach(step => step && (step.style.display = 'none'));
    Object.values(guides).forEach(guide => guide && (guide.style.display = 'none'));

    const activeStepElement = steps[currentStep];
    if (currentStep <= totalSteps && activeStepElement) {
      activeStepElement.style.display = 'flex';
      // 현재 단계 가이드
      if (currentStep === 2) {
        guides.step2 && (guides.step2.style.display = 'block');
      } else {
        guides.default && (guides.default.style.display = 'block');
      }

      const progressPercentage = (currentStep / totalSteps) * 100;
      if (progressBar) progressBar.style.width = `${progressPercentage}%`;
      if (stepText) stepText.textContent = `${currentStep}/${totalSteps}`;

      const prevBtn = activeStepElement.querySelector('.btn-prev');
      if (prevBtn) prevBtn.disabled = (currentStep === 1);

    } else if (steps.result) { // 결과 페이지
      steps.result.style.display = 'block';
      guides.result && (guides.result.style.display = 'block');
      if (progressBar) progressBar.style.width = '100%';
      if (stepText) stepText.textContent = '결과';
    }
  };

  const validateStep = (step) => {
    const stepElement = steps[step];
    if (!stepElement) return false;

    if (step === 1) {
      const checked = Array.from(stepElement.querySelectorAll('input:checked'));
      if (checked.length === 0) {
        alert('외상 종류를 1개 이상 선택해주세요.');
        return false;
      }
      surveyData.injuries = checked.map(el => el.value);

    } else if (step === 3) {
      const checked = stepElement.querySelector('input:checked');
      if (!checked) {
        alert('출혈 정도를 선택해주세요.');
        return false;
      }
      surveyData.bleeding = checked.value;

    } else if (step === 4) {
      const checked = stepElement.querySelector('input:checked');
      if (!checked) {
        alert('통증 및 움직임 정도를 선택해주세요.');
        return false;
      }
      surveyData.pain = checked.value;

    } else if (step === 5) {
      const checked = Array.from(stepElement.querySelectorAll('input:checked'));
      if (checked.length === 0) {
        alert('현재 상태를 1개 이상 선택해주세요.');
        return false;
      }
      surveyData.status = checked.map(el => el.value);
    }
    return true;
  };

  const renderResult = (data) => {
    const resultContainer = steps.result;
    resultContainer.innerHTML = `
      <h2>응급도 평가 결과</h2>
      <div class="result-card" style="border: 1px solid #ddd; padding: 20px; border-radius: 10px; text-align: center;">
        <div style="display: flex; justify-content: space-around; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0;">${data.riskLevel}</h3>
          <span style="background-color: ${data.riskColor}; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold;">${data.riskScore}/${data.maxScore}점</span>
        </div>
        <div class="progress-bar" style="margin: 10px 0;">
          <div class="progress" style="width: ${(data.riskScore / data.maxScore) * 100}%; background-color: ${data.riskColor};"></div>
        </div>
        <p><strong>${data.emergencyMessage}</strong></p>
        <p>${data.emergencyGuide}</p>
      </div>
      <div class="recommendation-section" style="margin-top: 20px; text-align: left;">
        <h4 style="margin-top: 0;">추천 진료과</h4>
        ${data.recommendedDepartments.map((dept, index) => `
          <div class="department-item" style="border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <p style="margin: 0;"><strong>${index + 1}순위: ${dept.name}</strong></p>
            <small style="color: var(--text-light);">${dept.description}</small>
          </div>
        `).join('')}
      </div>
      <div class="button-group">
        <button type="button" class="btn-primary" id="restart-button">다시 진단하기</button>
        <button type="button" class="btn-secondary" id="main-page-button">메인으로 돌아가기</button>
      </div>
    `;
    document.getElementById('restart-button').addEventListener('click', restartSurvey);
    document.getElementById('main-page-button').addEventListener('click', goToMainPage);
  };

  const submitSurvey = () => {
    // console.log("최종 설문 데이터:", surveyData);
    const dummyResult = calculateDummyResult(surveyData);
    renderResult(dummyResult);
    currentStep = totalSteps + 1;
    updateUI();
  };

  const calculateDummyResult = (data) => {
    let riskScore = 0;
    let riskLevel = "안정";
    let emergencyMessage = "안정적인 상태입니다.";
    let emergencyGuide = "자가 처치 후 경과를 지켜보거나 가까운 병원을 방문해 주세요.";
    let recommendedDepartments = [{ name: "일반외과", description: "간단한 외상 처치 및 소독이 가능합니다." }];

    // 외상 종류
    if (data.injuries.includes('head_injury') || data.injuries.includes('facial_injury')) {
      riskScore += 10;
    } else if (data.injuries.includes('burn') || data.injuries.includes('traffic_accident') || data.injuries.includes('fracture') || data.injuries.includes('puncture')) {
      riskScore += 7;
    } else if (data.injuries.includes('animal_bite')) {
      riskScore += 5;
    } else if (data.injuries.includes('cut')) {
      riskScore += 3;
    }

    // 출혈
    if (data.bleeding === 'slight') riskScore += 2;
    else if (data.bleeding === 'continuous') riskScore += 5;
    else if (data.bleeding === 'severe') riskScore += 8;
    else if (data.bleeding === 'spurting') riskScore += 12;

    // 통증
    if (data.pain === 'moderate') riskScore += 3;
    else if (data.pain === 'severe') riskScore += 7;
    else if (data.pain === 'unconscious') riskScore += 15;

    // 상태
    if (data.status.includes('breathing_difficulty') || data.status.includes('consciousness_decreased')) {
      riskScore += 10;
    } else if (data.status.includes('pulse_fast') || data.status.includes('pulse_weak') || data.status.includes('nausea') || data.status.includes('dizziness')) {
      riskScore += 5;
    }

    // 사진 업로드 시 (더미 가점)
    if (data.imageFile) {
      riskScore += 2;
      emergencyGuide += " AI 분석 결과는 더욱 정확한 진단에 도움이 됩니다.";
    }

    if (riskScore >= 20) {
      riskLevel = "매우 위험";
      emergencyMessage = "생명이 위험할 수 있는 심각한 응급상황입니다!";
      emergencyGuide = "즉시 119에 신고하고 응급실로 이송하세요.";
      recommendedDepartments = [{ name: "응급의학과", description: "즉각적인 처치 및 소생술이 필요합니다." }];
    } else if (riskScore >= 10) {
      riskLevel = "위험";
      emergencyMessage = "빠른 의료 조치가 필요한 응급상황입니다.";
      emergencyGuide = "가까운 응급실을 방문하거나 의료기관에 문의하세요.";
      recommendedDepartments = [
        { name: "응급의학과", description: "빠른 진단과 처치가 필요합니다." },
        { name: "정형외과", description: "골절/탈구 등 뼈와 관절 외상에 특화." }
      ];
    } else if (riskScore >= 5) {
      riskLevel = "주의";
      emergencyMessage = "경과를 지켜보고 병원 방문을 고려하세요.";
      emergencyGuide = "자가 처치 후 악화 시 병원을 방문해야 합니다.";
      recommendedDepartments = [
        { name: "일반외과", description: "열상, 자상 등 일반 외상 처치." },
        { name: "가정의학과", description: "경미한 외상 및 일반 진료." }
      ];
    }

    let riskColor = '#5cb85c';
    if (riskLevel === "주의") riskColor = '#f0ad4e';
    else if (riskLevel === "위험") riskColor = '#d9534f';
    else if (riskLevel === "매우 위험") riskColor = '#ff0000';

    return {
      riskLevel,
      riskScore,
      maxScore: 30,
      riskColor,
      emergencyMessage,
      emergencyGuide,
      recommendedDepartments
    };
  };

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    surveyData.imageFile = file;
    if (dragDropArea) {
      const p = dragDropArea.querySelector('p');
      const icon = dragDropArea.querySelector('i');
      if (p) p.textContent = `선택된 파일: ${file.name}`;
      if (icon) icon.style.display = 'none';
    }
  };

  const displayNearbyHospitals = () => {
    const mapContainer = document.getElementById('map-container');
    const listContainer = document.querySelector('.hospital-grid');
    if (!mapContainer || !listContainer) return;

    const displayError = (message) => listContainer.innerHTML = `<p style="text-align: center; color: #888;">${message}</p>`;

    const initWithCenter = (centerLatLng) => {
      const map = new kakao.maps.Map(mapContainer, { center: centerLatLng, level: 5 });
      const places = new kakao.maps.services.Places();

      places.keywordSearch('응급실', (data, status) => {
        if (status === kakao.maps.services.Status.OK) {
          listContainer.innerHTML = '';
          const bounds = new kakao.maps.LatLngBounds();
          data.forEach(place => {
            const placePosition = new kakao.maps.LatLng(place.y, place.x);
            new kakao.maps.Marker({ map, position: placePosition });
            const hospitalDiv = document.createElement('div');
            hospitalDiv.className = 'hospital-item'; // CSS와 일치
            hospitalDiv.innerHTML = `
              <strong>${place.place_name}</strong>
              <div class="details">${place.road_address_name || place.address_name || ''}</div>
              <div class="details">📞 ${place.phone || '전화번호 없음'}</div>
              <div class="buttons">
                <a href="https://map.kakao.com/link/to/${encodeURIComponent(place.place_name)},${place.y},${place.x}" class="btn btn-primary" target="_blank">길찾기</a>
                <a href="${place.place_url}" class="btn btn-secondary" target="_blank">상세보기</a>
              </div>`;
            listContainer.appendChild(hospitalDiv);
            bounds.extend(placePosition);
          });
          map.setBounds(bounds);
        } else {
          displayError('주변 응급실 정보를 찾을 수 없습니다.');
        }
      }, { location: centerLatLng, radius: 10000 });
    };

    // 지오로케이션 시도
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLocation = new kakao.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          initWithCenter(userLocation);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          displayError('위치 권한이 거부되어 기본 위치(서울시청)로 검색합니다.');
          const fallback = new kakao.maps.LatLng(37.5665, 126.9780);
          initWithCenter(fallback);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    } else {
      displayError('이 브라우저는 위치 정보를 지원하지 않습니다. 기본 위치(서울시청)로 검색합니다.');
      const fallback = new kakao.maps.LatLng(37.5665, 126.9780);
      initWithCenter(fallback);
    }
  };

  // --- 이벤트 리스너 설정 ---
  surveyContainer.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    if (target.classList.contains('btn-next') || target.classList.contains('btn-skip')) {
      if (target.classList.contains('btn-next') && !validateStep(currentStep)) {
        // 유효성 실패 시 즉시 종료
        return;
      }
      if (currentStep < totalSteps) {
        currentStep++;
        updateUI();
      }
    } else if (target.classList.contains('btn-prev')) {
      if (currentStep > 1) {
        currentStep--;
        updateUI();
      }
    } else if (target.classList.contains('btn-submit')) {
      if (validateStep(currentStep)) {
        submitSurvey();
      }
    }
  });

  document.getElementById('upload-photo-button')?.addEventListener('click', () => fileInput && fileInput.click());
  fileInput?.addEventListener('change', () => handleFiles(fileInput.files));

  if (dragDropArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dragDropArea.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
    });
    ['dragenter', 'dragover'].forEach(eventName => {
      dragDropArea.addEventListener(eventName, () => dragDropArea.style.backgroundColor = '#f0f8ff', false);
    });
    ['dragleave', 'drop'].forEach(eventName => {
      dragDropArea.addEventListener(eventName, () => dragDropArea.style.backgroundColor = 'transparent', false);
    });
    dragDropArea.addEventListener('drop', e => handleFiles(e.dataTransfer.files), false);
  }

  // --- 초기화 ---
  new Swiper('.photo-guide-slider', {
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    loop: true,
  });

  updateUI();

  // Kakao SDK 준비 후 지도/주변 병원 초기화
  whenKakaoReady((err) => {
    if (err) {
      console.warn(err.message || err);
      const listContainer = document.querySelector('.hospital-grid');
      if (listContainer) listContainer.innerHTML = `<p style="text-align:center; color:#888;">지도를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>`;
      return;
    }
    displayNearbyHospitals();
  });
});
