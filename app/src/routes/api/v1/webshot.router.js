const Router = require('koa-router');
const RenderPDF = require('chrome-headless-render-pdf');
const logger = require('logger');
const send = require('koa-send');
const tmp = require('tmp');
const rimraf = require('rimraf');

const router = new Router({
  prefix: '/webshot',
});

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
    ctx.assert(ctx.query.name, 400, 'Name param required');
    logger.info(`Doing screenshot of ${ctx.query.url}`);
    const tmpDir = tmp.dirSync();
    try {
      logger.debug(`Saving in: ${tmpDir.name}/${ctx.query.name}.pdf `);
      await RenderPDF.generateSinglePdf(ctx.query.url, `${tmpDir.name}/${ctx.query.name}.pdf`);
      ctx.set('Content-disposition', `attachment; filename=${ctx.query.name}.pdf`);
      ctx.set('Content-type', 'application/pdf');
      await send(ctx, `${tmpDir.name}/${ctx.query.name}.pdf`, { root: '/' });

    } catch (err) {
      logger.error(err);
    } finally {
      logger.debug('Removing folder ');
      if (tmpDir) {
        // WebshotRouter.removeFolder(tmpDir.name);
      }
    }

  }

}

router.get('/', WebshotRouter.screenshot);

module.exports = router;
