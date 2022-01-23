/**
 * controls everything that happens when in confirm_new_password.html
 * @author Oscar Wellner
 */
function confirmEmailController() {
    //reference to the loaded view.
    var confirmEmailView;

    function initialize() {
        //gets the data from confrim_new_email.html.
        $.get("views/confirm_new_email.html")
            .done(setup)
            .fail(error);
    }

    //is called when confirm_new_email.html is found.
    function setup(data) {
        //loads the data into memory.
        confirmEmailView = $(data);

        //adds a click event to the anchor.
        confirmEmailView.find("a").on("click", returnSettings);

        //empties the content container and fills it with the data.
        $(".container").empty().append(confirmEmailView);
    }

    //is called when the confirm_new_email.html is not found.
    function error() {
        $(".container").html("Failed to load content!");
    }

    //call ini. to kick things off
    initialize();
}

//returns the user to the user settings page.
function returnSettings() {
    var controller = "settings";

    loadController(controller);

    //returns false to prevent the page from reloading.
    return false;
}