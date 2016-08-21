import homeComponent from "components/homeComponent/index";

let $script = require('scriptjs');
let trelloAPIUrl = 'https://api.trello.com/1/client.js?key=' + TRELLO_APP_KEY;

$script(['http://code.jquery.com/jquery-1.7.1.min.js', trelloAPIUrl], 'trello');

$script.ready('trello', function () {
  Trello.authorize({
                     type: 'popup',
                     name: 'Trello Open Diagrams',
                     scope: {
                       read: true,
                       write: true
                     },
                     expiration: 'never',
                     success: function () {
                       console.log('Successful authentication');
                     },
                     error: function () {
                       console.log('Failed authentication');
                     }
                   });
});

require('./index.html?output=index.html');
/*===== yeoman style require hook =====*/

function lazyLoad() {
  let onload = window.onload || function () {
    };
  window.onload = function () {
    let currentRoute = m.route();
    Object.keys(routes).forEach(function (key) {
      let route = routes[key];
      if (key !== currentRoute) {
        route.controller();
      }
    });
    onload();
  }
}

let routes = {
  /*===== yeoman hook =====*/
  '/': homeComponent
};

m.route(document.body, '/', routes);
