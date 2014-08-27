var qs = require('querystring');
var request = require('request');

module.exports = {
  bnetAuth: function(req, res){
    if(!req.body.region){
      req.body.region = req.app.get('BNET_REGION');
    }

    if(!req.body.scope){
      req.body.scope = req.app.get('BNET_SCOPE');
    }

    var params = qs.stringify({
      client_id: req.app.get('BNET_ID'),
      scope: req.body.scope,
      state: req.body.scope + ':' + req.body.region + ':IMPLEMENT_RANDOM',
      redirect_uri: req.app.get('BASE_URL') + req.app.get('BNET_CALLBACK_URL'),
      response_type: 'code'
    });

    res.redirect('https://' + req.body.region + '.battle.net/oauth/authorize?' + params);
  },
  bnetCallback: function(req, res){
    var scope,
      region,
      token_params;

    if(req.query.error || !req.query.code){
      console.log('No code returned in query.');
      return req.app.get('LOGIN_FAIL')(req, res);
    }

    try {
      scope = req.query.state.split(':').length ? state.split(':')[0] : req.app.get('BNET_SCOPE');
      region = req.query.state.split(':').length ? state.split(':')[1] : req.app.get('BNET_REGION');

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

    request('https://' + region + '.battle.net/oauth/token' + token_params, function(error, response, body){
      res.send(body);
    })

  }
};