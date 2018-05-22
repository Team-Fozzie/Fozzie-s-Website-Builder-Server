'use strict';

var app = app || {};
(function (module) { 
  var loginView = {};

  loginView.initLoginView = function() {
    $('section').hide();
    $('#home-view-login').show();
    $('#section-list').hide();
    $('body').css('background', '#06aaf6');

    $('#home-view-login').on('submit', function(event) {
      event.preventDefault();
      let username = $('#login-username').val();
      let password = $('#login-password').val();

      $.ajax({
        url:`${ENV.apiUrl}/users/${username}`,
        method: 'GET',
        data: {
          password: password
        }
      })
        .then(results => {
          app.user = new app.User(results.username, results.email, results.user_id);
          page(`/projects/${app.user.user_id}`);
        })
      .catch(console.error);

    });
  };

  module.loginView = loginView;
})(app)