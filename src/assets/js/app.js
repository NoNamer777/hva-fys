//Global variables
var session = sessionManager();
var databaseManager = databaseManager();

var DEFAULT_LANG = "NL";

//Constants (sort of)
var CONTROLLER_HEADER = "header";
var CONTROLLER_LOGIN = "login";
var CONTROLLER_LOGOUT = "logout";
var CONTROLLER_HOME = "home";
var CONTROLLER_PASSWORD_RECOVERY = "password-recovery";
var CONTROLLER_PASSWORD_RECOVERY_SEND = "password-recovery-send";
var CONTROLLER_REGISTRATION = "register";
var CONTROLLER_SETTINGS = "settings";
var CONTROLLER_CONFIRM_NEW_EMAIL = "confirm-email";
var CONTROLLER_CONFIRM_NEW_PASSWORD = "confirm-password";
var CONTROLLER_DELETE_ACCOUNT = "delete-account";
var CONTROLLER_FAVORITE = "favorite";
var CONTROLLER_PROFILE_DETAILS = "profile-details";
var CONTROLLER_PROFILE_OVERVIEW = "profile-overview";
var CONTROLLER_MANUAL = "manual";
var CONTROLLER_REVIEWS = "reviews";

// Admin specific Constants (sort of)
var CONTROLLER_ADMIN_HOME = "admin-home";
var CONTROLLER_DESTINATIONS = "admin-destinations";
var CONTROLLER_GENERAL = "admin-general";
var CONTROLLER_HOBBIES = "admin-hobbies";
var CONTROLLER_USERS = "admin-users";

//This is called when the browser is done loading
$(function () {
    if (!session.get("lang")) session.set("lang", DEFAULT_LANG); // check if session is set, if not set to default

    //Always load the sidebar
    loadController(CONTROLLER_HEADER);

    //Attempt to load the controller from the URL, if it fails, fall back to the welcome controller.
    loadControllerFromUrl(CONTROLLER_HOME);

    //Setup the database manager
    databaseManager.connect("https://db.fys-hva.tk/");
    databaseManager.authenticate("ae7nFo3WQjR27qPC");
});

//This function is responsible for creating the controllers of all views
function loadController(name, controllerData, queryParams) {
    if (controllerData) {
        console.log(controllerData);
    }
    else {
        controllerData = {};
    }

    if (name !== CONTROLLER_HEADER) {
        toggleStyle(name);
        setQueryParams(queryParams, name);
    }

    switch (name) {
        case CONTROLLER_HEADER:
            headerController();
            break;
        case CONTROLLER_LOGIN:
            setCurrentController(name);
            headerController();
            isLoggedIn(userSettingsController, loginController);
            break;
        case CONTROLLER_LOGOUT:
            setCurrentController(name);
            handleLogout();
            headerController();
            break;
        case CONTROLLER_HOME:
            setCurrentController(name);
            isLoggedIn(homeController, homeController);
            headerController();
            break;
        case CONTROLLER_PASSWORD_RECOVERY:
            setCurrentController(name);
            passwordRecoveryController(passwordRecoveryController, false);
            break;
        case CONTROLLER_PASSWORD_RECOVERY_SEND:
            setCurrentController(name);
            passwordRecoveryController(passwordRecoverySendController, false);
            break;
        case CONTROLLER_REGISTRATION:
            setCurrentController(name);
            registrationController();
            break;
        case CONTROLLER_SETTINGS:
            setCurrentController(name);
            isLoggedIn(userSettingsController, loginController, false);
            break;
        case CONTROLLER_CONFIRM_NEW_PASSWORD:
            setCurrentController(name);
            isLoggedIn(confirmNewPasswordController, homeController, false);
            break;
        case CONTROLLER_CONFIRM_NEW_EMAIL:
            setCurrentController(name);
            isLoggedIn(confirmEmailController, homeController, false);
            break;
        case CONTROLLER_DELETE_ACCOUNT:
            setCurrentController(name);
            isLoggedIn(deleteAccountController, homeController, false);
            break;
        case CONTROLLER_FAVORITE:
            setCurrentController(name);
            isLoggedIn(favoritesController, loginController, false);
            break;
        case CONTROLLER_PROFILE_DETAILS:
            setCurrentController(name);
            isLoggedIn(
                function() {
                    profileDetailsController(controllerData)
                },
                loginController
            );
            break;
        case CONTROLLER_PROFILE_OVERVIEW:
            setCurrentController(name);
            isLoggedIn(profileOverviewController, function () {
                loadController("login");
            }, false);
            break;
        case CONTROLLER_MANUAL:
            setCurrentController(name);
            manualController();
            break;
        case CONTROLLER_REVIEWS:
            setCurrentController(name);
            reviewsController();
            break;
        // admin pages
        case CONTROLLER_ADMIN_HOME:
            setCurrentController(name);
            isLoggedIn(adminHomeController, loginController, true);
            break;
        case CONTROLLER_DESTINATIONS:
            setCurrentController(name);
            isLoggedIn(adminDestinationController, loginController, true);
            break;
        case CONTROLLER_GENERAL:
            setCurrentController(name);
            isLoggedIn(adminGeneralController, loginController, true);
            break;
        case CONTROLLER_HOBBIES:
            setCurrentController(name);
            isLoggedIn(adminInterestsController, loginController, true);
            break;
        case CONTROLLER_USERS:
            setCurrentController(name);
            isLoggedIn(adminUsersController, loginController, true);
            break;
        default:
            return false;
    }

    translatePage();
    return true;
}

function loadControllerFromUrl(fallbackController) {
    var currentController = getCurrentController();

    if (currentController) {
        if (!loadController(currentController)) {
            loadController(fallbackController);
        }
    }
    else {
        loadController(fallbackController);
    }
}

function getCurrentController() {
    return location.hash.slice(1);
}

function setCurrentController(name) {
    location.hash = name;
}

function setQueryParams(params, controller) {
    resetQueryParams(controller);
    if (params === undefined || params === null || !params) return;
    var base = location.protocol + '//' + location.host + location.pathname;
    var queryString = "?";

    Object.keys(params).forEach(function (key, index) {
        queryString += key + "=" + params[key];
        if (index + 1 !== Object.keys(params).length) {
            queryString += "&";
        }
    });

    history.replaceState({}, "", base + queryString + "#" + controller);
}

function resetQueryParams(controller) {
    history.replaceState({}, "", location.protocol + '//' + location.host + location.pathname + "#" + controller);
}

function getSearchParams(key) {
    var params = {};
    location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (s, k, v) {
        params[k] = v
    });
    return key ? params[key] : params;
}

//Convenience functions to handle logged-in states
function isLoggedIn(whenYes, whenNo, isAdmin) {
    (isAdmin ? session.get("admin") : session.get("username")) ? whenYes() : whenNo();
}

function translatePage() {
    $.getJSON("data/lang.json")
        .done(function (data) {
            var currentLang = data[session.get("lang")];
            $(".translate").each(function () {
                $(this).html(currentLang[$(this).attr("data-lang")]);
            })
        })
        .fail(function (error) {
            console.log("error while translating", error)
        });
}

function toggleStyle(name) {
    var controller = (name.indexOf("admin-") >= 0) ? "admin" : name;
    var link = $("head link[rel='stylesheet']")[3];
    var url = "assets/css/pages/"+controller+".css";
    $.get(url)
        .done(function() {
            $(link).attr("href", url);
        }).fail(function() {
            console.log("No Style for current page")
    });

}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function handleLogout() {
    session.remove("admin");
    session.remove("userId");
    session.remove("username");
    loadController("home");
}