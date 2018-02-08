const Router = require('koa-router');
const puppeteer = require('puppeteer');
const logger = require('logger');
const send = require('koa-send');
const tmp = require('tmp');
const url = require('url');
const rimraf = require('rimraf');

const router = new Router({
  prefix: '/webshot',
});

const viewportDefaultOptions = { width: 1024, height: 768, isMobile: true };
const gotoOptions = { waitUntil: 'networkidle' };

const getDelayParam = (param) => {
  const n = parseInt(param, 10);
  if (typeof n === 'number' && !isNaN(n)) return n;
  return param;
};

class WebshotRouter {

  static async removeFolder(path) {
    return new Promise((resolve, reject) => {
      rimraf(path, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  static async screenshot(ctx) {
    ctx.assert(ctx.query.url, 400, 'url param is required');
    ctx.assert(ctx.query.filename, 400, 'filename param required');
    logger.info(`Doing screenshot of ${ctx.query.url}`);

    // Validating URL
    const urlObject = url.parse(ctx.query.url);
    ctx.assert(/http|https/.test(urlObject.protocol), 400, 'The protocol in url param is not valid. Use http or https.');

    const viewportOptions = Object.assign({}, viewportDefaultOptions);
    const tmpDir = tmp.dirSync();
    const filename = `${ctx.query.filename}-${Date.now()}.pdf`;
    const filePath = `${tmpDir.name}/${filename}`;
    const delay = getDelayParam(ctx.query.waitFor);

    if (ctx.query.landscape && ctx.query.landscape === 'true') viewportOptions.isLandscape = true;
    if (ctx.query.width) viewportOptions.width = parseInt(ctx.query.width, 10);
    if (ctx.query.height) viewportOptions.height = parseInt(ctx.query.height, 10);

    try {
      logger.debug(`Saving in: ${filePath}`);

      // Using Puppeteer
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setViewport(viewportOptions);
      await page.goto(ctx.query.url, gotoOptions);
      if (delay) await page.waitFor(delay);
      if (ctx.query.mediatype) await page.emulateMedia(ctx.query.mediatype);
      await page.pdf({ path: filePath, format: 'A4' });

      browser.close();

      // Sending file to download
      ctx.set('Content-disposition', `attachment; filename=${filename}`);
      ctx.set('Content-type', 'application/pdf');
      await send(ctx, filePath, { root: '/' });
    } catch (err) {
      logger.error(err);
    }
  }

}

router.get('/', WebshotRouter.screenshot);

module.exports = router;
