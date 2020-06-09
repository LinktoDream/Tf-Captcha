'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.post('/captcha/get', controller.home.get);
  router.post('/captcha/check', controller.home.check);
};
