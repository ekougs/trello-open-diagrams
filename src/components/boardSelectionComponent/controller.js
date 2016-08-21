import VM from "./viewModel";

export default class Controller {
  constructor(args) {
    let ctrl = this;
    ctrl.vm = new VM();
    ctrl.onSelectedBoard = args.onSelectedBoard;
    let boardService = args.boardService;
    boardService.getBoards().then((boards) => {
      ctrl.vm.boards(boards);
    });
    return ctrl;
  }
}
