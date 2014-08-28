var qs = require('querystring');
var request = require('request');

module.exports = {
  bnetAuth: function(req, res){
    if(!req.query.region){
      req.query.region = req.app.get('BNET_REGION');
    }

    if(!req.query.scope){
      req.query.scope = req.app.get('BNET_SCOPE');
    }

    var params = qs.stringify({
      client_id: req.app.get('BNET_ID'),
      scope: req.query.scope,
      state: req.query.scope + ':' + req.query.region + ':IMPLEMENT_RANDOM',
      redirect_uri: req.app.get('BASE_URL') + req.app.get('BNET_CALLBACK_URL'),
      response_type: 'code'
    });

    res.redirect('https://' + req.query.region + '.battle.net/oauth/authorize?' + params);
  },
  bnetCallback: function(req, res){
    var scope,
      region,
      token_params;

    //User Declined Access
    if(req.query.error && req.query.error === 'access_denied'){
      res.error = {error: req.query.error, error_description: req.query.error_description};
      return req.app.get('LOGIN_FAIL')(req, res);
    }

    try {
      scope = req.query.state.split(':').length ? req.query.state.split(':')[0] : req.app.get('BNET_SCOPE');
      region = req.query.state.split(':').length ? req.query.state.split(':')[1] : req.app.get('BNET_REGION');

    } catch(e){
      scope = req.app.get('BNET_SCOPE');
      region = req.app.get('BNET_REGION');
    }

    token_params = qs.stringify({
      client_id: req.app.get('BNET_ID'),
      client_secret: req.app.get('BNET_SECRET'),
      code: req.query.code,
      scope: scope,
      grant_type: 'authorization_code',
      redirect_uri: req.app.get('BASE_URL') + req.app.get('BNET_CALLBACK_URL')
    });

    request('https://' + region + '.battle.net/oauth/token?' + token_params, function(error, response, body){
      //Catch Request Errors First
      if(error) {
        res.error = {error: error, error_description: 'Error reaching battle.net servers.'};
      } else {
        try {
          var parsedResponse = JSON.parse(body);
          if(parsedResponse.error){
            res.error = parsedResponse;
          } else {
            res.token_data = parsedResponse;
          }
        } catch(e){
          res.error = {
            error: 'Invalid battle.net response.',
            error_description: 'Response to BNET_CALLBACK_URL expected JSON and received: ' + body
          };
        }
      }
      if(res.error){
        return req.app.get('LOGIN_FAIL')(req, res);
      }

      return req.app.get('LOGIN_SUCCESS')(req, res);
    });

  }
};