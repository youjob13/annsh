const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://annushka-tg-bot-3d6cd33c9162.herokuapp.com/",
      changeOrigin: true,
    })
  );
};
