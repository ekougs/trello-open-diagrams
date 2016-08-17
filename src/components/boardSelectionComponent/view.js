export default function (ctrl) {
  let vm = ctrl.vm;
  return m('.form-group.is-empty.board-selection',
           [
             m('input.form-control[placeholder=Board][list=boardsList][type=text]'),
             m('datalist.hide.form-control[id=boardsList][placeholder=Board]',
               [
                 vm.boards().map(function (board) {
                   return m('option', {value: board.name});
                 })
               ]
             )
           ]);
}
