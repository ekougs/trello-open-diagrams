import moment from "moment/src/moment";
import * as _ from "lodash/lodash";
import DateService from "./date.service";

let $script = require('scriptjs');
// Only events that add card in a list
let cardMovementEvents = ['updateCard:idList',
                          'createCard',
                          'moveCardToBoard',
                          'convertToCardFromCheckItem',
                          'copyCard'];
let formattedCardMovementEvents = cardMovementEvents.join(',');

export default class BoardService {
  constructor() {
    this.dateService = new DateService();
  }

  getBoards() {
    let boardsDeferred = m.deferred();
    _loadBoards();
    return boardsDeferred.promise;
    function _loadBoards() {
      $script.ready('trello', function () {
        Trello.get('/members/me/boards/',
                   function (boards) {
                     _resolve(boardsDeferred, boards);
                   },
                   function () {
                     _reject(boardsDeferred, "Failed to load boards");
                   })
      });
    }
  }

  getLists(boardId) {
    let boardListsDeferred = m.deferred();
    _loadBoards();
    return boardListsDeferred.promise;
    function _loadBoards() {
      $script.ready('trello', function () {
        Trello.get('/boards/' + boardId + '/lists/open',
                   function (lists) {
                     _resolve(boardListsDeferred, lists);
                   },
                   function () {
                     _reject(boardListsDeferred, "Failed to load boards");
                   })
      });
    }
  }

  getCardCountsByDateByListSince(boardId, since, listIds) {
    since = since.format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
    let dateService = this.dateService;
    let cardCountsByDateByListSinceDeferred = m.deferred();
    _countCardsByDateByListSince(boardId, since, listIds);
    return cardCountsByDateByListSinceDeferred.promise;

    function _countCardsByDateByListSince(boardId, since, listIds) {
      $script.ready('trello', function () {
        Trello.get('/boards/' + boardId + '/actions?filter=' + formattedCardMovementEvents + '&since=' + since,
                   function (rawCardMoves) {
                     let uniqueSortedCardMoves = _getUniqueSortedCardMoves(rawCardMoves);
                     let cardsCountsByDateListCombinedKey = _countCardsByDateListCombinedKey(uniqueSortedCardMoves);
                     let cardsCountsByDateByList =
                       _getWeeklyCumulativeCounts(uniqueSortedCardMoves, cardsCountsByDateListCombinedKey, listIds);
                     _resolve(cardCountsByDateByListSinceDeferred, cardsCountsByDateByList);

                   },
                   function () {
                     _reject(cardCountsByDateByListSinceDeferred, "Failed to load boards");
                   })
      });
    }

    function _getUniqueSortedCardMoves(rawCardMoves) {
      rawCardMoves = rawCardMoves.map(rawCardMove => {
        return {
          cardId: rawCardMove.data.card.id,
          listId: rawCardMove.data.list.id,
          dateInMs: moment(rawCardMove.date).startOf('day').valueOf()
        }
      });
      rawCardMoves = _.sortBy(rawCardMoves, rawCardMove => rawCardMove.dateInMs);
      return _.sortedUniq(rawCardMoves);
    }

    function _getDateListCombinedKey(dateInMs, listId) {
      return '' + listId + dateInMs;
    }

    function _countCardsByDateListCombinedKey(uniqueSortedCardMoves) {
      // Group card moves by combined key
      let cardMovesByListIdAndDate =
        _.groupBy(uniqueSortedCardMoves, cardMove => _getDateListCombinedKey(cardMove.dateInMs, cardMove.listId));
      let cardsCountByListIdAndDate = {};
      _.forOwn(cardMovesByListIdAndDate,
               // dateList is date and list combined key
               (cardMoves, dateListKey) => {
                 cardsCountByListIdAndDate[dateListKey] = cardMoves.length;
               });
      return cardsCountByListIdAndDate;
    }

    function _getWeeklyCumulativeCounts(uniqueSortedCardMoves, cardsCountsByDateListCombinedKey, listIds) {
      let cardMovesDatesInMs = uniqueSortedCardMoves.map(cardMove => cardMove.dateInMs);
      cardMovesDatesInMs = _.uniq(cardMovesDatesInMs);
      let sortedUniqueCardMovesDatesInMs = _.sortBy(cardMovesDatesInMs);
      let sinceDate = _.min(sortedUniqueCardMovesDatesInMs);
      let endOfWeeks = dateService.getEndOfWeeks(sinceDate);
      let cumulativeCountByList = {};
      // 2 forEach level as we need every list cards count for each date
      endOfWeeks.forEach(endOfWeekInMs => {
        listIds.forEach(listId => _setCumulativeCount(endOfWeekInMs, listId, cardsCountsByDateListCombinedKey));
      });
      return _.merge(cumulativeCountByList, {endOfWeeks: endOfWeeks});

      function _setCumulativeCount(endOfWeekInMs, listId, cardsCountsByDateListCombinedKey) {
        // To get the cumulative count, we need the previous count for the list
        let previousCount = _getPreviousCumulativeCount(listId);
        // Get the week cumulative count
        cumulativeCountByList[listId] = cumulativeCountByList[listId] || [];
        let weeklyCumulativeCount =
          previousCount + _getCountCumulativeInWeek(listId, endOfWeekInMs, cardsCountsByDateListCombinedKey);
        cumulativeCountByList[listId].push(weeklyCumulativeCount);
      }

      function _getPreviousCumulativeCount(listId) {
        let listCumulativeCounts = cumulativeCountByList[listId];
        if (listCumulativeCounts) {
          return listCumulativeCounts[listCumulativeCounts.length - 1];
        }
        return 0;
      }

      function _getCountCumulativeInWeek(listId, endOfWeekInMs, cardsCountsByDateListCombinedKey) {
        let cardsMovesCountsInWeek = 0;
        let lastUsedCardMoveDateIndex = 0;
        while (sortedUniqueCardMovesDatesInMs[lastUsedCardMoveDateIndex] < endOfWeekInMs) {
          let cardMoveDateInMs = sortedUniqueCardMovesDatesInMs[lastUsedCardMoveDateIndex];
          cardsMovesCountsInWeek +=
            cardsCountsByDateListCombinedKey[_getDateListCombinedKey(cardMoveDateInMs, listId)];
          lastUsedCardMoveDateIndex++;
        }
        sortedUniqueCardMovesDatesInMs.splice(0, lastUsedCardMoveDateIndex);
        return cardsMovesCountsInWeek;
      }
    }
  }
}

function _resolve(deferredToResolve, data) {
  m.startComputation();
  deferredToResolve.resolve(data);
  m.endComputation();
}

function _reject(deferredToReject, errorMessage) {
  console.error(errorMessage);
  deferredToReject.reject(errorMessage);
}
