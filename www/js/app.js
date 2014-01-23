var months = months_fr;
var days = days_fr;
var dateFormat = dateFormat_fr;
var dateOrder = dateOrder_fr;

var language = window.navigator.userLanguage || window.navigator.language;
codeLang = language.substr(0, 2);

//codeLang = 'fr';

var curr = new Date().getFullYear();
var opt = {}

opt.date = {preset: 'date', dateFormat: dateFormat, dateOrder: dateOrder, endYear: curr + 100};
opt.time = {preset: 'time', stepMinute: 5};

var prefLanguage = null;
var prefMealVoucher = null;
var prefDevise = null;
var prefHourlyRate = null;
var prefExtraHoursPolicy = null;

$(document).ready(function ()
{
    var dateShift;
    var beginShiftAM;
    var endShiftAM;
    var beginShiftPM;
    var endShiftPM;

    $('#inputDateShift').on("change input", function() {
        $('#lblEditDateShift').html(this.value);
        dateShift = this.value;
    });

    $('#inputBeginAMShift').on("change input", function ()
    {
        $('#lblEditBeginAMShift').html(this.value);
        beginShiftAM = this.value;
    });

    $('#inputEndAMShift').on("change input", function ()
    {
        $('#lblEditEndAMShift').html(this.value);
        endShiftAM = this.value;
    });

    $('#inputBeginPMShift').on("change input", function ()
    {
        $('#lblEditBeginPMShift').html(this.value);
        beginShiftPM = this.value;
    });

    $('#inputEndPMShift').on("change input", function ()
    {
        $('#lblEditEndPMShift').html(this.value);
        endShiftPM = this.value;
    });

    ///////////////////////////////////////////////////

    // Edit date shift
    $('#actionEditDateShift').click(function ()
    {
        $('#itemEditDateShift').addClass('ui-btn-active');

        $('#inputDateShift').val(dateShift).scroller('destroy').scroller($.extend(opt['date'], { theme: 'ios', mode: 'scroller', display: 'inline', lang: prefLanguage }));
        $('#lblEditDateShift').html($('#inputDateShift').val());
        $('#inputDateShift').html(dateShift);

        dateShift = $('#inputDateShift').val();
        $('#inputDateShift').focus();
    });

    // Edit morning shift
    $('#actionEditMorningShift').click(function ()
    {
        if (beginShiftAM == '' && endShiftAM == '')
        {
            $('#sliderWorkedMorningShift').slider();
            $('#sliderWorkedMorningShift').val("no");
            $('#sliderWorkedMorningShift').slider('refresh');

            $('#itemEditEndAMShift').removeClass('ui-btn-active');
            $('#itemEditBeginAMShift').removeClass('ui-btn-active');

            $('#itemEditBeginAMShift').addClass('ui-disabled');
            $('#itemEditEndAMShift').addClass('ui-disabled');
        }
        else
        {
            $('#sliderWorkedMorningShift').slider();
            $('#sliderWorkedMorningShift').val("yes");
            $('#sliderWorkedMorningShift').slider('refresh');

            $('#itemEditBeginAMShift').removeClass('ui-disabled');
            $('#itemEditEndAMShift').removeClass('ui-disabled');

            $('#itemEditEndAMShift').removeClass('ui-btn-active');
            $('#itemEditBeginAMShift').addClass('ui-btn-active');

            $('#inputEndAMShift').val('').scroller('destroy');
            $('#inputBeginAMShift').val(beginShiftAM).scroller('destroy').scroller($.extend(opt['time'], { theme: 'ios', mode: 'scroller', display: 'inline', lang: 'fr' }));
            $('#lblEditBeginAMShift').html($('#inputBeginAMShift').val());
            beginShiftAM = $('#inputBeginAMShift').val();
        }
    });

    // Edit afternoon shift
    $('#actionEditAfternoonShift').click(function ()
    {
        if (beginShiftPM == '' && endShiftPM == '')
        {
            $('#sliderWorkedAfternoonShift').slider();
            $('#sliderWorkedAfternoonShift').val("no");
            $('#sliderWorkedAfternoonShift').slider('refresh');

            $('#itemEditEndPMShift').removeClass('ui-btn-active');
            $('#itemEditBeginPMShift').removeClass('ui-btn-active');

            $('#itemEditBeginPMShift').addClass('ui-disabled');
            $('#itemEditEndPMShift').addClass('ui-disabled');
        }
        else
        {
            $('#sliderWorkedAfternoonShift').slider();
            $('#sliderWorkedAfternoonShift').val("yes");
            $('#sliderWorkedAfternoonShift').slider('refresh');

            $('#itemEditBeginPMShift').removeClass('ui-disabled');
            $('#itemEditEndPMShift').removeClass('ui-disabled');

            $('#itemEditEndPMShift').removeClass('ui-btn-active');
            $('#itemEditBeginPMShift').addClass('ui-btn-active');

            $('#inputEndPMShift').val('').scroller('destroy');
            $('#inputBeginPMShift').val(beginShiftPM).scroller('destroy').scroller($.extend(opt['time'], { theme: 'ios', mode: 'scroller', display: 'inline', lang: 'fr' }));
            $('#lblEditBeginPMShift').html($('#inputBeginPMShift').val());
            beginShiftPM = $('#inputBeginPMShift').val();
        }
    });

    // Edit check-in morning shift
    $('#itemEditBeginAMShift').click(function ()
    {
        $('#itemEditEndAMShift').removeClass('ui-btn-active');
        $('#itemEditBeginAMShift').addClass('ui-btn-active');

        $('#inputEndAMShift').val('').scroller('destroy');
        $('#inputBeginAMShift').val(beginShiftAM).scroller('destroy').scroller($.extend(opt['time'], { theme: 'ios', mode: 'scroller', display: 'inline', lang: 'fr' }));
        $('#lblEditBeginAMShift').html($('#inputBeginAMShift').val());
        beginShiftAM = $('#inputBeginAMShift').val();
    });

    // Edit check-in afternoon shift
    $('#itemEditBeginPMShift').click(function ()
    {
        $('#itemEditEndPMShift').removeClass('ui-btn-active');
        $('#itemEditBeginPMShift').addClass('ui-btn-active');

        $('#inputEndPMShift').val('').scroller('destroy');
        $('#inputBeginPMShift').val(beginShiftPM).scroller('destroy').scroller($.extend(opt['time'], { theme: 'ios', mode: 'scroller', display: 'inline', lang: 'fr' }));
        $('#lblEditBeginPMShift').html($('#inputBeginPMShift').val());
        beginShiftPM = $('#inputBeginPMShift').val();
    });

    // Edit check-out morning shift
    $('#itemEditEndAMShift').click(function ()
    {
        $('#itemEditEndAMShift').addClass('ui-btn-active');
        $('#itemEditBeginAMShift').removeClass('ui-btn-active');

        $('#inputBeginAMShift').val('').scroller('destroy');
        $('#inputEndAMShift').val(endShiftAM).scroller('destroy').scroller($.extend(opt['time'], { theme: 'ios', mode: 'scroller', display: 'inline', lang: 'fr' }));
        $('#lblEditEndAMShift').html($('#inputEndAMShift').val());
        endShiftAM = $('#inputEndAMShift').val();
    });

    // Edit check-out afternoon shift
    $('#itemEditEndPMShift').click(function ()
    {
        $('#itemEditEndPMShift').addClass('ui-btn-active');
        $('#itemEditBeginPMShift').removeClass('ui-btn-active');

        $('#inputBeginPMShift').val('').scroller('destroy');
        $('#inputEndPMShift').val(endShiftPM).scroller('destroy').scroller($.extend(opt['time'], { theme: 'ios', mode: 'scroller', display: 'inline', lang: 'fr' }));
        $('#lblEditEndPMShift').html($('#inputEndPMShift').val());
        endShiftPM = $('#inputEndPMShift').val();
    });

    // Slider worked? morning shift
    $('#sliderWorkedMorningShift').change(function (event, ui)
    {
        if (event.currentTarget.value == 'no')
        {
            $('#inputEndAMShift').val('').scroller('destroy');
            $('#inputBeginAMShift').val('').scroller('destroy');

            $('#itemEditEndAMShift').removeClass('ui-btn-active');
            $('#itemEditBeginAMShift').removeClass('ui-btn-active');

            $('#itemEditBeginAMShift').addClass('ui-disabled');
            $('#itemEditEndAMShift').addClass('ui-disabled');
        }
        else
        {
            $('#itemEditBeginAMShift').removeClass('ui-disabled');
            $('#itemEditEndAMShift').removeClass('ui-disabled');

            $('#itemEditEndAMShift').removeClass('ui-btn-active');
            $('#itemEditBeginAMShift').addClass('ui-btn-active');

            $('#inputBeginAMShift').val('').scroller('destroy').scroller($.extend(opt['time'], { theme: 'ios', mode: 'scroller', display: 'inline', lang: 'fr' }));
        }

        $('#lblEditBeginAMShift').html($('#inputBeginAMShift').val());
        $('#lblEditEndAMShift').html($('#inputEndAMShift').val());

        beginShiftAM = $('#inputBeginAMShift').val();
        endShiftAM = $('#inputEndAMShift').val();
    });

    // Slider worked? afternoon shift
    $('#sliderWorkedAfternoonShift').change(function (event, ui)
    {
        if (event.currentTarget.value == 'no')
        {
            $('#inputEndPMShift').val('').scroller('destroy');
            $('#inputBeginPMShift').val('').scroller('destroy');

            $('#itemEditEndPMShift').removeClass('ui-btn-active');
            $('#itemEditBeginPMShift').removeClass('ui-btn-active');

            $('#itemEditBeginPMShift').addClass('ui-disabled');
            $('#itemEditEndPMShift').addClass('ui-disabled');
        }
        else
        {
            $('#itemEditBeginPMShift').removeClass('ui-disabled');
            $('#itemEditEndPMShift').removeClass('ui-disabled');

            $('#itemEditEndPMShift').removeClass('ui-btn-active');
            $('#itemEditBeginPMShift').addClass('ui-btn-active');

            $('#inputBeginPMShift').val('').scroller('destroy').scroller($.extend(opt['time'], { theme: 'ios', mode: 'scroller', display: 'inline', lang: 'fr' }));
        }

        $('#lblEditBeginPMShift').html($('#inputBeginPMShift').val());
        $('#lblEditEndPMShift').html($('#inputEndPMShift').val());

        beginShiftPM = $('#inputBeginPMShift').val();
        endShiftPM = $('#inputEndPMShift').val();
    });

    // Validate add shift
    $('#actionDoneAddShift').click(function ()
    {
        var dateId = moment(dateShift, "DD MMMM YYYY").format("YYYYMMDD");
        //var dateId = Date.parse(dateShift).toString("yyyyMMdd");
        var dateIdYY = dateId.substr(0,4);
        var dateIdMM = dateId.substr(4,2);
        var dateIdDD = dateId.substr(6,2);
        var id = dateIdYY + (dateIdMM - 1 < 10 ? ("0" + (dateIdMM - 1)) : (dateIdMM - 1)) + dateIdDD;

        if ($('#sliderWorkedMorningShift').val() === 'yes' && $('#sliderWorkedAfternoonShift').val() === 'yes')
        {
            if (!validateShift(endShiftAM, beginShiftPM, 'no'))
            {
//                        navigator.notification.alert("This is a test","","Info");
                alert($.i18n._('msg.shift.field.error'));
            }
            else
            {
                addShift(id, beginShiftAM, endShiftAM, beginShiftPM, endShiftPM);
            }
        }
        else
        {
            addShift(id, beginShiftAM, endShiftAM, beginShiftPM, endShiftPM);
        }
    });

    // Validate date shift
    $('#actionDoneDateShift').click(function ()
    {
        $('#lblDateShift').html($('#lblEditDateShift').text());
        dateShift = $('#lblEditDateShift').text();
    });

    // Validate morning shift
    $('#actionDoneMorningShift').click(function ()
    {
        $('#lblBeginAMShift').html($('#lblEditBeginAMShift').text());
        beginShiftAM = $('#lblEditBeginAMShift').text();

        $('#lblEndAMShift').html($('#lblEditEndAMShift').text());
        endShiftAM = $('#lblEditEndAMShift').text();

        if (!validateShift(beginShiftAM, endShiftAM, $('#sliderWorkedMorningShift').val()))
        {
//                        navigator.notification.alert("This is a test","","Info");
            alert($.i18n._('msg.shift.field.error'));
        }
        else
        {
            $.mobile.changePage("#viewAddShift", { transition: "slide", reverse: true, changeHash: false });
        }
    });

    // Validate afternoon shift
    $('#actionDoneAfternoonShift').click(function ()
    {
        $('#lblBeginPMShift').html($('#lblEditBeginPMShift').text());
        beginShiftPM = $('#lblEditBeginPMShift').text();

        $('#lblEndPMShift').html($('#lblEditEndPMShift').text());
        endShiftPM = $('#lblEditEndPMShift').text();

        if (!validateShift(beginShiftPM, endShiftPM, $('#sliderWorkedAfternoonShift').val()))
        {
            alert($.i18n._('msg.shift.field.error'));
        }
        else
        {
            $.mobile.changePage("#viewAddShift", { transition: "slide", reverse: true, changeHash: false });
        }
    });

    // Today
    $('#actionToday').click(function ()
    {
        $("#calendar").trigger('refresh', [new Date()]);
    });

    // Add a new shift
    $('#actionAddShift').click(function ()
    {
        //$('#lblDateShift').html(new Date().toString('dd MMMM yyyy'));
        dateShift = $('#lblDateShift').text();

        // Morning
        $('#lblBeginAMShift').html("08:00");
        $('#lblEditBeginAMShift').html($('#lblBeginAMShift').text());
        beginShiftAM = $('#lblBeginAMShift').text();

        $('#lblEndAMShift').html("12:00");
        $('#lblEditEndAMShift').html($('#lblEndAMShift').text());
        endShiftAM = $('#lblEndAMShift').text();

        // Afternoon
        $('#lblBeginPMShift').html("14:00");
        $('#lblEditBeginPMShift').html($('#lblBeginPMShift').text());
        beginShiftPM = $('#lblBeginPMShift').text();

        $('#lblEndPMShift').html("18:00");
        $('#lblEditEndPMShift').html($('#lblEndPMShift').text());
        endShiftPM = $('#lblEndPMShift').text();
    });

    ///////////////////////////////////////////////////

    // Report Summary from Calendar
    $('#actionCalendarViewReport, #actionSettingsViewReport').click(function ()
    {
        $('#actionReportViewReport').click();
    });

    // Report Weekly
    $('#itemReportWeekly, #itemReportMonthly').click(function ()
    {
        $('#viewReportSummary').hide();
        $('#viewReportDetail').show();
    });

    // Report Summary
    $('#actionReportViewReport').click(function ()
    {
        $('#actionReportViewReport').addClass('ui-btn-active');
        $('#linkReportWeekly').removeClass('ui-btn-active');
        $('#linkReportMonthly').removeClass('ui-btn-active');

        $('#viewReportSummary').show();
        $('#viewReportDetail').hide();
    });

    ///////////////////////////////////////////////////

    $("#viewLanguage input[type='radio']").change(function (event, ui)
    {
        prefLanguage = event.currentTarget.value;
        updatePreference("lang", prefLanguage);
        doTranslation();

        $.mobile.changePage("#viewSettings", { transition: "slide", reverse: true, changeHash: false });
    });

    $("#viewMealVoucher input[type='radio']").change(function (event, ui)
    {
        prefMealVoucher = event.currentTarget.value;
        updatePreference("mealvoucher", prefMealVoucher);
        $('#lblSettingsMealVoucher').text($.i18n._('settings.mealvoucher.' + prefMealVoucher));

        $.mobile.changePage("#viewSettings", { transition: "slide", reverse: true, changeHash: false });
    });

    $("#viewDevise input[type='radio']").change(function (event, ui)
    {
        prefDevise = event.currentTarget.value;
        updatePreference("devise", prefDevise);
        $('#lblSettingsDevise').text($.i18n._('settings.devise.' + prefDevise));

        $.mobile.changePage("#viewSettings", { transition: "slide", reverse: true, changeHash: false });
    });

    $("#inputSettingsHourlyRate").blur(function (event, ui)
    {
        prefHourlyRate = $('#inputSettingsHourlyRate').val();
        updatePreference("hourlyrate", prefHourlyRate);
    });

    $("#actionSettingsEditHourlyRate").click(function (event, ui)
    {
        $('#inputSettingsHourlyRate').focus();
    });

    $("#backExtraHoursPolicy").click(function (event, ui)
    {
        var level1 = $('#selectLevel1').val();

        var level2 = $('#selectLevel2').val();
        level2 += ";" + $('#rangeMinLevel2').val();
        level2 += "-" + $('#rangeMaxLevel2').val();

        var level3 = $('#selectLevel3').val();

        prefExtraHoursPolicy = level1 + "|" + level2 + "|" + level3;
        updatePreference("extrahourspolicy", prefExtraHoursPolicy);
    });
});