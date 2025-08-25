// goToMainPage 함수를 추가합니다.
function goToMainPage() {
    window.location.href = '/main'; // 메인 페이지의 URL로 이동합니다.
}

document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 1;
    const totalSteps = 5;
    const surveyData = {
        injuries: [],
        bleeding: '',
        pain: '',
        status: []
    };

    const steps = {
        1: document.getElementById('step1'),
        2: document.getElementById('step2'),
        3: document.getElementById('step3'),
        4: document.getElementById('step4'),
        5: document.getElementById('step5'),
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
        document.getElementById('riskLevel').textContent = data.riskLevel;
        document.getElementById('scoreValue').textContent = `${data.riskScore}/${data.maxScore}`;
        document.getElementById('scoreProgress').style.width = `${(data.riskScore / data.maxScore) * 100}%`;
        document.getElementById('emergencyMessage').textContent = data.emergencyMessage;
        document.getElementById('emergencyGuide').textContent = data.emergencyGuide;

        const detailResultList = document.getElementById('detailResultList');
        detailResultList.innerHTML = '';
        data.detailedResults.forEach(item => {
            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `
                <h4>${item.question}</h4>
                <p>${item.answer}</p>
                <p>위험도: ${item.riskScore}</p>
            `;
            detailResultList.appendChild(div);
        });

        const recommendedDepartments = document.getElementById('recommendedDepartments');
        recommendedDepartments.innerHTML = '';
        data.recommendedDepartments.forEach((dept, index) => {
            const div = document.createElement('div');
            div.className = 'department-item';
            div.innerHTML = `
                <p><strong>${index + 1}순위</strong> ${dept.name}</p>
                <small>${dept.description}</small>
            `;
            recommendedDepartments.appendChild(div);
        });
    };

    // --- 이벤트 리스너 시작 ---
    surveyContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-next')) {
            if (currentStep === 1) {
                const checkedInjuries = Array.from(document.querySelectorAll('#injuryForm input:checked')).map(el => el.value);
                if (checkedInjuries.length === 0) {
                    alert('외상 종류를 선택해주세요.');
                    return;
                }
                surveyData.injuries = checkedInjuries;
            } else if (currentStep === 3) {
                const selectedBleeding = document.querySelector('#bleedingForm input:checked');
                if (!selectedBleeding) {
                    alert('출혈 정도를 선택해주세요.');
                    return;
                }
                surveyData.bleeding = selectedBleeding.value;
            } else if (currentStep === 4) {
                const selectedPain = document.querySelector('#painForm input:checked');
                if (!selectedPain) {
                    alert('통증 정도를 선택해주세요.');
                    return;
                }
                surveyData.pain = selectedPain.value;
            } else if (currentStep === 5) {
                const checkedStatus = Array.from(document.querySelectorAll('#statusForm input:checked')).map(el => el.value);
                surveyData.status = checkedStatus;
            }

            currentStep++;
            updateUI();

        } else if (e.target.classList.contains('btn-prev')) {
            currentStep--;
            updateUI();
        } else if (e.target.classList.contains('btn-submit')) {
            const checkedStatus = Array.from(document.querySelectorAll('#statusForm input:checked')).map(el => el.value);
            surveyData.status = checkedStatus;

            const dummyResult = {
                riskLevel: "위험",
                riskScore: 20,
                maxScore: 30,
                emergencyMessage: "생명이 위험할 수 있는 응급상황",
                emergencyGuide: "119 신고 후 즉시 응급실 이송",
                detailedResults: [
                    { question: "어떤 종류의 외상을 입으셨나요?", answer: "관통상", riskScore: 5 },
                    { question: "출혈의 정도는 어떠한가요?", answer: "심한 출혈 (멈추지 않음)", riskScore: 5 },
                    { question: "통증과 움직임은 어떠한가요?", answer: "의식 잃음", riskScore: 6 },
                    { question: "현재 상태를 확인해주세요", answer: "빠른 호흡", riskScore: 4 },
                ],
                recommendedDepartments: [
                    { name: "응급의학과", description: "생명 위험 응급상황으로 즉시 응급처치 필요" },
                    { name: "일반외과", description: "열상, 골절, 이물질 제거 등 일반 외과적 처치" }
                ]
            };

            renderResult(dummyResult);
            currentStep = totalSteps + 1;
            updateUI();

            // 함수 호출
            displayNearbyHospitals();
        }
    });
    // --- 이벤트 리스너 끝 ---

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

    // displayNearbyHospitals 함수: 주변 병원 정보를 표시
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
                places.keywordSearch('외과', (data, status) => {
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

    updateUI();
});