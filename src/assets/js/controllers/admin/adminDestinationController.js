/**
 * Responsible for handling the actions happening on destinations view
 *
 * @author Miguel Korn
 */
function adminDestinationController() {
    var destinationView;
    var listItemTemplate;

    function initialize() {
        var destinationRequest = $.get('views/admin/destinations.html');
        var listItemRequest = $.get('views/admin/list-item.html');

        $.when(destinationRequest, listItemRequest)
            .done(function (destinationResponse, listItemResponse) {
                //Index 0 of a response is the actual data
                setup(destinationResponse[0], listItemResponse[0]);
            })
            .fail(error);
    }

    function setup(destination, listItem) {
        destinationView = $(destination);
        listItemTemplate = $(listItem);

        // add click on the elements
        destinationView.find("a").on("click", handleClick);

        //Empty the content-div and add the resulting view to the page
        $(".container").empty().append(destinationView);

        showCurrentList();
    }

    function handleClick() {
        var params = {};
        var country = $(this).attr("data-country");
        var region = $(this).attr("data-region");
        var place = $(this).attr("data-place");

        if (country) params['country'] = country;
        if (region) params['region'] = region;
        if (place) params['place'] = place;

        loadController("admin-destinations", null, params);

        return false;
    }

    function showCurrentList() {
        // show list views based on queryparams
        var params = getSearchParams();
        var addDestinationInput = destinationView.find("#addDestinationItem");
        var addDestinationBtn = destinationView.find(".header .add");
        var headerText, addButtonText, currentList;
        var backLinkAttr = {};

        if ('country' in params) {
            backLinkAttr['data-controller'] = "admin-destinations";
            if ('region' in params) {
                backLinkAttr['data-country'] = params.country;
                if ('place' in params) {
                    backLinkAttr['data-region'] = params.region;

                    headerText = 'Bestemmingen';
                    addButtonText = 'Bestemming';
                    currentList = 'destination';
                } else {
                    headerText = 'Plaatsen';
                    addButtonText = 'Plaats';
                    currentList = 'place';
                }
            } else {
                headerText = 'Regio\'s';
                addButtonText = 'Regio';
                currentList = 'region';
            }
        } else {
            headerText = 'Landen';
            addButtonText = 'Land';
            backLinkAttr = false;
            currentList = 'country';
        }

        $('.header h2').empty().append(headerText);

        addDestinationBtn
            .attr("data-add", addButtonText.toLowerCase())
            .on("click", function () {
                handleAddItem(this, addDestinationInput, currentList);
            });

        addDestinationInput
            .attr("placeholder", "Voer hier je " + addButtonText.toLowerCase() + " in");

        showListItems(currentList);

        var backLink = $('.header .back');
        backLinkAttr ? backLink.attr(backLinkAttr) : backLink.addClass('hidden');
    }

    function handleAddItem(element, input, table) {
        var inputValue = input.val();
        if (!inputValue) return;
        var insertValues = [];
        var query;

        switch (table) {
            case "country":
                query = "INSERT INTO country (name) VALUES (?)";
                insertValues.push(inputValue);
                break;
            case "region":
                query = "INSERT INTO region (name, country_id) VALUES (?, ?)";
                insertValues.push(inputValue, getSearchParams("country"));
                break;
            case "place":
                query = "INSERT INTO city (name, region_id) VALUES (?, ?)";
                insertValues.push(inputValue, getSearchParams("region"));
                break;
            case "destination":
                query = "INSERT INTO destination (name, city_id) VALUES (?, ?)";
                insertValues.push(inputValue, getSearchParams("place"));
                break;
        }

        databaseManager
            .query(query, insertValues)
            .done(function (data) {
                input.val("");
                showListItems(table);
            })
            .fail(function (reason) {
                console.log(reason)
            });
    }

    function showListItems(table) {
        var query;
        var deleteQuery;
        var updateQuery;
        var queryData = [];
        var countryID = getSearchParams("country") || false;
        var regionID = getSearchParams("region") || false;
        var cityID = getSearchParams("place") || false;

        switch (table) {
            case "country":
                query = "SELECT C.*, COUNT(R.country_id) AS children FROM country C LEFT JOIN region R ON C.id = R.country_id GROUP BY C.id ORDER BY C.name ASC";
                deleteQuery = "DELETE FROM country WHERE id = ?";
                updateQuery = "UPDATE country SET name = ? WHERE id = ?";
                break;
            case "region":
                query = "SELECT R.*, COUNT(C.region_id) AS children FROM region R LEFT JOIN city C ON R.id = C.region_id WHERE R.country_id = ? GROUP BY R.id ORDER BY R.name ASC";
                deleteQuery = "DELETE FROM region WHERE id = ?";
                updateQuery = "UPDATE region SET name = ? WHERE id = ?";
                queryData.push(countryID);
                break;
            case "place":
                query = "SELECT C.*, COUNT(D.city_id) AS children FROM city C LEFT JOIN destination D ON C.id = D.city_id WHERE C.region_id = ? GROUP BY C.id ORDER BY C.name ASC";
                deleteQuery = "DELETE FROM city WHERE id = ?";
                updateQuery = "UPDATE city SET name = ? WHERE id = ?";
                queryData.push(regionID);
                break;
            case "destination":
                query = "SELECT * FROM destination WHERE city_id = ? ORDER BY name ASC";
                deleteQuery = "DELETE FROM destination WHERE id = ?";
                updateQuery = "UPDATE destination SET name = ? WHERE id = ?";
                queryData.push(cityID);
                break;
        }

        databaseManager
            .query(query, queryData)
            .done(function (data) {
                destinationView.find('.list').empty();

                $.each(data, function (index, item) {
                    var listItem = listItemTemplate.clone();

                    var nameElem = listItem.find(".name");
                    var countElem = listItem.find(".count");
                    var linkElem = listItem.find("a");
                    var deleteElem = listItem.find(".remove");
                    var editElem = listItem.find(".edit");
                    var acceptElem = listItem.find(".accept");
                    var cancelElem = listItem.find(".cancel");

                    nameElem.html(item.name);
                    countElem.html(item.children);
                    acceptElem
                        .toggle()
                        .on("click", function () {
                            handleChangeListItem(table, updateQuery, item.id, nameElem.find("input").val());
                        });
                    cancelElem
                        .toggle()
                        .on("click", toggleElements);
                    linkElem
                        .attr("data-country", (countryID ? countryID : item.id))
                        .attr("data-region", (countryID ? (regionID ? regionID : item.id) : null))
                        .attr("data-place", (regionID ? (cityID ? cityID : item.id) : null))
                        .on("click", handleClick);
                    editElem
                        .on("click", toggleElements);

                    (item.children && item.children !== 0) ? deleteElem.remove() : deleteElem.on("click", function () {
                        handleRemoveListItem(table, deleteQuery, item.id);
                    });

                    destinationView.find('.list').append(listItem);

                    function toggleElements() {
                        nameElem.html((nameElem.find("input").length) ? item.name : '<input type="text" placeholder="' + item.name + '" value="' + item.name + '">');
                        acceptElem.toggle();
                        cancelElem.toggle();

                        countElem.toggle();
                        linkElem.toggle();
                        deleteElem.toggle();
                        editElem.toggle();
                    }
                })
            })
            .fail(function (reason) {
                console.log(reason)
            });
    }

    function handleRemoveListItem(table, query, id) {
        databaseManager
            .query(query, [id])
            .done(function () {
                showListItems(table);
            })
            .fail(function (reason) {
                console.log(reason)
            })
    }

    function handleChangeListItem(table, query, name, id) {
        databaseManager
            .query(query, [id, name])
            .done(function () {
                showListItems(table);
            })
            .fail(function (reason) {
                console.log(reason)
            })
    }

    //Called when the login.html failed to load
    function error() {
        $(".container").html("Failed to load countries!");
    }

    //Run the initialize function to kick things off
    initialize();
}