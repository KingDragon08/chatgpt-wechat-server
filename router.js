import Router from 'koa-router';
import { koaBody } from 'koa-body';
import { chatgpt } from './chatgpt.js';
import { pay, login } from './wx.js';
import { gen } from './image.js';
import { voice } from './ms_text_to_speech.js';

const router = new Router();

export default (app) => {
  router.options('*', async function (ctx) {
    ctx.status = 204;
  });
  router.post('/msg', chatgpt);
  router.post('/wx/pay', pay);
  router.post('/wx/login', login);
  router.post('/image/gen', gen);
  router.post('/voice/gen', voice);
  app.use(koaBody());
  app.use(router.routes());
  app.use(router.allowedMethods());
}
