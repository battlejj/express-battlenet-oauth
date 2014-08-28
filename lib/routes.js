var qs = require('querystring');
var request = require('request');
var uuid = require('node-uuid');

module.exports = {
  bnetAuth: function(req, res){
    if(!req.query.region){
      req.query.region = req.app.get('BNET_REGION');
    }

    if(!req.query.scope){
      req.query.scope = req.app.get('BNET_SCOPE');
    }

    if(req.session){
      req.session.bnet_state = req.query.scope + ':' + req.query.region + ':' + uuid.v4();
    } else {
      console.warn('No sessions enabled. This is a security hazard as 3rd parties could take advantage of your' +
      'static state query param.');
      req.session = {bnet_state: req.query.scope + ':' + req.query.region + ':' + 'NO_SESSIONS'};
    }

    var params = qs.stringify({
      client_id: req.app.get('BNET_ID'),
      scope: req.query.scope,
      state: req.session.bnet_state,
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

    if(!req.query.state){
      res.error = {
        error: 'Invalid battle.net response.',
        error_description: 'Did not receive a state query parameter from battle.net. This is unusual.'
      };
      return req.app.get('LOGIN_FAIL')(req, res);
    }

    if(req.session){
      if(!req.session.bnet_state || req.session.bnet_state !== req.query.state){
        res.error = {
          error: 'Invalid battle.net response.',
          error_description: 'State query parameters do not match. This may be caused by a 3rd party trying to exploit.'
        };
      }
    } else {
      if(req.query.state !== (req.query.scope + ':' + req.query.region + ':' + 'NO_SESSIONS')){
        res.error = {
          error: 'Invalid battle.net response.',
          error_description: 'State query parameters do not match. This may be caused by a 3rd party trying to exploit.'
        };
        return req.app.get('LOGIN_FAIL')(req, res);
      }
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