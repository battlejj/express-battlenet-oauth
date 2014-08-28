express-battlenet-oauth
=================
Handy sub-app for quickly adding Battle.net (https://dev.battle.net) OAuth to your express application.


####Installation
````
$ npm install express-battlenet-oauth
````

###Read Before Getting Started
<div style="width:100%; background-color:#f1e05a;">
Blizzard's OAuth requires that your callback URL be served via SSL.
This makes creating usable tests difficult. You'll have to provide your site via SSL at least for your
BNET_CALLBACK_URL or you will receive the error "Invalid redirect_url."

See http://us.battle.net/en/forum/topic/13977887738#8 for more information.
</div>


###Easy to Implement
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

app.use('/', auth);

//Setup your express app like normal
```

###Options
All options for express-battlenet-oauth are set in your main express app via:

```javascript
app.set('VARIABLE_NAME', value);
```
The only non-optional fields are BASE_URL, BNET_ID and BNET_SECRET, however, without setting a LOGIN_SUCCESS, LOGIN_FAILURE
function you won't be able to do much useful with the authentication.

Other fields:
| Field | Default | Usage|
|-------|---------|------|
|BNET_REGION| 'us' | Changing the region you auth against. Valid values: us, eu, kr, tw, or cn|
|BNET_SCOPE| 'wow.profile' | Changing the scope of your request. Valid values: wow.profile, sc2.profile|
|BNET_AUTH_URL| '/auth/bnet' | This value is the route you want your Express app to use to begin BNET authentication|
|BNET_CALLBACK_URL| '/auth/bnet/callback' | This value is the route you want your Express app to use for the callback from the Blizzard OAuth API. This value has to match your applications "REGISTER CALLBACK URL" minus your BASE_URL value|
|LOGIN_SUCCESS| ```function(req, res){ res.status(200).send('Use your own method to manipulate res.token_data, currently: ' + JSON.stringify(res.token_data))}```| A function to handle a successful battle.net authentication, token data will be available at res.token_data|
|LOGIN_FAILURE| ```function(req, res){ res.status(500).send(res.error) }``| A function to handle a failed battle.net authentication (use declined access, bnet server errors, invalid grants, etc), error data will be available at res.error |
