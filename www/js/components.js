angular.module('iTimeSheet', []).
    directive('reportDetail', function() {
        return {
            restrict: "E",
            scope: {
                report: "="
            },
            template:
                '<div class="detailTimeSheet">' +
                    '<div class="singleton" style="text-align: left; width: 100px;">' +
                    '   <img src="img/chrono.png" width="22" height="22"/><span>{{report.totalHours}}</span>' +
                    '</div>' +
                    '<div>' +
                    '   <img src="img/chrono.png" width="22" height="22"/><span>{{report.totalHoursLvl2}}</span>' +
                    '   <br/>' +
                    '   <img src="img/chrono.png" width="22" height="22"/><span>{{report.totalHoursLvl3}}</span>' +
                    '</div>' +
                    '<div class="singleton">' +
                    '   <span>{{report.totalMealVoucher}}</span>' +
                    '</div>' +
                    '<div class="singleton" style="text-align: left; padding-left: 5px;">' +
                    '   <img src="img/burger.png" width="32" height="32"/>' +
                    '</div>' +
                '</div>',
            replace: true,
            transclude: false,
            controller: [ "$scope", function ($scope) { }],
            link: function (scope, element, attrs, controller) {}
        };
    });