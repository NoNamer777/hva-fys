/**
 * Controls everything that happens on the UserSettings view
 * @author Oscar Wellner
 */
function userSettingsController() {
    //reference to the loaded view.
    var userSettingsView;

    var targetList;
    var selectExist;
    var knownUserSettings;              var knownVisibilityName;
    var knownSettingsVisibility;        var knownVisibilityCity;
    var knownEmail;                     var knownVisibilityCountry;
    var knownName;                      var knownVisibilityAge;
    var knownCity;                      var knownVisibilityGender;
    var knownCountry;                   var knownVisibilityProfilePicture;
    var knownDateOfBirth;               var knownVisibilityHobbies;
    var knownGender;                    var knownVisibilityBiography;
    var knownProfilePicture = new Image();    var knownVisibilityVacationDestination;
    var knownHobbies;                   var knownPassword;
    var knownBiography;                 var knownFirstName;
    var knownVacationDestination;       var knownLastNamePrefix;
    var knownLastName;
    var filledInValues = new Array(13);
    var settingsToChange = new Array(13);
    var visibilitySettingsToChange = new Array(9);
    var visibilityUpdated = new Array(9);
    var controller;
    var age;
    var dateOfBirth;
    var hobbies = [];
    var chosenHobbies = [];
    var selectedHobby;
    var reader = new FileReader();
    var new_profile_picture;

    function initialize() {
        $.get("views/user_settings.html")
            .done(setup)
            .fail(error);
    }

    //is called when user_settings.html is loaded.
    function setup(data) {
        userSettingsView = $(data);

        //adds click events to the found elements.
        userSettingsView.find("#saveSettings").on("click", saveChanges);
        userSettingsView.find("#deleteAccount").on("click", deleteAccount);
        userSettingsView.find("#addCustomHobby").on("click", addCustomHobby);
        userSettingsView.find("#removeHobby").on("click", removeHobby);
        userSettingsView.find("#addHobbyFromList").on("click", addHobby);

        userSettingsView.find("#newPassword").on("keypress keyup keydown",function() {
            var pass = userSettingsView.find(this).val();
            var score = scorePassword(pass);
            checkPassStrength(score);
        });

        userSettingsView.find("#profilePictureInput").on("change", function () {
            var file = this.files[0];
            reader.onloadend = function() {
                userSettingsView.find("#currentProfilePicture").attr("src", reader.result);
                new_profile_picture = reader.result;
            };
            reader.readAsDataURL(file);
        });

        getDataFromDatabase();

        databaseManager
            .query("SELECT * FROM country")
            .done(function (data) {
                var vacationDestinations = userSettingsView.find("#vacationDesInput");
                var defaultDestination = document.createElement("option");
                defaultDestination.innerHTML = "Selecteer uw vakantie bestemming.";
                defaultDestination.value = undefined;
                vacationDestinations.append(defaultDestination);
                for (var i = 0; i < data.length; i++) {
                    var option = document.createElement("option");
                    option.innerHTML = data[i].name;
                    option.value = data[i].name;
                    vacationDestinations.append(option);
                }
            }).fail(function (reason) {
            console.log(reason);
        });

        //sets the targeted list to the list with available hobbies.
        targetList = userSettingsView.find("#availableHobbies");

        //empties the content-div ind index.html and adds the data that is in user_settings.html to it.
        $(".container").empty().append(userSettingsView);
    }

    //Is called when user_settings.html is not found.
    function error() {
        $(".container").html("Failed to load content!");
    }

    //Checks how strong the new password is.
    function scorePassword(pass) {
        var score = 0;
        if (!pass)
            return score;

        //award every unique letter until 5 repetitions
        var letters = new Object();
        for (var i = 0; i < pass.length; i++) {
            letters[pass[i]] = (letters[pass[i]] || 0) + 1;
            score += 5.0 / letters[pass[i]];
        }

        //bonus points for mixing it up
        var variations = {
            digits: /\d/.test(pass),
            lower: /[a-z]/.test(pass),
            upper: /[A-Z]/.test(pass),
            nonWords: /\W/.test(pass)
        };

        var variationCount = 0;
        for (var check in variations) {
            variationCount += (variations[check] === true) ? 1 : 0;
        }
        score += (variationCount - 1) * 10;

        return score;
    }

    //setts the src of the password_strength meter to show the user how strong is password is.
    function checkPassStrength(score) {
        var src;
        if (score > 80) {
            src = "assets/img/very_strong_password.png";
        } else if (score > 60) {
            src = "assets/img/strong_password.png";
        } else if (score >= 40) {
            src = "assets/img/medium_password.png";
        } else if (score >= 30) {
            src = "assets/img/less_weak_password.png";
        } else if (score >= 10) {
            src = "assets/img/weak_password.png";
        } else {
            src = "assets/img/weak_password.png";
        }
        userSettingsView.find("#passwordStrength").attr("src", src);
    }

    //saves all changes
    function saveChanges() {
        //finds the email change and adds it to the to be changed data array.
        var newEmailAddress = userSettingsView.find("#newEmail").val();
        if (newEmailAddress !== "") {
            filledInValues[4] = newEmailAddress;
            controller = "confirm-email";
            loadController(controller);
        }

        //finds the password change and adds it to the to be changed data array.
        var new_password = userSettingsView.find("#newPassword").val();
        var confirm_new_password = userSettingsView.find("#confirmNewPassword").val();
        if (new_password !== confirm_new_password) {
            userSettingsView.find("#passwordWarning").html("Het ingevulde wachtwoord komt niet overeen, probeer opnieuw!");
        } else if (new_password === confirm_new_password && confirm_new_password !== "") {
            userSettingsView.find("#passwordWarning").html("");
            filledInValues[10] = new_password;
            controller = "confirm-password";
            loadController(controller);
        }

        var firstName = userSettingsView.find("#firstName").val();
        var lastName = userSettingsView.find("#lastName").val();
        var lastNamePrefix = userSettingsView.find("#lastNamePrefix").val();
        if (firstName !== "") {
            filledInValues[5] = firstName;
        }
        if ((lastNamePrefix === "-") && (knownLastNamePrefix !== lastNamePrefix)) {
            lastNamePrefix = null;
            filledInValues[9] = null;
        } else if ((lastNamePrefix !== "" && (lastNamePrefix === "")) ||
            (lastNamePrefix !== "" && (knownLastNamePrefix !== lastNamePrefix))) {
            filledInValues[9] = lastNamePrefix;
        }
        if (lastName !== "") {
            filledInValues[8] = lastName;
        }
        //checks the visibility of the name option.
        if (userSettingsView.find("#visibilityName").is(':checked')) {
            visibilitySettingsToChange[6] = 1;
        } else {
            visibilitySettingsToChange[6] = 0;
        }

        //finds the city data and adds it to the to be changed data array.
        var city = userSettingsView.find("#cityInput").val();
        if (city !== "") {
            filledInValues[2] = city;
        }
        //checks the visibility of the city data.
        if (userSettingsView.find("#visibilityCity").is(':checked')) {
            visibilitySettingsToChange[2] = 1;
        } else {
            visibilitySettingsToChange[2] = 0;
        }

        //finds the country data and adds it to the to be changed data array.
        var country = userSettingsView.find("#countryInput").val();
        if (country !== "default") {
            filledInValues[3] = country;
        }
        //checks the visibility status of the country.
        if (userSettingsView.find("#visibilityCountry").is(':checked')) {
            visibilitySettingsToChange[3] = 1;
        } else {
            visibilitySettingsToChange[3] = 0;
        }

        //finds the date of birth data and adds it to the to be changed data array.
        dateOfBirth = userSettingsView.find("#dOBInput").val();
        if (dateOfBirth !== "") {
            age = calculateAge(dateOfBirth);
            filledInValues[1] = dateOfBirth;
        }
        //checks the visibility status of the age data.
        if (userSettingsView.find("#visibilityAge").is(':checked')) {
            visibilitySettingsToChange[0] = 1;
        } else {
            visibilitySettingsToChange[0] = 0;
        }

        //finds the selected gender data and adds it to the to be changed data array.
        var gender;
        if (userSettingsView.find("#male").attr("checked")) {
            gender = "M";
        } else if (userSettingsView.find("#female").attr("checked")) {
            gender = "F";
        } else if (userSettingsView.find("#other").attr("checked")) {
            gender = "D";
        }
        filledInValues[6] = gender;
        //checks the visibility status of the gender data.
        if (userSettingsView.find("#visibilityGender").is(':checked')) {
            visibilitySettingsToChange[4] = 1;
        } else {
            visibilitySettingsToChange[4] = 0;
        }

        //finds the profile picture data and adds the src (location) of the file to the to be changed data array.
        var current_profile_picture = userSettingsView.find("#currentProfilePicture");
        if (new_profile_picture !== null) {
            if (new_profile_picture !== undefined) {
                filledInValues[11] = new_profile_picture;
            }
            //if no profile picture is known in the DB and nothing is uploaded the standard PP is assigned to the user.
        } else if (current_profile_picture.src === undefined) {
            current_profile_picture.src = "assets/img/user_icon.jpg";
            filledInValues[11] = current_profile_picture.src;
        } else {
            filledInValues[11] = knownProfilePicture;
        }
        //checks the visibility status of the profile picture data.
        if (userSettingsView.find("#visibilityProfilePicture").is(':checked')) {
            visibilitySettingsToChange[7] = 1;
        } else {
            visibilitySettingsToChange[7] = 0;
        }

        //finds the hobbies data and adds the array to the to be changed data array.
        if (chosenHobbies !== undefined) {
            for (var n = 0; n < hobbies.length; n++) {
                if ($.inArray(hobbies[n], chosenHobbies) === -1) {
                    chosenHobbies.push(hobbies[n]);
                }
            }
            filledInValues[7] = chosenHobbies;
        }
        //checks the visibility status of the hobbies data.
        if (userSettingsView.find("#visibilityHobbies").is(':checked')) {
            visibilitySettingsToChange[5] = 1;
        } else {
            visibilitySettingsToChange[5] = 0;
        }

        //finds the biography data and adds it to the to be changed data array.
        var bio = userSettingsView.find("#bioInput").val();
        if (bio !== "") {
            filledInValues[0] = bio;
        }
        //checks the biography data visibility status,
        if (userSettingsView.find("#visibilityBiography").is(':checked')) {
            visibilitySettingsToChange[1] = 1;
        } else {
            visibilitySettingsToChange[1] = 0;
        }

        //finds the vacation destination data and adds it to the to be changed data array.
        var vacationDestination = userSettingsView.find("#vacationDesInput").val();
        if (vacationDestination !== undefined) {
            filledInValues[12] = vacationDestination;
        }
        //checks the visibility status of the vacation destination data.
        if (userSettingsView.find("#visibilityVacationDes").is(':checked')) {
            visibilitySettingsToChange[8] = 1;
        } else {
            visibilitySettingsToChange[8] = 0;
        }

        //checks which values needs to be updated and fills an array with the up-to-date values and passes those values to the DB.
        for (var i = 0; i < filledInValues.length; i++) {
                switch (i) {
                    case 0:
                        if (filledInValues[0] !== undefined) {
                            settingsToChange[0] = filledInValues[0];
                        } else {
                            settingsToChange[0] = knownBiography;
                        }
                        break;
                    case 1:
                        if (filledInValues[1] !== undefined) {
                            settingsToChange[1] = filledInValues[1];
                        } else {
                            var dateOfBirthArray = knownDateOfBirth.split("-");
                            if (dateOfBirthArray[1] < 10) {
                                dateOfBirthArray[1] = "0" + dateOfBirthArray[1];
                            }
                            if (dateOfBirthArray[0] < 10) {
                                dateOfBirthArray[0] = "0" + dateOfBirthArray[0];
                            }
                            settingsToChange[1] = dateOfBirthArray[2] + "-" + dateOfBirthArray[1] + "-" + dateOfBirthArray[0];
                        }
                        break;
                    case 2:
                        if (filledInValues[2] !== undefined) {
                            settingsToChange[2] = filledInValues[2];
                        } else {
                            settingsToChange[2] = knownCity;
                        }
                        break;
                    case 3:
                        if (filledInValues[3] !== undefined) {
                            settingsToChange[3] = filledInValues[3];
                        } else {
                            settingsToChange[3] = knownCountry;
                        }
                        break;
                    case 4:
                        if (filledInValues[4] !== undefined) {
                            settingsToChange[4] = filledInValues[4];
                        } else {
                            settingsToChange[4] = knownEmail;
                        }
                        break;
                    case 5:
                        if (filledInValues[5] !== undefined) {
                            settingsToChange[5] = filledInValues[5];
                        } else {
                            settingsToChange[5] = knownFirstName;
                        }
                        break;
                    case 6:
                        if (filledInValues[6] !== undefined) {
                            settingsToChange[6] = filledInValues[6];
                        } else {
                            settingsToChange[6] = knownGender;
                        }
                        break;
                    case 7:
                        if (filledInValues[7] !== undefined) {
                            settingsToChange[7] = filledInValues[7];
                        } else {
                            settingsToChange[7] = knownHobbies;
                        }
                        break;
                    case 8:
                        if (filledInValues[8] !== undefined) {
                            settingsToChange[8] = filledInValues[8];
                        } else {
                            settingsToChange[8] = knownLastName;
                        }
                        break;
                    case 9:
                        if (filledInValues[9] !== undefined) {
                            settingsToChange[9] = filledInValues[9];
                        } else {
                            settingsToChange[9] = knownLastNamePrefix;
                        }
                        break;
                    case 10:
                        if (filledInValues[10] !== undefined) {
                            settingsToChange[10] = filledInValues[10];
                        } else {
                            settingsToChange[10] = knownPassword;
                        }
                        break;
                    case 11:
                        if (filledInValues[11] !== undefined) {
                            settingsToChange[11] = filledInValues[11];
                        } else {
                            settingsToChange[11] = knownProfilePicture;
                        }
                        break;
                    case 12:
                        if (filledInValues[12] !== undefined) {
                            if (filledInValues[12] !== "-") {
                                settingsToChange[12] = filledInValues[12];
                            } else {
                                settingsToChange[12] = null;
                            }
                        } else {
                            settingsToChange[12] = knownVacationDestination;
                        }
                        break;
                }
        }

        databaseManager
            .query("UPDATE user set password = ?, email = ?, firstName = ?, lastNamePrefix = ?, lastName = ?, " +
                "birthdate = ?, gender = ?, profilePicture = ?, biography = ?, vacationDestination = (" +
                "SELECT id FROM country WHERE name = ?) WHERE id = ?",
                [settingsToChange[10], settingsToChange[4],  settingsToChange[5], settingsToChange[9], settingsToChange[8],
                settingsToChange[1], settingsToChange[6], settingsToChange[11], settingsToChange[0], settingsToChange[12],
                session.get("userId")])
            .done(function() {
                console.log("successfully updated general user to the database!");
            }).fail(function(reason) {
            console.log(reason);
        });

        databaseManager
            .query("UPDATE address set city = ?, country = ? WHERE userId = ?",
                [settingsToChange[2], settingsToChange[3], session.get("userId")])
            .done(function() {
                console.log("successfully updated address data to the database!");
            }).fail(function(reason) {
            console.log(reason);
        });

        var delayInMilliseconds = 1000;
        //first removing all known hobbies and then inserting the new hobbies in the DB.
        databaseManager
            .query("DELETE FROM userinterest WHERE user_id = ?", [session.get("userId")])
            .done(function() {
                console.log("successfully removed all known hobbies from the database!");
                hobbies.splice(0, hobbies.length);
            }).fail(function(reason) {
            console.log(reason);
        });

        setTimeout( function () {
            for (var k = 0; k < settingsToChange[7].length; k++) {
                databaseManager
                    .query("INSERT INTO userinterest(interest_id, user_id) VALUES((SELECT id FROM interest WHERE name = TRIM(?)), ?)",
                        [settingsToChange[7][k], session.get("userId")])
                    .done(function () {
                        console.log("successfully added new hobby to the database!");
                    }).fail(function (reason) {
                    console.log(reason);
                });
            }

            //updates the placeholders and known values fields with the new data.
            getDataFromDatabase();
        }, delayInMilliseconds);

        //checks which visibility statuses need to be updated and fills an array with the up-to-date values. Passes those values to the DB.
        for (var j = 0; j < visibilitySettingsToChange.length; j++) {
            switch (j) {
                case 0:
                    if (visibilitySettingsToChange[0] !== knownVisibilityAge) {
                        visibilityUpdated[0] = visibilitySettingsToChange[0];
                    } else {
                        visibilityUpdated[0] = knownVisibilityAge;
                    }
                    break;
                case 1:
                    if (visibilitySettingsToChange[1] !== knownVisibilityBiography) {
                        visibilityUpdated[1] = visibilitySettingsToChange[1];
                    } else {
                        visibilityUpdated[1] = knownVisibilityBiography;
                    }
                    break;
                case 2:
                    if (visibilitySettingsToChange[2] !== knownVisibilityCity) {
                        visibilityUpdated[2] = visibilitySettingsToChange[2];
                    } else {
                        visibilityUpdated[2] = knownVisibilityCity;
                    }
                    break;
                case 3:
                    if (visibilitySettingsToChange[3] !== knownVisibilityCountry) {
                        visibilityUpdated[3] = visibilitySettingsToChange[3];
                    } else {
                        visibilityUpdated[3] = knownVisibilityCountry;
                    }
                    break;
                case 4:
                    if (visibilitySettingsToChange[4] !== knownVisibilityGender) {
                        visibilityUpdated[4] = visibilitySettingsToChange[4];
                    } else {
                        visibilityUpdated[4] = knownVisibilityGender;
                    }
                    break;
                case 5:
                    if (visibilitySettingsToChange[5] !== knownVisibilityHobbies) {
                        visibilityUpdated[5] = visibilitySettingsToChange[5];
                    } else {
                        visibilityUpdated[5] = knownVisibilityHobbies;
                    }
                    break;
                case 6:
                    if (visibilitySettingsToChange[6] !== knownVisibilityName) {
                        visibilityUpdated[6] = visibilitySettingsToChange[6];
                    } else {
                        visibilityUpdated[6] = knownVisibilityName;
                    }
                    break;
                case 7:
                    if (visibilitySettingsToChange[7] !== knownVisibilityProfilePicture) {
                        visibilityUpdated[7] = visibilitySettingsToChange[7];
                    } else {
                        visibilityUpdated[7] = knownVisibilityProfilePicture;
                    }
                    break;
                case 8:
                    if (visibilitySettingsToChange[8] !== knownVisibilityVacationDestination) {
                        visibilityUpdated[8] = visibilitySettingsToChange[8];
                    } else {
                        visibilityUpdated[8] = knownVisibilityVacationDestination;
                    }
                    break;
            }
        }

        databaseManager
            .query("UPDATE setting set showAge = ?, showBiography = ?, showCity = ?, showCountry = ?, " +
                "showGender = ?, showHobbies = ?, showName = ?, showProfilePicture = ?, showVacationDestination = ? " +
                "WHERE userId = ?",
                [visibilityUpdated[0], visibilityUpdated[1], visibilityUpdated[2], visibilityUpdated[3], visibilityUpdated[4],
                    visibilityUpdated[5], visibilityUpdated[6], visibilityUpdated[7], visibilityUpdated[8], session.get("userId")])
            .done(function() {
                console.log("successfully updated visibility settings to the database!");
            }).fail(function(reason) {
            console.log(reason);
        });

        //Outputs a message to the user.
        userSettingsView.find("#savedChanges").css("display", "block");

        //return false to prevent the page from reloading.
        return false;
    }

    function calculateAge(dateOfBirth) {
        var birth = new Date(dateOfBirth);
        var birthYear = birth.getFullYear();

        var today = new Date();
        var currentYear = today.getFullYear();

        age = currentYear - birthYear;

        return age;
    }

    //adds a hobby from the pre-set list to the user's chosen hobbies list.
    function addHobby() {
        selectedHobby = userSettingsView.find("#availableHobbies").val().trim();

        if (" " + selectedHobby === "") {
            userSettingsView.find("#userSettingsHobbyWarning").html("Selecteer eerst een hobby voordat u iets toevoegt!");
        } else if (hobbies.includes(" " + selectedHobby)) {
            userSettingsView.find("#userSettingsHobbyWarning").html("Hobby is al toegevoegd!");
        }  else {
            hobbies.push(" " + selectedHobby);
            chosenHobbies.push(" " + selectedHobby);
            userSettingsView.find("#displayChosenHobbies").html(hobbies.toString());
            userSettingsView.find("#userSettingsHobbyWarning").html("");
        }
    }

    //adds a hobby that the user sets in the "custum hobby" input in th euser's chosen hobbies list and the available hobbies list.
    function addCustomHobby() {
        var customSelectedHobby = userSettingsView.find("#customHobbyInput").val().trim();

        if (" " + customSelectedHobby === "") {
            userSettingsView.find("#userSettingsHobbyWarning").html("Selecteer eerst een hobby voordat u iets toevoegt!");
        } else if (hobbies.includes(" " + customSelectedHobby)) {
            userSettingsView.find("#userSettingsHobbyWarning").html("Hobby is al toegevoegd!");
        }  else {
            hobbies.push(" " + customSelectedHobby);
            chosenHobbies.push(" " + customSelectedHobby);
            var opt = document.createElement('option');
            selectExist = userSettingsView.find(opt.value === customSelectedHobby);
            if (selectExist !== customSelectedHobby) {
                opt.value = customSelectedHobby;
                opt.innerHTML = customSelectedHobby;
                targetList.append(opt);

                //writes the new custom hobby to the database.
                databaseManager
                    .query("INSERT INTO interest (name) VALUES (?)", [opt.value])
                    .done(function () {
                        console.log("Added " + opt.value + " into the interest table");
                    }).fail(function (reason) {
                    console.log(reason);
                });
            }
            userSettingsView.find("#displayChosenHobbies").html(hobbies.toString());
            userSettingsView.find("#userSettingsHobbyWarning").html("");
        }
    }

    //removes the selected hobbies in the available hobbies list from the user's chosen hobbies list.
    function removeHobby() {
        selectedHobby = userSettingsView.find("#availableHobbies").val().trim();
        if (" " + selectedHobby === "") {
            userSettingsView.find("#userSettingsHobbyWarning").html("Selecteer eerst een hobby voordat u iets verwijderd!");
        } else if (hobbies.includes(" " + selectedHobby)) {
            hobbies.splice(hobbies.indexOf(" " + selectedHobby), 1);
            chosenHobbies.splice(hobbies.indexOf(" " + selectedHobby), 1);
            userSettingsView.find("#userSettingsHobbyWarning").html("");
        }  else {
            userSettingsView.find("#userSettingsHobbyWarning").html("Hobby is niet aanwezig in uw lijst!");
        }
        if (userSettingsView.find("#displayChosenHobbies").html === "") {
            userSettingsView.find("#displayChosenHobbies").html("Uw gekozen hobby's komen hier te staan.");
        } else {
            userSettingsView.find("#displayChosenHobbies").html(hobbies.toString());
            if (hobbies.toString() === "") {
                userSettingsView.find("#displayChosenHobbies").html("Uw gekozen hobby's komen hier te staan.");
            }
        }
        return false;
    }

    //Gets all the data that is already in the dB of the user and fills placeholders with that data.
    function getDataFromDatabase() {
        databaseManager
            .query("SELECT email, firstName, lastNamePrefix, lastName, birthdate, gender, profilePicture, biography, vacationDestination, password FROM user " +
                "INNER JOIN address ON user.id = address.userId WHERE userId = ?", [session.get("userId")])
            .done(function(data) {
                knownUserSettings = data[0];

                databaseManager
                    .query("SELECT * FROM setting WHERE userId = ?", [session.get("userId")])
                    .done(function(data) {
                        knownSettingsVisibility = data[0];

                        knownVisibilityName = knownSettingsVisibility.showName;
                        knownVisibilityCity = knownSettingsVisibility.showCity;
                        knownVisibilityCountry = knownSettingsVisibility.showCountry;
                        knownVisibilityAge = knownSettingsVisibility.showAge;
                        knownVisibilityGender = knownSettingsVisibility.showGender;
                        knownVisibilityProfilePicture = knownSettingsVisibility.showProfilePicture;
                        knownVisibilityHobbies = knownSettingsVisibility.showHobbies;
                        knownVisibilityBiography = knownSettingsVisibility.showBiography;
                        knownVisibilityVacationDestination = knownSettingsVisibility.showVacationDestination;

                        knownEmail = knownUserSettings.email;
                        knownPassword = knownUserSettings.password;
                        knownFirstName = knownUserSettings.firstName;
                        knownLastNamePrefix = knownUserSettings.lastNamePrefix;
                        knownLastName = knownUserSettings.lastName;
                        if (knownLastNamePrefix === null) {
                            knownName = knownFirstName + " " + knownLastName;
                        } else {
                            knownName = knownFirstName + " " + knownLastNamePrefix + " " + knownLastName;
                        }

                        knownCity = knownUserSettings.city;
                        knownCountry = knownUserSettings.country;
                        knownDateOfBirth = knownUserSettings.birthdate;
                        knownGender = knownUserSettings.gender;
                        knownProfilePicture = knownUserSettings.profilePicture;
                        userSettingsView.find("#currentProfilePicture").attr("src", knownProfilePicture);

                        databaseManager
                            .query("SELECT `userinterest`.user_id, `userinterest`.interest_id, `interest`.name as 'hobbyName' FROM userinterest" +
                                " INNER JOIN `interest` ON `userinterest`.interest_id = `interest`.id WHERE user_id = ?", [session.get("userId")])
                            .done(function(data) {
                                knownHobbies = "";
                                for (var l = 0; l < data.length; l++) {
                                    var currentIndex = data.indexOf(data[l]);
                                    if ((data.length - 1) !== currentIndex) {
                                        knownHobbies += data[l].hobbyName + ", ";
                                    } else {
                                        knownHobbies += data[l].hobbyName;
                                    }
                                    hobbies.push(data[l].hobbyName);
                                }
                                knownBiography = knownUserSettings.biography;
                                knownVacationDestination = knownUserSettings.vacationDestination;

                                //Setting the known values into placeholders etc. to show the user what is stored, and also filling the profile preview accordingly.
                                userSettingsView.find("#newEmail").attr("placeholder", knownEmail);
                                userSettingsView.find("#firstName").attr("placeholder", knownFirstName);
                                userSettingsView.find("#lastNamePrefix").attr("placeholder", knownLastNamePrefix);
                                userSettingsView.find("#lastName").attr("placeholder", knownLastName);
                                if (knownVisibilityName === 1) {
                                    userSettingsView.find("#visibilityName").attr("checked", true);
                                    userSettingsView.find("#nameOutput").html(knownName);
                                } else {
                                    userSettingsView.find("#nameOutput").html("Naam niet tonen");
                                }
                                if (knownCity !== null) {
                                    userSettingsView.find("#cityInput").attr("placeholder", knownCity);
                                    if (knownVisibilityCity === 1) {
                                        userSettingsView.find("#visibilityCity").attr("checked", true);
                                        userSettingsView.find("#cityOutput").html(knownCity);
                                    } else {
                                        userSettingsView.find("#cityOutput").html("Woonplaats niet tonen");
                                    }
                                }
                                if (knownCountry !== null) {
                                    userSettingsView.find("#knownCountry").html(knownCountry);
                                    if (knownVisibilityCountry === 1) {
                                        userSettingsView.find("#visibilityCountry").attr("checked", true);
                                        userSettingsView.find("#countryOutput").html(knownCountry);
                                    } else {
                                        userSettingsView.find("#countryOutput").html("Land van herkomst niet tonen");
                                    }
                                } else {
                                    userSettingsView.find("#knownCountry").html("Onbepaald");
                                    if (knownVisibilityCountry === 1) {
                                        userSettingsView.find("#visibilityCountry").attr("checked", true);
                                        userSettingsView.find("#countryOutput").html("Land van herkomst niet bepaald");
                                    } else {
                                        userSettingsView.find("#countryOutput").html("Land van herkomst niet tonen");
                                    }
                                }
                                knownDateOfBirth = new Date(knownDateOfBirth);
                                knownDateOfBirth = knownDateOfBirth.getDate() + "-"  + (knownDateOfBirth.getMonth() + 1) + "-" + knownDateOfBirth.getFullYear();
                                userSettingsView.find(".knownDOB").html(knownDateOfBirth);
                                age = calculateAge(knownDateOfBirth);
                                if (knownVisibilityAge === 1) {
                                    userSettingsView.find("#visbilityAge").attr("checked", true);
                                    userSettingsView.find("#ageOutput").html("leeftijd: " + age);
                                } else {
                                    userSettingsView.find("#ageOutput").html("leeftijd niet tonen");
                                }
                                if (knownGender === "M") {
                                    userSettingsView.find("#male").attr("checked", true);
                                    if (knownVisibilityGender === 1) {
                                        userSettingsView.find("#visibilityGender").attr("checked", true);
                                        userSettingsView.find("#genderOutput").html("geslacht: man");
                                    } else {
                                        userSettingsView.find("#genderOutput").html("geslacht niet tonen");
                                    }
                                } else if (knownGender === "F") {
                                    userSettingsView.find("#female").attr("checked", true);
                                    if (knownVisibilityGender === 1) {
                                        userSettingsView.find("#visibilityGender").attr("checked", true);
                                        userSettingsView.find("#genderOutput").html("geslacht: vrouw");
                                    } else {
                                        userSettingsView.find("#genderOutput").html("geslacht niet tonen");
                                    }
                                } else {
                                    userSettingsView.find("#other").attr("checked", true);
                                    if (knownVisibilityGender === 1) {
                                        userSettingsView.find("#visibilityGender").attr("checked", true);
                                        userSettingsView.find("#genderOutput").html("geslacht: anders");
                                    } else {
                                        userSettingsView.find("#genderOutput").html("geslacht niet tonen");
                                    }
                                }
                                if (knownProfilePicture !== null) {
                                    userSettingsView.find("#currentProfilePicture").attr("src", knownProfilePicture);
                                    if (knownVisibilityProfilePicture === 1) {
                                        userSettingsView.find("#visibilityProfilePicture").attr("checked", true);
                                        userSettingsView.find("#profilePictureOutput").attr("src", knownProfilePicture);
                                    } else {
                                        userSettingsView.find("#profilePictureOutput").attr("src", "assets/img/user_icon.jpg");
                                    }
                                } else {
                                    userSettingsView.find("#currentProfilePicture").attr("src", "assets/img/user_icon.jpg");
                                    if (knownVisibilityProfilePicture === 1) {
                                        userSettingsView.find("#visibilityProfilePicture").attr("checked", true);
                                        userSettingsView.find("#profilePictureOutput").attr("src", "assets/img/user_icon.jpg");
                                    } else {
                                        userSettingsView.find("#profilePictureOutput").attr("src", "assets/img/user_icon.jpg");
                                    }
                                }
                                if (knownHobbies !== "") {
                                    userSettingsView.find("#displayChosenHobbies").html(knownHobbies);
                                    if (knownVisibilityHobbies === 1) {
                                        userSettingsView.find("#visibilityHobbies").attr("checked", true);
                                        userSettingsView.find("#hobbiesOutput").html(knownHobbies);
                                    } else {
                                        userSettingsView.find("#hobbiesOutput").html("Hobbies niet tonen");
                                    }
                                } else {
                                    userSettingsView.find("#displayChosenHobbies").html("Uw gekozen hobby's komen hier te staan.");
                                    if (knownVisibilityHobbies === 1) {
                                        userSettingsView.find("#visibilityHobbies").attr("checked", true);
                                        userSettingsView.find("#hobbiesOutput").html("Hobby's nog niet gekozen!");
                                    } else {
                                        userSettingsView.find("#hobbiesOutput").html("Hobby's niet tonen");
                                    }
                                }
                                if (knownBiography !== null) {
                                    userSettingsView.find("#bioInput").attr("placeholder", knownBiography);
                                    if (knownVisibilityBiography === 1) {
                                        userSettingsView.find("#visibilityBiography").attr("checked", true);
                                        userSettingsView.find("#bioOutput").html(knownBiography);
                                    } else {
                                        userSettingsView.find("#bioOutput").html("Biografie niet tonen");
                                    }
                                } else {
                                    userSettingsView.find("#bioInput").attr("placeholder", "Schrijf uw Biografie hier...");
                                    if (knownVisibilityBiography === 1) {
                                        userSettingsView.find("#visibilityBiography").attr("checked", true);
                                        userSettingsView.find("#bioOutput").html("Biografie nog niet opgegeven!");
                                    } else {
                                        userSettingsView.find("#bioOutput").html("Biografie niet tonen");
                                    }
                                }
                                if (knownVacationDestination !== null) {
                                    userSettingsView.find("vacationDesInput").attr("placeholder", knownVacationDestination);
                                    if (knownVisibilityVacationDestination === 1) {
                                        userSettingsView.find("#vacationDesOutput").html(knownVacationDestination);
                                        userSettingsView.find("#visibilityVacationDes").attr("checked", true);
                                    } else {
                                        userSettingsView.find("#vacationDesOutput").html(" Vakantie bestemming niet tonen");
                                    }
                                } else {
                                    if (knownVisibilityVacationDestination === 1) {
                                        userSettingsView.find("#vacationDesOutput").html(" Geen Vakantie bestemming om te tonen");
                                        userSettingsView.find("#visibilityVacationDes").attr("checked", true);
                                    } else {
                                        userSettingsView.find("#vacationDesOutput").html(" Vakantie bestemming niet tonen");
                                    }
                                }
                            }).fail(function(reason) {
                            console.log(reason);
                        });
                    }).fail(function(reason) {
                    console.log(reason);
                });
            }).fail(function(reason) {
            console.log(reason);
        });

        //loads all the hobbies in the database and adds it to the available hobbies list.
        databaseManager
            .query("SELECT * FROM interest")
            .done(function (data) {
                for(var i = 0; i < data.length; i++) {
                    var hobbyList = userSettingsView.find("#availableHobbies");
                    var listItem = document.createElement("option");

                    listItem.value = " " + data[i].name;
                    listItem.innerHTML = data[i].name;
                    listItem.className += "translate";
                    listItem.setAttribute("data-lang", data[i].name);
                    hobbyList.append(listItem);
                }
            }).fail(function (reason) {
            console.log(reason);
        });

        return false;
    }

    //forwards the user to the delete account page
    function deleteAccount() {
        controller = "delete-account";
        loadController(controller);
    }

    //start initialize function om alles te starten
    initialize();
}