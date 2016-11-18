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

    $('#msg').show();
    $('#msg').text('Loading profile...');
    $('#msg').show();
    $('#btn-login').hide();
    
    localStorage.setItem('access_token', result.accessToken);
    localStorage.setItem('id_token', result.idToken);

    auth0.getProfile(result.idToken, function (err, profile) {
      if (profile) {
        $('.nickname').text(profile.nickname);
        $('.avatar').attr('src', profile.picture).show();
      }
      $('#login-link').hide();
      $('.btn-logout').show();
      $('#btn-refresh').show();
      $('#profile').show();
      $('#msg').hide();
    });

  } else if (result && result.error) {
    console.log('error: ' + result.error);
  }

  $('#api-call').click(function(e) {
    // invoke api securely
    invokeApi();
  });


  $('.btn-logout').click(function(e) {
    e.preventDefault();
    logout();
  });

  function invokeApi() {
    // invoke api securely
    console.log('start of invokeApi');

    var accessToken = localStorage.getItem('access_token');
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "http://localhost:7000/authorized",
      "method": "GET",
      "headers": {
        "content-type": "application/json",
        "authorization": "Bearer " + accessToken
      }
    }

    $.ajax(settings).done(function (response) {
      $('#msg').text('API Response: ' + JSON.stringify(response));
      $('#msg').show();
    }).fail(function(err) {
      if (err.status === 401) {
        refreshToken();
      } else {
        console.log(JSON.stringify(err));
      }
    });
  }

  function refreshToken() {
    console.log('Starting refreshToken');
    auth0.silentAuthentication({
      responseType: 'id_token token',
      scope: 'openid profile read:todo create:todo',
      audience: 'http://todoapi2.api'
    }, function(err, result){
      localStorage.setItem('access_token', result.accessToken);
      localStorage.setItem('id_token', result.idToken);

      // we refreshed our access token 
      // so now we can call the API again
      invokeApi();
    });
  }

  $('#btn-login').click(function(e) {
    auth0.login({
      responseType: 'id_token token',
      scope: 'openid profile read:todo create:todo',
      audience: 'http://todoapi2.api'
      // uncomment if you want to force the user to be prompted for consent every time
      // prompt: 'consent', 
    });
  });

});
