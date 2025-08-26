// 메인 페이지로 이동하는 함수
function goToMainPage() {
    window.location.href = '/main'; // 실제 메인 페이지 URL로 변경
}

// 설문을 처음부터 다시 시작하는 함수
function restartSurvey() {
    window.location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 5; // 총 설문 단계 수
    const surveyData = {
        injuries: [],
        bleeding: null,
        pain: null,
        status: []
    };

    // 각 단계의 HTML 요소를 객체에 저장
    const steps = {
        1: document.getElementById('step1'),
        2: document.getElementById('step2'),
        3: document.getElementById('step3'),
        4: document.getElementById('step4'),
        5: document.getElementById('step5'),
        result: document.getElementById('result')
    };

    // 오른쪽 가이드 요소
    const guideDefault = document.getElementById('guide-default');
    const guideStep2 = document.getElementById('guide-step2');

    const progressBar = document.querySelector('.progress');
    const stepText = document.querySelector('.step-text');
    const surveyContainer = document.querySelector('.survey-container');

    // UI를 현재 단계에 맞게 업데이트하는 함수
    const updateUI = () => {
        Object.values(steps).forEach(step => {
            if (step) step.style.display = 'none';
        });
        if (guideDefault) guideDefault.style.display = 'none';
        if (guideStep2) guideStep2.style.display = 'none';

        if (currentStep <= totalSteps) {
            if (steps[currentStep]) steps[currentStep].style.display = 'block';

            if (currentStep === 2 && guideStep2) {
                guideStep2.style.display = 'block';
            } else if (guideDefault) {
                guideDefault.style.display = 'block';
            }

            const progress = (currentStep / totalSteps) * 100;
            if(progressBar) progressBar.style.width = `${progress}%`;
            if(stepText) stepText.textContent = `${currentStep}/${totalSteps}`;
        } else {
            if (steps.result) steps.result.style.display = 'block';
            if (guideDefault) guideDefault.style.display = 'block';

            if(progressBar) progressBar.style.width = '100%';
            if(stepText) stepText.textContent = '결과';
        }
    };

    // 결과 데이터를 화면에 렌더링하는 함수
    const renderResult = (data) => {
        const riskLevel = document.getElementById('riskLevel');
        const scoreValue = document.getElementById('scoreValue');
        const scoreProgress = document.getElementById('scoreProgress');
        const emergencyMessage = document.getElementById('emergencyMessage');
        const emergencyGuide = document.getElementById('emergencyGuide');
        const detailResultList = document.getElementById('detailResultList');
        const recommendedDepartments = document.getElementById('recommendedDepartments');

        if(riskLevel) riskLevel.textContent = data.riskLevel;
        if(scoreValue) scoreValue.textContent = `${data.riskScore}/${data.maxScore}`;
        if(scoreProgress) scoreProgress.style.width = `${(data.riskScore / data.maxScore) * 100}%`;
        if(emergencyMessage) emergencyMessage.textContent = data.emergencyMessage;
        if(emergencyGuide) emergencyGuide.textContent = data.emergencyGuide;

        if(detailResultList) {
            detailResultList.innerHTML = '';
            data.detailedResults.forEach(item => {
                const div = document.createElement('div');
                div.className = 'result-item card';
                div.innerHTML = `<h4>${item.question}</h4><p><strong>답변:</strong> ${item.answer}</p><p><strong>위험 기여도:</strong> ${item.riskScore}</p>`;
                detailResultList.appendChild(div);
            });
        }

        if(recommendedDepartments) {
            recommendedDepartments.innerHTML = '';
            data.recommendedDepartments.forEach((dept, index) => {
                const div = document.createElement('div');
                div.className = 'department-item card';
                div.innerHTML = `<p><strong>${index + 1}순위: ${dept.name}</strong></p><small>${dept.description}</small>`;
                recommendedDepartments.appendChild(div);
            });
        }
    };

    // 버튼 클릭 이벤트 처리
    if (surveyContainer) {
        surveyContainer.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            let canProceed = true;
            if (target.classList.contains('btn-next') || target.classList.contains('btn-skip')) {
                if (currentStep === 1) {
                    const checked = Array.from(document.querySelectorAll('#step1 input:checked'));
                    if (checked.length === 0) {
                        alert('외상 종류를 1개 이상 선택해주세요.');
                        canProceed = false;
                    } else {
                        surveyData.injuries = checked.map(el => el.value);
                    }
                } else if (currentStep === 3) {
                    const checked = document.querySelector('#step3 input:checked');
                    if (!checked) {
                        alert('출혈 정도를 선택해주세요.');
                        canProceed = false;
                    } else {
                        surveyData.bleeding = checked.value;
                    }
                } else if (currentStep === 4) {
                    const checked = document.querySelector('#step4 input:checked');
                    if (!checked) {
                        alert('통증 및 움직임 정도를 선택해주세요.');
                        canProceed = false;
                    } else {
                        surveyData.pain = checked.value;
                    }
                }

                if (canProceed && currentStep < totalSteps) {
                    currentStep++;
                    updateUI();
                }
            }
            else if (target.classList.contains('btn-prev')) {
                if (currentStep > 1) {
                    currentStep--;
                    updateUI();
                } else {
                    goToMainPage();
                }
            }
            else if (target.classList.contains('btn-submit')) {
                const checked = Array.from(document.querySelectorAll('#step5 input:checked'));
                if (checked.length === 0) {
                    alert('현재 상태를 1개 이상 선택해주세요.');
                    return;
                }
                surveyData.status = checked.map(el => el.value);

                console.log("최종 설문 데이터:", surveyData);
                // 여기에 fetch를 사용하여 AI 서버로 surveyData를 보내는 로직을 추가합니다.

                const dummyResult = {
                    riskLevel: "위험", riskScore: 25, maxScore: 30,
                    emergencyMessage: "생명이 위험할 수 있는 응급상황입니다.",
                    emergencyGuide: "즉시 119에 신고하고 응급실로 이송해야 합니다.",
                    detailedResults: [
                        { question: "외상 종류", answer: surveyData.injuries.join(', '), riskScore: 5 },
                        { question: "출혈 정도", answer: surveyData.bleeding, riskScore: 8 },
                        { question: "통증과 움직임", answer: surveyData.pain, riskScore: 6 },
                        { question: "현재 상태", answer: surveyData.status.join(', '), riskScore: 6 },
                    ],
                    recommendedDepartments: [
                        { name: "응급의학과", description: "생명과 직결된 응급상황으로, 즉각적인 처치가 필요합니다." },
                        { name: "정형외과", description: "골절 및 관절 손상에 대한 전문적인 치료가 필요합니다." }
                    ]
                };
                renderResult(dummyResult);
                currentStep = totalSteps + 1;
                updateUI();
            }
        });
    }

    // 주변 병원 정보를 표시하는 함수
    function displayNearbyHospitals() {
        const mapContainer = document.getElementById('map-container');
        const hospitalListContainer = document.getElementById('nearby-hospitals-list');
        if (!mapContainer || !hospitalListContainer) return;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const userLocation = new kakao.maps.LatLng(position.coords.latitude, position.coords.longitude);
                const map = new kakao.maps.Map(mapContainer, { center: userLocation, level: 5 });
                const places = new kakao.maps.services.Places();

                places.keywordSearch('응급실', (data, status) => {
                    if (status === kakao.maps.services.Status.OK) {
                        hospitalListContainer.innerHTML = '';
                        const bounds = new kakao.maps.LatLngBounds();
                        data.forEach(place => {
                            const placePosition = new kakao.maps.LatLng(place.y, place.x);
                            new kakao.maps.Marker({ map: map, position: placePosition });
                            const hospitalDiv = document.createElement('div');
                            hospitalDiv.className = 'hospital-item card';
                            hospitalDiv.innerHTML = `<strong>${place.place_name}</strong><div class="details">${place.address_name}</div><div class="details">📞 ${place.phone || '전화번호 없음'}</div><div class="buttons"><a href="https://map.kakao.com/link/to/${place.id}" class="btn btn-primary" target="_blank">길찾기</a><a href="${place.place_url}" class="btn btn-secondary" target="_blank">상세보기</a></div>`;
                            hospitalListContainer.appendChild(hospitalDiv);
                            bounds.extend(placePosition);
                        });
                        map.setBounds(bounds);
                    } else {
                        hospitalListContainer.innerHTML = '<p>주변 응급실 정보를 찾을 수 없습니다.</p>';
                    }
                }, { location: userLocation, radius: 10000 });
            }, () => {
                hospitalListContainer.innerHTML = '<p>위치 정보 제공에 동의하시면 주변 병원 정보를 볼 수 있습니다.</p>';
            });
        } else {
            hospitalListContainer.innerHTML = '<p>이 브라우저는 위치 정보를 지원하지 않습니다.</p>';
        }
    }

    // 초기 UI 설정 및 지도 로드
    updateUI();
    displayNearbyHospitals();
});