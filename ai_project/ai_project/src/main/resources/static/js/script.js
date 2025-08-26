/**
 * WellnessMate - 건강한 삶의 동반자
 * Main JavaScript file for handling SPA navigation, medical consultations, and AI features
 */

// Global variables
let currentPage = 'home';
let currentSlideIndex = 0;
let slideInterval;

// CES-D 20-item depression scale questions
const cesdQuestions = [
    '일들이 귀찮고 무엇을 해도 정신을 집중하기가 힘들었다.',
    '먹고 싶지 않고 식욕이 떨어졌다.',
    '가족이나 친구가 도와주어도 울적한 기분을 떨쳐 버릴 수 없었다.',
    '다른 사람들만큼 능력이 있다고 느꼈다.',
    '하는 일에 정신을 집중하기가 힘들었다.',
    '우울했다.',
    '하는 일마다 힘들게 느껴졌다.',
    '미래에 대하여 희망적으로 느꼈다.',
    '내 인생은 실패작이라는 생각이 들었다.',
    '무서움을 느꼈다.',
    '잠을 설쳤다.',
    '행복했다.',
    '평소보다 말을 적게 했다.',
    '세상에 홀로 있는 듯한 외로움을 느꼈다.',
    '사람들이 나에게 차갑게 대한다고 느꼈다.',
    '생활이 즐거웠다.',
    '갑자기 울음이 나왔다.',
    '슬픔을 느꼈다.',
    '사람들이 나를 싫어한다고 느꼈다.',
    '도무지 뭘 해 나갈 엄두가 나지 않았다.'
];

// Reverse scored items (positive items)
const reverseItems = [3, 7, 11, 15];

// Response options for CES-D
const cesdOptions = [
    { value: 0, text: '극히 드물었다 (0일)' },
    { value: 1, text: '가끔 있었다 (1-2일)' },
    { value: 2, text: '종종 있었다 (3-4일)' },
    { value: 3, text: '대부분 그랬다 (5-7일)' }
];

// Symptom data for internal medicine and surgery
const internalSymptoms = [
    '발열', '두통', '복통', '설사', '변비', '기침', '호흡곤란', '가슴통증',
    '현기증', '피로감', '체중감소', '체중증가', '소화불량', '구토', '혈뇨', '빈뇨'
];

const surgerySymptoms = [
    '복부 오른쪽 아래 통증', '서혜부 돌출', '복부 덩어리', '유방 덩어리',
    '목 덩어리', '상처가 아물지 않음', '관절 통증', '골절', '화상', '외상',
    '수술 후 합병증', '만성 통증', '신경 압박', '혈관 문제'
];

/**
 * Promotional Slider Functions
 */

// Initialize slider
function initializeSlider() {
    if (currentPage !== 'home') return;

    // Start auto-slide timer
    startSlideTimer();

    // Ensure first slide is visible
    showSlide(0);
}

// Start auto-slide timer (5 seconds interval)
function startSlideTimer() {
    clearInterval(slideInterval);
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000);
}

// Stop auto-slide timer
function stopSlideTimer() {
    clearInterval(slideInterval);
}

// Show specific slide
function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');

    if (!slides.length || !dots.length) return;

    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });

    // Remove active class from all dots
    dots.forEach(dot => {
        dot.classList.remove('active');
    });

    // Show current slide
    if (slides[index]) {
        slides[index].classList.add('active');
    }

    // Activate current dot
    if (dots[index]) {
        dots[index].classList.add('active');
    }

    currentSlideIndex = index;
}

// Go to next slide
function nextSlide() {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;

    const nextIndex = (currentSlideIndex + 1) % slides.length;
    showSlide(nextIndex);
}

// Go to previous slide
function previousSlide() {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;

    const prevIndex = currentSlideIndex === 0 ? slides.length - 1 : currentSlideIndex - 1;
    showSlide(prevIndex);
}

// Go to specific slide (for dot navigation)
function currentSlide(index) {
    showSlide(index);
    // Restart timer when user manually navigates
    startSlideTimer();
}

/**
 * SPA Navigation Functions
 */

// Show specific page and hide others
function showPage(pageId) {
    // Stop slider when leaving home page
    if (currentPage === 'home' && pageId !== 'home') {
        stopSlideTimer();
    }

    // Hide all pages
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(page => {
        page.classList.add('hidden');
    });

    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        currentPage = pageId;
    }

    // Close any open dropdowns
    closeAllDropdowns();

    // Initialize page-specific content
    initializePage(pageId);

    // Initialize slider if returning to home page
    if (pageId === 'home') {
        setTimeout(() => {
            initializeSlider();
        }, 100);
    }
}

// Initialize page-specific content
function initializePage(pageId) {
    switch (pageId) {
        case 'mental-care':
            initializeCESDForm();
            break;
        case 'internal-medicine':
            initializeInternalSymptoms();
            break;
        case 'surgery':
            initializeSurgerySymptoms();
            break;
        case 'home':
            initializeSlider();
            break;
    }
}

// Toggle dropdown menus
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        if (dropdown.classList.contains('opacity-0')) {
            closeAllDropdowns();
            dropdown.classList.remove('opacity-0');
            dropdown.classList.add('opacity-100');
        } else {
            dropdown.classList.add('opacity-0');
            dropdown.classList.remove('opacity-100');
        }
    }
}

// Close all dropdown menus
function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
        dropdown.classList.add('opacity-0');
        dropdown.classList.remove('opacity-100');
    });
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.relative')) {
        closeAllDropdowns();
    }
});

/**
 * Mental Care Functions
 */

// Switch between chat and diagnosis tabs
function switchMentalTab(tabName) {
    // Update tab buttons
    const tabs = document.querySelectorAll('.mental-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Show/hide tab content
    const chatTab = document.getElementById('chat-tab');
    const diagnosisTab = document.getElementById('diagnosis-tab');

    if (tabName === 'chat') {
        chatTab.classList.remove('hidden');
        diagnosisTab.classList.add('hidden');
    } else {
        chatTab.classList.add('hidden');
        diagnosisTab.classList.remove('hidden');
        initializeCESDForm();
    }
}

// Initialize CES-D form
function initializeCESDForm() {
    const questionsContainer = document.getElementById('cesd-questions');
    if (!questionsContainer || questionsContainer.children.length > 0) return;

    let formHTML = '';
    cesdQuestions.forEach((question, index) => {
        formHTML += `
            <div style="margin-bottom: 2rem; padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 0.5rem; background: #f8fafc;">
                <p style="margin-bottom: 1rem; font-weight: 500; color: #374151;">
                    ${index + 1}. ${question}
                </p>
                <div style="display: grid; grid-template-columns: 1fr; gap: 0.5rem;">
                    ${cesdOptions.map(option => `
                        <label style="display: flex; align-items: center; cursor: pointer; padding: 0.5rem; border-radius: 0.25rem; transition: background-color 0.2s;">
                            <input type="radio" name="cesd_${index}" value="${option.value}" style="margin-right: 0.5rem;">
                            <span>${option.text}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    });
    questionsContainer.innerHTML = formHTML;
}

// Calculate CES-D score
function calculateCESD() {
    let totalScore = 0;
    let answeredQuestions = 0;

    for (let i = 0; i < cesdQuestions.length; i++) {
        const radioButtons = document.querySelectorAll(`input[name="cesd_${i}"]`);
        const checkedRadio = Array.from(radioButtons).find(radio => radio.checked);

        if (checkedRadio) {
            let score = parseInt(checkedRadio.value);

            // Reverse score for positive items
            if (reverseItems.includes(i)) {
                score = 3 - score;
            }

            totalScore += score;
            answeredQuestions++;
        }
    }

    if (answeredQuestions < 20) {
        alert('모든 문항에 답변해 주세요.');
        return;
    }

    displayCESDResult(totalScore);
}

// Display CES-D results
function displayCESDResult(score) {
    const resultContainer = document.getElementById('cesd-result');
    let interpretation = '';
    let recommendation = '';
    let severity = '';

    if (score < 16) {
        severity = 'normal';
        interpretation = '정상 범위';
        recommendation = '현재 우울 증상이 거의 없는 상태입니다. 건강한 정신 상태를 유지하기 위해 규칙적인 운동과 충분한 수면을 권장합니다.';
    } else if (score < 21) {
        severity = 'mild';
        interpretation = '경도 우울 위험';
        recommendation = '경미한 우울 증상이 관찰됩니다. 스트레스 관리와 생활 습관 개선을 통해 증상을 완화할 수 있습니다. 필요시 전문가 상담을 받아보세요.';
    } else if (score < 25) {
        severity = 'moderate';
        interpretation = '중등도 우울 위험';
        recommendation = '중등도의 우울 증상이 있습니다. 전문가와의 상담을 강력히 권합니다. 적절한 치료를 통해 증상을 개선할 수 있습니다.';
    } else {
        severity = 'severe';
        interpretation = '중도 우울 위험';
        recommendation = '상당한 우울 증상이 관찰됩니다. 즉시 정신건강 전문의와 상담하시기 바랍니다. 전문적인 치료가 필요한 상태입니다.';
    }

    const severityColors = {
        normal: { bg: '#f0fdf4', text: '#065f46' },
        mild: { bg: '#fefce8', text: '#a16207' },
        moderate: { bg: '#fef2f2', text: '#dc2626' },
        severe: { bg: '#fef2f2', text: '#7f1d1d' }
    };

    resultContainer.innerHTML = `
        <div style="border-left: 4px solid ${severityColors[severity].text}; padding-left: 1rem;">
            <h4 style="color: ${severityColors[severity].text}; margin-bottom: 0.5rem;">
                CES-D 점수: ${score}/60
            </h4>
            <p style="font-weight: 500; margin-bottom: 1rem; color: ${severityColors[severity].text};">
                ${interpretation}
            </p>
            <p style="color: #374151; line-height: 1.6;">
                ${recommendation}
            </p>
        </div>
        <div style="margin-top: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 0.5rem;">
            <p style="font-size: 0.875rem; color: #6b7280;">
                <strong>주의사항:</strong> 이 결과는 참고용이며 정확한 진단을 위해서는 반드시 전문의와 상담하시기 바랍니다.
            </p>
        </div>
    `;

    resultContainer.classList.remove('hidden');
}

/**
 * AI Chat Functions
 */

// Send chat message
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    addChatMessage(message, 'user');
    input.value = '';

    // Simulate AI response
    setTimeout(() => {
        const aiResponse = generateAIResponse(message);
        addChatMessage(aiResponse, 'ai');
    }, 1000);
}

// Handle Enter key in chat input
function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Add message to chat
function addChatMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';

    const messageStyle = sender === 'user'
        ? 'background: #2563eb; color: white; padding: 0.75rem; border-radius: 1rem; margin-bottom: 1rem; margin-left: auto; max-width: 70%;'
        : 'background: #dbeafe; color: #1e40af; padding: 0.75rem; border-radius: 1rem; margin-bottom: 1rem; max-width: 70%;';

    messageDiv.innerHTML = `<div style="${messageStyle}">${message}</div>`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Generate AI response (mock implementation)
function generateAIResponse(userMessage) {
    const responses = [
        '그런 기분이 드시는군요. 더 자세히 말씀해 주실 수 있나요?',
        '이해합니다. 이런 상황에서는 그렇게 느끼시는 것이 자연스럽습니다.',
        '힘드시겠네요. 언제부터 이런 기분이 드셨나요?',
        '좋은 방법을 함께 생각해보겠습니다. 평소에 어떤 활동을 할 때 기분이 좋아지시나요?',
        '충분히 이해됩니다. 이런 감정을 느끼는 것은 누구에게나 있을 수 있는 일이에요.',
        '그럴 때는 깊게 숨을 들이마시고 천천히 내쉬어 보세요. 지금 이 순간에 집중해보는 것도 도움이 됩니다.',
        '전문가와 상담을 받아보시는 것을 고려해보세요. 혼자 해결하기 어려운 문제들이 있습니다.'
    ];

    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Medical Symptom Analysis Functions
 */

// Initialize internal medicine symptoms
function initializeInternalSymptoms() {
    const symptomsContainer = document.getElementById('internal-symptoms');
    if (!symptomsContainer || symptomsContainer.children.length > 0) return;

    let symptomsHTML = '';
    internalSymptoms.forEach((symptom, index) => {
        symptomsHTML += `
            <label style="display: flex; align-items: center; cursor: pointer; padding: 0.5rem; border-radius: 0.25rem;">
                <input type="checkbox" name="internal_symptom" value="${symptom}" style="margin-right: 0.5rem;">
                <span style="font-size: 0.875rem;">${symptom}</span>
            </label>
        `;
    });
    symptomsContainer.innerHTML = symptomsHTML;
}

// Initialize surgery symptoms
function initializeSurgerySymptoms() {
    const symptomsContainer = document.getElementById('surgery-symptoms');
    if (!symptomsContainer || symptomsContainer.children.length > 0) return;

    let symptomsHTML = '';
    surgerySymptoms.forEach((symptom, index) => {
        symptomsHTML += `
            <label style="display: flex; align-items: center; cursor: pointer; padding: 0.5rem; border-radius: 0.25rem;">
                <input type="checkbox" name="surgery_symptom" value="${symptom}" style="margin-right: 0.5rem;">
                <span style="font-size: 0.875rem;">${symptom}</span>
            </label>
        `;
    });
    symptomsContainer.innerHTML = symptomsHTML;
}

// Analyze internal medicine symptoms
function analyzeInternalSymptoms() {
    const checkedSymptoms = Array.from(document.querySelectorAll('input[name="internal_symptom"]:checked'))
        .map(input => input.value);
    const description = document.getElementById('internal-description').value.trim();

    if (checkedSymptoms.length === 0 && !description) {
        alert('증상을 선택하거나 설명을 입력해 주세요.');
        return;
    }

    // Mock AI analysis
    const diagnosis = generateInternalDiagnosis(checkedSymptoms, description);
    displayInternalDiagnosis(diagnosis);
}

// Analyze surgery symptoms
function analyzeSurgerySymptoms() {
    const checkedSymptoms = Array.from(document.querySelectorAll('input[name="surgery_symptom"]:checked'))
        .map(input => input.value);
    const description = document.getElementById('surgery-description').value.trim();

    if (checkedSymptoms.length === 0 && !description) {
        alert('증상을 선택하거나 설명을 입력해 주세요.');
        return;
    }

    // Mock AI analysis
    const diagnosis = generateSurgeryDiagnosis(checkedSymptoms, description);
    displaySurgeryDiagnosis(diagnosis);
}

// Generate internal medicine diagnosis (mock)
function generateInternalDiagnosis(symptoms, description) {
    const possibleDiseases = [
        { name: '급성 위장염', probability: 85, department: '소화기내과' },
        { name: '과민성 대장 증후군', probability: 70, department: '소화기내과' },
        { name: '위식도 역류질환', probability: 65, department: '소화기내과' }
    ];

    const recommendedDepartments = [
        { name: '소화기내과', reason: '복부 증상 관련 전문 진료' },
        { name: '순환기내과', reason: '가슴 통증 및 호흡 관련 증상' },
        { name: '내분비내과', reason: '전신 증상 및 대사 관련 문제' }
    ];

    return { possibleDiseases, recommendedDepartments };
}

// Generate surgery diagnosis (mock)
function generateSurgeryDiagnosis(symptoms, description) {
    const possibleDiseases = [
        { name: '급성 충수염', probability: 80, department: '외과' },
        { name: '서혜부 탈장', probability: 75, department: '외과' },
        { name: '갑상선 결절', probability: 60, department: '외과' }
    ];

    const recommendedDepartments = [
        { name: '외과', reason: '외과적 처치가 필요한 급성 질환' },
        { name: '정형외과', reason: '근골격계 손상 및 외상' },
        { name: '성형외과', reason: '피부 및 연조직 관련 문제' }
    ];

    return { possibleDiseases, recommendedDepartments };
}

// Display internal medicine diagnosis
function displayInternalDiagnosis(diagnosis) {
    const resultContainer = document.getElementById('internal-diagnosis-result');

    let resultHTML = `
        <h4 style="color: #065f46; margin-bottom: 1rem;">AI 진단 결과</h4>

        <div style="margin-bottom: 2rem;">
            <h5 style="color: #374151; margin-bottom: 0.5rem;">예상 병명 (확률순)</h5>
            <div style="space-y: 0.5rem;">
                ${diagnosis.possibleDiseases.map(disease => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem;">
                        <span style="font-weight: 500;">${disease.name}</span>
                        <span style="color: #059669; font-weight: 500;">${disease.probability}%</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div>
            <h5 style="color: #374151; margin-bottom: 0.5rem;">추천 진료과 TOP 3</h5>
            <div style="space-y: 0.5rem;">
                ${diagnosis.recommendedDepartments.map((dept, index) => `
                    <div style="padding: 0.75rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem;">
                        <div style="display: flex; align-items: center; margin-bottom: 0.25rem;">
                            <span style="background: #059669; color: white; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 0.25rem; margin-right: 0.5rem;">
                                ${index + 1}위
                            </span>
                            <span style="font-weight: 500;">${dept.name}</span>
                        </div>
                        <p style="color: #6b7280; font-size: 0.875rem;">${dept.reason}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-top: 1.5rem; padding: 1rem; background: white; border-left: 4px solid #059669; border-radius: 0.25rem;">
            <p style="font-size: 0.875rem; color: #374151;">
                <strong>주의사항:</strong> 이 결과는 AI 분석에 의한 참고용이며, 정확한 진단을 위해서는 반드시 전문의와 상담하시기 바랍니다.
            </p>
        </div>
    `;

    resultContainer.innerHTML = resultHTML;
    resultContainer.classList.remove('hidden');
}

// Display surgery diagnosis
function displaySurgeryDiagnosis(diagnosis) {
    const resultContainer = document.getElementById('surgery-diagnosis-result');

    let resultHTML = `
        <h4 style="color: #7f1d1d; margin-bottom: 1rem;">AI 진단 결과</h4>

        <div style="margin-bottom: 2rem;">
            <h5 style="color: #374151; margin-bottom: 0.5rem;">예상 병명 (확률순)</h5>
            <div style="space-y: 0.5rem;">
                ${diagnosis.possibleDiseases.map(disease => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem;">
                        <span style="font-weight: 500;">${disease.name}</span>
                        <span style="color: #dc2626; font-weight: 500;">${disease.probability}%</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <div>
            <h5 style="color: #374151; margin-bottom: 0.5rem;">추천 진료과 TOP 3</h5>
            <div style="space-y: 0.5rem;">
                ${diagnosis.recommendedDepartments.map((dept, index) => `
                    <div style="padding: 0.75rem; background: white; border: 1px solid #e5e7eb; border-radius: 0.25rem;">
                        <div style="display: flex; align-items: center; margin-bottom: 0.25rem;">
                            <span style="background: #dc2626; color: white; font-size: 0.75rem; padding: 0.125rem 0.5rem; border-radius: 0.25rem; margin-right: 0.5rem;">
                                ${index + 1}위
                            </span>
                            <span style="font-weight: 500;">${dept.name}</span>
                        </div>
                        <p style="color: #6b7280; font-size: 0.875rem;">${dept.reason}</p>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-top: 1.5rem; padding: 1rem; background: white; border-left: 4px solid #dc2626; border-radius: 0.25rem;">
            <p style="font-size: 0.875rem; color: #374151;">
                <strong>주의사항:</strong> 이 결과는 AI 분석에 의한 참고용이며, 정확한 진단을 위해서는 반드시 전문의와 상담하시기 바랍니다.
            </p>
        </div>
    `;

    resultContainer.innerHTML = resultHTML;
    resultContainer.classList.remove('hidden');
}

/**
 * Initialization
 */

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set initial page
    showPage('home');

    // Initialize slider
    setTimeout(() => {
        initializeSlider();
    }, 100);

    // Initialize any necessary components
    console.log('WellnessMate application initialized');
});

// Pause slider when user hovers over it
document.addEventListener('mouseenter', function(event) {
    if (event.target.closest('.promotional-slider')) {
        stopSlideTimer();
    }
}, true);

// Resume slider when user moves mouse away
document.addEventListener('mouseleave', function(event) {
    if (event.target.closest('.promotional-slider') && currentPage === 'home') {
        startSlideTimer();
    }
}, true);

// Handle visibility change (pause when tab is not active)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        stopSlideTimer();
    } else if (currentPage === 'home') {
        startSlideTimer();
    }
});

// Expose functions to global scope for onclick handlers
window.showPage = showPage;
window.toggleDropdown = toggleDropdown;
window.switchMentalTab = switchMentalTab;
window.calculateCESD = calculateCESD;
window.sendMessage = sendMessage;
window.handleChatKeyPress = handleChatKeyPress;
window.analyzeInternalSymptoms = analyzeInternalSymptoms;
window.analyzeSurgerySymptoms = analyzeSurgerySymptoms;
window.nextSlide = nextSlide;
window.previousSlide = previousSlide;
window.currentSlide = currentSlide;