// Wait for PhoneGap to load
document.addEventListener("deviceready", onDeviceReady, false);

window.addEventListener('load', function ()
{
    FastClick.attach(document.body);
}, false);

var events = [];

function createDB(tx)
{
//                tx.executeSql('DROP TABLE IF EXISTS EVENTS');
    //tx.executeSql('DROP TABLE IF EXISTS PREFS');
    tx.executeSql('CREATE TABLE IF NOT EXISTS EVENTS (id UNIQUE, date, week, month, beginAM, endAM, beginPM, endPM)');
    //			     tx.executeSql('INSERT INTO EVENTS (id, beginAM, endAM, beginPM, endPM) VALUES (20130818, "08:30", "12:30", "13:00", "18:30")');
    //			     tx.executeSql('INSERT INTO EVENTS (id, beginAM, endAM, beginPM, endPM) VALUES (20130816, "08:00", "10:00", "14:00", "15:00")');
    tx.executeSql('CREATE TABLE IF NOT EXISTS PREFS (name UNIQUE, value)');
    // tx.executeSql('INSERT INTO PREFS (name, value) VALUES ("lang", "en")');
    // tx.executeSql('INSERT INTO PREFS (name, value) VALUES ("mealvoucher", "15")');
}

function errorDB(err)
{
    alert("Error processing SQL: " + err.code + " - " + err.message);
}

function load()
{
    loadAllEvent();

    // Loading the preferences
    $('#viewMealVoucher, #viewLanguage, #viewDevise, #viewExtraHoursPolicy').page();

    findPreference("hourlyrate", function (result)
    {
        prefHourlyRate = result == null ? "0" : result;
        $('#inputSettingsHourlyRate').val(prefHourlyRate);
    });

    findPreference("extrahourspolicy", function (result)
    {
        prefExtraHoursPolicy = result == null ? "100|150;35-40|200" : result;

        var levelSplit = prefExtraHoursPolicy.split('|');
        var level1 = levelSplit[0];
        var level2 = levelSplit[1];
        var level3 = levelSplit[2];

        $('#selectLevel1').val(parseInt(level1));
        $('#selectLevel1').selectmenu("refresh");

        var level2Split = level2.split(';');

        $('#selectLevel2').val(parseInt(level2Split[0]));
        $('#selectLevel2').selectmenu("refresh");

        $('#rangeMaxLevel2').val(level2Split[1].split('-')[1]);
        $('#rangeMaxLevel2').slider("refresh");
        $('#rangeMinLevel2').val(level2Split[1].split('-')[0]);
        $('#rangeMinLevel2').slider("refresh");

        $('#selectLevel3').val(parseInt(level3));
        $('#selectLevel3').selectmenu("refresh");
    })

    findPreference("lang", function (result)
    {
        prefLanguage = result == null ? codeLang : result;
        $('#radioLang' + prefLanguage.capitalize()).prop("checked", true).checkboxradio("refresh");

        findPreference("mealvoucher", function (result)
        {
            prefMealVoucher = result == null ? "60" : result;
            $('#radioMealVoucher' + prefMealVoucher).prop("checked", true).checkboxradio("refresh");

            findPreference("devise", function (result)
            {
                prefDevise = result == null ? "euro" : result;
                $('#radioDevise' + prefDevise.capitalize()).prop("checked", true).checkboxradio("refresh");

                doTranslation();
            });

            displayCalendar();
        });
    });
}

function loadAllEvent()
{
    var db = window.openDatabase("timesheet", "1.0", "Timesheet DB", 10000000);

    db.transaction(function query(tx)
    {
        var sql = 'SELECT * FROM EVENTS';
        tx.executeSql(sql, [], function querySuccess(tx, results)
        {
            var len = results.rows.length;

            for (var i = 0; i < len; i++)
            {
                var date = results.rows.item(i).id.toString();

                var year = date.substr(0, 4);
                var month = date.substr(4, 2);
                var day = date.substr(6, 2);

                var event_details = [];
                event_details['day'] = new Date(year, month, day);
                event_details['beginAM'] = results.rows.item(i).beginAM;
                event_details['endAM'] = results.rows.item(i).endAM;
                event_details['beginPM'] = results.rows.item(i).beginPM;
                event_details['endPM'] = results.rows.item(i).endPM;

                events[i] = event_details;
            }
            refreshCalendar();
        }, errorDB);
    }, errorDB);
}

// PhoneGap is ready
function onDeviceReady()
{
    var db = window.openDatabase("timesheet", "1.0", "Timesheet DB", 10000000);
    db.transaction(createDB, errorDB, load);
}

function findPreference(name, callback)
{
    var db = window.openDatabase("timesheet", "1.0", "Timesheet DB", 10000000);

    db.transaction(function query(tx)
    {
        var sql = 'SELECT * FROM PREFS where name=?';
        tx.executeSql(sql, [name], function querySuccess(tx, results)
        {
            var result = null;
            if (results.rows.length > 0) {
                result = results.rows.item(0).value;
            }
            callback(result);
        }, errorDB);
    }, errorDB);
}

function updatePreference(name, value)
{
    var db = window.openDatabase("timesheet", "1.0", "Timesheet DB", 10000000);

    db.transaction(function query(tx)
    {
        var sql = 'INSERT or REPLACE INTO PREFS ("name", "value") VALUES (?, ?)';
        tx.executeSql(sql, [name, value], function querySuccess(tx, results) {
        }, errorDB);
    }, errorDB);
}

function deleteShift(dateId)
{
    var db = window.openDatabase("timesheet", "1.0", "Timesheet DB", 10000000);

    db.transaction(function query(tx)
    {
        var sql = 'SELECT * FROM EVENTS WHERE id = ?';
        tx.executeSql(sql, [dateId], function querySuccess(tx, results)
        {
            var len = results.rows.length;

            if (len > 0)
            {
                var sql = 'DELETE FROM EVENTS WHERE id = ?';
                tx.executeSql(sql, [dateId], function querySuccess(tx, results) {

                    for (var i = 0; i < events.length; i++)
                    {
                        var dateEvent = events[i].day;
                        var curDateId = dateEvent.getFullYear() + "" + dateEvent.getMonth() + "" + dateEvent.getDate();

                        if (curDateId === dateId)
                        {
                            events.splice(i, 1);
                            break;
                        }
                    }
                    refreshCalendar();
                }, errorDB)
            }
        }, errorDB);
    }, errorDB);
}

function addShift(dateId, beginAM, endAM, beginPM, endPM)
{
    var db = window.openDatabase("timesheet", "1.0", "Timesheet DB", 10000000);

    db.transaction(function query(tx)
    {
        var sql = 'SELECT * FROM EVENTS WHERE id = ?';
        tx.executeSql(sql, [dateId], function querySuccess(tx, results)
        {
            var len = results.rows.length;

            if (len == 0)
            {
                var year = dateId.substr(0, 4);
                var month = dateId.substr(4, 2);
                var day = dateId.substr(6, 2);

                var date = new Date(year, month, day);
                var dateFormatted = year + "-" + month + "-" + day;
                var week = date.getWeekOfYear();

                var sql = 'INSERT INTO EVENTS ("id", "date", "week", "month", "beginAM", "endAM", "beginPM", "endPM") VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                tx.executeSql(sql, [dateId, dateFormatted, week, month, beginAM, endAM, beginPM, endPM], function querySuccess(tx, results) {
                    loadAllEvent();
                    $.mobile.changePage("#viewCalendar", { transition: "slidedown", reverse: false, changeHash: false });
                }, errorDB)
            }
            else
            {
                alert($.i18n._('msg.shift.already.exist'));
            }
        }, errorDB);
    }, errorDB);
}

function displayCalendar()
{
    $('#calendar').jqmCalendar({
        events: events,
        months: months,
        days: days,
        startOfWeek: 1,
        prefMealVoucher: prefMealVoucher,
        index: this
    });
}

function refreshCalendar()
{
    $("#calendar").trigger('refresh');
}

function doTranslation()
{
    if (prefLanguage == "fr")
    {
        replacejscssfile("js/date-en-GB.js", "js/date-fr-FR.js", "js");

        months = months_fr;
        days = days_fr;
        dateFormat = dateFormat_fr;
        dateOrder = dateOrder_fr;
        $.i18n.setDictionary(i18n_dict_fr);

        refreshCalendar();
    }
    else
    {
        replacejscssfile("js/date-fr-FR.js", "js/date-en-GB.js", "js");

        months = months_en;
        days = days_en;
        dateFormat = dateFormat_en;
        dateOrder = dateOrder_en;
        $.i18n.setDictionary(i18n_dict_en);

        refreshCalendar();
    }

    // Calendar View
    $('#lblViewCalendarTitle').text($.i18n._('main.calendar'));
    $('#lblViewCalendarToday').text($.i18n._('calendar.button.today'));
    $('#lblViewCalendarAdd').text($.i18n._('calendar.button.add'));

    // Common
    $('#lblViewAddShiftCancel, #lblViewEditShiftCancel, #lblViewEditMorningCancel, #lblViewEditAfternoonCancel').text($.i18n._('common.cancel'));
    $('#lblViewAddShiftDone, #lblViewEditShiftDone, #lblViewEditMorningDone, #lblViewEditAfternoonDone').text($.i18n._('common.done'));

    // Calendar View - Add Shift
    $('#lblViewAddShiftTitle').text($.i18n._('main.calendar.addshift'));
    $('#lblViewAddShiftDate').text($.i18n._('calendar.addshift.date'));
    $('#lblViewAddShiftMorning').text($.i18n._('calendar.addshift.morning'));
    $('#lblViewAddShiftAfternoon').text($.i18n._('calendar.addshift.afternoon'));
    $('#lblViewAddShiftAMStarts').text($.i18n._('calendar.addshift.am.starts'));
    $('#lblViewAddShiftAMEnds').text($.i18n._('calendar.addshift.am.ends'));
    $('#lblViewAddShiftPMStarts').text($.i18n._('calendar.addshift.pm.starts'));
    $('#lblViewAddShiftPMEnds').text($.i18n._('calendar.addshift.pm.ends'));

    // Calendar View - Edit Shift
    $('#lblViewEditShiftTitle').text($.i18n._('main.calendar.editshift'));
    $('#lblViewEditShiftDate').text($.i18n._('calendar.editshift.date'));

    // Calendar View - Edit Morning
    $('#lblViewEditMorningTitle').text($.i18n._('main.calendar.editmorning'));
    $('#lblViewEditMorningStarts').text($.i18n._('calendar.editmorning.starts'));
    $('#lblViewEditMorningEnds').text($.i18n._('calendar.editmorning.ends'));
    $('#lblViewEditMorningWorked').text($.i18n._('calendar.editmorning.worked'));

    // Calendar View - Edit Afternoon
    $('#lblViewEditAfternoonTitle').text($.i18n._('main.calendar.editafternoon'));
    $('#lblViewEditAfternoonStarts').text($.i18n._('calendar.editafternoon.starts'));
    $('#lblViewEditAfternoonEnds').text($.i18n._('calendar.editafternoon.ends'));
    $('#lblViewEditAfternoonWorked').text($.i18n._('calendar.editafternoon.worked'));

    // Footer
    $('#lblViewCalendarFooterCalendar, #lblViewReportFooterCalendar, #lblViewSettingsFooterCalendar').text($.i18n._('main.calendar'));
    $('#lblViewCalendarFooterReport, #lblViewReportFooterReport, #lblViewSettingsFooterReport').text($.i18n._('main.report'));
    $('#lblViewCalendarFooterSettings, #lblViewReportFooterSettings, #lblViewSettingsFooterSettings').text($.i18n._('main.settings'));

    // Report View
    $('#lblViewReportTitle').text($.i18n._('main.report'));
    $('#lblViewReportWeekly').text($.i18n._('report.weekly'));
    $('#lblViewReportMonthly').text($.i18n._('report.monthly'));
    $('#lblViewReportThisWeek').text($.i18n._('report.thisweek'));
    $('#lblViewReportThisMonth').text($.i18n._('report.thismonth'));

    // Settings View
    $('#lblViewSettingsTitle').text($.i18n._('main.settings'));
    $('#lblViewSettingsMealVoucher').text($.i18n._('settings.mealvoucher'));
    $('#lblViewSettingsHourlyRate').text($.i18n._('settings.hourlyrate'));
    $('#lblViewSettingsDevise').text($.i18n._('settings.devise'));
    $('#lblViewSettingsExtraHoursPolicy').text($.i18n._('settings.extrahourspolicy'));
    $('#lblViewSettingsLanguage').text($.i18n._('settings.language'));
    $('#lblViewSettingsVersion').text($.i18n._('settings.version'));

    // Settings View - Language
    $('#lblViewLanguageTitle').text($.i18n._('main.settings.language'));
    $('#lblSettingsLanguage').text($.i18n._('settings.language.' + prefLanguage));

    // Settings View - Meal Voucher
    $('#lblViewMealVoucherTitle').text($.i18n._('main.settings.mealvoucher'));
    $('#lblSettingsMealVoucher').text($.i18n._('settings.mealvoucher.' + prefMealVoucher));

    // Settings View - Devise
    $('#lblViewDeviseTitle').text($.i18n._('main.settings.devise'));
    $('#lblSettingsDevise').text($.i18n._('settings.devise.' + prefDevise));

    // Settings View - Extra Hours Policy
    $('#lblViewExtraHoursPolicyTitle').text($.i18n._('main.settings.extrahourspolicy'));
    $('#lblViewExtraHoursPolicyLevel1').text($.i18n._('settings.extrahourspolicy.level1'));
    $('#lblViewExtraHoursPolicyLevel2').text($.i18n._('settings.extrahourspolicy.level2'));
    $('#lblViewExtraHoursPolicyLevel3').text($.i18n._('settings.extrahourspolicy.level3'));
}

function createjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    return fileref
}

function replacejscssfile(oldfilename, newfilename, filetype){
    var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist using
    var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
    var allsuspects=document.getElementsByTagName(targetelement)
    for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
        if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(oldfilename)!=-1){
            var newelement=createjscssfile(newfilename, filetype)
            allsuspects[i].parentNode.replaceChild(newelement, allsuspects[i])
        }
    }
}

function validateShift(beginShift, endShift, isworked)
{
    if (isworked === "yes" && (beginShift === "" || endShift === ""))
    {
       return false;
    }

    if (beginShift !== "" || endShift !== "")
    {
        var beginShiftHH = beginShift.split(":")[0];
        var beginShiftMM = beginShift.split(":")[1];

        var endShiftHH = endShift.split(":")[0];
        var endShiftMM = endShift.split(":")[1];

        if (endShiftHH < beginShiftHH)
        {
            return false;
        }
        else if (endShiftHH === beginShiftHH && endShiftMM < beginShiftMM)
        {
            return false;
        }
    }

    return true;
}

String.prototype.capitalize = function ()
{
    return this.charAt(0).toUpperCase() + this.slice(1);
};



