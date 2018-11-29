const Router = require('koa-router');
const puppeteer = require('puppeteer');
const logger = require('logger');
const send = require('koa-send');
const tmp = require('tmp');
const url = require('url');
const rimraf = require('rimraf');
const S3Service = require('services/s3.service');
const config = require('config');

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

      // Whether or not to include the background
      const printBackground = !!(ctx.query.backgrounds && ctx.query.backgrounds === 'true');

      await page.pdf({ path: filePath, format: 'A4', printBackground });

      browser.close();

      // Sending file to download
      ctx.set('Content-disposition', `attachment; filename=${filename}`);
      ctx.set('Content-type', 'application/pdf');
      await send(ctx, filePath, { root: '/' });
    } catch (err) {
      logger.error(err);
    }
  }

  static async widgetThumbnail(ctx) {
    const widget = ctx.params.widget;
    logger.info(`Generating thumbnail for widget ${widget}`);

    // Validating URL
    const viewportOptions = Object.assign({}, viewportDefaultOptions);
    const tmpDir = tmp.dirSync();
    const filename = `${widget}-${Date.now()}.png`;
    const filePath = `${tmpDir.name}/${filename}`;
    const delay = 10000;
    const renderUrl = `${config.get('service.appUrl')}${widget}`;

    if (ctx.query.width) viewportOptions.width = parseInt(ctx.query.width, 10);
    if (ctx.query.height) viewportOptions.height = parseInt(ctx.query.height, 10);

    logger.info(`Capturing URL: ${renderUrl}`);

    try {
      logger.debug(`Saving in: ${filePath}`);

      // Using Puppeteer
      const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setViewport(viewportOptions);
      await page.goto(renderUrl, { waitUntil: ['networkidle2', 'domcontentloaded'] });
      if (delay) await page.waitFor(delay);

      // element
      const element = await page.$('.widget-content');
      await element.screenshot({ path: filePath });

      browser.close();

      const s3file = await S3Service.uploadFileToS3(filePath, filename);
      ctx.body = { data: { widgetThumbnail: s3file } };
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

}

router.get('/', WebshotRouter.screenshot);
router.post('/widget/:widget/thumbnail', WebshotRouter.widgetThumbnail);

module.exports = router;
