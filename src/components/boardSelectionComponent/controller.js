import VM from "./viewModel";
import BoardService from "models/board.service";

export default class Controller {
  constructor(args) {
    let ctrl = this;
    let service = new BoardService();
    ctrl.vm = new VM();
    service.getBoards().then((boards) => {
      ctrl.vm.boards(boards);
    });
    return ctrl;
  }
}
