var attempts = 0;
function loginController() {
    var loginView;

    function initialize() {
        $.get("views/login.html")
            .done(setup)
            .fail(error);
    }

    function setup(data) {
        loginView = $(data);

        if (attempts === 3) {
            loginView.find("[id='un']").prop("disabled", true);
            loginView.find("[id='ww']").prop("disabled", true);
        }
            loginView.find(".user_login_form").on("submit", function () {
                handleLogin();

                //Return false to prevent the form submission from reloading the page.
                return false;
            });

        loginView.find(".register_button").on("click", handleRegister);

        //Empty the content-div and add the resulting view to the page
        $(".container").empty().append(loginView);
    }

    function handleLogin() {

        //Find the username and password
        var username = loginView.find("[name='username']").val();
        var password = loginView.find("[name='password']").val();

        databaseManager
            .query("SELECT * FROM user WHERE username = ?", [username])
            .done(function (data) {
                var user = data[0] || {}; //get the first user from the database

                if (attempts === 3) {
                    window.alert("U heeft de maximale inlogpogingen behaald. U moet nu een nieuw wachtwoord aanmaken om opnieuw in te loggen");
                    loginView.find("[id='un']").prop("disabled", true);
                    loginView.find("[id='ww']").prop("disabled", true);
                } else {
                    if (user && attempts !== 3 || user !== undefined) {
                        if (password === user.password) {

                            session.set("userId", user.id);
                            session.set("admin", user.isAdmin);

                            session.set("status", "logged in");
                            session.set("username", user.username);

                            // Succesful login! Move to a welcome page or something.
                            loadController(CONTROLLER_HOME);
                            attempts = 0;
                        } else {
                            if (attempts === 3) {
                                window.alert("U heeft de maximale inlogpogingen behaald. U moet nu een nieuw wachtwoord aanmaken om opnieuw in te loggen");
                            } else {
                                attempts++;
                                console.log(attempts);
                                if (attempts === 3) {
                                    window.alert("U heeft de maximale inlogpogingen behaald. U moet nu een nieuw wachtwoord aanmaken om opnieuw in te loggen");
                                    loginView.find("[id='un']").prop("disabled", true);
                                    loginView.find("[id='ww']").prop("disabled", true);
                                }
                                loginView
                                    .find(".error")
                                    .html("De waarden waren niet goed ingevuld");
                            }
                        }
                    } else {
                        loginView
                            .find(".error")
                            .html("De waarden waren niet goed ingevuld!");
                    }
                }
            }).fail(function (reason) {
            console.log(reason);
            loginView
                .find(".error")
                .html("Er is iets misgegaan??? :'(");
        });
    }

    function error() {
        $(".container").html("Failed to load login!")

    }

    function handleRegister() {
        var controller = "register";
        loadController(controller);

        return false;
    }

    initialize();
}