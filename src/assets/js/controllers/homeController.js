/**
 * Controller for the index page
 *
 * @author Jonathan van Veen
 */
function homeController() {
    var homeView;
    var reviewTileView;

    function initialize() {
        var reviewRequest = $.get("views/home.html");
        var reviewTileRequest = $.get("views/templates/review-tile.html");

        $.when(reviewRequest, reviewTileRequest)
            .done(function (reviewResponse, reviewTileResponse) {
                setup(reviewResponse[0], reviewTileResponse[0])
            })
            .fail(error);
    }

    function setup(reviewResponse, reviewTileResponse) {
        homeView = $(reviewResponse);
        reviewTileView = $(reviewTileResponse);

        var currentUser = session.get("userId");
        var currentUserName;

        if (currentUser !== undefined) {
            databaseManager
                .query("SELECT firstName, lastNamePrefix, lastName FROM user WHERE id = ?", [currentUser])
                .done(function (data) {
                    var user = data[0] || {}; //get the first user from the database
                    if (user && user !== undefined) {
                        if (user.lastNamePrefix !== null) {
                            currentUserName = user.firstName + " " + user.lastNamePrefix + " " + user.lastName;
                        } else {
                            currentUserName = user.firstName + " " + user.lastName;
                        }
                    }
                    homeView.find("h1 span.user").html((currentUserName ? ', ' + currentUserName : ''));
                }).fail(function (reason) {
                console.log(reason);
            });

            showReviews();
        }

        homeView.find("a").on("click", handleClick);


        homeView.find(".frontpage_form").on("submit", function () {
            loadController(CONTROLLER_REGISTRATION);

            //Return false to prevent the form submission from reloading the page.
            return false;
        });

        homeView.find(".recensie_link").on("click", function () {
            loadController(CONTROLLER_REVIEWS);

            return false;
        });



        $(".container").empty().append(homeView);
    }

    function error() {
        $(".container").html("Failed to load Home!");
    }

    function showReviews() {
        homeView.find(".site_review").empty();
        homeView.find(".travel_review").empty();

        databaseManager
            .query("SELECT R.*, U.username, U.profilePicture FROM review R LEFT JOIN user U on R.user_id = U.id WHERE isAdmin = 0 AND reviewType = 'site' LIMIT 4")
            .done(function (data) {
                $.each(data, function (index, review) {
                    var homeTile = reviewTileView.clone();
                    homeTile.find(".review_head").html(review.username);
                    homeTile.find(".review_body").html(review.text);
                    homeView.find(".site_reviews").append(homeTile);

                })
            }).fail(function (reason) {
            console.log(reason)
        });
        databaseManager
            .query("SELECT R.*, U.username, U.profilePicture FROM review R LEFT JOIN user U on R.user_id = U.id WHERE isAdmin = 0 AND reviewType = 'trip' LIMIT 4")
            .done(function (data) {
                $.each(data, function (index, review) {
                    var homeTile = reviewTileView.clone();
                    homeTile.find(".review_head").html(review.username);
                    homeTile.find(".review_body").html(review.text);
                    homeView.find(".travel_reviews").append(homeTile);

                })
            }).fail(function (reason) {
            console.log(reason)
        })
    }

    function handleClick() {
    //Get the data-controller from the clicked element (this)
    var controller = $(this).attr("data-controller");
    console.log(controller);

    //Pass the action to a new function for further processing.
    loadController(controller);

    //return false to prevent reloading the page.
    return false;
    }

    initialize();
}