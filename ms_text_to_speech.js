import sdk from 'microsoft-cognitiveservices-speech-sdk';
import { v4 as uuidv4 } from 'uuid';

export async function voice(ctx) {
  var {
    text,
    voice = 'zh-CN-XiaoxiaoNeural', // 角色
    style = 'cheerful', // 语气
    speed = 1, // 语速
    pitch = 0, // 音调
  } = ctx.request.body;
  const audioFile = await css(text, voice, style, speed, pitch);
  ctx.body = { text, path: audioFile };
  ctx.status = 200;
}

function css(text, voice, style, speed, pitch) {
  var audioFile = `voices/${uuidv4()}.wav`;
  var speechConfig = sdk.SpeechConfig.fromSubscription(process.env.MS_SPEECH_KEY, process.env.MS_SPEECH_REGION);
  var audioConfig = sdk.AudioConfig.fromAudioFileOutput(`public/${audioFile}`);
  speechConfig.speechSynthesisLanguage = "zh-CN";
  var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
  return new Promise((resolve, reject) => {
    var ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="zh-CN">
        <voice name="${voice}">
            <mstts:express-as style="${style}" styledegree="2">
              <prosody pitch="${pitch * 100}%" rate="${speed}">
                ${text}
              </prosody>
            </mstts:express-as>
        </voice>
      </speak>
    `;
    synthesizer.speakSsmlAsync(
      ssml,
      function () {
        synthesizer.close();
        synthesizer = null;
        resolve(audioFile);
      },
      function (err) {
        synthesizer.close();
        synthesizer = null;
        reject('');
      }
    );
  });
}
