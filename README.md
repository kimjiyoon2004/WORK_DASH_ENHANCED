# Workflow OS Dashboard - Google OAuth + Gmail Enabled

이 패키지는 과제 제출용 Workflow OS 대시보드입니다.

## 포함 기능

- 16:9 대시보드 화면
- 관리자/사원 사내 계정 로그인
- 실제 Google OAuth 로그인
- Google 로그인 후 이메일 기준 관리자/사원 역할 구분
- 업무 분장, SNS/채팅, 포스트잇, 결산 분석 화면
- 일일 결산 Gmail 발송 API
- Railway 배포용 Node.js 서버

## GitHub 업로드 구조

GitHub 저장소 루트에 아래 파일들이 그대로 있어야 합니다.

```text
package.json
server.js
.env.example
README.md
public/
  index.html
```

## Railway Variables

Railway 프로젝트의 Variables에 아래 값을 추가하세요. 실제 비밀번호/Secret은 GitHub에 올리지 마세요.

```text
GOOGLE_CLIENT_ID=Google OAuth 클라이언트 ID
GOOGLE_CLIENT_SECRET=Google OAuth 클라이언트 보안 비밀번호
ADMIN_EMAIL=관리자로 인식할 Google 이메일

GMAIL_USER=메일을 발송할 Gmail 주소
GMAIL_APP_PASSWORD=Gmail 앱 비밀번호 16자리
REPORT_RECEIVER=결산 리포트를 받을 이메일
```

선택 사항:

```text
PUBLIC_URL=https://workdashenhanced-production.up.railway.app
```

## Google Cloud OAuth 설정

Google Cloud Console의 OAuth 클라이언트에서 아래처럼 설정하세요.

```text
승인된 JavaScript 원본:
https://workdashenhanced-production.up.railway.app

승인된 리디렉션 URI:
https://workdashenhanced-production.up.railway.app/auth/google/callback
```

## 로그인 결과

- `ADMIN_EMAIL`과 같은 Google 계정으로 로그인: 관리자 대시보드
- 그 외 Google 계정으로 로그인: 사원 대시보드

## 테스트 순서

1. GitHub에 파일 업로드
2. Railway에서 GitHub 저장소 연결
3. Railway Variables 입력
4. 배포 완료 후 URL 접속
5. `Google로 계속하기` 클릭
6. Google 계정 선택
7. 대시보드 진입 확인
8. `일일 결산 Gmail 발송` 버튼 클릭

## 확인용 URL

```text
/health
```

`googleOAuth: true`, `gmail: true`가 나오면 환경변수가 정상 적용된 것입니다.
