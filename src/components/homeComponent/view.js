import boardSelectionComponent from "components/boardSelectionComponent/index";
import * as Chart from "chart.js/dist/Chart";

export default function (ctrl) {
  let vm = ctrl.vm;
  let boardSelectionForm =
      m('form.bs-component',
        {
          onsubmit: function () {
            return false;
          }
        },
        [m(boardSelectionComponent, {
          onSelectedBoard: ctrl.loadDiagrams.bind(ctrl),
          boardService: ctrl.boardService
        })])
    ;
  return m('.container.dashboard',
           [
             dashboardRow(boardSelectionForm, 4),
             dashboardRow(m('.mirror', formatSelectedBoard(vm.selectedBoard()))),
             dashboardRow(m('.cumulative-flow-diagram', createDiagram(vm)))
           ]);

  function dashboardRow(component, spaceColWidth = 2) {
    let contentWidth = 12 - 2 * spaceColWidth;
    let spaceColClass = '.col-md-' + spaceColWidth;
    return m('.row', [m(spaceColClass), m('.col-md-' + contentWidth, component), m(spaceColClass)]);
  }

  function formatSelectedBoard(selectedBoard) {
    return selectedBoard && selectedBoard.id ? selectedBoard.name : '';
  }

  function formatList(list) {
    return list && list.id ? 'List: ' + list.name : '';
  }

  function createDiagram() {
    if (!vm.boardCumulativeDataSets() || vm.boardCumulativeDataSets().length == 0) {
      return;
    }
    return m('canvas[cum_flw_diagram_' + vm.selectedBoard().id + ']',
             {
               config: function drawCumulativeFlowDiagram(element, isInitialized, context) {
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
