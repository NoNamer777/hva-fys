/**
 * Responsible for handling the actions happening on admin home/statistics view
 *
 * @author Miguel Korn
 */
function adminHomeController() {
    var adminHomeView, totalUsers;

    function initialize() {
        $.get("views/admin/home.html")
            .done(setup)
            .fail(error);
    }

    function setup(data) {
        adminHomeView = $(data);
        resetCanvas();

        $(".container").empty().append(adminHomeView);

        pieOptions = {
            events: [],
            tooltips: {
                enabled: false
            },
            responsive: true,
            animation: {
                duration: 500,
                easing: "easeOutQuart",
                onComplete: function () {
                    var ctx = this.chart.ctx;
                    ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontFamily, 'normal', Chart.defaults.global.defaultFontFamily);
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'bottom';

                    this.data.datasets.forEach(function (dataset) {
                        for (var i = 0; i < dataset.data.length; i++) {
                            var model = dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model,
                                total = dataset._meta[Object.keys(dataset._meta)[0]].total,
                                mid_radius = model.innerRadius + (model.outerRadius - model.innerRadius) / 2,
                                start_angle = model.startAngle,
                                end_angle = model.endAngle,
                                mid_angle = start_angle + (end_angle - start_angle) / 2;

                            var x = mid_radius * Math.cos(mid_angle);
                            var y = mid_radius * Math.sin(mid_angle);

                            ctx.fillStyle = (i === 3) ? '#444' : '#FFF';// Darker text color for lighter background

                            var percent = String(Math.round(dataset.data[i] / total * 100)) + "%";
                            //Don't Display If Legend is hide or value is 0
                            // if (dataset.data[i] !== 0 && dataset._meta[0].data[i].hidden !== true) {
                            ctx.fillText(dataset.data[i], model.x + x, model.y + y);
                            // Display percent in another line, line break doesn't work for fillText
                            ctx.fillText(percent, model.x + x, model.y + y + 15);
                            // }
                        }
                    });
                }
            }
        };

        showUserStatistics();
        showBuddyStatistics();
        showCountryStatistics();
    }

    function showUserStatistics() {
        databaseManager
            .query("SELECT * FROM user WHERE isAdmin = 0")
            .done(function (data) {
                totalUsers = data.length;

                var usersData = {
                    total: totalUsers,
                    totalMale: 0,
                    totalFemale: 0
                };

                $.each(data, function (index, user) {
                    if (user.gender === 'M') {
                        usersData.totalMale += 1;
                    } else if (user.gender === 'F') {
                        usersData.totalFemale += 1;
                    }
                });

                var pieData = {
                    datasets: [{
                        data: [usersData.totalMale, usersData.totalFemale],
                        backgroundColor: [
                            'rgb(54, 105, 201)',
                            'rgb(218, 59,33)'
                        ]
                    }],
                    labels: ['Man', 'Vrouw']
                };

                var numberUsersCtx = $("#numberUsers")[0].getContext("2d");
                var numberUsersChart = new Chart(numberUsersCtx, {
                    type: 'pie',
                    data: pieData,
                    options: pieOptions
                });

                adminHomeView.find(".box h4")[0].append(" - Totaal: " + usersData.total);
            })
            .fail(function (reason) {
                console.log(reason);
            });
    }

    function showBuddyStatistics() {
        databaseManager
            .query("SELECT UF.id, U.gender AS userGender, F.gender AS favoriteGender FROM userfavorites UF INNER JOIN user U ON U.id = UF.user_id INNER JOIN user F on F.id = UF.favorite_id")
            .done(function (data) {
                var buddyData = {
                    total: data.length,
                    totalMToM: 0,
                    totalMToV: 0,
                    totalVToV: 0
                };

                $.each(data, function (index, connection) {
                    (connection.userGender === 'M') ?
                        ((connection.favoriteGender === 'M') ?
                            buddyData.totalMToM += 1 :
                            buddyData.totalMToV += 1) :
                        ((connection.favoriteGender === 'M') ?
                            buddyData.totalMToV += 1 :
                            buddyData.totalVToV += 1)
                });

                var pieData = {
                    datasets: [{
                        data: [buddyData.totalMToM, buddyData.totalMToV, buddyData.totalVToV],
                        backgroundColor: [
                            'rgb(54, 105, 201)',
                            'rgb(218, 59,33)',
                            'rgb(253, 152, 39)'
                        ]
                    }],
                    labels: ['Man - Man', 'Man - Vrouw', 'Vrouw - Vrouw']
                };

                var numberBuddiesCtx = $("#numberBuddies")[0].getContext("2d");
                var numberBuddiesChart = new Chart(numberBuddiesCtx, {
                    type: 'pie',
                    data: pieData,
                    options: pieOptions
                });

                adminHomeView.find(".box h4")[1].append(" - Totaal: " + buddyData.total);
            })
            .fail(function (reason) {
                console.log(reason);
            })
    }

    function showCountryStatistics() {
        databaseManager
            .query("SELECT C.*, COUNT(U.vacationDestination) as countUsers FROM country C LEFT OUTER JOIN user U ON U.vacationDestination = C.id GROUP BY C.id")
            .done(function (data) {
                var usersWithoutDestination = totalUsers;
                var labelList = [];
                var dataList = [];
                var color = Chart.helpers.color;

                $.each(data, function (index, country) {
                    var users = country.countUsers;
                    labelList[index] = country.name;
                    dataList[index] = users;
                    usersWithoutDestination -= users;
                });

                labelList.push("Bestemmingsloos");
                dataList.push(usersWithoutDestination);

                var barData = {
                    labels: labelList,
                    datasets: [{
                        label: "landen",
                        backgroundColor: color('#4dc9f6').alpha(0.5).rgbString(),
                        borderColor: '#4dc9f6',
                        data: dataList
                    }]
                };
                var barOptions = {
                    elements: {
                        rectangle: {
                            borderWidth: 2
                        }
                    },
                    responsive: true,
                    legend: {
                        display: false,
                        position: 'right'
                    },
                    scales: {
                        xAxes: [{
                            ticks: {
                                beginAtZero: true,
                                callback: function (value) { if (Number.isInteger(value)) { return value; } },
                                stepSize: 1
                            }
                        }]
                    }
                };

                var usersCountryCtx = $("#usersCountry")[0].getContext("2d");
                var usersCountryChart = new Chart(usersCountryCtx, {
                    type: 'horizontalBar',
                    data: barData,
                    options: barOptions
                });
            })
            .fail(function (reason) {
                console.log(reason);
            })
    }

    function resetCanvas() {
        // remove all canvasses and append new ones
        adminHomeView.find("#numberUsers").remove();
        adminHomeView.find("#numberBuddies").remove();
        adminHomeView.find("#usersCountry").remove();

        var boxes = adminHomeView.find(".box");
        $(boxes[0]).append("<canvas id=\"numberUsers\"></canvas>");
        $(boxes[1]).append("<canvas id=\"numberBuddies\"></canvas>");
        $(boxes[2]).append("<canvas id=\"usersCountry\"></canvas>");
    }

    function error() {
        $(".container").html("Failed to load Home!")

    }

    initialize()
}