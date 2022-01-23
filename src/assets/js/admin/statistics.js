$(function () {
    // Admin - Statistics
    var siteTrafficCtx = $('#siteTraffic')[0].getContext('2d');
    var pageViewsCtx = $('#pageViews')[0].getContext('2d');

    var siteTrafficChart = new Chart(siteTrafficCtx, {
        type: 'line',
        data: {
            labels: ['Sep 21', 'Sep 22', 'Sep 23', 'Sep 24', 'Sep 25', 'Sep 26', 'Sep 27'],
            datasets: [{
                label: 'Session',
                backgroundColor: 'rgb(229, 243, 249)',
                borderColor: 'rgb(24, 142, 197)',
                data: [5, 6, 8, 10, 6, 9, 5]
            }]
        },
        options: {
            responsive: true
        }
    });

    var pageViewsChart = new Chart(pageViewsCtx, {
        type: 'pie',
        data: {
            datasets: [{
                data: [70, 12.3, 7.5, 6.2, 4],
                backgroundColor: [
                    'rgb(54, 105, 201)',
                    'rgb(218, 59,33)',
                    'rgb(253, 152, 39)',
                    'rgb(28, 149, 35)',
                    'rgb(151, 20, 151)'
                ]
            }],
            labels: ['Chrome', 'Safari', 'Firefox', 'Internet Explorer', 'Android Browser'],
        },
        options: {
            responsive: true
        }
    });
});