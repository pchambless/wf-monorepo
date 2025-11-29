import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import session from 'express-session';

const app = express();
const PORT = process.env.PORT || 3002;
const TARGET_SERVER = process.env.TARGET_SERVER || 'http://localhost:3001';

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3003',
    'http://localhost:3004'
  ],
  credentials: true
}));

app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'whatsfresh-gateway-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

// Port to email mapping
const portToEmailMap = {
  '3004': 'studio@whatsfresh.ai',
  '3000': 'admin@whatsfresh.ai',
  '3003': 'whatsfresh@whatsfresh.ai'
};

// User email injection middleware
const injectUserEmail = (req, res, next) => {
  let userEmail;

  // Enhanced logging - show what's being requested
  const logRequest = () => {
    const endpoint = req.path.split('/').pop();
    switch(endpoint) {
      case 'execEvent':
        console.log(`[Gateway] 📊 execEvent: ${req.body?.eventSQLId || 'unknown'} | Params:`, JSON.stringify(req.body?.params || {}).substring(0, 100));
        break;
      case 'setVals':
        const values = req.body?.values?.map(v => `${v.paramName}=${v.paramVal}`).join(', ') || 'unknown';
        console.log(`[Gateway] 💾 setVals: ${values}`);
        break;
      case 'execDML':
        console.log(`[Gateway] ✍️  execDML: ${req.body?.method || 'unknown'} ${req.body?.table || ''}`);
        break;
      case 'getVal':
        console.log(`[Gateway] 🔍 getVal: ${req.query?.paramName || 'unknown'}`);
        break;
      default:
        console.log(`[Gateway] ${req.method} ${req.path}`);
    }
  };
  logRequest();

  // Check session first
  if (req.session && req.session.userEmail) {
    userEmail = req.session.userEmail;
    console.log(`[Gateway] ${req.method} ${req.path} | Session User: ${userEmail}`);
  } else {
    // Fall back to origin-based detection
    console.log(`[Gateway] No session found. Session:`, req.session ? 'exists but no userEmail' : 'null');
    const origin = req.headers.origin || req.headers.referer;
    if (origin) {
      const match = origin.match(/:(\d+)/);
      const originPort = match ? match[1] : null;
      userEmail = portToEmailMap[originPort] || 'default@whatsfresh.ai';
      console.log(`[Gateway] ${req.method} ${req.path} | Port: ${originPort} | User: ${userEmail}`);
    }
  }

  // Inject userEmail into request
  if (userEmail) {
    if (req.method === 'POST' && req.body) {
      req.body.userEmail = userEmail;
    }
    if (req.method === 'GET') {
      req.query.userEmail = userEmail;
    }
    req.headers['x-user-email'] = userEmail;
  }

  next();
};

// Login endpoint - creates session
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

      // Explicitly save session before responding
      req.session.save((err) => {
        if (err) {
          console.error(`[Gateway] Session save error:`, err);
          return res.status(500).json({ success: false, message: 'Session save failed' });
        }
        console.log(`[Gateway] Login successful, session saved for ${data.user.email}`);
        console.log(`[Gateway] Session ID: ${req.sessionID}`);
        res.json(data);
      });
    } else {
      console.log(`[Gateway] Login failed for ${userEmail}`);
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error(`[Gateway] Login error:`, error.message);
    res.status(500).json({ success: false, message: 'Gateway login error' });
  }
});

// Logout endpoint - destroys session
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

// Login page routes
app.get('/', (req, res) => {
  res.sendFile('login.html', { root: 'public' });
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: 'public' });
});

// Apply userEmail injection to all /api routes
app.use('/api', injectUserEmail);

// Proxy all /api requests to server
app.use('/api', createProxyMiddleware({
  target: TARGET_SERVER,
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    // Forward user email header
    if (req.headers['x-user-email']) {
      proxyReq.setHeader('x-user-email', req.headers['x-user-email']);
    }

    // Re-write body with injected userEmail
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

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    gateway: 'running',
    target: TARGET_SERVER,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Proxying requests to: ${TARGET_SERVER}`);
  console.log(`\n📋 Port → User mapping:`);
  Object.entries(portToEmailMap).forEach(([port, email]) => {
    console.log(`   :${port} → ${email}`);
  });
  console.log(`\n✅ Ready to serve requests\n`);
});
