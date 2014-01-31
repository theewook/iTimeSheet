function ReportCtrl($scope)
{
    $scope.reports = [];
    $scope.reportsWeekly = {};
    $scope.reportsMonthly = {};

    $scope.reportWeekly = function()
    {
        var newItems = [];

        var db = window.openDatabase("timesheet", "1.0", "Timesheet DB", 10000000);

        db.transaction(function query(tx)
        {
            var sql = "SELECT * FROM EVENTS ORDER BY id DESC";
            tx.executeSql(sql, [], function querySuccess(tx, results)
            {
                var len = results.rows.length;
                var totalHours = 0;
                var totalMealVoucher = 0;
                var curWeek = -1;
                var curDate = -1;

                for (var i = 0; i < len; i++)
                {
                    var date = getDateFromDB(results.rows.item(i).date);
                    var week = results.rows.item(i).week;

                    if (i > 0 && curWeek != week)
                    {
                        newItems.push(calculate(getDateRangeOfWeek(curDate == -1 ? date : curDate), totalHours, totalMealVoucher));

                        // Ready for the next week
                        totalHours = 0;
                        totalMealVoucher = 0;
                    }

                    var beginAM = results.rows.item(i).beginAM;
                    var endAM = results.rows.item(i).endAM;
                    var beginPM = results.rows.item(i).beginPM;
                    var endPM = results.rows.item(i).endPM;

                    if (timeDiff(endAM, beginAM, true) !== 0 && timeDiff(endPM, beginPM, true) !== 0 && timeDiff(endAM, beginPM, true) < prefMealVoucher)
                    {
                        totalMealVoucher++;
                    }

                    totalHours += timeDiff(beginAM, endAM, true);
                    totalHours += timeDiff(beginPM, endPM, true);

                    curWeek = week;
                    curDate = Date.parseExact(date, "yyyy-MM-dd");

                    if (i == len-1)
                    {
                        newItems.push(calculate(getDateRangeOfWeek(curDate), totalHours, totalMealVoucher));
                    }
                }

                $scope.reports = newItems;
                $scope.$digest();
            });
        });
    };

    $scope.reportMonthly = function()
    {
        var newItems = [];

        var db = window.openDatabase("timesheet", "1.0", "Timesheet DB", 10000000);

        db.transaction(function query(tx)
        {
            var sql = "SELECT * FROM EVENTS ORDER BY id DESC";
            tx.executeSql(sql, [], function querySuccess(tx, results)
            {
                var len = results.rows.length;
                var totalHours = 0;
                var totalMealVoucher = 0;
                var curMonth = -1;
                var curDate = -1;

                for (var i = 0; i < len; i++)
                {
                    var date = getDateFromDB(results.rows.item(i).date);
                    var month = results.rows.item(i).month;

                    if (i > 0 && curMonth != month)
                    {
                        newItems.push(calculate(getDateRangeOfMonth(curDate == -1 ? date : curDate), totalHours, totalMealVoucher));

                        // Ready for the next week
                        totalHours = 0;
                        totalMealVoucher = 0;
                    }

                    var beginAM = results.rows.item(i).beginAM;
                    var endAM = results.rows.item(i).endAM;
                    var beginPM = results.rows.item(i).beginPM;
                    var endPM = results.rows.item(i).endPM;

                    if (timeDiff(endAM, beginAM, true) !== 0 && timeDiff(endPM, beginPM, true) !== 0 && timeDiff(endAM, beginPM, true) < prefMealVoucher)
                    {
                        totalMealVoucher++;
                    }

                    totalHours += timeDiff(beginAM, endAM, true);
                    totalHours += timeDiff(beginPM, endPM, true);

                    curMonth = month;
                    curDate = Date.parseExact(date, "yyyy-MM-dd");

                    if (i == len-1)
                    {
                        newItems.push(calculate(getDateRangeOfMonth(curDate), totalHours, totalMealVoucher));
                    }
                }

                $scope.reports = newItems;
                $scope.$digest();
            });
        });
    };

    $scope.reportSummary = function()
    {
        $scope.reportsWeekly = {};
        $scope.reportsMonthly = {};

        var date = new Date(), y = date.getFullYear(), m = date.getMonth();
        var firstDayOfMonth = new Date(y, m, 1);
        var lastDayOfMonth = new Date(y, m + 1, 0);

        var firstDayOfWeek = new Date(date.setDate(date.getDate() - date.getDay() + 1)).clearTime();
        var lastDayOfWeek = new Date(date.setDate(date.getDate() - date.getDay() + 1 + 6)).clearTime();

        var db = window.openDatabase("timesheet", "1.0", "Timesheet DB", 10000000);

        db.transaction(function query(tx)
        {
            var sql = "SELECT * FROM EVENTS WHERE date BETWEEN ? AND ?";
            tx.executeSql(sql, [getDateForSQL(firstDayOfWeek.toString("yyyy-MM-dd")), getDateForSQL(lastDayOfWeek.toString("yyyy-MM-dd"))], function querySuccess(tx, results)
            {
                var len = results.rows.length;
                var totalHours = 0;
                var totalMealVoucher = 0;

                for (var i = 0; i < len; i++)
                {
                    var beginAM = results.rows.item(i).beginAM;
                    var endAM = results.rows.item(i).endAM;
                    var beginPM = results.rows.item(i).beginPM;
                    var endPM = results.rows.item(i).endPM;

                    if (timeDiff(endAM, beginAM, true) !== 0 && timeDiff(endPM, beginPM, true) !== 0 && timeDiff(endAM, beginPM, true) < prefMealVoucher)
                    {
                        totalMealVoucher++;
                    }

                    totalHours += timeDiff(beginAM, endAM, true);
                    totalHours += timeDiff(beginPM, endPM, true);
                }

                $scope.reportsWeekly = calculate('', totalHours, totalMealVoucher);
            });
        });

        db.transaction(function query(tx)
        {
            var sql = "SELECT * FROM EVENTS WHERE date BETWEEN ? AND ?";
            tx.executeSql(sql, [getDateForSQL(firstDayOfMonth.toString("yyyy-MM-dd")), getDateForSQL(lastDayOfMonth.toString("yyyy-MM-dd"))], function querySuccess(tx, results)
            {
                var len = results.rows.length;
                var totalHours = 0;
                var totalMealVoucher = 0;

                for (var i = 0; i < len; i++)
                {
                    var beginAM = results.rows.item(i).beginAM;
                    var endAM = results.rows.item(i).endAM;
                    var beginPM = results.rows.item(i).beginPM;
                    var endPM = results.rows.item(i).endPM;

                    if (timeDiff(endAM, beginAM, true) !== 0 && timeDiff(endPM, beginPM, true) !== 0 && timeDiff(endAM, beginPM, true) < prefMealVoucher)
                    {
                        totalMealVoucher++;
                    }

                    totalHours += timeDiff(beginAM, endAM, true);
                    totalHours += timeDiff(beginPM, endPM, true);
                }

                $scope.reportsMonthly = calculate('', totalHours, totalMealVoucher);
                $scope.$digest();
            });
        });
    };
}

function getDateForSQL(date)
{
    var dateSplit = date.split('-');
    var year = dateSplit[0];
    var month = dateSplit[1];
    var day = dateSplit[2];

    return year + "-" + (month - 1 < 10 ? "0" + (month - 1) : month - 1) + "-" + day;
}

function getDateFromDB(date)
{
    var dateSplit = date.split('-');
    var year = dateSplit[0];
    var month = parseInt(dateSplit[1], 10);
    var day = dateSplit[2];

    return year + "-" + (month + 1 < 10 ? "0" + (month + 1) : month + 1) + "-" + day;
}

function getDateRangeOfWeek(date)
{
    var firstDayOfWeek = new Date(date.setDate(date.getDate() - (date.getDay() + 6) % 7 )).clearTime();
    var lastDayOfWeek = new Date(date.setDate(date.getDate() - (date.getDay() + 6) % 7 + 6)).clearTime();

    var lib = firstDayOfWeek.toString("dd MMMM yyyy") + " - " + lastDayOfWeek.toString("dd MMMM yyyy");
    return lib;
}

function getDateRangeOfMonth(date)
{
    var lib = date.toString("MMMM yyyy");
    return lib;
}

function calculate(dateRange, totalHours, totalMealVoucher)
{
    var levelSplit = prefExtraHoursPolicy.split('|');
    var level1 = levelSplit[0];
    var level2 = levelSplit[1];
    var level3 = levelSplit[2];

    var level2Split = level2.split(';');
    var lvl2Hours = level2Split[1].split('-')[0];
    var lvl3Hours = level2Split[1].split('-')[1];

    var totalHoursLvl3 = 0;
    if (totalHours > lvl3Hours * 60)
    {
        totalHoursLvl3 = totalHours - lvl3Hours * 60;
    }

    var totalHoursLvl2 = 0;
    if (totalHours > lvl2Hours * 60)
    {
        totalHoursLvl2 = totalHours - lvl2Hours * 60 - totalHoursLvl3;
    }

    return {
        date:dateRange,
        totalHours:formatTime(totalHours),
        totalHoursLvl2:formatTime(totalHoursLvl2),
        totalHoursLvl3:formatTime(totalHoursLvl3),
        totalMealVoucher:totalMealVoucher
    };
}

function formatTime(totalMinutes)
{
    var hours = totalMinutes >= 60 ? parseInt((totalMinutes / 60), 10): 0;
    var minutes = parseInt((totalMinutes - hours * 60), 10);

    return ((hours < 10 && hours >= 0) ? ('0' + hours) : hours) + 'h' + ((minutes < 10 && minutes >= 0) ? ('0' + minutes) : minutes);
}

function timeDiff(first, second, onlyMinute) {
    if (second === "") {
        second = "00:00";
    }
    if (first === "") {
        first = "00:00";
    }

    var time1 = first.split(':'),
        time2 = second.split(':');

    time1 = time1[0] * 3600 + time1[1] * 60;
    time2 = time2[0] * 3600 + time2[1] * 60;
    var td = time2 - time1,
        hours = parseInt((td / 3600), 10),
        minutes = parseInt(((td - hours * 3600) / 60), 10),
        diff = ((hours < 10 && hours >= 0) ? ('0' + hours) : hours) + ':' + ((minutes < 10 && minutes >= 0) ? ('0' + minutes) : minutes),
        diffMinute = hours * 60 + minutes;

    if (onlyMinute)
    {
        return (diffMinute);
    }
    else
    {
        return (diff);
    }
}