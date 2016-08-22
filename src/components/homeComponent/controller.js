import VM from "./viewModel";
import BoardService from "models/board.service";
import moment from "moment/src/moment";
import * as _ from "lodash/lodash";

// http://colorbrewer2.org/
const DISTINCT_COLORS = [
  [166, 206, 227],
  [31, 120, 180],
  [178, 223, 138],
  [51, 160, 44],
  [251, 154, 153],
  [227, 26, 28],
  [253, 191, 111],
  [255, 127, 0],
  [106, 61, 154],
  [177, 89, 40],
  [141, 211, 199],
  [0, 60, 48],
  [53, 151, 143],
  [142, 1, 82],
  [64, 0, 75],
  [0, 68, 27],
  [179, 88, 6],
  [45, 0, 75],
  [103, 0, 31],
  [5, 48, 97],
  [178, 24, 43],
  [244, 109, 67],
  [0, 104, 55],
  [102, 194, 165]
];

const DISTINCT_COLORS_INDICES = Array.from(DISTINCT_COLORS.keys());

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
                    // Graph data
                    let shuffledIndices = _.shuffle(DISTINCT_COLORS_INDICES.slice());
                    let colors_rgb = _.take(shuffledIndices, boardLists.length).map(idx => DISTINCT_COLORS[idx]);
                    let colors = colors_rgb.map(color_rgb => 'rgb(' + color_rgb.join(',') + ')');
                    let colorBgs = colors_rgb.map(color_rgb => 'rgba(' + color_rgb.join(',') + ', 0.3)');
                    let dataSets = boardLists.map(list => {
                      let listId = list.id;
                      let dataSet = {
                        label: list.name,
                        fill: true,
                        borderCapStyle: 'butt',
                        borderColor: colors.pop(),
                        backgroundColor: colorBgs.pop(),
                        pointStyle: 'line',
                        data: []
                      };
                      let data = weeklyCumulativeCounts[listId] ? weeklyCumulativeCounts[listId] : [];
                      dataSet.data.push(...data);
                      return dataSet;
                    });
                    vm.boardCumulativeDates(formattedEndOfWeeks);
                    vm.boardCumulativeDataSets(dataSets);
                  });
    }
  }
}
