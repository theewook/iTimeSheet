(function ($) {
    $.jqmCalendar = function (element, options) {

        var defaults = {
            // Array of events
            events: [],
            // Default properties for events
            day: "day",
            beginAM: "beginAM",
            endAM: "endAM",
            beginPM: "beginPM",
            endPM: "endPM",
            // Theme
            theme: "c",
            // Date variable to determine which month to show and which date to select
            date: new Date(),
            // Array of month strings (calendar header)
            months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            // Array of day strings (calendar header)
            days: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
            // Most months contain 5 weeks, some 6. Set this to six if you don't want the amount of rows to change when switching months.
            weeksInMonth: 6,
            // Start the week at the day of your preference, 0 for sunday, 1 for monday, and so on.
            startOfWeek: 1
        }

        var plugin = this;
        plugin.settings = null;

        var $element = $(element).addClass("jq-calendar-wrapper"),
            element = element,
            $table,
            $header,
            $tbody,
            $listview;

        function init() {
            plugin.settings = $.extend({}, defaults, options);
            $table = $("<table/>");

            // Build the header
            var $thead = $("<thead/>").appendTo($table),
                $tr = $("<tr/>").appendTo($thead),
                $th = $("<th class='ui-bar-" + plugin.settings.theme + " header' colspan='7'/>");

            $previous = $("<a href='#' data-role='button' data-icon='arrow-l' data-iconpos='notext' class='previous-btn'>Previous</a>").click(function (event) {
                refresh(new Date(plugin.settings.date.getFullYear(), plugin.settings.date.getMonth() - 1, plugin.settings.date.getDate()));
            }).appendTo($th);

            $header = $("<span/>").appendTo($th);

            $previous = $("<a href='#' data-role='button' data-icon='arrow-r' data-iconpos='notext' class='next-btn'>Next</a>").click(function (event) {
                refresh(new Date(plugin.settings.date.getFullYear(), plugin.settings.date.getMonth() + 1, plugin.settings.date.getDate()));
            }).appendTo($th);

            $th.appendTo($tr);

            $tr = $("<tr/>").appendTo($thead);

            // The way of determing the labels for the days is a bit awkward, but works.
            for (var i = 0, days = [].concat(plugin.settings.days, plugin.settings.days).splice(plugin.settings.startOfWeek, 7); i < 7; i++) {
                $tr.append("<th class='ui-bar-" + plugin.settings.theme + "'><span class='hidden'>" + days[i] + "</span></th>");
            }

            $tbody = $("<tbody/>").appendTo($table);

            $table.appendTo($element);
            $listview = $("<ul id='swipeMe' data-role='listview'/>").insertAfter($table);

            $($table).on( "swipeleft swiperight", function( e ) {
                if ( e.type === "swipeleft"  ) {
                    refresh(new Date(plugin.settings.date.getFullYear(), plugin.settings.date.getMonth() + 1, plugin.settings.date.getDate()));
                } else if ( e.type === "swiperight" ) {
                    refresh(new Date(plugin.settings.date.getFullYear(), plugin.settings.date.getMonth() - 1, plugin.settings.date.getDate()));
                }
            });

            // Call refresh to fill the calendar with dates
            refresh(plugin.settings.date);
        }

        function _firstDayOfMonth(date) {
            // [0-6] Sunday is 0, Monday is 1, and so on.
            return ( new Date(date.getFullYear(), date.getMonth(), 1) ).getDay();
        }

        function _daysBefore(date, fim) {
            // Returns [0-6], 0 when firstDayOfMonth is equal to startOfWeek, else the amount of days of the previous month included in the week.
            var firstDayInMonth = ( fim || _firstDayOfMonth(date) ),
                diff = firstDayInMonth - plugin.settings.startOfWeek;
            return ( diff > 0 ) ? diff : ( 7 + diff );
        }

        function _daysInMonth(date) {
            // [1-31]
            return ( new Date(date.getFullYear(), date.getMonth() + 1, 0)).getDate();
        }

        function _daysAfter(date, wim, dim, db) {
            // Returns [0-6] amount of days from the next month
            return    (( wim || _weeksInMonth(date) ) * 7 ) - ( dim || _daysInMonth(date) ) - ( db || _daysBefore(date));
        }

        function _weeksInMonth(date, dim, db) {
            // Returns [5-6];
            return ( plugin.settings.weeksInMonth ) ? plugin.settings.weeksInMonth : Math.ceil(( ( dim || _daysInMonth(date) ) + ( db || _daysBefore(date)) ) / 7);
        }

        function addCell($row, date, hidden, selected) {
            var $td = $("<td class='ui-body-" + plugin.settings.theme + "'/>").appendTo($row),
                $a = $("<a href='#' class='ui-btn ui-btn-up-" + plugin.settings.theme + "'/>")
                    .html(date.getDate().toString())
                    .data('date', date)
                    .click(cellClickHandler)
                    .appendTo($td);

            if (selected) $a.click();

            if (hidden) {
                $td.addClass("hidden");
            } else {
                var importance = 0;
                var dailyHoursWorkedMealVoucher = "<span></span>";

                // Find events for this date
                for (var i = 0,
                         event,
                         begin = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
                         end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0, 0);
                     event = plugin.settings.events[i]; i++) {
                    if (event[plugin.settings.day] < end && event[plugin.settings.day] >= begin) {

                        var totalHoursAM = timeDiff(event[plugin.settings.beginAM], event[plugin.settings.endAM], false);
                        var totalHoursPM = timeDiff(event[plugin.settings.beginPM], event[plugin.settings.endPM], false);
                        var totalHours = addDuration(totalHoursAM, totalHoursPM);
                        var totalHoursSplit = totalHours.split('h');

                        var lunchBreak = timeDiff(event[plugin.settings.endAM], event[plugin.settings.beginPM], true);
                        dailyHoursWorkedMealVoucher = (totalHoursAM !== "00:00" && totalHoursPM !== "00:00" && lunchBreak < plugin.settings.prefMealVoucher) ? "<span>&bull;</span>" : "<span></span>";

                        if (totalHoursSplit[0] >= 10) {
                            importance = 3;
                        } else if (totalHoursSplit[0] >= 8 && totalHoursSplit[0] < 10 && totalHoursSplit[1] > 0) {
                            importance = 2;
                        } else {
                            importance = 1;
                        }
                    }
                }

                if (importance > 0) {
                    $a.append(dailyHoursWorkedMealVoucher).addClass("importance-" + importance.toString());
                }
            }
        }

        function cellClickHandler(event) {
            var $this = $(this),
                date = $this.data('date');
            $tbody.find("a.ui-btn-active").removeClass("ui-btn-active");
            $this.addClass("ui-btn-active");

            if (date.getMonth() !== plugin.settings.date.getMonth()) {
                // Go to previous/next month
                refresh(date);
            } else {
                // Select new date
                $element.trigger('change', date);
            }
        }

        function refresh(date) {
            plugin.settings.date = date = date || plugin.settings.date || new Date();

            var year = date.getFullYear(),
                month = date.getMonth(),
                daysBefore = _daysBefore(date),
                daysInMonth = _daysInMonth(date),
                weeksInMonth = plugin.settings.weeksInMonth || _weeksInMonth(date, daysInMonth, daysBefore);

            if (((daysInMonth + daysBefore) / 7 ) - weeksInMonth === 0)
                weeksInMonth++;

            // Empty the table body, we start all over...
            $tbody.empty();
            // Change the header to match the current month
            $header.html(plugin.settings.months[month] + " " + year.toString());

            for (var weekIndex = 0,
                     daysInMonthCount = 1,
                     daysAfterCount = 1; weekIndex < weeksInMonth; weekIndex++) {

                var daysInWeekCount = 0,
                    row = $("<tr/>").appendTo($tbody);

                // Previous month
                while (daysBefore > 0) {
                    addCell(row, new Date(year, month, 1 - daysBefore), true);
                    daysBefore--;
                    daysInWeekCount++;
                }

                // Current month
                while (daysInWeekCount < 7 && daysInMonthCount <= daysInMonth) {
                    addCell(row, new Date(year, month, daysInMonthCount), false, daysInMonthCount === date.getDate());
                    daysInWeekCount++;
                    daysInMonthCount++;
                }

                // Next month
                while (daysInMonthCount > daysInMonth && daysInWeekCount < 7) {
                    addCell(row, new Date(year, month, daysInMonth + daysAfterCount), true);
                    daysInWeekCount++;
                    daysAfterCount++;
                }
            }

            $element.trigger('create');
        }

        function addDuration(first, second) {
            if (second === "") {
                second = "00:00";
            }
            if (first === "") {
                first = "00:00";
            }

            var totalHoursDay = parseInt(first.split(":")[0], 10) + parseInt(second.split(":")[0], 10);
            var totalMinutesDay = parseInt(first.split(":")[1], 10) + parseInt(second.split(":")[1], 10);

            if (totalMinutesDay >= 60) {
                totalHoursDay += 1;
                totalMinutesDay -= 60;
            }
            return totalHoursDay + "h" + (totalMinutesDay > 9 ? totalMinutesDay : "0" + totalMinutesDay);
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

        $element.bind('change', function (event, begin) {
            var end = new Date(begin.getFullYear(), begin.getMonth(), begin.getDate() + 1, 0, 0, 0, 0);
            // Empty the list
            $listview.empty();

            // Find events for this date
            for (var i = 0, events; events = plugin.settings.events[i]; i++) {
                if (events[plugin.settings.day] < end && events[plugin.settings.day] >= begin) {
                    // Append matches to list
                    var totalHoursAM = timeDiff(events[plugin.settings.beginAM], events[plugin.settings.endAM], false);
                    var totalHoursPM = timeDiff(events[plugin.settings.beginPM], events[plugin.settings.endPM], false);

                    var dailyHoursWorkedAM = "<img src='img/chrono.png' width='22' height='22'/><span>" + (totalHoursAM === "00:00" ? "" : events[plugin.settings.beginAM] + " - " + events[plugin.settings.endAM]) + "</span>";
                    var dailyHoursWorkedPM = "<img src='img/chrono.png' width='22' height='22'/><span>" + (totalHoursPM === "00:00" ? "" : (events[plugin.settings.beginPM] + " - " + events[plugin.settings.endPM])) + "</span>";

                    var lunchBreak = timeDiff(events[plugin.settings.endAM], events[plugin.settings.beginPM], true);
                    var dailyHoursWorkedMealVoucher = (totalHoursAM !== "00:00" && totalHoursPM !== "00:00" && lunchBreak < plugin.settings.prefMealVoucher) ? "<div class='singleton'><img src='img/burger.png' width='32' height='32' /></div>" : "";

                    var dailyHoursWorked = "<div class='detailTimeSheet'><div style='float:left;'>" +
                        dailyHoursWorkedAM + "<br/>" + dailyHoursWorkedPM +
                        "</div>" + dailyHoursWorkedMealVoucher + "<div class='singleton'>" + addDuration(totalHoursAM, totalHoursPM) + "</div></div>";
                    $("<li data-swipeurl='#' data-icon='false'><a href='#'>" + dailyHoursWorked + "</a></li>").appendTo($listview);

                    $('#swipeMe li').swipeDelete({
                        direction: 'swipeleft',
                        btnLabel: 'Delete',
                        btnTheme: 'a',
                        btnClass: 'aSwipeBtn',
                        click: function (e) {
                            e.preventDefault();
                            var dateId = begin.getFullYear() + "" + (begin.getMonth() < 10 ? "0" + begin.getMonth() : begin.getMonth()) + "" + (begin.getDate() < 10 ? "0" + begin.getDate() : begin.getDate());
                            plugin.settings.index.deleteShift(dateId);
                            $(this).parents('li').slideUp();
                        }
                    });
                }
            }

            $('#lblDateShift').html(end.addDays(-1).toString('dd MMMM yyyy'));
            $listview.trigger('create').filter(".ui-listview").listview('refresh');
        });

        $element.bind('refresh', function (event, date) {
            refresh(date);
        });

        init();
    }

    $.fn.jqmCalendar = function (options) {
        return this.each(function () {
            if (!$(this).data('jqmCalendar')) {
                $(this).data('jqmCalendar', new $.jqmCalendar(this, options));
            }
        });
    }


})(jQuery);