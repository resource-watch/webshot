const Router = require('koa-router');
const puppeteer = require('puppeteer');
const logger = require('logger');
const send = require('koa-send');
const tmp = require('tmp');
const rimraf = require('rimraf');

const router = new Router({
  prefix: '/webshot',
});

const viewportOptions = { width: 1024, height: 768 };
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
    ctx.assert(ctx.query.url, 400, 'Url param is required');
    ctx.assert(ctx.query.filename, 400, 'Name param required');
    logger.info(`Doing screenshot of ${ctx.query.url}`);

    const tmpDir = tmp.dirSync();
    const filename = `${ctx.query.filename}-${Date.now()}.pdf`;
    const filePath = `${tmpDir.name}/${filename}`;
    const delay = getDelayParam(ctx.query.waitFor);

    if (ctx.query.landscape && ctx.query.landscape === 'true') viewportOptions.isLandscape = true;

    try {
      logger.debug(`Saving in: ${filePath}`);

      // Using Puppeteer
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setViewport(viewportOptions);
      await page.goto(ctx.query.url, gotoOptions);
      if (delay) await page.waitFor(delay);
      await page.pdf({ path: filePath, format: 'A4' });

      browser.close();

      // Sending file to download
      ctx.set('Content-disposition', `attachment; filename=${filename}`);
      ctx.set('Content-type', 'application/pdf');
      await send(ctx, filePath, { root: '/' });
    } catch (err) {
      logger.error(err);
    }
    // finally {
    //   logger.debug('Removing folder ');
    //   if (tmpDir) {
    //     WebshotRouter.removeFolder(tmpDir.name);
    //   }
    // }
  }

}

router.get('/', WebshotRouter.screenshot);

module.exports = router;
