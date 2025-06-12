require('module-alias/register');
const codeName = `[listRegisteredRoutes.js] `;

module.exports = {
  listRoutes: (app) => (_, res) => {
    console.log('Entering listRoutes function'); // Log entry point
    const routes = [];
    app._router.stack.forEach((middleware, index) => {
      if (middleware.route) { // Routes registered directly on the app
        const methods = Object.keys(middleware.route.methods);
        routes.push({
          path: middleware.route.path,
          methods: methods.map(method => method.toUpperCase()),
        });
        console.log(codeName, `Added route: ${middleware.route.path}`); // Log added route
      } else if (middleware.name === 'router') { // Routes added as router middleware
        middleware.handle.stack.forEach((handler, handlerIndex) => {
          if (handler.route) { // Ensure handler has route property
            const methods = Object.keys(handler.route.methods);
            routes.push({
              path: handler.route.path,
              methods: methods.map(method => method.toUpperCase()),
            });
            console.log(codeName,`Added handler route ${handlerIndex}: ${handler.route.path}`); 
          }
        });
      }
    });
    console.log(codeName, 'Completed processing routes'); // Log completion
    res.json({ routes });
    console.log(codeName,'Response sent'); // Log response sent
  }
};
