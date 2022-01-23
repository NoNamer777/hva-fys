/**
 * Controller for the password recovery page
 *
 * @author Jonathan van Veen
 */
function passwordRecoveryController() {

    var passwordRecoveryView;

    function initialize() {
        $.get("views/password_recovery.html")
            .done(setup)
            .fail(error);
    }

    function setup(data) {
        passwordRecoveryView = $(data);

        $(".container").empty().append(passwordRecoveryView);

    }

    function error() {
        $(".container").html("Failed to load password recovery!");

    }

    // function matchMail() {
    //     var mailInput = document.getElementById("passwordRecovery").value;
    //     if (mailInput = "PLACEHOLDER") {
    //
    //     }
    // }

    initialize();
}