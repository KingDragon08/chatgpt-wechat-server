import Router from 'koa-router';
import { koaBody } from 'koa-body';
import { chatgpt } from './chatgpt.js';
import { pay, login } from './wx.js';
import { gen } from './image.js';
import { voice } from './ms_text_to_speech.js';

const router = new Router();

async function options (ctx) {
  ctx.body = '';
  ctx.status = 204;
}

export default (app) => {
  router.post('/msg', chatgpt);
  router.options('/msg', options);
  router.post('/wx/pay', pay);
  router.post('/wx/login', login);
  router.post('/image/gen', gen);
  router.post('/voice/gen', voice);
  router.options('/voice/gen', options);
  app.use(koaBody());
  app.use(router.routes());
  app.use(router.allowedMethods());
}
