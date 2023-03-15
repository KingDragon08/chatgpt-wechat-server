import { ChatGPTAPI } from 'chatgpt';
import { msgSecCheck } from './wx.js';

export async function chatgpt(ctx) {
  const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY
  });
  const { cid, pid, msg, openid } = ctx.request.body;
  if (!openid) {
    ctx.body = { cid, pid, text: '小程序版本过时, 请退出重新进入' };
    ctx.status = 200;
    return;
  }
  let res = {};
  const isSensitive = await msgSecCheck(msg, openid);
  if (isSensitive) {
    ctx.body = { cid, pid, text: '内容违规, 试试别的问题吧' };
    ctx.status = 200;
    return;
  }
  if (!cid || !pid) {
    res = await api.sendMessage(msg, { timeoutMs: 2 * 60 * 1000 });
  } else {
    res = await api.sendMessage(msg, {
      conversationId: cid,
      parentMessageId: pid,
      timeoutMs: 2 * 60 * 1000,
    });
  }
  const { conversationId, id, text } = res;
  ctx.body = { cid: conversationId, pid: id, text: text };
  ctx.status = 200;
};
