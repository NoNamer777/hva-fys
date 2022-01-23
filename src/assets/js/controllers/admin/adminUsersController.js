/**
 * Responsible for handling the actions happening on users view
 *
 * @author Miguel Korn
 */
function adminUsersController() {
    var DEFAULT_LIMIT = 5;
    var DEFAULT_OFFSET = 0;
    var DEFAULT_PAGE = 1;
    var limit, offset, search, page;

    var usersView;
    var rowItemTemplate;

    function initialize() {
        var usersRequest = $.get('views/admin/users.html');
        var rowItemRequest = $.get('views/admin/row-item.html');

        $.when(usersRequest, rowItemRequest)
            .done(function (usersResponse, rowItemResponse) {
                //Index 0 of a response is the actual data
                setup(usersResponse[0], rowItemResponse[0]);
            }).fail(error);
    }

    function setup(users, rowItem) {
        usersView = $(users);
        rowItemTemplate = $(rowItem);

        limit = DEFAULT_LIMIT;
        offset = DEFAULT_OFFSET * limit;
        page = DEFAULT_PAGE;

        usersView.find("#rowsPerPage")
            .val(limit)
            .on("change", function(){
                limit = Number($(this).val());
                handleShowUsers();
            });

        var searchButton = usersView.find(".search button");
        searchButton
            .hide()
            .on("click", function () {
                usersView.find(".search input").val('');
                $(this).hide();
                search = false;
                handleShowUsers();
            });

        usersView.find(".search input")
            .on("keyup", function () {
                search = $(this).val();
                (search === "") ? searchButton.hide() : searchButton.show();
                handleShowUsers();
            });

        //Empty the content-div and add the resulting view to the page
        $(".container").empty().append(usersView);

        handleShowUsers()
    }

    function handleShowUsers(newPage) {
        var userTable = usersView.find("#users");
        var query = "SELECT id, username, email, CASE WHEN lastNamePrefix IS NULL THEN CONCAT(firstName, ' ', lastName) ELSE CONCAT(firstName,' ',lastNamePrefix,' ',lastName) END AS fullname FROM user";
        var inputValues = [];

        if (search) {
            query += " WHERE username LIKE ? OR email LIKE ? OR (CASE WHEN lastNamePrefix IS NULL THEN CONCAT(firstName, ' ', lastName) ELSE CONCAT(firstName,' ',lastNamePrefix,' ',lastName) END) LIKE ?";
            var searchStr = "%" + search + "%";
            inputValues.push(searchStr, searchStr, searchStr); //add search value for eacht statement
        }

        if (page !== newPage) {
            page = newPage || DEFAULT_PAGE;
            offset = (page - 1) * limit;
            handleShowPaginationbar(query, inputValues);
        }

        query += " LIMIT ? OFFSET ?";
        inputValues.push(limit, offset);

        databaseManager
            .query(query, inputValues)
            .done(function (data) {
                userTable.find("tbody").empty();

                $.each(data, function (index, user) {
                    var rowItem = rowItemTemplate.clone();

                    rowItem.find(".id").html(index + 1);
                    rowItem.find(".username").html(user.username);
                    rowItem.find(".fullname").html(user.fullname);
                    rowItem.find(".email").html(user.email);
                    rowItem.find(".delete")
                        .attr("value", user.id)
                        .on("click", function () {
                            var acceptDelete = confirm("Weet je zeker dat je " + user.fullname + " wilt verwijderen?");
                            if (acceptDelete) handleDeleteUser(this);
                        });

                    userTable.find("tbody").append(rowItem);
                });
            })
            .fail(function (reason) {
                console.log(reason)
            });
    }

    function handleDeleteUser(e) {
        var currentUser = $(e).attr("value");

        databaseManager
            .query("DELETE FROM user WHERE id = ?", [currentUser])
            .done(function () {
                handleShowUsers();
            })
            .fail(function (reason) {
                console.log("reason", reason)
            });
    }

    function handleShowPaginationbar(query, values) {
        databaseManager
            .query(query, values)
            .done(function (data) {
                var rows = data.length;
                var countTabs = Math.ceil(rows / limit);
                var paginationBar = usersView.find(".pagination_bar").empty();

                paginationBar.append("<li class='prev'><button "+((page && page !== 1) ? "" : "disabled")+" value='" + (page - 1) + "'>Vorige</a></li>");
                for (var i = 0; i < countTabs; i++) {
                    var newPage = i + 1;
                    paginationBar.append("<li " + (i + 1 === page ? "class='current'" : "") + "><button value='" + newPage + "'>" + newPage + "</button></li>");
                }
                paginationBar.append("<li class='next'><button "+((page !== countTabs)? "" : "disabled")+" value='" + (page + 1) + "'>Volgende</button></li>");

                paginationBar
                    .find("button")
                    .on("click", function () {
                        paginationBar
                            .find("li.active")
                            .removeClass("current");

                        $(this).parent().addClass("current");
                        handleShowUsers(Number($(this).val()));
                    });
            })
            .fail(function (reason) {
                console.log(reason);
            })
    }

    //Called when the login.html failed to load
    function error() {
        $(".container").html("Failed to load users!");
    }

    //Run the initialize function to kick things off
    initialize();
}