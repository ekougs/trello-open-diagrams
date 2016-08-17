var $script = require('scriptjs');

export default class BoardService {
  getBoards() {
    var boardsDeferred = m.deferred();
    _loadBoards();
    return boardsDeferred.promise;
    function _loadBoards() {
      $script.ready('trello', function () {
        Trello.get('/members/me/boards/',
                   function (boards) {
                     _resolve(boardsDeferred, boards);
                   },
                   function () {
                     _reject("Failed to load boards");
                   })
      });
    }
  }
}

function _resolve(deferredToResolve, data) {
  m.startComputation();
  deferredToResolve.resolve(data);
  m.endComputation();
}

function _reject(deferredToReject, errorMessage) {
  console.log(errorMessage);
  deferredToReject.reject(errorMessage);
}
