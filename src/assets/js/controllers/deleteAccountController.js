/**
 * Controls all actions that happen on confirm_delete_account.html when a user needs to confirm whether he wants
 * to delete his / her account or not/
 * @author Oscar Wellner
 */
function deleteAccountController() {
    //reference to our view.
    var deleteAccountView;

    function initialize() {
        //getting the data from the called html file.
        $.get("views/confirm_delete_account.html")
            .done(setup)
            .fail(error);
    }

    //is called when confirm_delete_account.html is found.
    function setup(data) {
        deleteAccountView = $(data);

        //empties the content container and adds the data from the called html.
        $(".container").empty().append(deleteAccountView);
    }

    //is called when confirm_delete_account.html is not found.
    function error() {
        $(".container").html("Failed to load content!");
    }

    //run ini. to kick things off.
    initialize();
}

//sets the forward delay in ms.
var delayInMilliseconds = 3000;
var controller;

//is called when the user wants to keep his account.
function returnToSettings() {

    if (session.get("lang") === "EN") {
        document.querySelector("#message").innerHTML = "Your account will be kept, You're being redirected to Account settings...";
    } else {
        document.querySelector("#message").innerHTML = "Uw Account blijft behouden, u wordt omgeleid naar uw Account instellingen...";
    }

    setTimeout( function () {
        //user is forwarded back to the user settings page.
        controller = "settings";
        loadController(controller);
    }, delayInMilliseconds);

    return false;
}

//is called when the user wants to delete his / her account.
function confirmDeleteAccount() {

    if (session.get("lang") === "EN") {
        document.querySelector("#message").innerHTML = "Your account will be deleted, You're being redirected to the Home page...";
    } else {
        document.querySelector("#message").innerHTML = "Uw Account wordt verwijderd, u wordt omgeleid naar de Home page...";
    }

    setTimeout( function() {
        //the account of the user that is logged in is removed from the database.
        databaseManager
            .query("DELETE FROM user WHERE id = ?", [session.get("userId")])
            .done(function(data) {
                console.log(data);
            }).fail(function(reason) {
            console.log(reason);
        });
        //the session data of the user that is logged in is deleted and the user is sent back to the home page.
        session.remove("admin");
        session.remove("username");
        session.remove("userId");
        controller = "home";
        loadController(controller);
    }, delayInMilliseconds);

    return false;
}