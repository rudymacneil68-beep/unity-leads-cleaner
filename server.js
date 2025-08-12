const express = require('express');
const { exec } = require('child_process');

const app = express();
app.use(express.json());

const RUN_TOKEN = process.env.RUN_TOKEN || '';

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Run via GET: /run?token=TOKEN&pages=5
app.get('/run', (req, res) => {
  const token = req.query.token;
  if (!RUN_TOKEN || token !== RUN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const pages = parseInt(req.query.pages, 10) || parseInt(process.env.PAGES_TO_PROCESS || '5', 10);
  console.log('Running cleaning script for', pages, 'pages via GET');
  exec('node index.js', (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Script failed', stderr });
    }
    res.json({ ok: true, stdout });
  });
});

// Run via POST: header x-run-token, body: { pages: 5 }
app.post('/run', (req, res) => {
  const token = req.headers['x-run-token'];
  if (!RUN_TOKEN || token !== RUN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const pages = req.body && req.body.pages ? parseInt(req.body.pages, 10) : parseInt(process.env.PAGES_TO_PROCESS || '5', 10);
  console.log('Running cleaning script for', pages, 'pages via POST');
  exec('node index.js', (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Script failed', stderr });
    }
    res.json({ ok: true, stdout });
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
