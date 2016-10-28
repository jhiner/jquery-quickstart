var auth0 = new Auth0({
  domain:       AUTH0_DOMAIN,
  clientID:     AUTH0_CLIENT_ID,
  callbackURL:  AUTH0_CALLBACK_URL
});

$(document).ready(function() {
  
  // utility functions
  // clear local storage upon logout
  var logout = function() {
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    window.location.href = "/";
  };

  // app functionality

  // check hash for access_token, id_token
  var result = auth0.parseHash(window.location.hash);

  // check if we are calling back from auth0 with access_token
  if (result && result.idToken) {
    $('#msg').text('Loading profile...');
    $('#msg').show();
    $('#btn-login').hide();
    
    localStorage.setItem('access_token', result.accessToken);
    localStorage.setItem('id_token', result.idToken);
    
    auth0.getProfile(result.idToken, function (err, profile) {
        $('.nickname').text(profile.nickname);
        $('#login-link').hide();
        $('.avatar').attr('src', profile.picture).show();
        $('.btn-logout').show();
        $('#profile').show();
        $('#msg').hide();
      });

  } else if (result && result.error) {
    console.log('error: ' + result.error);
  }

  $('#api-call').click(function(e) {
    // invoke api securely
    var accessToken = localStorage.getItem('accessToken');
    fetch('http://todoapi2.api/authorized', {
      method: 'get',
      headers: new Headers({
        'Content-Type': 'application/json',
        'Authorization' : 'Bearer ' + accessToken
      })
    }).then(function(response) {
      response.text().then(function(t) {
        if (response.status !== 200) {
          console.log('error');
          return;
        }
        $('#msg').text('API Response: ' + JSON.stringify(JSON.parse(t)));
        $('#msg').show();
      })
    }).catch(function(err) {
      console.log(err);
    });
  });

  $('.btn-logout').click(function(e) {
    e.preventDefault();
    logout();
  });

  $('#btn-login').click(function(e) {
    auth0.login({
      responseType: 'id_token token',
      scope: 'openid profile read:todo',
      audience: 'http://todoapi2.api'
      // uncomment if you want to force the user to be prompted for consent every time
      // prompt: 'consent', 
    });
  });

});
