/*
HTTPS is required in order for Battle.net to reply to your server with a value token, so if you have
no SSL certificate you will not be able to use this or any other library.

While it is not 100% required to use sessions for Battle.net auth, it is highly recommended as a security
measure to prevent unauthorized 3rd party abuse.
 */
var bnet = require('../index')
  , express = require('express')
  , fs = require('fs')
  , https = require('https')
  , path = require('path')
  , session;

/*
For this example we are using sessions, so be sure to npm install the dependencies. Tell the user if they haven't.
 */
try {
  session = require('express-session');
} catch(e){
  if(e.code === 'MODULE_NOT_FOUND'){
    throw new Error('Cannot find express-session. To run the example please run "npm install" from the command line.');
  }
}

//Get the path to this file being executed
var rootPath = path.dirname(process.mainModule.filename);

//Load our SSL key and certificate
var ssl_options = {
  key: fs.readFileSync(path.join(rootPath, 'ssl/localhost.key')),
  cert: fs.readFileSync(path.join(rootPath, 'ssl/localhost.crt'))
};

//Initialize Express
app = express();

//Load session middleware
app.use(session({
  secret: 'keyboard cat'
  , cookie: { secure: true }
  , saveUninitialized: true
  , resave: true
}));

//Initialize our HTTPS server to listen on port 8443
var server = https.createServer(ssl_options, app).listen(8443, function() {
  console.log('Listening on port %d', server.address().port);
  console.log('To test this example, navigate to https://localhost:' + server.address().port +'/auth/bnet');
  console.log('You\'ll have to accept a security exception for the self signed SSL certificate.');

});

//Set the variables our plugin needs
app.set('BNET_ID', 'INSERT YOUR KEY');
app.set('BNET_SECRET', 'INSERT YOUR SECRET');
app.set('BASE_URL', 'https://localhost:8443');

//Mount the plugin
app.use('/', bnet);