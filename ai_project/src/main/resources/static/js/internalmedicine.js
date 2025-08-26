// goToMainPage 함수를 추가합니다.
function goToMainPage() {
    window.location.href = '/main'; // 메인 페이지의 URL로 이동합니다.
}

// 설문을 처음부터 다시 시작하는 함수
function restartSurvey() {
    location.reload(); // 페이지를 새로고침하여 설문을 재시작합니다.
}

document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 4;
    const surveyData = {
        symptoms: [],
        duration: null,
        severity: null,
        history: []
    };

    const steps = {
        1: document.getElementById('step1'),
        2: document.getElementById('step2'),
        3: document.getElementById('step3'),
        4: document.getElementById('step4'),
        result: document.getElementById('result')
    };

    const progressBar = document.querySelector('.progress');
    const stepText = document.querySelector('.step-text');
    const surveyContainer = document.querySelector('.survey-container');

    const updateUI = () => {
        Object.values(steps).forEach(step => {
            step.style.display = 'none';
        });

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
        const resultTitle = document.getElementById('resultTitle');
        const urgencyBadge = document.getElementById('urgencyBadge');
        const riskProgress = document.getElementById('riskProgress');
        const riskScore = document.getElementById('riskScore');
        const resultMessage = document.getElementById('resultMessage');
        const recommendedDepartments = document.getElementById('recommendedDepartments');
        const expectedDisease = document.getElementById('expectedDisease');

        recommendedDepartments.innerHTML = '';
        expectedDisease.innerHTML = '';

        resultTitle.textContent = data.expectedDisease.name;
        urgencyBadge.textContent = data.expectedDisease.urgency;
        urgencyBadge.className = `urgency-badge ${data.expectedDisease.urgency}`;

        riskProgress.style.width = `${data.riskScore / 20 * 100}%`;
        riskScore.textContent = `${data.riskScore}/20`;
        resultMessage.textContent = data.riskMessage;

        data.recommendedDepartments.forEach(dept => {
            const div = document.createElement('div');
            div.className = 'department-item';
            div.textContent = `• ${dept}`;
            recommendedDepartments.appendChild(div);
        });

        const diseaseCard = document.createElement('div');
        diseaseCard.className = 'disease-card';
        diseaseCard.innerHTML = `
            <div class="disease-header">
                <h3>${data.expectedDisease.name}</h3>
                <span class="urgency-badge ${data.expectedDisease.urgency}">${data.expectedDisease.urgency}</span>
            </div>
            <p><strong>주요 증상:</strong> ${data.expectedDisease.relatedSymptoms.join(', ')}</p>
            <p><strong>추천 진료과:</strong> ${data.expectedDisease.recommendedDepartment}</p>
        `;
        expectedDisease.appendChild(diseaseCard);
    };

    surveyContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-next')) {
            if (currentStep === 1) {
                const checkedSymptoms = Array.from(document.querySelectorAll('#symptomForm input:checked')).map(el => el.value);
                if (checkedSymptoms.length === 0) {
                    alert('증상을 하나 이상 선택해주세요.');
                    return;
                }
                surveyData.symptoms = checkedSymptoms;
            } else if (currentStep === 2) {
                const selectedDuration = document.querySelector('#durationForm input:checked');
                if (!selectedDuration) {
                    alert('기간을 선택해주세요.');
                    return;
                }
                surveyData.duration = selectedDuration.value;
            } else if (currentStep === 3) {
                const selectedSeverity = document.querySelector('#severityForm input:checked');
                if (!selectedSeverity) {
                    alert('심각도를 선택해주세요.');
                    return;
                }
                surveyData.severity = selectedSeverity.value;
            }

            currentStep++;
            updateUI();
        } else if (e.target.classList.contains('btn-prev')) {
            if (currentStep > 1) {
                currentStep--;
                updateUI();
            } else {
                goToMainPage();
            }
        } else if (e.target.classList.contains('btn-submit')) {
            const checkedHistory = Array.from(document.querySelectorAll('#historyForm input:checked')).map(el => el.value);
            surveyData.history = checkedHistory;

            const resultContainer = document.getElementById('result');
            resultContainer.innerHTML = '<h2><i class="fas fa-spinner fa-spin"></i> AI가 진단 중입니다...</h2>';
            currentStep = totalSteps + 1;
            updateUI();

            fetch('/internal-medicine/diagnose', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(surveyData),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('서버 응답에 문제가 있습니다. 상태 코드: ' + response.status);
                }
                return response.json(); // ⚠️ response.json() 사용
            })
            .then(aiResult => {
                resultContainer.innerHTML = `
                    <h2>건강상태 진단 결과</h2>
                    <div class="result-card">
                        <div class="result-header">
                            <h3 id="resultTitle"></h3>
                            <span class="urgency-badge" id="urgencyBadge"></span>
                        </div>
                        <div class="risk-score">
                            <p>위험도 점수</p>
                            <div class="progress-bar-small">
                                <div class="progress-fill" id="riskProgress"></div>
                            </div>
                            <span id="riskScore"></span>
                        </div>
                        <p id="resultMessage"></p>
                    </div>
                    <div class="recommendation-section">
                        <h4>추천 진료과</h4>
                        <div id="recommendedDepartments"></div>
                    </div>
                    <div class="expected-disease">
                        <h4>예상 질환명</h4>
                        <div id="expectedDisease"></div>
                    </div>
                    <div class="button-group">
                        <button type="button" class="btn-primary" onclick="restartSurvey()">다시 진단하기</button>
                        <button type="button" class="btn-secondary" onclick="goToMainPage()">메인으로 돌아가기</button>
                    </div>
                `;

                renderResult(aiResult);
            })
            .catch(error => {
                console.error('Error:', error);
                resultContainer.innerHTML = `
                    <h2>진단 중 오류 발생</h2>
                    <p>AI 진단에 실패했습니다. 잠시 후 다시 시도해주세요.</p>
                    <div class="button-group">
                        <button type="button" class="btn-primary" onclick="restartSurvey()">다시 진단하기</button>
                    </div>
                `;
            });
        }
    });

    const historyCheckboxes = document.querySelectorAll('#historyForm input[name="history"]');
    const noHistoryCheckbox = document.querySelector('#historyForm input[value="none"]');

    historyCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            if (e.target.value === 'none' && e.target.checked) {
                historyCheckboxes.forEach(cb => {
                    if (cb.value !== 'none') cb.checked = false;
                });
            } else if (e.target.value !== 'none' && e.target.checked) {
                noHistoryCheckbox.checked = false;
            }
        });
    });

    function displayNearbyHospitals() {
        const mapContainer = document.getElementById('map-container');
        const hospitalListContainer = document.getElementById('nearby-hospitals-list');

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const userLat = position.coords.latitude;
                const userLng = position.coords.longitude;
                const userLocation = new kakao.maps.LatLng(userLat, userLng);

                const mapOption = {
                    center: userLocation,
                    level: 4
                };
                const map = new kakao.maps.Map(mapContainer, mapOption);

                const places = new kakao.maps.services.Places();
                places.keywordSearch('내과', (data, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        hospitalListContainer.innerHTML = '';
                        const bounds = new kakao.maps.LatLngBounds();

                        data.forEach(place => {
                            const placePosition = new kakao.maps.LatLng(place.y, place.x);
                            const marker = new kakao.maps.Marker({
                                map: map,
                                position: placePosition
                            });

                            const hospitalDiv = document.createElement('div');
                            hospitalDiv.className = 'hospital-item';
                            hospitalDiv.innerHTML = `
                                <strong>${place.place_name}</strong>
                                <div class="details">${place.address_name}</div>
                                <div class="details">📞 ${place.phone || '전화번호 없음'}</div>
                                <div class="buttons">
                                    <a href="https://map.kakao.com/link/to/${place.id}" class="btn-directions" target="_blank">길찾기</a>
                                    <a href="${place.place_url}" class="btn-detail" target="_blank">자세히 보기</a>
                                </div>
                            `;
                            hospitalListContainer.appendChild(hospitalDiv);
                            bounds.extend(placePosition);
                        });
                        map.setBounds(bounds);
                    } else {
                        hospitalListContainer.innerHTML = '<p>주변 병원 정보를 찾을 수 없습니다.</p>';
                    }
                }, {
                    location: userLocation,
                    radius: 10000
                });

            }, () => {
                hospitalListContainer.innerHTML = '<p>위치 정보 제공에 동의해주시면 더 정확한 병원 정보를 얻을 수 있습니다.</p>';
                const defaultLocation = new kakao.maps.LatLng(37.5665, 126.9780);
                const mapOption = { center: defaultLocation, level: 6 };
                new kakao.maps.Map(mapContainer, mapOption);
            });
        } else {
            hospitalListContainer.innerHTML = '<p>이 브라우저는 위치 정보를 지원하지 않습니다.</p>';
        }
    }

    displayNearbyHospitals();
    updateUI();
});