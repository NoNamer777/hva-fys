/**
 *Responsible for handeling the actions on the manual page
 *
 * @author Mike Korver
 **/
function manualController() {
    //Reference to our loaded view
    var manualView;

    function initialize() {
        $.get("views/manual.html")
            .done(setup)
            .fail(error);
    }

    function setup(manual) {
        //load the manual-content into memory
        manualView = $(manual);

        $(".container").empty().append(manualView);
    }

    function error() {
        $(".container").html("Failed to load content!")
    }

    //Run the initialize function to kick things off
    initialize();
}