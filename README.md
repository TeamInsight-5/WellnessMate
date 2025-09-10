# 🌿 Wellness Mate

**Wellness Mate**는 심리케어, 내과, 외과를 아우르는 **종합 건강 관리 플랫폼**입니다.  
사용자에게 맞춤형 건강 정보와 심리 케어 서비스를 제공하여, 더 나은 **웰니스(Wellness) 라이프**를 지원합니다.

---

## 🎥 데모 & 자료
- ▶️ **데모 영상**: [영상 보러가기](https://your.demo.video.url)  <!-- TODO: 실제 URL로 교체 -->
- 📄 **프로젝트 보고서(PDF)**: [다운로드](docs/report.pdf)         <!-- TODO: docs/report.pdf 업로드 -->
- 🖼️ **스크린샷**
  <div align="center">
    <img src="assets/screenshots/01-home.png" alt="홈 화면" width="45%"/>
    <img src="assets/screenshots/02-mental-care.png" alt="심리케어" width="45%"/>
    <img src="assets/screenshots/03-hospital-map.png" alt="주변 병원 지도" width="45%"/>
    <img src="assets/screenshots/04-profile-edit.png" alt="회원정보 수정" width="45%"/>
  </div>

> 경로 가이드  
> - 보고서 PDF: `docs/report.pdf`  
> - 스크린샷: `assets/screenshots/xx.png` (이름은 자유)

---

## 📌 주요 기능
- 🧠 **심리 케어**: CES-D 자가진단, 상담 가이드, 스트레스 관리 팁
- 🏥 **병원 정보**: 내과/외과 증상 기반 안내, 인근 병원 지도(Kakao Map)
- 📰 **공지/안내**: 최신 건강 소식 및 플랫폼 업데이트
- 👤 **회원 관리**: 회원가입/로그인, 프로필 수정, **회원 탈퇴(내역 완전 삭제 정책)**
- 📧 **이메일**: 인증/알림 메일 발송
- 💬 **AI 연동(옵션)**: `FastAPI/` 서브서비스를 통한 특화 모델 연계

---

## 🛠️ 개발 환경 / 스택
**Backend**
- Java 17 · Spring Boot **3.5.4**
- Spring MVC(Web), WebFlux(일부 비동기 I/O), Spring Security
- Spring Data JPA (Hibernate) · MariaDB
- Spring Data Redis (옵션) · Mail

**Frontend**
- Thymeleaf · HTML/CSS/JS · (일부) Bootstrap/Custom CSS
- Kakao Map SDK

**Build/Etc.**
- Gradle Wrapper  
- (선택) **FastAPI**: Python 3.10+ 기반 AI 서브서비스

📦 의존성(Dependencies)
✅ 필수 (현재 사용 중)

Spring Boot 3.5.4

Web / Thymeleaf / Security

JPA(Hibernate) + MariaDB Driver

WebFlux(일부 비동기 I/O)

Redis(옵션 캐시/세션)

Mail(알림/인증 메일)

Thymeleaf Extras Spring Security

Lombok

JSON(org.json)
---

## 📁 디렉터리 구조
> 실제 코드 기준으로 정리 (필요 없는 항목은 자유롭게 삭제)

```text
.
├─ docs/
│  ├─ report.pdf                 # ← 보고서 PDF (추가)
│  └─ api/ (선택)
│     └─ openapi.yaml
├─ assets/
│  └─ screenshots/               # ← README 스크린샷 (추가)
│     ├─ 01-home.png
│     ├─ 02-mental-care.png
│     ├─ 03-hospital-map.png
│     └─ 04-profile-edit.png
├─ FastAPI/                      # 파이썬 AI 서브서비스(옵션)
├─ src/
│  ├─ main/
│  │  ├─ java/com/example/ai_project/
│  │  │  ├─ AiProjectApplication.java
│  │  │  ├─ config/
│  │  │  │  └─ SecurityConfig.java
│  │  │  ├─ main/controller/
│  │  │  │  ├─ EmailController.java
│  │  │  │  ├─ InternalMedicineController.java
│  │  │  │  ├─ KakaoMapController.java
│  │  │  │  ├─ MemberController.java
│  │  │  │  ├─ MentalCareController.java
│  │  │  │  └─ WellnessMateController.java
│  │  │  ├─ DTO/
│  │  │  │  ├─ AiResponse.java
│  │  │  │  ├─ Hospital.java
│  │  │  │  └─ SurveyData.java
│  │  │  ├─ entity/
│  │  │  │  └─ SignupEntity.java
│  │  │  ├─ repository/
│  │  │  │  ├─ SignupRepository.java
│  │  │  │  └─ UserRepository.java
│  │  │  └─ service/
│  │  │     ├─ CustomUserDetailsService.java
│  │  │     ├─ DiagnosisService.java
│  │  │     ├─ EmailService.java
│  │  │     ├─ MentalCareService.java
│  │  │     └─ SignService.java
│  │  └─ resources/
│  │     ├─ application.properties
│  │     ├─ templates/
│  │     │  ├─ hospital/
│  │     │  │  ├─ hospitalMed.html
│  │     │  │  ├─ hospitalSurgery.html
│  │     │  │  └─ mentalCarePage.html
│  │     │  ├─ main/
│  │     │  │  └─ mainpage.html
│  │     │  └─ memberManager/
│  │     │     ├─ find.html
│  │     │     ├─ findPass.html
│  │     │     ├─ profile_edit.html
│  │     │     ├─ signin.html
│  │     │     └─ signup.html
│  │     └─ static/
│  │        ├─ css/
│  │        ├─ img/
│  │        └─ js/
│  └─ test/java/...              # 테스트 코드
├─ build.gradle
├─ settings.gradle
├─ .gitignore
└─ README.md
