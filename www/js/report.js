function ReportCtrl($scope)
{
    $scope.reports = [];
    $scope.reportsWeekly = {};
    $scope.reportsMonthly = {};

    $scope.reportWeekly = function()
    {
        $scope.reports = [
            {
                date:'14 October 2013 - 20 October 2013 (week 42)',
                totalHours:'42h',
                totalHoursLvl2:'3h30',
                totalHoursLvl3:'1h30',
                totalMealVoucher:'3'
            },
            {
                date:'7 October 2013 - 13 October 2013 (week 41)',
                totalHours:'46h15',
                totalHoursLvl2:'3h30',
                totalHoursLvl3:'4h30',
                totalMealVoucher:'5'
            }
        ];
    };

    $scope.reportMonthly = function()
    {
        $scope.reports = [
            {
                date:'14 October 2013 - 20 October 2013 (week 42)',
                totalHours:'42h',
                totalHoursLvl2:'3h30',
                totalHoursLvl3:'1h30',
                totalMealVoucher:'3'
            }
        ];
    };

    $scope.reportSummary = function()
    {
        $scope.reportsWeekly = {
                date:'14 October 2013 - 20 October 2013 (week 42)',
                totalHours:'42h',
                totalHoursLvl2:'3h30',
                totalHoursLvl3:'1h30',
                totalMealVoucher:'3'
            };

        $scope.reportsMonthly = {
                date:'14 October 2013 - 20 October 2013 (week 42)',
                totalHours:'42h',
                totalHoursLvl2:'3h30',
                totalHoursLvl3:'1h30',
                totalMealVoucher:'3'
            };
    };

}