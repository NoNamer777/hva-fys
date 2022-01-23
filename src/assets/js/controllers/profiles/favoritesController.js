function favoritesController() {

    var favoritesView;
    var profileTileTemplate;
    var DEFAULT_LIMIT = 20;
    var DEFAULT_OFFSET = 0;
    var DEFAULT_PAGE = 1;
    var limit = DEFAULT_LIMIT;
    var offset = DEFAULT_OFFSET * limit;
    var page;
    var userId = session.get("userId"); //De id van de ingelogde gebruiker.

    function initialize() {
        var favoriteOverviewRequest = $.get("views/user_favorite.html");
        var profileTileRequest = $.get("views/templates/profile-tile.html");

        $.when(favoriteOverviewRequest, profileTileRequest)
            .done(function (favoriteOverviewResponse, profileTileResponse) {
                setup(favoriteOverviewResponse[0], profileTileResponse[0])
            })
            .fail(error);
    }

    function setup(favoriteOverviewResponse, profileTileResponse) {
        //load the manual-content into memory
        favoritesView = $(favoriteOverviewResponse);
        profileTileTemplate = $(profileTileResponse);

        $(".container").empty().append(favoritesView);

        handleShowUsers();
    }

    function handleShowUsers(query, insertValues) { // Haalt de users uit de database en stopt ze in een profile.
        insertValues = [userId, limit, offset];
        query = "SELECT U.*, CASE WHEN U.lastNamePrefix IS NULL THEN CONCAT(U.firstName, ' ', U.lastName) ELSE CONCAT(U.firstName,' ',U.lastNamePrefix,' ',U.lastName) END AS fullname FROM userfavorites F  INNER JOIN user U on F.favorite_id = U.id WHERE F.user_id = ? AND U.isAdmin = 0 GROUP BY U.id LIMIT ? OFFSET ?";
        databaseManager
            .query(query, insertValues)
            .done(function (data) {
                favoritesView.find(".user_profiles").empty();
                $.each(data, function (index, value) {
                    var profile = value;
                    var profileTile = profileTileTemplate.clone();
                    var fullname = profile.firstName+" "+(profile.lastNamePrefix+" " || " ")+profile.lastName+", "+(profile.birthdate);
                    var birthday = profile.birthdate;
                    var picture = profile.profilePicture;
                    var age = getAge(birthday);
                    var favID = profile.id;

                    function getAge(birthday) { // rekent leeftijd uit van geboortedatum
                        var today = new Date();
                        var birthDate = new Date(birthday);
                        var age = today.getFullYear() - birthDate.getFullYear();
                        var m = today.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                        }
                        return age;
                    }
                   getAge(birthday);

                    if (picture !== null) { // stopt de profielfoto van de gebruiker in het profiel en als die er geen een heeft krijgt hij een standaard afbeelding.
                        profileTile.find(".profile_picture").attr("src", picture );
                    } else {
                        profileTile.find(".profile_picture").attr("src", "assets/img/user.png");
                    }
                    if(profile.gender === 'M' ) { // plaatst voor elk geslacht het juiste icoon.
                        profileTile.find(".hidden_gender").append("<i class='fas fa-mars'></i>");
                    } else {
                        profileTile.find(".hidden_gender").append("<i class='fas fa-venus'></i>");
                    }

                    profileTile.find(".profile_name").html(profile.fullname).append(" "+age);
                    profileTile.find(".profile_body_favorite").html(profile.biography);
                    profileTile.find(".favorite_btn").on("click", function () { // Deze function dubbelcheckt of de gebruiker zijn favoriet wil verwijderen.
                        var confirmed = confirm("Weet je zeker dat je je Buddy wil verwijderen?");

                        if (confirmed){
                            handleRemoveFavorite(profile.id);
                        }
                    });
                    favoritesView.find(".user_profiles").append(profileTile);
                })
            })
            .fail(function (reason) {
                console.log(reason);
            });

        var params = getSearchParams();
        console.log(params);
    }

    function handleRemoveFavorite(favorite_id) { // verwijderd de favoriet uit de database.
        databaseManager
            .query("DELETE FROM userfavorites WHERE user_id = ? AND favorite_id = ?", [userId, favorite_id])
            .done(function () {
                handleShowUsers();
            })
            .fail(function (reason) {
                console.log(reason);
            })
    }

    function error() {
        $(".container").html("Failed to load content!")
    }

    //Run the initialize function to kick things off
    initialize();
}