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

    // --- 함수 정의 ---
    const goToMainPage = () => window.location.href = '/main';
    const restartSurvey = () => window.location.reload();

    const updateUI = () => {
        Object.values(steps).forEach(step => step && (step.style.display = 'none'));
        Object.values(guides).forEach(guide => guide && (guide.style.display = 'none'));

        const activeStepElement = steps[currentStep];
        if (currentStep <= totalSteps && activeStepElement) {
            activeStepElement.style.display = 'flex';
            if (currentStep === 2) {
                guides.step2.style.display = 'block';
            } else {
                guides.default.style.display = 'block';
            }

            const progressPercentage = (currentStep / totalSteps) * 100;
            progressBar.style.width = `${progressPercentage}%`;
            stepText.textContent = `${currentStep}/${totalSteps}`;

            const prevBtn = activeStepElement.querySelector('.btn-prev');
            if(prevBtn) prevBtn.disabled = (currentStep === 1);

        } else if(steps.result) {
            steps.result.style.display = 'block';
            guides.result.style.display = 'block';
            progressBar.style.width = '100%';
            stepText.textContent = '결과';
        }
    };

    const validateStep = (step) => {
        const stepElement = steps[step];
        if(!stepElement) return false;

        if (step === 1) {
            const checked = Array.from(stepElement.querySelectorAll('input:checked'));
            if (checked.length === 0) {
                alert('외상 종류를 1개 이상 선택해주세요.');
                return false;
            }
            surveyData.injuries = checked.map(el => el.value);
        } else if (step === 2) {
            if (!surveyData.imageFile) {
                alert('상처 부위 사진을 등록해주세요.');
                return false;
            }
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
        // AI 응답에 맞게 위험도 색상 결정
        let riskColor = '#f0ad4e'; // 주의(보통)
        if (data.risk.includes('높음') || data.risk.includes('매우 높음')) {
            riskColor = '#d9534f';
        } else if (data.risk.includes('낮음')) {
            riskColor = '#5cb85c';
        }

        resultContainer.innerHTML = `
            <h2>AI 분석 결과</h2>
            <div class="result-card" style="border-color: ${riskColor}; padding: 20px; border-radius: 10px; text-align: left;">
                <h3 style="text-align: center; margin-top: 0;">${data.name}</h3>
                <p><strong>🚨 위험도:</strong> <span style="color: ${riskColor}; font-weight: bold;">${data.risk}</span></p>
                <p><strong>🩹 응급처치 가이드:</strong></p>
                <p style="background-color: #f9f9f9; padding: 10px; border-radius: 5px;">${data.first_aid}</p>
            </div>
            <div class="recommendation-section" style="margin-top: 20px; text-align: left;">
                <h4 style="margin-top: 0;">안내</h4>
                <div class="department-item" style="border: 1px solid #eee; padding: 15px; border-radius: 8px; margin-top: 10px;">
                    <p style="margin: 0;"><strong>전문의 상담 필요</strong></p>
                    <small style="color: var(--text-light);">AI 분석은 참고용이며, 정확한 진단과 치료는 반드시 병원을 방문하여 전문의와 상담하세요.</small>
                </div>
            </div>
            <div class="button-group">
                <button type="button" class="btn-primary" id="restart-button">다시 진단하기</button>
                <button type="button" class="btn-secondary" id="main-page-button">메인으로 돌아가기</button>
            </div>
        `;
        document.getElementById('restart-button').addEventListener('click', restartSurvey);
        document.getElementById('main-page-button').addEventListener('click', goToMainPage);
    };

    // ⭐️ 실제 서버 통신을 하도록 수정한 함수
    const submitSurvey = () => {
        if (!surveyData.imageFile) {
            alert('상처 부위 사진을 등록해주세요.');
            return;
        }

        const formData = new FormData();
        formData.append('image', surveyData.imageFile);

        currentStep = totalSteps + 1;
        updateUI();
        steps.result.innerHTML = '<div class="loader"></div><p style="text-align: center;">AI가 이미지를 분석 중입니다...</p>';

        fetch('/api/surgery/predict', {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`서버 오류 발생: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("AI 서버 응답:", data);
            renderResult(data); // AI 응답 결과를 화면에 렌더링
        })
        .catch(error => {
            console.error('AI 분석 요청 실패:', error);
            steps.result.innerHTML = `
                <div class="error-message">
                    <h3>진단 중 오류 발생</h3>
                    <p>AI 진단에 실패했습니다. 잠시 후 다시 시도해주세요.</p>
                    <button type="button" class="btn-primary" id="restart-button">다시 진단하기</button>
                </div>
            `;
            document.getElementById('restart-button').addEventListener('click', restartSurvey);
        });
    };

    const handleFiles = (files) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        console.log('선택된 파일:', file.name);
        surveyData.imageFile = file;
        dragDropArea.querySelector('p').textContent = `선택된 파일: ${file.name}`;
        dragDropArea.querySelector('i').style.display = 'none';
    };

    const displayNearbyHospitals = () => {
        const mapContainer = document.getElementById('map-container');
        const listContainer = document.querySelector('.hospital-grid');
        if (!mapContainer || !listContainer) return;

        const displayError = (message) => listContainer.innerHTML = `<p style="text-align: center; color: #888;">${message}</p>`;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const userLocation = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
                const map = new kakao.maps.Map(mapContainer, { center: userLocation, level: 5 });
                const places = new kakao.maps.services.Places();

                places.keywordSearch('응급실', (data, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        listContainer.innerHTML = '';
                        const bounds = new kakao.maps.LatLngBounds();
                        data.forEach(place => {
                            const placePosition = new kakao.maps.LatLng(place.y, place.x);
                            new kakao.maps.Marker({ map, position: placePosition });
                            const hospitalDiv = document.createElement('div');
                            hospitalDiv.className = 'hospital-item';
                            hospitalDiv.innerHTML = `
                                <strong>${place.place_name}</strong>
                                <div class="details">${place.address_name}</div>
                                <div class="details">📞 ${place.phone || '전화번호 없음'}</div>
                                <div class="buttons">
                                    <a href="https://map.kakao.com/link/to/${place.id}" class="btn btn-primary" target="_blank">길찾기</a>
                                    <a href="${place.place_url}" class="btn btn-secondary" target="_blank">상세보기</a>
                                </div>`;
                            listContainer.appendChild(hospitalDiv);
                            bounds.extend(placePosition);
                        });
                        map.setBounds(bounds);
                    } else {
                        displayError('주변 응급실 정보를 찾을 수 없습니다.');
                    }
                }, { location: userLocation, radius: 10000 });
            }, () => displayError('위치 정보 제공에 동의하시면 주변 병원 정보를 볼 수 있습니다.'));
        } else {
            displayError('이 브라우저는 위치 정보를 지원하지 않습니다.');
        }
    };

    // --- 이벤트 리스너 설정 ---
    surveyContainer.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        if (target.classList.contains('btn-next') || target.classList.contains('btn-skip')) {
            if (target.classList.contains('btn-next') && !validateStep(currentStep)) {
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

    document.getElementById('upload-photo-button')?.addEventListener('click', () => fileInput.click());
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
    if (typeof Swiper !== 'undefined') {
        new Swiper('.photo-guide-slider', {
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            loop: true,
        });
    }

    updateUI();
    displayNearbyHospitals();
});