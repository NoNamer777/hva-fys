$(function () {
    // Admin - Delete Users
    var alert = $('.alert');

    $('.delete').on('click', function (e) {
        var id = $(this).attr('value');
        console.log('ID ', id, alert.find('p'));
        if (confirm('Weet je zeker dat je gebruiker met id: ' + id + 'wilt verwijderen?')) {
            console.log('Verwijderd');
            alert.find('p').html('<p>Gebruiker met id: ' + id + ' is verwijderd uit het systeem</p>');
            alert.addClass('show');
        } else {
            console.log('niet verwijderd');
        }
    });

    // Admin - Destinations
    var countryContainer = $('.choose_country');
    var settingsContainer = $('.settings_container');
    var countryList = $('.country_list');
    var addDestinationBtn = $('#addDestination');
    var backBtn = $('.back_btn');

    countryList.on('click', 'li', function (e) {
        e.preventDefault();
        var destination = $(e.currentTarget).find('p')[0].innerText;
        console.log(destination);
        editDestination(destination);
    });

    backBtn.on('click', function () {
        switchContainers();
    });

    function switchContainers() {
        countryContainer.toggleClass('hide');
        settingsContainer.toggleClass('hide');
    }

    function editDestination(destination) {
        switchContainers();
    }
});