/**
 * Responsible for handling the actions happening on header view
 *
 * @author Miguel Korn
 */
function headerController() {
    //reference to our loaded view
    var headerView;
    var currentController = getCurrentController();
    var activeNavItem;

    function initialize() {
        if (session.get("admin") === 1) {
            $.get("views/headers/admin_header.html")
                .done(setup)
                .fail(error);
        } else if (session.get("userId") !== undefined) {
            $.get("views/headers/user_header.html")
                .done(setup)
                .fail(error);
        } else {
            $.get("views/headers/visitor_header.html")
                .done(setup)
                .fail(error);
        }
    }

    //Called when the x_header.html is loaded
    function setup(data) {
        //Load the header-content into memory.
        headerView = $(data);

        // add eventlistener on language images
        headerView.find(".langNL").on("click", function () {
            handleChangeLanguage("NL");
        });
        headerView.find(".langEN").on("click", function () {
            handleChangeLanguage("EN");
        });

        headerView.find("a[data-controller='" + currentController + "']").parent().addClass("active");
        headerView.find(".tab a[data-controller='" + currentController + "']").parent().addClass("active");

        //Find all anchors and register the click-events.
        headerView.find("ul#normal").addClass("navbar");
        headerView.find("ul#admin").addClass("hide");
        headerView.find("ul#normal_nav_list").addClass("nav_list");
        headerView.find("ul#admin_nav_list").addClass("hide");
        headerView.find("a").on("click", handleClickMenuItem);
        headerView.find("a").on("click", handleChangeNavbar);

        headerView.find("#nav_tabs_mobile").addClass("hide");
        headerView.find("#content").css("display", "none");
        headerView.find(".tab").css("display", "block");
        headerView.find("ul#normal_tab").css("display", "flex");
        headerView.find("ul#admin_tab").css("display", "none");
        headerView.find(".nav_toggle").on("click", toggleMobileNav);
        headerView.find(".tab a").on("click", toggleMobileNav);
        headerView.find("ul#normal_tab li.admin_link a").on("click", toggleMobileNavTabs);
        headerView.find("ul#admin_tab li.normal_link a").on("click", toggleMobileNavTabs);

        //Empty the header-div and add the resulting view to the page.
        $(".header").empty().append(headerView);
    }

    function handleClickMenuItem() {
        if ($(this)[0] !== (headerView.find(".nav_toggle")[0] || headerView.find(".login_toggle")[0])) {
            //Get the data-controller from the clicked element (this)
            var controller = $(this).attr("data-controller");

            //Pass the action to a new function for further processing.
            loadController(controller);

            headerView.find('.navbar li.active').removeClass('active');
            headerView.find('.tab li.active').removeClass('active');
            headerView.find('.navbar a[data-controller="' + controller + '"]').parent().addClass("active");
            headerView.find('.tab a[data-controller="' + controller + '"]').parent().addClass("active");
            activeNavItem = headerView.find(".navbar li.active");
        }
        //return false to prevent reloading the page.
        return false;
    }

    function handleChangeNavbar() {
        if ($(this)[0] !== (headerView.find(".nav_toggle")[0] || headerView.find(".login_toggle")[0])) {
            if (activeNavItem[0] === headerView.find(".navbar li.admin_link")[0]) {
                headerView.find("#normal").addClass("hide").removeClass("navbar");
                headerView.find("#admin").addClass("navbar").removeClass("hide");

                headerView.find("#normal_nav_list").addClass("hide").removeClass("nav_list");
                headerView.find("#admin_nav_list").addClass("nav_list").removeClass("hide");

                headerView.find('.navbar li.active').removeClass('active');
                headerView.find('.navbar a[data-controller="admin-home"]').parent().addClass("active");
            } else if (activeNavItem[0] === headerView.find(".navbar li.normal_link")[0]) {
                headerView.find("#admin").addClass("hide").removeClass("navbar");
                headerView.find("#normal").addClass("navbar").removeClass("hide");

                headerView.find("#admin_nav_list").addClass("hide").removeClass("nav_list");
                headerView.find("#normal_nav_list").addClass("nav_list").removeClass("hide");
            }
        }

        return false;
    }

    function toggleMobileNav() {
        if (headerView.find("#content").css("display") === "none") {
            headerView.find("#nav_tabs_mobile").removeClass("hide");
            headerView.find("#content").css("display", "block");
        } else {
            headerView.find("#nav_tabs_mobile").addClass("hide");
            headerView.find("#content").css("display", "none");
        }

        return false;
    }

    function toggleMobileNavTabs() {
        if (headerView.find("ul#normal_tab").css("display") === "flex") {
            headerView.find("ul#normal_tab").css("display", "none");
            headerView.find("ul#admin_tab").css("display", "flex");
        } else {
            headerView.find("ul#normal_tab").css("display", "flex");
            headerView.find("ul#admin_tab").css("display", "none");
        }

        return false;
    }

    function handleChangeLanguage(newLang) {
        session.set("lang", newLang);
        translatePage();
    }

    function error() {
        $(".header").html("Failed to load the header!");
    }

    //Run initialize function to kick things off.
    initialize();
}