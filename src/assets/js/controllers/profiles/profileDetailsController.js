function profileDetailsController(controllerData) {

    var profileDetailView;
    var user;
    var age;
    var gender;

    function initialize() {
        console.log(controllerData.user);
        if(controllerData.user !== undefined) {
            user = controllerData.user.user;
            console.log(user);
        } else {
            loadController(CONTROLLER_PROFILE_OVERVIEW);
        }

        $.get("views/profiles/profile-details.html")
            .done(setup)
            .fail(error);
    }

    function setup(data) {
        profileDetailView = $(data);
        console.log(user);
        loadprofile();

        profileDetailView.find(".messageButton").on("click", function () {
           profileDetailView.find("#overlay").css("display", "block");
           profileDetailView.find("#popup").css("display", "block");
           $("body").css("overflow", "hidden");
        });

        profileDetailView.find(".closePopup").on("click", function () {
            profileDetailView.find("#overlay").css("display", "none");
            profileDetailView.find("#popup").css("display", "none");
            $("body").css("overflow", "scroll");
        });

        profileDetailView.find(".sendMessageButton").on("click", function () {
            var subject = profileDetailView.find(".messageSubject").val();
            var messageContent = profileDetailView.find(".messageContent").val();
            if (subject !== "" && messageContent !== "") {
                databaseManager
                    .mail("fys2019@mailinator.com", subject, messageContent, "")
                    .done(function (data) {
                    }).fail(function (reason) {
                });

                var confirmMessage = document.createElement("div");
                var boldText = document.createElement("b");
                confirmMessage.style.color = "green";
                boldText.innerHTML = "Uw bericht is succesvol verstuurd en u kunt dit venster sluiten";
                confirmMessage.append(boldText);

                profileDetailView.find("#messageWorkArea").empty().append(confirmMessage);
            } else {
                if (subject === "") {
                    profileDetailView.find("#subjectText").css("color", "red");
                    profileDetailView.find(".messageSubject").css("border-color", "red");
                } else {
                    profileDetailView.find("#subjectText").css("color", "green");
                    profileDetailView.find(".messageSubject").css("border-color", "green");
                }
                if (messageContent === "") {
                    profileDetailView.find("#messageContentText").css("color", "red");
                    profileDetailView.find(".messageContent").css("border-color", "red");
                } else {
                    profileDetailView.find("#messageContentText").css("color", "green");
                    profileDetailView.find(".messageContent").css("border-color", "green");
                }
            }
        });

        $(".container").empty().append(profileDetailView);
    }

    function loadprofile() {
        databaseManager
            .query("SELECT U.*, group_concat(I.name) as interests, S.showAge, S.showBiography, S.showCountry, S.showGender, S.showHobbies, " +
                "S.showName, S.showProfilePicture, S.showVacationDestination from user U \n" +
                "LEFT OUTER JOIN userinterest UI ON U.id = UI.user_id \n" +
                "LEFT OUTER JOIN interest I on I.id = UI.interest_id\n" +
                "INNER JOIN setting S on S.userId = U.id" +
                " WHERE U.id = ?" +
                " GROUP BY U.id;", [user.id])
            .done(function(data) {
                displayProfile(data)
            }).fail(function (reason) {
            console.log(reason)
        });

    }

    function displayProfile(data) {

        if (data[0].showProfilePicture === 1) {
            if (data[0].profilePicture !== null) {
                var image = new Image();
                image.src = data[0].profilePicture;
                profileDetailView.find(".profile_img").attr("src", image.src);
            } else {
                profileDetailView.find(".profile_img").attr("src", "assets/img/user_icon.jpg");
            }
        } else {
            profileDetailView.find(".profile_img").attr("src", "assets/img/user_icon.jpg");
        }
            profileDetailView.find(".name").html(data[0].username);

        if (data[0].showBiography === 1) {
            profileDetailView.find(".bio").html(data[0].biography);
        } else {
            profileDetailView.find(".bio").html("De gebruiker wilt zijn/haar bio niet vrijstellen.");
        }

        calculateAge(data[0].birthdate);
        if (data[0].showAge === 1) {
            profileDetailView.find(".age").html(age);
        } else {
            profileDetailView.find(".age").html("De gebruiker wilt zijn/haar leeftijd niet vrijstellen.")
        }

        gender = calculateGender(data[0].gender);
        if (data[0].showGender === 1) {
            profileDetailView.find(".gender").html(gender);
        }
        else {
            profileDetailView.find(".gender").html("De gebruiker wilt zijn/haar geslacht niet vrijstellen");
        }

        if (data[0].showCity === 1) {
            profileDetailView.find(".city").html(data[0].name);
        }
        else {
            profileDetailView.find(".city").html("De gebruiker wilt zijn/haar stad niet vrijstellen");
        }

        if (data[0].showHobbies === 1) {
            if (data[0].interests !== null) {
                var hobby = data[0].interests;
                var shobby = hobby.split(",");
                for (var i = 0; i < shobby.length; i++) {
                    shobby[i] = " " + shobby[i];
                }
                profileDetailView.find(".hobby").html(shobby.toString());
            } else {
                profileDetailView.find(".hobby").html("De gebruiker heeft geen hobby's opgegeven.");
            }
        } else {
            profileDetailView.find(".hobby").html("De gebruiker wilt zijn/haar hobbies niet vrijstellen");
        }
        if (data[0].showvacationDestination === 1) {
            profileDetailView.find(".vacation").html(data[0].vacationDestination);
        } else {
            profileDetailView.find(".vacation").html("De gebruiker wilt zijn/haar vakantie niet vrijstellen");
        }



        profileDetailView.find(".back").on("click", function () {
            loadController(CONTROLLER_PROFILE_OVERVIEW);

            return false;
        });
    }

    function calculateAge(dateOfBirth) {
        var birth = new Date(dateOfBirth);
        var birthYear = birth.getFullYear();

        var today = new Date();
        var currentYear = today.getFullYear();

        age = currentYear - birthYear;

        return age;
    }

    function calculateGender(gender) {
        if (gender === "M") {
            gender = "Man";
        } else if (gender === "F") {
            gender = "Vrouw";
        } else {
            gender = "Anders"
        }
        return gender;
    }


    $('.favorite_btn').on('click', function (e) {
        $(this).toggleClass('far');
        $(this).toggleClass('fas');
    });

    function error() {
        $(".container").html("Failed to load content!")
    }

    //Run the initialize function to kick things off
    initialize();
}