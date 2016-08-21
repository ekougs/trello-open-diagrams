import VM from "./viewModel";
import BoardService from "models/board.service";
import moment from "moment/src/moment";
import * as _ from "lodash/lodash";
import randomColor from "randomcolor/randomColor";

export default class Controller {
  constructor(args) {
    let ctrl = this;
    ctrl.vm = new VM(args);
    ctrl.boardService = new BoardService();
    return this;
  }

  loadDiagrams(selectedBoard) {
    let vm = this.vm;
    vm.selectedBoard(selectedBoard);
    let selectedBoardId = selectedBoard.id;
    let boardService = this.boardService;
    boardService.getLists(selectedBoardId)
                .then(boardLists => {
                  vm.boardLists(boardLists);
                  _setUpCumulativeFlowDiagramData(boardLists);
                });

    function _setUpCumulativeFlowDiagramData(boardLists) {
      let moment6MonthsAgo = moment().subtract(6, 'M');
      let boardListIds = boardLists.map(boardList => boardList.id);
      boardService.getCardCountsByDateByListSince(selectedBoardId, moment6MonthsAgo, boardListIds)
                  .then(boardCardCountsByDateByList => {
                    let weeklyCumulativeCounts = _getWeeklyCumulativeCounts(boardCardCountsByDateByList);

                    let orderedDatesInMs =
                      _.orderBy(_.keys(weeklyCumulativeCounts).map(dateInMs => Number(dateInMs)));
                    // Graph labels
                    vm.boardCumulativeDates(orderedDatesInMs.map(dateInMs => moment(dateInMs).format('DD-MM-Y')));
                    // Graph data
                    let colors = randomColor({
                                               luminosity: 'random',
                                               hue: 'random',
                                               count: boardLists.length
                                             });
                    let dataSets = boardLists.map(list => {
                      let listId = list.id;
                      let dataSet = {
                        label: list.name,
                        fill: true,
                        borderCapStyle: 'butt',
                        borderColor: colors.pop(),
                        pointStyle: 'line',
                        data: []
                      };
                      orderedDatesInMs.forEach(dateInMs => {
                        dataSet.data.push(weeklyCumulativeCounts[dateInMs][listId]);
                      });
                      return dataSet;
                    });
                    vm.boardCumulativeDataSets(dataSets);
                    vm.boardCumulativeDataReady(true);
                  });
    }

    function _getWeeklyCumulativeCounts(boardCardCountsByDateByList) {
      // First we sample end of weeks from sinceDate to today
      let cardCountsDates = _.orderBy(_.keys(boardCardCountsByDateByList).map(dateInMs => Number(dateInMs)));
      let sinceDate = _.min(cardCountsDates);
      let endOfWeeksInMs = _getEndOfWeeksInMs(sinceDate);
      let completeCumulativeCounts = {};
      endOfWeeksInMs.forEach(endOfWeekInMs => {
        completeCumulativeCounts[endOfWeekInMs] =
          _getNearestCardsCounts(endOfWeekInMs, boardCardCountsByDateByList, cardCountsDates)
      });

      return completeCumulativeCounts;
    }

    function _getEndOfWeeksInMs(sinceDate) {
      let endOfFirstWeek = moment(sinceDate).endOf('week').startOf('day');
      let endDate = moment().startOf('day');
      let endOfWeeks = [];
      let currentEndOfWeek = endOfFirstWeek;
      while (currentEndOfWeek.isBefore(endDate)) {
        // To copy the date as current mutates
        endOfWeeks.push(moment(currentEndOfWeek.valueOf()));
        // This mutates the date
        currentEndOfWeek.add(1, 'w');
      }
      return endOfWeeks.map(endOfWeek => endOfWeek.valueOf());
    }

    function _getNearestCardsCounts(endOfWeek, boardCardCountsByDateByList, cardCountsDates) {
      if (endOfWeek > cardCountsDates[1]) {
        cardCountsDates.splice(0, 1);
      }
      return boardCardCountsByDateByList[cardCountsDates[0]];
    }
  }
}
