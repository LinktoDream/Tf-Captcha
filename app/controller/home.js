'use strict';

const Controller = require('egg').Controller;
const Jimp = require('jimp');

const craetNewJimp = (width, height) => new Promise((resolve,reject) => {
  new Jimp(width, height, 0xffffff00, (err, image) => {
    if (err) reject(err);
    else resolve(image);
  });
})


/**
 * 产生随机整数，包含下限值，包括上限值
 * @param {Number} lower 下限
 * @param {Number} upper 上限
 * @return {Number} 返回在下限到上限之间的一个随机整数
 */
const random = (lower, upper) => {
	return Math.floor(Math.random() * (upper - lower+1)) + lower;
}  

class HomeController extends Controller {
  // 获取验证图片
  async get() {
    const { ctx } = this;
    const randomIndex = random(1,20);
    const lenna = await Jimp.read(`http://127.0.0.1:7001/public/jigsaw/bg${randomIndex}.png`),
      border = await Jimp.read('http://127.0.0.1:7001/public/resource/border.png');
    const {width, height} = lenna.bitmap,w = 43, h = w;
    const x = random(100,width - w),y = random(10,height - h);
    // 缓存x坐标
    ctx.session.jigsawX = x;
    const jigsaw = lenna.clone().crop(x,y,w,h);
    const newJimp = await craetNewJimp(w + 4,height);
    const originalImageBase64 = (await lenna
      .composite(jigsaw.clone().blur(20),x + 2,y + 2)
      .composite(border,x, y)
      .getBase64Async(Jimp.MIME_PNG)
      ).split(',')[1];
    const jigsawImageBase64 = (await newJimp
      .composite(jigsaw,2,y + 2)
      .composite(border,0, y)
      .getBase64Async(Jimp.MIME_PNG)
      ).split(',')[1];
    ctx.body = {
      error: false,
      repCode: "0000",
      repData: {
        jigsawImageBase64,
        opAdmin: false,
        originalImageBase64,
        result: false,
        token: "71dd26999e314f9abb0c635336976635"
      },
      success: true
    };
  }
  // 验证方法
  async check() {
    const { ctx } = this;
    let reqX = JSON.parse(ctx.request.body.pointJson).x,
      jigsawX = ctx.session.jigsawX,
      error = true,
      repCode = "6111",
      repData = null,
      repMsg = "验证失败",
      success = false
      ;
    if (Math.abs(reqX - jigsawX) < 5) {
      error = false;
      repCode = "0000";
      repMsg = null;
      success = true;
      repData = {
        captchaFontSize: null,
        captchaFontType: null,
        captchaId: null,
        captchaOriginalPath: null,
        captchaType: "blockPuzzle",
        captchaVerification: null,
        jigsawImageBase64: null,
        originalImageBase64: null,
        point: null,
        pointJson: "HPydrRfTk9Ha9rkT+1HEyfZrws3E9QqyekSo/QLbDkE=",
        pointList: null,
        projectCode: null,
        result: true,
        secretKey: null,
        token: "7f24496cde8c4ff4bb25c26d04de7cda",
        wordList: null
      };
    }
    ctx.body = {
      error,
      repCode,
      repData,
      repMsg,
      success
    };
  }
}

module.exports = HomeController;
