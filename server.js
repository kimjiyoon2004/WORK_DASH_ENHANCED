require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || process.env.GMAIL_USER || '').toLowerCase();

function getBaseUrl(req) {
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, '');
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '');
  if (process.env.RAILWAY_PUBLIC_DOMAIN) return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  return `${proto}://${req.get('host')}`;
}

function getRedirectUri(req) {
  return `${getBaseUrl(req)}/auth/google/callback`;
}

function getOAuthClient(req) {
  return new OAuth2Client(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    getRedirectUri(req)
  );
}

function encodeUserCookie(user) {
  return Buffer.from(JSON.stringify(user), 'utf8').toString('base64url');
}

function decodeUserCookie(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
  } catch (error) {
    return null;
  }
}

function getMailConfig() {
  return {
    user: process.env.MAIL_USER || process.env.GMAIL_USER,
    pass: process.env.MAIL_PASS || process.env.GMAIL_APP_PASSWORD,
    receiver: process.env.REPORT_RECEIVER || process.env.MAIL_USER || process.env.GMAIL_USER
  };
}

async function sendGmailReport({ to, subject, text }) {
  const { user, pass, receiver } = getMailConfig();

  if (!user || !pass) {
    return {
      ok: true,
      mode: 'demo',
      message: 'Gmail 환경변수가 없어 데모 모드로 처리되었습니다.',
      preview: { to: to || receiver, subject, text }
    };
  }

  const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user,
    pass
  },
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000
});

  await transporter.sendMail({
    from: `Workflow OS <${user}>`,
    to: to || receiver,
    subject,
    text
  });

  return { ok: true, mode: 'gmail', message: '일일 결산 메일이 실제 Gmail로 발송되었습니다.' };
}

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'Workflow OS Dashboard',
    status: 'online',
    googleOAuth: Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET),
    gmail: Boolean((process.env.MAIL_USER || process.env.GMAIL_USER) && (process.env.MAIL_PASS || process.env.GMAIL_APP_PASSWORD)),
    timestamp: new Date().toISOString()
  });
});

// Google OAuth 로그인 시작
app.get('/auth/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).send('Google OAuth 환경변수(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)가 Railway에 없습니다.');
  }

  const oauth2Client = getOAuthClient(req);
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    prompt: 'select_account'
  });

  res.redirect(url);
});

// Google OAuth 콜백
app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect('/?login=google_failed');

    const oauth2Client = getOAuthClient(req);
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const email = (payload.email || '').toLowerCase();
    const role = ADMIN_EMAIL && email === ADMIN_EMAIL ? 'admin' : 'staff';

    const user = {
      name: payload.name || email,
      email,
      picture: payload.picture || '',
      role,
      loginProvider: 'google',
      loginAt: new Date().toISOString()
    };

    res.cookie('wf_user', encodeUserCookie(user), {
      httpOnly: false,
      sameSite: 'lax',
      secure: getBaseUrl(req).startsWith('https://'),
      maxAge: 1000 * 60 * 60 * 8
    });

    res.redirect('/?login=google_success');
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect('/?login=google_failed');
  }
});

app.get('/api/me', (req, res) => {
  const user = decodeUserCookie(req.cookies.wf_user);
  if (!user) return res.json({ ok: false, authenticated: false });
  res.json({ ok: true, authenticated: true, user });
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('wf_user');
  res.json({ ok: true });
});

// 대시보드 버튼용: 일일 결산 Gmail 실제 발송
app.post('/api/send-report', async (req, res) => {
  const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  const user = decodeUserCookie(req.cookies.wf_user);

  const reportText = `
[Workflow OS 일일 결산 리포트]

발송 시각: ${now}
발송 요청자: ${user ? `${user.name} <${user.email}> / ${user.role}` : '사내 계정 또는 미로그인 사용자'}

1. 오늘 업무 요약
- 오늘 완료 업무: 18건
- 처리 중 업무: 7건
- SLA 임박: 2건
- 긴급 이슈: VIP 결제 오류 / 배송 지연 불만

2. 팀/사원 운영 현황
- 관리자 모드: 업무 배정, 팀원별 업무량, 결산 분석 확인 가능
- 사원 모드: 고객 문의 응대, 개인 To-do, 응답 SLA 확인 가능

3. 자동화 상태
- Railway 배포: 완료
- Google OAuth 로그인: 완료
- GitHub 연동: 완료
- 일일 결산 Gmail 발송: 완료

본 메일은 Workflow OS 대시보드의 "일일 결산 Gmail 발송" 버튼을 통해 자동 발송되었습니다.
`.trim();

  try {
    const result = await sendGmailReport({
      subject: '[Workflow OS] 일일 결산 리포트',
      text: reportText
    });
    res.json(result);
  } catch (error) {
    console.error('Gmail send error:', error);
    res.status(500).json({
      ok: false,
      message: 'Gmail 발송 실패',
      error: error.message
    });
  }
});

// 기존 API도 유지
app.post('/api/daily-report', async (req, res) => {
  const { to, subject, summary } = req.body || {};
  if (!subject || !summary) {
    return res.status(400).json({ ok: false, message: 'subject, summary 값이 필요합니다.' });
  }

  try {
    const result = await sendGmailReport({ to, subject, text: summary });
    res.json(result);
  } catch (error) {
    console.error('Gmail send error:', error);
    res.status(500).json({ ok: false, message: '메일 발송 실패', error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Workflow OS Dashboard running on port ${PORT}`);
});
