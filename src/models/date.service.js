import moment from "moment/src/moment";

export default class DateService {
  /**
   *
   * Returns an array containing moments representing end of weeks at the start of the day
   * between two dates. from must be greater than to otherwise it doesn't make sense.
   *
   * @param fromInMs: start date
   * @param toInMs: end date. Default value is now
   * @returns {*|Array} end of weeks between from and to
   */
  getEndOfWeeks(fromInMs, toInMs = moment().valueOf()) {
    let endOfFirstWeek = moment(fromInMs).endOf('week').startOf('day');
    let endDate = moment(toInMs).startOf('day');
    let endOfWeeks = [];
    let currentEndOfWeek = endOfFirstWeek;
    while (currentEndOfWeek.isBefore(endDate)) {
      // To copy the date as current mutates
      endOfWeeks.push(moment(currentEndOfWeek.startOf('day').valueOf()));
      // This mutates the date
      currentEndOfWeek.add(1, 'w');
    }
    return endOfWeeks.map(endOfWeek => endOfWeek.valueOf());
  }
}
