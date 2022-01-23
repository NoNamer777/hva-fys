/**
 * Responsible for handling the actions happening on lists view
 *
 * @author Miguel Korn
 */
function adminInterestsController() {
    var interestView;
    var listItemTemplate;

    function initialize() {
        var interestsRequest = $.get('views/admin/interests.html');
        var listItemRequest = $.get('views/admin/list-item.html');

        $.when(interestsRequest, listItemRequest)
            .done(function (interestsResponse, listItemResponse) {
                //Index 0 of a response is the actual data
                setup(interestsResponse[0], listItemResponse[0]);
            })
            .fail(error);
    }

    function setup(interest, listItem) {
        interestView = $(interest);
        listItemTemplate = $(listItem);

        interestView.find(".add").on("click", handleAddInterest);

        //Empty the content-div and add the resulting view to the page
        $(".container").empty().append(interestView);

        handleShowInterests();
    }

    function handleShowInterests() {
        databaseManager
            .query("SELECT * FROM interest ORDER BY name ASC")
            .done(function (data) {
                interestView.find(".list").empty();

                $.each(data, function (index, interest) {
                    var listItem = listItemTemplate.clone();

                    var nameElem = listItem.find(".name");
                    var deleteElem = listItem.find(".remove");
                    var editElem = listItem.find(".edit");
                    var acceptElem = listItem.find(".accept");
                    var cancelElem = listItem.find(".cancel");

                    listItem.find(".count").addClass("hidden");
                    listItem.find("a").hide();
                    nameElem.html(capitalizeFirstLetter(interest.name));
                    acceptElem
                        .toggle()
                        .on("click", function () {
                            handleUpdateInterest(interest.id, nameElem.find("input").val());
                        });
                    cancelElem
                        .toggle()
                        .on("click", toggleElements);
                    editElem
                        .on("click", toggleElements);
                    deleteElem.on("click", function () {
                        handleRemoveInterest(interest.id);
                    });

                    interestView.find(".list").append(listItem);

                    function toggleElements() {
                        nameElem.html((nameElem.find("input").length) ? interest.name : '<input type="text" placeholder="' + interest.name + '" value="' + interest.name + '">');
                        acceptElem.toggle();
                        cancelElem.toggle();
                        deleteElem.toggle();
                        editElem.toggle();
                    }
                })
            })
            .fail(function (reason) {

            })
    }

    function handleUpdateInterest(id, value) {
        databaseManager
            .query("UPDATE interest SET name = ? WHERE id = ?", [value, id])
            .done(function () {
                handleShowInterests();
            })
            .fail(function (reason) {
                console.log(reason);
            })
    }

    function handleAddInterest() {
        var interestInput = interestView.find("#addInterestItem");
        var newInterest = interestInput.val();

        databaseManager
            .query("INSERT INTO interest (name) VALUES (?)", [newInterest])
            .done(function () {
                interestInput.val("");
                handleShowInterests();
            })
            .fail(function (reason) {
                console.log(reason);
            })
    }

    function handleRemoveInterest(id) {
        databaseManager
            .query("DELETE FROM interest WHERE id = ?", [id])
            .done(function () {
                handleShowInterests();
            })
            .fail(function (reason) {
                console.log(reason);
            })
    }

    //Called when the login.html failed to load
    function error() {
        $(".container").html("Failed to load lists!");
    }

    //Run the initialize function to kick things off
    initialize();
}