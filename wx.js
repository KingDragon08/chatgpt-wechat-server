import fs from 'fs';
import crypto from 'crypto';
import axios from 'axios';

/**
 * 生成随机字符串
 * @param {number} len 字符串长度
 */
export function createRandomString(len) {
  let data = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  let str = "";
  for (let i = 0; i < len; i++) {
    str += data.charAt(Math.floor(Math.random() * data.length));
  }
  return str;
}

/**
 * 微信支付v3 签名生成
 * @param {string} method 请求方法
 * @param {string} url
 * @param {number} timestamp 时间戳 秒级
 * @param {string} nonce_str 随机字符串
 * @param {Object} order 主体信息
 */
function createSign(method, url, timestamp, nonce_str, order) {
  let signStr = `${method}\n${url}\n${timestamp}\n${nonce_str}\n${JSON.stringify(
    order
  )}\n`;
  let cert = fs.readFileSync("./ssl/apiclient_key.pem", "utf-8");
  let sign = crypto.createSign("RSA-SHA256");
  sign.update(signStr);
  return sign.sign(cert, "base64");
}

/**
 * 创建小程序发起支付的签名字符串
 * @param {number} timestamp 时间戳
 * @param {string} nonce_str 随机字符串
 * @param {string} prepay    订单详情扩展字符串
 */
function createMiniSign(timestamp, nonce_str, prepay) {
  let signStr = `${process.env.MINI_APPID}\n${timestamp}\n${nonce_str}\nprepay_id=${prepay}\n`;
  let cert = fs.readFileSync("./ssl/apiclient_key.pem", "utf-8");
  let sign = crypto.createSign("RSA-SHA256");
  sign.update(signStr);
  return sign.sign(cert, "base64");
}

/**
 * 微信支付v3
 * @param {Object} order 订单信息
 */
async function v3Pay(order) {
  let timestamp = Math.floor(new Date().getTime() / 1000);
  let nonce_str = createRandomString(32);
  let signature = createSign(
    "POST",
    "/v3/pay/transactions/jsapi",
    timestamp,
    nonce_str,
    order
  );
  let Authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${process.env.WXPAY_MERCHANT_ID}",nonce_str="${nonce_str}",timestamp="${timestamp}",signature="${signature}",serial_no="${process.env.WXPAY_KEY_SERIAL_NO}"`;
  const result = await axios.post(
    "https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi",
    order,
    {
      headers: { Authorization: Authorization },
    }
  )
  return {
    timeStamp: `${timestamp}`,
    nonceStr: nonce_str,
    package: `prepay_id=${result.data.prepay_id}`,
    signType: 'RSA',
    paySign: createMiniSign(timestamp, nonce_str, result.data.prepay_id),
  };
}

export async function pay(ctx) {
  const { keyword, openid } = ctx.request.body;
  ctx.status = 200;
  ctx.body = await v3Pay({
    appid: process.env.MINI_APPID,
    mchid: process.env.WXPAY_MERCHANT_ID,
    description: `${keyword}图像生成支付`,
    out_trade_no: createRandomString(16),
    amount: {
      total: 1,
    },
    payer: { openid },
    notify_url: "https://chatgpt.hhjkln.com/wxpay/callback",
  });
}

export async function login(ctx) {
  const { code } = ctx.request.body;
  const result = await axios.get(
    'https://api.weixin.qq.com/sns/jscode2session',
    {
      params: {
        appid: process.env.MINI_APPID,
        secret: process.env.MINI_APP_SECRET,
        js_code: code,
        grant_type: 'authorization_code',
      }
    }
  );
  ctx.status = 200;
  ctx.body = result.data;
}
