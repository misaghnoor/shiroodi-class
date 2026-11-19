import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';
const apiRoutes = new Set(['data', 'login', 'public', 'student']);

function enhanceResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
    return res;
  };
  return res;
}

async function readJsonBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function handleApi(req, res, name) {
  const modulePath = path.join(root, 'api', `${name}.js`);
  const { default: handler } = await import(pathToFileURL(modulePath).href);
  req.body = await readJsonBody(req);
  await handler(req, enhanceResponse(res));
}

async function handleIndex(res) {
  const html = await readFile(path.join(root, 'index.html'));
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(html);
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  try {
    const apiMatch = pathname.match(/^\/api\/([a-z]+)$/);
    if (apiMatch && apiRoutes.has(apiMatch[1])) {
      return await handleApi(req, res, apiMatch[1]);
    }
    if (pathname === '/' || pathname === '/index.html') {
      return await handleIndex(res);
    }
    res.statusCode = 404;
    res.end('Not found');
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
    }
    res.end(JSON.stringify({ error: 'dev_server_error', message: error.message }));
  }
});

server.listen(port, host, () => {
  console.log(`shiroodi dev server listening on http://${host}:${port}`);
});
