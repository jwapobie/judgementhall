// via https://github.com/wxqee/https-server
// Place SSL certs server.crt and server.key into $HOME/.https-serve/ first. 
// mkdir -p $HOME/.https-serve/ && cd $HOME/.https-serve/ && sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout server.key -out server.crt

var fs = require('fs');
var http = require('http');
var https = require('https');
var path = require('path');
var express = require('express');

const credentials = {
	key: fs.readFileSync(path.resolve(process.env.HOME, '.https-serve/server.key'), 'utf8'),
	cert: fs.readFileSync(path.resolve(process.env.HOME, '.https-serve/server.crt'), 'utf8'),
};

const createServer = (app, options) => {
	const httpServer = http.createServer(app);
	const httpsServer = https.createServer(credentials, app);

	httpServer.listen(options.port);
	httpsServer.listen(options.httpsPort);

	return { httpServer, httpsServer };
	//return httpsServer;
};

// application
var app = express();
app.use (function (req, res, next) { //Middleware function that redirects insecure requests to https
        if (req.secure) {
                // request was via https, so do no special handling
                next();
        } else {
                // request was via http, so redirect to https
                res.redirect('https://' + req.headers.host + req.url);
        }
});
app.use(express.static(path.resolve('./build')));


// run application in http+https server
var serverOptions = {
  port: process.env.PORT || 80,
  httpsPort: process.env.HTTPS_PORT || 443,
};
var {httpServer, httpsServer} = createServer(app, serverOptions);

httpServer.on('listening', () => {
  const { address, port, family } = httpServer.address();
  console.info('httpServer on %s:%s (%s)', address, port, family);
});

httpsServer.on('listening', () => {
  const { address, port, family } = httpsServer.address();
  console.info('httpsServer on %s:%s (%s)', address, port, family);
});