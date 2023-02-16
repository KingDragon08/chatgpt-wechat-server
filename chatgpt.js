import { ChatGPTAPI } from 'chatgpt';

export async function chatgpt(ctx) {
  const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY
  })
  const { cid, pid, msg } = ctx.request.body;
  let res = {};
  if (!cid || !pid) {
    res = await api.sendMessage(msg, { timeoutMs: 2 * 60 * 1000 });
  } else {
    res = await api.sendMessage(msg, {
      conversationId: cid,
      parentMessageId: pid,
    });
  }
  const { conversationId, id, text } = res;
  ctx.body = { cid: conversationId, pid: id, text: text };
  ctx.status = 200;
};
