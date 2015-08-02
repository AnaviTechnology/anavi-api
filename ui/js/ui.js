$(document).ready(function() {

  $( "body>[data-role='panel']" ).panel().enhanceWithin();

  //$("[data-role=panel]").panel().enhanceWithin();

  $('#loginLogIn').bind('click', function(event) {
    $.mobile.pageContainer.pagecontainer("change", "#devices");
  });

});
