import boardSelectionComponent from "components/boardSelectionComponent/index";
import * as Chart from "chart.js/dist/Chart";

export default function (ctrl) {
  let vm = ctrl.vm;
  let boardSelectionForm =
      m('form.bs-component',
        [m(boardSelectionComponent, {
          onSelectedBoard: ctrl.loadDiagrams.bind(ctrl),
          boardService: ctrl.boardService
        })])
    ;
  return m('.container.dashboard',
           [
             dashboardRow(boardSelectionForm, 4),
             dashboardRow(m('.mirror', formatSelectedBoard(vm.selectedBoard()))),
             dashboardRow(m('.lists', formatSelectedBoardLists(vm.boardLists()))),
             dashboardRow(m('.cumulative-flow-diagram', createDiagram(vm)))
           ]);

  function dashboardRow(component, spaceColWidth = 2) {
    let contentWidth = 12 - 2 * spaceColWidth;
    let spaceColClass = '.col-md-' + spaceColWidth;
    return m('.row', [m(spaceColClass), m('.col-md-' + contentWidth, component), m(spaceColClass)]);
  }

  function formatSelectedBoard(selectedBoard) {
    return selectedBoard && selectedBoard.id ? 'Board: ' + selectedBoard.name : '';
  }

  function formatSelectedBoardLists(selectedBoardLists) {
    return selectedBoardLists.map((list) => m('.list', formatList(list)));
  }

  function formatList(list) {
    return list && list.id ? 'List: ' + list.name : '';
  }

  function createDiagram() {
    if (vm.boardCumulativeDataReady()) {
      return m('canvas[cum_flw_diagram_' + vm.selectedBoard().id + ']',
               {
                 config: function drawCumulativeFlowDiagram(element, isInitialized, context) {
                   if (isInitialized) {
                     return;
                   }
                   console.log(vm.boardCumulativeDates());
                   Chart.Line(element, {
                     data: {
                       labels: vm.boardCumulativeDates(),
                       datasets: vm.boardCumulativeDataSets()
                     }
                   });
                 }
               });
    }
  }
}
