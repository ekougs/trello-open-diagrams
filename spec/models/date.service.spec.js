import DateService from "models/date.service";
import moment from "moment/src/moment";

describe('Date service', function () {
  let subject = new DateService();

  it('should return 2016-08-07 and 2016-08-14 for get end of weeks between the 4th and the 15th', function () {
    // GIVEN
    let from = moment('2016-08-04').valueOf();
    let to = moment('2016-08-15').valueOf();

    // WHEN
    let actual = subject.getEndOfWeeks(from, to);

    // THEN
    // End of week is a saturday not a sunday
    let expected = [
      moment('2016-08-06').startOf('day').valueOf(),
      moment('2016-08-13').startOf('day').valueOf()
    ];
    expect(actual).toEqual(expected);
  });

  it('should return at least 2016-08-07 and 2016-08-14 for get end of weeks between the 4th and today', function () {
    // GIVEN
    let from = moment('2016-08-04').valueOf();

    // WHEN
    let actual = subject.getEndOfWeeks(from);

    // THEN
    // End of week is a saturday not a sunday
    let expected = [
      moment('2016-08-06').startOf('day').valueOf(),
      moment('2016-08-13').startOf('day').valueOf()
    ];
    expected.forEach(expectedDateInMs => expect(actual).toContain(expectedDateInMs));
  });
});
