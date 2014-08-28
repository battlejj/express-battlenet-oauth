express-battlenet-oauth
=================
Handy sub-app for quickly adding Battle.net (https://dev.battle.net) OAuth to your express application.


####Installation
````
$ npm install express-battlenet-oauth
````

####Read Before Getting Started
<div style="width:100%; background-color:#f1e05a;">
Blizzard's OAuth requires that your callback URL be served via SSL.
This makes creating usable tests difficult. You'll have to provide your site via SSL at least for your
BNET_CALLBACK_URL or you will receive the error "Invalid redirect_url."

See http://us.battle.net/en/forum/topic/13977887738#8 for more information.


**DISCLAIMER**: The following will seem silly to point out, because without sessions enabled authentication is kind 
of pointless, however, please read it anyway.

While not *strictly* required, it is ***highly recommended*** you enable sessions in your application and make
the session available through req.session. If you don't do this, pseudo-random state parameters cannot be created
to prevent unauthorized 3rd party authentication attempts. 
</div>

####Minimal Implementation
```javascript
var express = require('express');
var app = express();

var bnet = require('express-battlenet-oauth');

var server = app.listen(8080, function() {
  console.log('Listening on port %d', server.address().port);
});

app.set('BNET_ID', '[YOUR BATTLE.NET APPLICATION KEY/ID]');
app.set('BNET_SECRET', '[YOUR BATTLE.NET APPLICATION SECRET]');
app.set('BASE_URL', 'https://yoursecuredomain.com');
app.set('LOGIN_SUCCESS', function(req, res){ 
  //battle.net oauth token is available in res.token_data for whatever your needs are
});
app.set('LOGIN_FAILURE', function(req, res){ 
  //error is available in res.error for you to handle user permission denial or other errors
});

app.use('/', bnet);

//Setup your express app like normal
```

For a full example please see: https://github.com/battlejj/express-battlenet-oauth/blob/master/examples/index.js

The example should be fully functional as is if you plop in your API Key and Secret and from the root folder run 
```
npm install
```
I've included a localhost SSL private key and certificate to be used for testing. It will require you to accept
a security exception since it is a self signed certificate. Chrome is the most ominous about this warning.


####Options
All options for express-battlenet-oauth are set in your main express app via:

```javascript
app.set('VARIABLE_NAME', value);
```
The only non-optional fields are BASE_URL, BNET_ID and BNET_SECRET, however, without setting a LOGIN_SUCCESS, LOGIN_FAILURE
function you won't be able to do much useful with the authentication.

#####Options List
<table>
  <thead><tr><th>Name</th><th>Default</th><th>Description</th></tr></thead>
  <tbody>
    <tr>
      <td>BNET_REGION</td>
      <td>'us'</td>
      <td>Changing the region you auth against. Valid values: us, eu, kr, tw, or cn</td>
    </tr>
    <tr>
      <td>BNET_SCOPE</td>
      <td>'wow.profile'</td>
      <td>Changing the scope of your request. Valid values: wow.profile, sc2.profile</td>
    </tr><tr>
      <td>BNET_AUTH_URL</td>
      <td>'/auth/bnet'</td>
      <td>This value is the route you want your Express app to use to begin BNET authentication.</td>
    </tr><tr>
      <td>BNET_CALLBACK_URL</td>
      <td>'/auth/bnet/callback'</td>
      <td>This value is the route you want your Express app to use for the callback from the Blizzard OAuth API. 
      This value has to match your applications "REGISTER CALLBACK URL" without your BASE_URL value.</td>
    </tr>
    <tr>
      <td>LOGIN_SUCCESS</td>
      <td>
      function(req, res){ res.status(200).send('Use your own method to manipulate res.token_data, 
      currently: ' + JSON.stringify(res.token_data))}
      </td>
      <td>A function to handle a successful battle.net authentication, token data will be available at res.token_data</td>
    </tr>
    <tr>
      <td>LOGIN_FAILURE</td>
      <td>
      function(req, res){ res.status(500).send(res.error) }
      </td>
      <td>A function to handle a failed battle.net authentication (use declined access, bnet server errors, invalid 
      grants, etc), error data will be available at res.error</td>
    </tr>
  </tbody>
</table>    
