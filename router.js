import Router from 'koa-router';
import { koaBody } from 'koa-body';
import { msg } from './msg.js';

const router = new Router();

export default (app) => {
  router.post('/msg', msg);
  app.use(koaBody());
  app.use(router.routes());
  app.use(router.allowedMethods());
}
