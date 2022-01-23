/**
 * Controller for the password recovery send page
 *
 * @author Jonathan van Veen
 */
function passwordRecoverySendController() {

    var passwordRecoverySendView;

    function initialize() {
        $.get("views/password_recovery_send.html")
            .done(setup)
            .fail(error);
    }

    function setup(passwordRecoverySend) {
        passwordRecoverySendView = $(passwordRecoverySend);

        $(".container").empty().append(passwordRecoverySendView);

    }

    function error() {
        $(".container").html("Failed to load password recovery send!")

    }

    initialize()
}