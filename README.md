# Workflow OS · 대시보드 고도화 제출 패키지

## 1. 프로젝트 개요
본 프로젝트는 기업 내부 직원용 업무 운영 플랫폼인 `Workflow OS` 대시보드입니다. 관리자와 사원 역할을 구분하고, 업무 분장, 고객 응대 현황, 업무용 SNS 채팅, 포스트잇 메모, 결산 분석, Google/Gmail 연동 상태를 한 화면에서 확인할 수 있도록 구성했습니다.

## 2. 주요 기능
- 16:9 단일 화면 대시보드 UI
- 관리자/사원 역할 기반 로그인 데모
- 팀원 및 팀장 업무 분장/공유 화면
- 업무용 SNS 채팅 및 업무 피드
- Google 로그인 데모 버튼 포함
- 포스트잇 메모 3개
- 일일/주간/월간/분기/연간 결산 분석 카드
- Railway/GitHub/Google/Gmail 상태 패널
- Gmail 앱 비밀번호 기반 일일 결산 메일 발송 API 예시

## 3. 폴더 구조
```text
dashboard_submit_package/
├── public/
│   └── index.html
├── server.js
├── package.json
├── .env.example
├── README.md
└── 대시보드 고도화_김지윤.txt
```

## 4. 로컬 실행 방법
```bash
npm install
npm start
```

브라우저에서 아래 주소로 접속합니다.
```text
http://localhost:3000
```

## 5. Railway 배포 방법
1. GitHub에 새 저장소를 생성합니다.
2. 이 폴더의 파일 전체를 저장소에 업로드합니다.
3. Railway에서 `New Project` → `Deploy from GitHub repo`를 선택합니다.
4. 해당 GitHub 저장소를 연결합니다.
5. Railway가 자동으로 `npm install` 후 `npm start`를 실행합니다.
6. 배포 완료 후 생성된 Railway URL을 복사합니다.
7. `대시보드 고도화_김지윤.txt` 파일에 Railway URL을 붙여 넣어 제출합니다.

## 6. Gmail 자동 발송 설정
Gmail 자동 발송을 실제로 사용하려면 Railway의 Variables에 아래 값을 설정합니다.

```text
GMAIL_USER=본인 Gmail 주소
GMAIL_APP_PASSWORD=Google 계정에서 발급한 앱 비밀번호
REPORT_TO=결산 메일 수신자
```

앱 비밀번호는 Google 계정에서 2단계 인증을 켠 뒤 생성할 수 있습니다.

## 7. 제출 파일
최종 제출 시 교수님께는 Railway 배포 URL이 들어간 텍스트 파일을 제출합니다.

파일명 예시:
```text
대시보드 고도화_김지윤.txt
```
