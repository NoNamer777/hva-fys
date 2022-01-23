/**
 * Controls all actions that happen in the confirm_new_password_account.
 * @author Oscar Wellner
 */
function confirmNewPasswordController() {
    //reference to the loaded view.
    var confirmNewPasswordView;

    function initialize() {
        //gets the data from confirm_new_password.html.
        $.get("views/confirm_new_password.html")
            .done(setup)
            .fail(error);
    }

    //is called when the data is found.
    function setup(data) {
        //loads the data into memory
        confirmNewPasswordView = $(data);

        //adds a click event to the anchor.
        confirmNewPasswordView.find("a").on("click", returnSettings);

        //empties the content container and fills it with the data.
        $(".container").empty().append(confirmNewPasswordView);
    }

    //is called when confirm_new_password.html is not found.
    function error() {
        $(".container").html("Failed to load content!");
    }

    //Run ini. to kick things off.
    initialize();
}

//returns the user to the user settings page.
function returnSettings() {
    var controller = "settings";
    loadController(controller);

    //return false to prevent the page from reloading.
    return false;
}