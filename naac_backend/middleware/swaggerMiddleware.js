const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const path = require('path');
const fs = require('fs');

const swaggerMiddleware = (app) => {
  // Serve the swagger.json endpoint
  app.get('/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // Serve the custom HTML file
  app.get('/api-docs', (req, res) => {
    const htmlPath = path.join(__dirname, '../swagger-ui.html');
    
    // Check if the HTML file exists
    if (fs.existsSync(htmlPath)) {
      res.setHeader('Content-Type', 'text/html');
      res.sendFile(htmlPath);
    } else {
      // Fallback to swagger-ui-express if HTML file doesn't exist
      const swaggerUiAssetPath = swaggerUi.getAbsoluteFSPath();
      const swaggerUiIndexTemplate = path.join(swaggerUiAssetPath, 'index.html');
      
      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>MMCH API Documentation</title>
          <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css" />
          <style>
            html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
            *, *:before, *:after { box-sizing: inherit; }
            body { margin: 0; background: #fafafa; }
          </style>
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js"></script>
          <script src="https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js"></script>
          <script>
            window.onload = function() {
              const ui = SwaggerUIBundle({
                url: window.location.origin + '/api-docs/swagger.json',
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                plugins: [SwaggerUIBundle.plugins.DownloadUrl],
                layout: "StandaloneLayout"
              });
            };
          </script>
        </body>
        </html>
      `);
    }
  });
};

module.exports = swaggerMiddleware;
