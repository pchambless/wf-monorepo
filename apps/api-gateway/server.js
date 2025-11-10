const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3002;
const TARGET_SERVER = process.env.TARGET_SERVER || 'http://localhost:3001';

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:3004'
  ],
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'whatsfresh-gateway-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

const portToEmailMap = {
  '3004': 'studio@whatsfresh.ai',
  '3000': 'admin@whatsfresh.ai',
  '3003': 'whatsfresh@whatsfresh.ai'
};

const injectUserEmail = (req, res, next) => {
  let userEmail;

  if (req.session && req.session.userEmail) {
    userEmail = req.session.userEmail;
    console.log(`[Gateway] ${req.method} ${req.path} | Session User: ${userEmail}`);
  } else {
    const origin = req.headers.origin || req.headers.referer;
    if (origin) {
      const match = origin.match(/:(\d+)/);
      const originPort = match ? match[1] : null;
      userEmail = portToEmailMap[originPort] || 'default@whatsfresh.ai';
      console.log(`[Gateway] ${req.method} ${req.path} | Port: ${originPort} | User: ${userEmail}`);
    }
  }

  if (userEmail) {
    if (req.method === 'POST' && req.body) {
      req.body.userEmail = userEmail;
    }
    req.headers['x-user-email'] = userEmail;
  }

  next();
};

app.post('/api/auth/login', async (req, res) => {
  try {
    const { userEmail, password } = req.body;
    console.log(`[Gateway] Login attempt for ${userEmail}`);

    const response = await fetch(`${TARGET_SERVER}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail, password })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      req.session.userEmail = data.user.email;
      req.session.user = data.user;
      console.log(`[Gateway] Login successful, session created for ${data.user.email}`);
      res.json(data);
    } else {
      console.log(`[Gateway] Login failed for ${userEmail}`);
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error(`[Gateway] Login error:`, error.message);
    res.status(500).json({ success: false, message: 'Gateway login error' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const userEmail = req.session?.userEmail;
  req.session.destroy((err) => {
    if (err) {
      console.error(`[Gateway] Logout error:`, err);
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    console.log(`[Gateway] Logout successful for ${userEmail}`);
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

app.use('/api', injectUserEmail);

app.use('/api', createProxyMiddleware({
  target: TARGET_SERVER,
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    if (req.headers['x-user-email']) {
      proxyReq.setHeader('x-user-email', req.headers['x-user-email']);
    }

    if (req.method === 'POST' && req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req) => {
    console.log(`[Gateway] Response: ${proxyRes.statusCode} for ${req.method} ${req.path}`);
  },
  onError: (err, req, res) => {
    console.error(`[Gateway] Proxy error:`, err.message);
    res.status(500).json({
      error: 'Gateway proxy error',
      message: err.message
    });
  }
}));

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    gateway: 'running',
    target: TARGET_SERVER,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Proxying requests to: ${TARGET_SERVER}`);
  console.log(`\n📋 Port → User mapping:`);
  Object.entries(portToEmailMap).forEach(([port, email]) => {
    console.log(`   :${port} → ${email}`);
  });
  console.log(`\n✅ Ready to serve requests\n`);
});
