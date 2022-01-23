function profileOverviewController() {
    var profileOverviewView;
    var profileTileTemplate;
    var userId = session.get("userId");
    var amountOfUsersToShow = 5;
    var startingPoint = 0;
    var endPoint = amountOfUsersToShow;
    var selectedUsers;

    function initialize() {
        var profileOverviewRequest = $.get("views/profiles/profile_overview.html");
        var profileTileRequest = $.get("views/templates/profile_tile.html");

        if (session.get("status") === "logged in" || session.get("userId") !== undefined) {
            $.when(profileOverviewRequest, profileTileRequest)
                .done(function(profileOverviewResponse, profileTileResponse) {
                    setup(profileOverviewResponse[0], profileTileResponse[0]);
                })
                .fail(error);
        } else {
            window.alert("Om bij dit gedeelte van de website te komen moet u ingelogd zijn. Maak hierbij een account aan door op registreren te klikken.")
        }
    }

    function setup(profileOverviewResponse, profileTileResponse) {
        //load the manual-content into memory
        profileOverviewView = $(profileOverviewResponse);
        profileTileTemplate = $(profileTileResponse);

        profileOverviewView.find(".hobby_form").on("checkbox", function () {
            handleFilterHobby();
        });
        profileOverviewView.find(".age_form").on("checkbox", function () {
            handleFilterAge();
        });
        profileOverviewView.find(".destination_form").on("checkobx", function () {
            handleFilterDestination();
        });
        profileOverviewView.find(".gender_form").on("checkbox", function () {
            handleFilterGender();
        });

        profileOverviewView.find(".filterContent_btn").click(function(){
            $(".filter_container").show();
        });

        profileOverviewView.find(".filter_head").click(function(){
            $(".filter_container").hide();
        });

        profileTileTemplate.find(".favorite_btn").click(function(){
            $(this).toggleClass('far');
            $(this).toggleClass('fas');
        });

        loadProfiles();
        profileOverviewView.find("#next").click(function() {
            if (selectedUsers.length == amountOfUsersToShow) {
                startingPoint += amountOfUsersToShow;
                endPoint += amountOfUsersToShow;
                loadProfiles();
            }
        });
        profileOverviewView.find("#previous").click(function() {
            if (startingPoint !== 0) {
                startingPoint -= amountOfUsersToShow;
                endPoint -= amountOfUsersToShow;

                loadProfiles();
            }
        });
        profileOverviewView.find("#amountOfUsers").on("change", function () {
            amountOfUsersToShow = profileOverviewView.find("#amountOfUsers").val();
            endPoint = amountOfUsersToShow;
            startingPoint = 0;
            loadProfiles();
        });
        handleAddFavorite();
        $(".container").empty().append(profileOverviewView);
    }

    function loadProfiles() {
        databaseManager
            .query("SELECT * FROM `user` WHERE isAdmin = 0 AND id != ?", [userId])
            .done(function (data) {
                console.log(data);
                displayProfiles(data);
                    $.each(data, function (index, value) {
                        var user = value;
                    })
            }).fail(error);
    }

    function displayProfiles(data) {
        profileOverviewView.find(".profiles").empty();

        console.log("showing users " + startingPoint + " through " + endPoint + " with " + amountOfUsersToShow + " users");
        selectedUsers = data.slice(startingPoint, endPoint);
        console.log(selectedUsers);

        for (var i = 0; i < selectedUsers.length; i++) {
            var user = selectedUsers[i] || {};
            var profileTile = profileTileTemplate.clone();
            if (user.username !== undefined) {
                if (user.profilePicture !== null) {
                    var image = new Image();
                    image.src = user.profilePicture;
                    profileTile.find(".profile_img").attr("src", image.src);
                } else {
                    profileTile.find(".profile_img").attr("src", "assets/img/user_icon.jpg");
                }

                profileTile.find(".user_id").html(user.id);

                profileTile.find(".profile_header").html(user.username);
                profileTile.find(".profile_body").html(user.biography);

                profileTile.data("user", user);

                profileOverviewView.find(".profiles").append(profileTile);

                databaseManager
                    .query("SELECT * FROM userfavorites WHERE user_id = ?", [userId])
                    .done(function (data) {
                            for(var i = 0; i < data.length; i++) {
                                console.log(data[i].favorite_id);
                                console.log(user.id);

                            }
                    }).fail(function () {

                });
            }
            profileTile.find(".favorite_btn").on("click", function () {
                var user = $(this).parent().parent().parent().parent().data(user);

                console.log( "testadsfdasfadsdfsa" , user.user.id);
                handleAddFavorite(user.user.id);
                if(".favorite_btn far") {
                    $(this).removeClass("far fa-star").addClass("fas fa-star");
                } else if (".favorite_btn fas") {
                    $(this).removeClass("far fa-star").addClass("far fa-star");
                }
            });
            profileTile.find(".profile_info_link").on("click", function() {
                var user = $(this).parent().parent().parent().data(user);
                console.log("de user", user);
                console.log("user.user", user.user.id );

                loadController(CONTROLLER_PROFILE_DETAILS, {
                    user: user
                });
            });

        }
        return false;
    }

    function handleAddFavorite(buddyId) {
                databaseManager
                    .query("INSERT INTO `userfavorites` (user_id, favorite_id) VALUES ( ?, ?);", [userId, buddyId])
                    .done(function () {
                        console.log(userId, buddyId)
                    })
            }

    function error() {
        $(".container").html("Failed to load content!")
    }

    //Run the initialize function to kick things off
    initialize();
}