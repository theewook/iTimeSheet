function ReportCtrl($scope)
{
    $scope.reports = [];
    $scope.reportsWeekly = {};
    $scope.reportsMonthly = {};
    $scope.reportCustom = {};

    $scope.selectedYearFrom = moment(new Date()).year();
    $scope.selectedWeekFrom = new Date(moment(moment(new Date()).weeks() + " ," + $scope.selectedYearFrom, "W ,GGGG")).toString("dd MMMM yyyy");
    $scope.selectedYearTo = moment(new Date()).year();
    $scope.selectedWeekTo = new Date(moment(moment(new Date()).weeks() + " ," + $scope.selectedYearTo, "W ,GGGG").add('days', 6)).toString("dd MMMM yyyy");

    $scope.getReportCustom = function()
    {
        $scope.reportCustom = {};

        var db = window.openDatabase("timesheet", "1.0", "Timesheet DB", 10000000);

        var startSearch = new Date(moment($scope.selectedWeekFrom));
        var endSearch = new Date(moment($scope.selectedWeekTo));

        db.transaction(function query(tx)
        {
            var sql = "SELECT * FROM EVENTS WHERE date BETWEEN ? AND ?";
            tx.executeSql(sql, [getDateForSQL(startSearch.toString("yyyy-MM-dd")), getDateForSQL(endSearch.toString("yyyy-MM-dd"))], function querySuccess(tx, results)
            {
                var len = results.rows.length;
                var totalHours = 0;
                var totalMealVoucher = 0;
                var arrReportWeek = new Array();
                var curWeek;

                for (var i = 0; i < len; i++)
                {
                    var beginAM = results.rows.item(i).beginAM;
                    var endAM = results.rows.item(i).endAM;
                    var beginPM = results.rows.item(i).beginPM;
                    var endPM = results.rows.item(i).endPM;
                    var week = results.rows.item(i).week;

                    if (i > 0 && curWeek !== week)
                    {
                        arrReportWeek.push(calculate('', totalHours, totalMealVoucher));
                        totalHours = 0;
                        totalMealVoucher = 0;
                    }

                    if (timeDiff(endAM, beginAM, true) !== 0 && timeDiff(endPM, beginPM, true) !== 0 && timeDiff(endAM, beginPM, true) < prefMealVoucher)
                    {
                        totalMealVoucher++;
                    }

                    totalHours += timeDiff(beginAM, endAM, true);
                    totalHours += timeDiff(beginPM, endPM, true);

                    curWeek = week;

                    if (i == len-1)
                    {
                        arrReportWeek.push(calculate('', totalHours, totalMealVoucher));
                    }
                }

                var report = new Array();
                report.totalHours = 0;
                report.totalHoursLvl2 = 0;
                report.totalHoursLvl3 = 0;
                report.totalMealVoucher = 0;
                report.wage = 0;
                for (var i = 0; i < arrReportWeek.length; i++)
                {
                    report.totalHours += arrReportWeek[i].totalHours;
                    report.totalHoursLvl2 += arrReportWeek[i].totalHoursLvl2;
                    report.totalHoursLvl3 += arrReportWeek[i].totalHoursLvl3;
                    report.totalMealVoucher += arrReportWeek[i].totalMealVoucher;
                    report.wage += arrReportWeek[i].wage;
                }

                $scope.reportCustom = formatReport(report);
                $scope.$digest();
            });
        });
    };

    $scope.getWeeksFirstDay = function () {
        var i, weeks = 53, res = [];

        for (i = 1; i <= weeks; i++) {
            var date = new Date(moment(i + " ," + $scope.selectedYearFrom, "W ,GGGG"));
            var firstDayOfWeek = new Date(date.setDate(date.getDate() - date.getDay() + 1)).clearTime();
            var weekDetail = firstDayOfWeek.toString("dd MMMM yyyy");
            res.push(weekDetail);
        }

        return res;
    };

    $scope.getWeeksLastDay = function () {
        var i, weeks = 53, res = [];

        for (i = 1; i <= weeks; i++) {
            var date = new Date(moment(i + " ," + $scope.selectedYearTo, "W ,GGGG"));
            var lastDayOfWeek = new Date(date.setDate(date.getDate() - date.getDay() + 1 + 6)).clearTime();
            var weekDetail = lastDayOfWeek.toString("dd MMMM yyyy");
            res.push(weekDetail);
        }

        return res;
    };

    $scope.getYears = function () {
        var i, res = [];
        var startYear = 2013;
        var endYear = moment(new Date()).year() + 1;

        for (i = startYear; i <= endYear; i++) {
            res.push(i);
        }

        return res;
    };

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
                        newItems.push(formatReport(calculate(getDateRangeOfWeek(curDate == -1 ? date : curDate), totalHours, totalMealVoucher)));

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
                        newItems.push(formatReport(calculate(getDateRangeOfWeek(curDate), totalHours, totalMealVoucher)));
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
                var arrReportWeek = new Array();
                var curWeek;

                for (var i = 0; i < len; i++)
                {
                    var date = getDateFromDB(results.rows.item(i).date);
                    var month = results.rows.item(i).month;
                    var week = results.rows.item(i).week;

                    if (i > 0 && curWeek !== week)
                    {
                        arrReportWeek.push(calculate('', totalHours, totalMealVoucher));
                        totalHours = 0;
                        totalMealVoucher = 0;
                    }

                    if (i > 0 && curMonth !== month)
                    {
                        var report = new Array();
                        report.date = getDateRangeOfMonth(curDate === -1 ? date : curDate);
                        report.totalHours = 0;
                        report.totalHoursLvl2 = 0;
                        report.totalHoursLvl3 = 0;
                        report.totalMealVoucher = 0;
                        report.wage = 0;
                        for (var j = 0; j < arrReportWeek.length; j++)
                        {
                            report.totalHours += arrReportWeek[j].totalHours;
                            report.totalHoursLvl2 += arrReportWeek[j].totalHoursLvl2;
                            report.totalHoursLvl3 += arrReportWeek[j].totalHoursLvl3;
                            report.totalMealVoucher += arrReportWeek[j].totalMealVoucher;
                            report.wage += arrReportWeek[j].wage;
                        }

                        newItems.push(formatReport(report));

                        // Ready for the next month
                        totalHours = 0;
                        totalMealVoucher = 0;
                        arrReportWeek = [];
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
                    curWeek = week;
                    curDate = Date.parseExact(date, "yyyy-MM-dd");

                    if (i == len-1)
                    {
                        arrReportWeek.push(calculate('', totalHours, totalMealVoucher));

                        var report = new Array();
                        report.date = getDateRangeOfMonth(curDate);
                        report.totalHours = 0;
                        report.totalHoursLvl2 = 0;
                        report.totalHoursLvl3 = 0;
                        report.totalMealVoucher = 0;
                        report.wage = 0;
                        for (var j = 0; j < arrReportWeek.length; j++)
                        {
                            report.totalHours += arrReportWeek[j].totalHours;
                            report.totalHoursLvl2 += arrReportWeek[j].totalHoursLvl2;
                            report.totalHoursLvl3 += arrReportWeek[j].totalHoursLvl3;
                            report.totalMealVoucher += arrReportWeek[j].totalMealVoucher;
                            report.wage += arrReportWeek[j].wage;
                        }

                        newItems.push(formatReport(report));
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

                $scope.reportsWeekly = formatReport(calculate('', totalHours, totalMealVoucher));
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
                var arrReportWeek = new Array();
                var curWeek;

                for (var i = 0; i < len; i++)
                {
                    var beginAM = results.rows.item(i).beginAM;
                    var endAM = results.rows.item(i).endAM;
                    var beginPM = results.rows.item(i).beginPM;
                    var endPM = results.rows.item(i).endPM;
                    var week = results.rows.item(i).week;

                    if (i > 0 && curWeek !== week)
                    {
                        arrReportWeek.push(calculate('', totalHours, totalMealVoucher));
                        totalHours = 0;
                        totalMealVoucher = 0;
                    }

                    if (timeDiff(endAM, beginAM, true) !== 0 && timeDiff(endPM, beginPM, true) !== 0 && timeDiff(endAM, beginPM, true) < prefMealVoucher)
                    {
                        totalMealVoucher++;
                    }

                    totalHours += timeDiff(beginAM, endAM, true);
                    totalHours += timeDiff(beginPM, endPM, true);

                    curWeek = week;

                    if (i == len-1)
                    {
                        arrReportWeek.push(calculate('', totalHours, totalMealVoucher));
                    }
                }

                var report = new Array();
                report.totalHours = 0;
                report.totalHoursLvl2 = 0;
                report.totalHoursLvl3 = 0;
                report.totalMealVoucher = 0;
                report.wage = 0;
                for (var i = 0; i < arrReportWeek.length; i++)
                {
                    report.totalHours += arrReportWeek[i].totalHours;
                    report.totalHoursLvl2 += arrReportWeek[i].totalHoursLvl2;
                    report.totalHoursLvl3 += arrReportWeek[i].totalHoursLvl3;
                    report.totalMealVoucher += arrReportWeek[i].totalMealVoucher;
                    report.wage += arrReportWeek[i].wage;
                }

                $scope.reportsMonthly = formatReport(report);
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

function formatReport(report)
{
    return {
        date:report.date,
        totalHours:formatTime(report.totalHours),
        totalHoursLvl2:formatTime(report.totalHoursLvl2),
        totalHoursLvl3:formatTime(report.totalHoursLvl3),
        totalMealVoucher:report.totalMealVoucher,
        wage:parseFloat(report.wage).toFixed(2)
    };
}

function calculate(dateRange, totalHours, totalMealVoucher)
{
    var levelSplit = prefExtraHoursPolicy.split('|');
    var level1Pourcent = levelSplit[0];
    var level2 = levelSplit[1];
    var level3Pourcent = levelSplit[2];

    var level2Split = level2.split(';');
    var level2Pourcent = level2Split[0];
    var lvl2Hours = level2Split[1].split('-')[0] * 60;
    var lvl3Hours = level2Split[1].split('-')[1] * 60;

    var totalHoursLvl2 = 0;
    if (totalHours > lvl2Hours)
    {
        totalHoursLvl2 = totalHours - lvl2Hours;
        if (totalHoursLvl2 >= (lvl3Hours - lvl2Hours))
        {
            totalHoursLvl2 = lvl3Hours - lvl2Hours;
        }
    }

    var totalHoursLvl3 = 0;
    if (totalHours > lvl3Hours)
    {
        totalHoursLvl3 = totalHours - lvl3Hours;
    }

    // Wage
    var wageLevel1 = ((level1Pourcent / 100) * (prefHourlyRate / 60)) * (totalHours - totalHoursLvl2 - totalHoursLvl3);
    var wageLevel2 = ((level2Pourcent / 100) * (prefHourlyRate / 60)) * totalHoursLvl2;
    var wageLevel3 = ((level3Pourcent / 100) * (prefHourlyRate / 60)) * totalHoursLvl3;
    var wage = wageLevel1 + wageLevel2 + wageLevel3;

    return {
        date:dateRange,
        totalHours:totalHours,
        totalHoursLvl2:totalHoursLvl2,
        totalHoursLvl3:totalHoursLvl3,
        totalMealVoucher:totalMealVoucher,
        wage:wage
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