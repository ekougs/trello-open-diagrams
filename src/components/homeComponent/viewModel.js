export default class VM {
  constructor(args) {
    let vm = this;
    vm.selectedBoard = m.prop();
    vm.boardLists = m.prop([]);
    vm.boardCumulativeDates = m.prop([]);
    vm.boardCumulativeDataSets = m.prop([]);
    return vm;
  }
};
