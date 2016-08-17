import boardSelectionComponent from "components/boardSelectionComponent/index";

export default function (ctrl) {
  let vm = ctrl.vm;
  var boardSelectionRow =
    m('.row',
      [m('.col-md-4'), m('.col-md-4', m('form.bs-component', [boardSelectionComponent])), m('.col-md-4')]);
  return m('.container.dashboard',
           [
             boardSelectionRow
           ]);
}
