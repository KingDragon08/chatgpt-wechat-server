import dotenv from 'dotenv';
import Koa from 'koa';
import CryptoJS from 'crypto-js';
import router from './router.js';
import serve from 'koa-static';
import cors from 'koa2-cors';

dotenv.config();
const app = new Koa();

const options = {
  origin: '*',
  maxAge: 5, //指定本次预检请求的有效期，单位为秒。
  credentials: true, //是否允许发送Cookie
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
};
app.use(cors(options));

function encrypt(word) {
  const key = CryptoJS.enc.Utf8.parse(process.env.AES_KEY);
  const srcs = CryptoJS.enc.Utf8.parse(word);
  const encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 });
  return encrypted.toString();
}

// static assets
const home = serve('public/')
app.use(home)

// timestamp
app.use(async (ctx, next) => {
  await next();
  ctx.set('X-Response-Time', new Date().getTime());
});

// authorization
app.use(async (ctx, next) => {
  const { header } = ctx.request;
  if (!header) {
    ctx.status = 401;
    ctx.body = { msg: 'authorization failed 1' };
    return;
  }
  const { token, random } = header;
  if (!token || !random) {
    ctx.status = 401;
    ctx.body = { msg: 'authorization failed 2' };
    return;
  }
  const enc = encrypt(random);
  if (token != enc) {
    ctx.status = 401;
    ctx.body = { msg: 'authorization failed 3' };
    return;
  }
  await next();
});

router(app);

app.listen(3000);