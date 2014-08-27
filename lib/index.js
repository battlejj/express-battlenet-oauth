var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes');

var app = module.exports = express();

app.on('mount', function(parent){
  app.set('BNET_ID', parent.get('BNET_ID') || process.env.BNET_ID);
  app.set('BNET_SECRET', parent.get('BNET_SECRET') || process.env.BNET_SECRET);

  app.set('BNET_REGION', parent.get('BNET_REGION') || 'us');
  app.set('BNET_SCOPE', parent.get('BNET_SCOPE') || 'wow.profile');

  app.set('BNET_AUTH_URL', parent.get('BNET_AUTH_URL') || '/auth/bnet/');
  app.set('BNET_CALLBACK_URL', parent.get('BNET_CALLBACK_URL') || '/auth/bnet/callback');

  //LOGIN_FAIL and LOGIN_SUCCESS are functions that should be set to determine what happens when a user
  //login fails and when a user login succeeds. These are placeholder methods that should be replaced.
  app.set('LOGIN_FAIL', parent.get('LOGIN_FAIL') || function(req, res){ res.status(500).send(res.error) });
  app.set('LOGIN_SUCCESS', parent.get('LOGIN_SUCCESS')
  || function(req, res){
    res.status(200).send('Use your own method to manipulate res.token_data, currently: ' + JSON.stringify(res.token_data))
  });

  //BNET_ID and BNET_SECRET have to exist or we error out
  if(!app.get('BNET_ID')){
    throw new ConfigurationException(
        'Your Battle.net client ID is required to use express-battlenet-oauth. Please provide it via the' +
        ' environment variable BNET_ID or as an express app variable with app.set("BNET_ID") = "YOUR CLIENT ID." For' +
        ' other usage please see the README.'
    );
  }

  if(!app.get('BNET_SECRET')){
    throw new ConfigurationException(
        'Your Battle.net client secret is required to use express-battlenet-oauth. Please provide it via the' +
        ' environment variable BNET_SECRET or as an express app variable with app.set("BNET_SECRET") = "YOUR SECRET KEY."' +
        'For other usage please see the README.'
    );
  }

  app.get(app.get('BNET_AUTH_URL'), routes.bnetAuth);
  app.get(app.get('BNET_CALLBACK_URL'), routes.bnetCallback);
});

app.use(bodyParser.urlencoded({ extended: false }));

function ConfigurationException(message){
  this.message = message;
  this.name = 'ExpressBnetOAuthException';
}

ConfigurationException.prototype.toString = function (){
  return this.name + ': "' + this.message + '"';
};

