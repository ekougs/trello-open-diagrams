export default function (ctrl) {
  let vm = ctrl.vm;

  function binds(vm) {
    return {
      onchange: changeEvt => {
        let boardInput = changeEvt.target;
        let selectedBoardOption = document.querySelectorAll(optionSelector(boardInput.value));
        if (selectedBoardOption.length === 1) {
          let selectedBoardId = selectedBoardOption[0].getAttribute('valueId');
          let selectedBoard = vm.boards().find((board) => board.id === selectedBoardId);
          ctrl.onSelectedBoard(selectedBoard);
          boardInput.blur();
        }
      }
    }
  }

  return m('.form-group.is-empty.board-selection',
           [
             m('input.form-control[id=board][placeholder=Board][list=boardsList][type=text]', binds(vm)),
             m('datalist.hide.form-control[id=boardsList][placeholder=Board]',
               [
                 vm.boards().map(function (board) {
                   return m('option', {valueId: board.id, value: board.name});
                 })
               ]
             )
           ]);

  function optionSelector(value) {
    return 'datalist#boardsList option[value="' + value + '"]'
  }
}
