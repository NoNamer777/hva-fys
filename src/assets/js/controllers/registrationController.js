/**
 * Controller for the registration page
 *
 * @author Jonathan van Veen
 */
function registrationController() {

    var registrationView;

    function initialize() {
        $.get("views/registration.html")
            .done(setup)
            .fail(error);
    }

    function setup(registration) {
        registrationView = $(registration);

        //register_form
        registrationView.find(".register_form").on("submit", function (){
            handleRegistration();

            return false;
        });

        $(".container").empty().append(registrationView);

        return false;
    }

    function handleRegistration() {
        var firstname = registrationView.find("[name='firstnameInput']").val();
        var lastname = registrationView.find("[name='lastnameInput']").val();
        var username = registrationView.find("[name='usernameInput']").val();
        var emailadress = registrationView.find("[name='emailaddressInput']").val();
        var password = registrationView.find("[name='passwordInput']").val();
        var passwordRepeat = registrationView.find("[name='passwordRepeat']").val();
        var birthdate = registrationView.find("[name='birthdateInput']").val();
        var gender = registrationView.find("[name='genderInput']").val();
        var picture = "assets/img/user_icon.jpg";

        //check voor password = password repeat
        if (password === passwordRepeat && passwordRepeat !== undefined) {
            console.log("De wachtwoorden komen overeen");
        } else {
            registrationView
                .find(".error")
                .html("U heeft het wachtwoord verkeerd ingevoerd!");
        }
        
        // aray alle gegevens
        var registration = [firstname, lastname, username, emailadress, password, birthdate, gender, picture];

        console.log("registration", registration);

        databaseManager
            .query("INSERT INTO `user` (firstname, lastname, username, email, password, birthdate, gender, profilePicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", registration)
            .done(function () {
                window.alert("U heeft nu een account gemaakt. Als u uw account verder wilt maken kunt u naar settings gaan.\n" +
                    "Als u dat heeft gedaan kunt u volledig aan de slag gaan met uw account.");
                loadController(CONTROLLER_LOGIN)
            }).fail(function (reason) {
            console.log(reason);
            registrationView
                .find(".error")
                .html("Er is iets misgegaan??? :'(");
        });

        var delayInMilliseconds = 1000;
        setTimeout( function () {
            databaseManager
                .query("INSERT INTO setting (username, userId, showName, showCity, showCountry, showAge, showGender, showProfilePicture" +
                    ", showHobbies, showBiography, showVacationDestination) VALUES (?, (SELECT id FROM user WHERE username = ?)" +
                    ", 0, 0, 0, 0, 0, 0, 0, 0, 0)", [username, username])
                .done().fail(function (reason) {
                console.log(reason);
            });
        }, delayInMilliseconds);
    }

    function error() {
        $(".container").html("Failed to load Registration!")
    }

    initialize()
}