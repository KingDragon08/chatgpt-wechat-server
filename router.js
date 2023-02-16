import Router from 'koa-router';
import { koaBody } from 'koa-body';
import { chatgpt } from './chatgpt.js';
import { pay, login } from './wx.js';
import { gen } from './image.js';

const router = new Router();

export default (app) => {
  router.post('/msg', chatgpt);
  router.post('/wx/pay', pay);
  router.post('/wx/login', login);
  router.post('/image/gen', gen);
  app.use(koaBody());
  app.use(router.routes());
  app.use(router.allowedMethods());
}
