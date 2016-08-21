import VM from "./viewModel";
import BoardService from "models/board.service";
import moment from "moment/src/moment";
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
                  .then(weeklyCumulativeCounts => {
                    // Graph labels
                    let formattedEndOfWeeks =
                      weeklyCumulativeCounts.endOfWeeks.map(dateInMs => moment(dateInMs).format('DD-MM-Y'));
                    vm.boardCumulativeDates(formattedEndOfWeeks);
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
                      dataSet.data = weeklyCumulativeCounts[listId];
                      return dataSet;
                    });
                    vm.boardCumulativeDataSets(dataSets);
                    vm.boardCumulativeDataReady(true);
                  });
    }
  }
}
