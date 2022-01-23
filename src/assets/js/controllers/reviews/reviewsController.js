/**
 * Responsible for handeling the actions on the review pages
 *
 *  @author Mike Korver
 */
function reviewsController() {
    //Reference to our loaded view
    var reviewView;
    var reviewTileView;

    function initialize() {
        var reviewRequest = $.get("views/reviews.html");
        var reviewTileRequest = $.get("views/templates/review_tile.html");

        $.when(reviewRequest, reviewTileRequest)
            .done(function (reviewResponse, reviewTileResponse) {
                setup(reviewResponse[0], reviewTileResponse[0]);
            })
            .fail(error);
    }

    // Called when the reviews.html has been loaded
    function setup(reviews, reviewTile) {
        //load the reviews-content into memory
        reviewView = $(reviews);
        reviewTileView = $(reviewTile);

        reviewView.find(".review_send").on("submit", handleReview);

        var buttonSite = reviewView.find(".review_site_button");
        var buttonTrip = reviewView.find(".review_trip_button");
        var buttonCreate = reviewView.find(".review_create_button");

        var containerSite = reviewView.find(".review_site");
        var containerTrip = reviewView.find(".review_trip");
        var containerCreate = reviewView.find(".review_create");

        buttonSite.on('click', function (e) {
            buttonSite.addClass('active');
            buttonTrip.removeClass('active');
            buttonCreate.removeClass('active');

            containerSite.removeClass('hide');
            containerTrip.addClass('hide');
            containerCreate.addClass('hide');

        });

        buttonTrip.on('click', function (e) {
            buttonSite.removeClass('active');
            buttonTrip.addClass('active');
            buttonCreate.removeClass('active');

            containerSite.addClass('hide');
            containerTrip.removeClass('hide');
            containerCreate.addClass('hide');

        });

        buttonCreate.on('click', function (e) {
            buttonSite.removeClass('active');
            buttonTrip.removeClass('active');
            buttonCreate.addClass('active');

            containerSite.addClass('hide');
            containerTrip.addClass('hide');
            containerCreate.removeClass('hide');

        });

        showReviews();
        $(".container").empty().append(reviewView);

        return false;
    }

    function handleReview() {
        var title = reviewView.find("[name='title']").val();
        var reviewType = reviewView.find("[name='selectType']").val();
        var text = reviewView.find("[name='review']").val();
        var review = [title, reviewType, text, session.get("userId")];

        databaseManager
            .query("INSERT INTO review(title, reviewType, text, user_id) VALUES (?, ?, ?, ?)", review)
            .done(function () {
                window.alert("U heeft met succes een review gepost als " + reviewType);
                reviewView.find("[name='title']").val("");
                reviewView.find("[name='review']").val("");
                showReviews();
            }).fail(function (reason) {
            console.log(reason)
        });

        return false;
    }

    function showReviews() {
        reviewView.find(".review_site").empty();
        reviewView.find(".review_trip").empty();

        databaseManager
            .query("SELECT R.*, U.username, U.profilePicture FROM review R LEFT JOIN user U on R.user_id = U.id WHERE isADMIN = 0")
            .done(function (data) {
                $.each(data, function (index, review) {
                    var reviewTile = reviewTileView.clone();
                    var profilePicture = review.profilePicture;
                    if (profilePicture !== null){
                        reviewTile.find(".review_picture img").attr("src", review.profilePicture);
                    }
                    else {
                        reviewTile.find(".review_picture img").attr("src", "assets/img/user.png");
                    }
                    reviewTile.find(".review_title").html(review.title);
                    reviewTile.find(".review_content").html(review.text);
                    reviewTile.find(".review_username").html(review.username);


                    if (review.reviewType === "site") {
                        reviewView.find(".review_site").append(reviewTile);
                    } else {
                        reviewView.find(".review_trip").append(reviewTile);
                    }

                })
            }).fail(function (reason) {
            console.log(reason)
        });
        return false;
    }

    function error() {
        $(".container").html("Failed to load content!")
    }

    //Run the initialize function to kick things off
    initialize();
}