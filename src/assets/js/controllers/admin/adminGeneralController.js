/**
 * Responsible for handling the actions happening on general view
 *
 * @author Miguel Korn
 */
function adminGeneralController() {
    var generalView;
    var translationItemTemplate;

    function initialize() {
        var generalRequest = $.get('views/admin/general.html');
        var translationItemRequest = $.get('views/admin/translation-item.html');

        $.when(generalRequest, translationItemRequest)
            .done(function (generalResponse, translationItemResponse) {
                setup(generalResponse[0], translationItemResponse[0]);
            })
            .fail(error);
    }

    function setup(general, translationItem) {
        generalView = $(general);
        translationItemTemplate = $(translationItem);

        //Empty the content-div and add the resulting view to the page
        $(".container").empty().append(generalView);

        handleShowTranslations();
    }

    function handleShowTranslations() {
        databaseManager
            .query("SELECT * FROM page ORDER BY name ASC")
            .done(function (data) {
                $.each(data, function (index, page) {
                    var pageName = page.name;
                    generalView.append("<div class='page' id='" + pageName + "'><h2>" + capitalizeFirstLetter(pageName) + "</h2></div>");
                    handleShowPageItems(pageName);
                })
            })
            .fail(function (reason) {
                console.log(reason);
            });
    }

    function handleShowPageItems(page) {
        databaseManager
            .query("SELECT TE.id, TE.text, TR.text AS translation, P.name FROM text TE INNER JOIN translation TR ON TE.translation_id = TR.id INNER JOIN page P ON TE.page_id = P.id WHERE p.name = ?", [page])
            .done(function (data) {
                $.each(data, function (index, item) {
                    var translationItem = translationItemTemplate.clone();
                    var id = page + "-" + (index + 1);
                    var labels = translationItem.find("label");

                    translationItem.addClass(id);
                    translationItem.find(".alert").hide();

                    $(labels[0]).attr("for", id + "-NL");
                    $(labels[1]).attr("for", id + "-EN");

                    translationItem.find("textarea.nl").attr("id", id).html(item.text);
                    translationItem.find("textarea.en").attr("id", id).html(item.translation);

                    translationItem.find("button")
                        .val(id)
                        .on("click", function () {
                            handleUpdateTranslation(item.id, id);
                        });

                    generalView.find("#" + page).append(translationItem);
                });
            })
            .fail(function (reason) {
                console.log(reason);
            });
    }

    function handleUpdateTranslation(textId, elem) {
        var textValue = generalView.find(".nl#" + elem).val();
        var translationValue = generalView.find(".en#" + elem).val();

        databaseManager
            .query("UPDATE text TE INNER JOIN translation TR ON TE.translation_id = TR.id INNER JOIN page P ON TE.page_id = P.id SET TE.text = ?, TR.text = ? WHERE TE.id = ?", [textValue, translationValue, textId])
            .done(function () {
                generalView.find("." + elem + " div.alert")
                    .addClass("success")
                    .html("Succesvol gewijzigd!")
                    .show(0)
                    .delay(3000)
                    .hide(0);
            })
            .fail(function () {
                generalView.find("." + elem + " div.alert")
                    .addClass("fail")
                    .html("Er ging iets mis! probeer opniew.")
                    .show(0)
                    .delay(3000)
                    .hide(0);
            })
    }

    //Called when the login.html failed to load
    function error() {
        $(".container").html("Failed to load general!");
    }

    //Run the initialize function to kick things off
    initialize();
}