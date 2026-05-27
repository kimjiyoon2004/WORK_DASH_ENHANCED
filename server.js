require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'Workflow OS Dashboard',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/daily-report', async (req, res) => {
  const { to, subject, summary } = req.body || {};

  if (!to || !subject || !summary) {
    return res.status(400).json({
      ok: false,
      message: 'to, subject, summary 값이 필요합니다.'
    });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailAppPassword) {
    return res.json({
      ok: true,
      mode: 'demo',
      message: 'Gmail 환경변수가 없어 데모 모드로 처리되었습니다.',
      preview: { to, subject, summary }
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });

    await transporter.sendMail({
      from: `Workflow OS <${gmailUser}>`,
      to,
      subject,
      text: summary
    });

    return res.json({ ok: true, mode: 'gmail', message: '일일 결산 메일이 발송되었습니다.' });
  } catch (error) {
    return res.status(500).json({ ok: false, message: '메일 발송 실패', error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Workflow OS Dashboard running on port ${PORT}`);
});
