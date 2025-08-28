// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// 내과 상담 페이지 스크립트 (internalmedicine.js) - 진행률 숫자 표시 최종본
// =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

document.addEventListener('DOMContentLoaded', () => {

    // --- 상태 변수 및 상수 정의 ---
    let currentStep = 1;
    const totalSteps = 4;
    const surveyData = {
        symptoms: [],
        duration: null,
        severity: null,
        history: []
    };

    // --- 주요 DOM 요소 선택 ---
    const steps = {
        1: document.getElementById('step1'),
        2: document.getElementById('step2'),
        3: document.getElementById('step3'),
        4: document.getElementById('step4'),
        result: document.getElementById('result')
    };
    const surveyContainer = document.querySelector('.survey-container');
    const progressBar = document.querySelector('.progress');
    const stepText = document.querySelector('.step-text');

    // 결과 페이지 요소
    const resultTitle = document.getElementById('resultTitle');
    const urgencyBadge = document.getElementById('urgencyBadge');
    const riskProgress = document.getElementById('riskProgress');
    const riskScore = document.getElementById('riskScore');
    const resultMessage = document.getElementById('resultMessage');
    const recommendedDepartments = document.getElementById('recommendedDepartments');
    const expectedDisease = document.getElementById('expectedDisease');
    const loadingContainer = document.getElementById('loading-container');
    const resultContent = document.getElementById('result-content');


    // --- 함수 정의 ---

    const goToMainPage = () => window.location.href = '/main';
    const restartSurvey = () => window.location.reload();

    const updateUI = () => {
        Object.values(steps).forEach(step => step && (step.style.display = 'none'));
        if (currentStep <= totalSteps) {
            steps[currentStep].style.display = 'block';
            const progress = (currentStep / totalSteps) * 100;
            progressBar.style.width = `${progress}%`;
            stepText.textContent = `${currentStep}/${totalSteps}`;
        } else {
            steps.result.style.display = 'block';
            progressBar.style.width = '100%';
            stepText.textContent = '결과';
        }
    };

    const renderResult = (data) => {
        resultTitle.textContent = data.expectedDisease.name;
        urgencyBadge.textContent = data.expectedDisease.urgency;
        urgencyBadge.className = `urgency-badge ${data.expectedDisease.urgency.toLowerCase()}`;
        const riskPercentage = (data.riskScore / 20) * 100;
        riskProgress.style.width = `${riskPercentage}%`;
        riskScore.textContent = `${Math.round(riskPercentage)}%`;
        resultMessage.textContent = data.riskMessage;
        recommendedDepartments.innerHTML = '';
        data.recommendedDepartments.forEach(dept => {
            const div = document.createElement('div');
            div.className = 'department-item';
            div.textContent = `• ${dept}`;
            recommendedDepartments.appendChild(div);
        });
        expectedDisease.innerHTML = `
            <div class="disease-card">
                <div class="disease-header">
                    <h3>${data.expectedDisease.name}</h3>
                    <span class="urgency-badge ${data.expectedDisease.urgency.toLowerCase()}">${data.expectedDisease.urgency}</span>
                </div>
                <p><strong>주요 증상:</strong> ${data.expectedDisease.relatedSymptoms.join(', ')}</p>
                <p><strong>추천 진료과:</strong> ${data.expectedDisease.recommendedDepartment}</p>
            </div>
        `;
        resultContent.querySelector('.btn-primary').addEventListener('click', restartSurvey);
        resultContent.querySelector('.btn-secondary').addEventListener('click', goToMainPage);
    };

    // 💡💡💡 [수정됨] 진행률 UI를 포함하도록 변경된 함수 💡💡💡
    const handleFormSubmission = () => {
        resultContent.style.display = 'none';
        loadingContainer.style.display = 'block';
        currentStep = totalSteps + 1;
        updateUI();

        // 1. [핵심 수정] 진행률 숫자(span)와 바(div)를 분리한 HTML 구조 삽입
        loadingContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 0;">
                <p style="font-weight: bold; font-size: 1.1rem; margin-bottom: 20px;">AI가 증상을 분석 중입니다...</p>
                <div class="progress-wrapper" style="display: flex; align-items: center; justify-content: center; gap: 15px; width: 80%; margin: 0 auto;">
                    <div class="progress-container" style="flex-grow: 1; background-color: #e9ecef; border-radius: 5px;">
                        <div id="loading-progress-bar" style="width: 0%; height: 10px; background-color: #28a745; border-radius: 5px; transition: width 0.4s ease;"></div>
                    </div>
                    <span id="loading-progress-text" style="font-weight: bold; color: #28a745; min-width: 40px;">0%</span>
                </div>
            </div>
        `;

        // 2. [핵심 수정] 진행률 바(bar)와 텍스트(text) 요소를 모두 선택
        const progressBar = document.getElementById('loading-progress-bar');
        const progressText = document.getElementById('loading-progress-text');
        let progress = 0;

        const interval = setInterval(() => {
            if (progress < 60) progress += 2;
            else if (progress < 90) progress += 1;

            // 3. [핵심 수정] 바의 너비와 텍스트의 내용을 각각 업데이트
            progressBar.style.width = progress + '%';
            progressText.textContent = progress + '%';
        }, 120);

        fetch('/internal-medicine/diagnose', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(surveyData),
        })
        .then(response => {
            if (!response.ok) throw new Error(`서버 오류: ${response.status}`);
            return response.json();
        })
        .then(aiResult => {
            clearInterval(interval);
            // 4. [핵심 수정] 완료 시 바와 텍스트 모두 100%로 업데이트
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            setTimeout(() => {
                renderResult(aiResult);
                loadingContainer.style.display = 'none';
                resultContent.style.display = 'block';
            }, 500);
        })
        .catch(error => {
            clearInterval(interval);
            console.error('진단 오류:', error);
            loadingContainer.innerHTML = `
                <div style="text-align: center; padding: 40px 0;">
                    <h2>진단 중 오류 발생</h2>
                    <p>AI 진단에 실패했습니다. 잠시 후 다시 시도해주세요.</p>
                    <div class="button-group" style="justify-content: center;">
                        <button type="button" class="btn-primary" id="restart-button-error">다시 진단하기</button>
                    </div>
                </div>
            `;
            document.getElementById('restart-button-error').addEventListener('click', restartSurvey);
        });
    };

    const handleHistoryCheckboxes = () => {
        const historyCheckboxes = document.querySelectorAll('#historyForm input[name="history"]');
        const noHistoryCheckbox = document.querySelector('#historyForm input[value="none"]');
        if (!noHistoryCheckbox) return;

        historyCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target === noHistoryCheckbox && e.target.checked) {
                    historyCheckboxes.forEach(cb => { if (cb !== noHistoryCheckbox) cb.checked = false; });
                } else if (e.target !== noHistoryCheckbox && e.target.checked) {
                    noHistoryCheckbox.checked = false;
                }
            });
        });
    };

    const displayNearbyHospitals = () => {
        const mapContainer = document.getElementById('map-container');
        const listContainer = document.getElementById('nearby-hospitals-list');
        if (!mapContainer || !listContainer) return;

        const displayError = (message) => listContainer.innerHTML = `<p style="text-align:center;">${message}</p>`;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const userLocation = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
                const map = new kakao.maps.Map(mapContainer, { center: userLocation, level: 5 });
                const places = new kakao.maps.services.Places();

                places.keywordSearch('내과', (data, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        listContainer.innerHTML = '';
                        const bounds = new kakao.maps.LatLngBounds();
                        data.forEach(place => {
                            new kakao.maps.Marker({ map, position: new kakao.maps.LatLng(place.y, place.x) });
                            const hospitalDiv = document.createElement('div');
                            hospitalDiv.className = 'hospital-item';
                            hospitalDiv.innerHTML = `
                                <strong>${place.place_name}</strong>
                                <div class="details">${place.address_name}</div>
                                <div class="details">📞 ${place.phone || '전화번호 없음'}</div>
                                <div class="buttons">
                                    <a href="https://map.kakao.com/link/to/${place.id}" class="btn-primary" target="_blank">길찾기</a>
                                    <a href="${place.place_url}" class="btn-secondary" target="_blank">자세히 보기</a>
                                </div>`;
                            listContainer.appendChild(hospitalDiv);
                            bounds.extend(new kakao.maps.LatLng(place.y, place.x));
                        });
                        map.setBounds(bounds);
                    } else {
                        displayError('주변 병원 정보를 찾을 수 없습니다.');
                    }
                }, { location: userLocation, radius: 10000 });
            }, () => {
                displayError('위치 정보 제공에 동의하시면 주변 병원 정보를 볼 수 있습니다.');
            });
        } else {
            displayError('이 브라우저는 위치 정보를 지원하지 않습니다.');
        }
    };

    // --- 이벤트 리스너 설정 ---
    surveyContainer.addEventListener('click', (e) => {
        const target = e.target;
        let canProceed = true;

        if (target.matches('.btn-next')) {
            if (currentStep === 1) {
                const checked = Array.from(steps[1].querySelectorAll('input:checked'));
                if (checked.length === 0) { alert('증상을 하나 이상 선택해주세요.'); canProceed = false; }
                else { surveyData.symptoms = checked.map(el => el.value); }
            } else if (currentStep === 2) {
                const checked = steps[2].querySelector('input:checked');
                if (!checked) { alert('기간을 선택해주세요.'); canProceed = false; }
                else { surveyData.duration = checked.value; }
            } else if (currentStep === 3) {
                const checked = steps[3].querySelector('input:checked');
                if (!checked) { alert('심각도를 선택해주세요.'); canProceed = false; }
                else { surveyData.severity = checked.value; }
            }
            if (canProceed && currentStep < totalSteps) { currentStep++; updateUI(); }

        } else if (target.matches('.btn-prev')) {
            if (currentStep > 1) { currentStep--; updateUI(); }
            else { goToMainPage(); }

        } else if (target.matches('.btn-submit')) {
            const checked = Array.from(steps[4].querySelectorAll('input:checked'));
            if(checked.length === 0) { alert('병력 유무를 선택해주세요.'); return; }
            surveyData.history = checked.map(el => el.value);
            handleFormSubmission();
        }
    });

    // --- 초기화 실행 ---
    handleHistoryCheckboxes();

    displayNearbyHospitals();
    updateUI();
});