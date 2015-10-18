function loginSubmit() {

  var loginUsername = $('#username').val();
  var loginPassword = $('#password').val();

  if (0 == loginUsername.length) {
    $('#dialogText').html('Please enter username.');
    $.mobile.changePage( "#dialog", { role: "dialog" } );
    return;
  }

  if (0 == loginPassword.length) {
    $('#dialogText').html('Please enter password.');
    $.mobile.changePage( "#dialog", { role: "dialog" } );
    return;
  }

  $.ajax({
    type: "POST",
    url: "/login",
    data: { username: loginUsername, password: loginPassword },
    success: function(data, status) {
      if ( (undefined !== data.error) && (0 === data.error) &&
           (undefined !== data.errorCode) && (0 === data.errorCode) ) {

        $('#username').val('');
        $('#password').val('');
        $.mobile.pageContainer.pagecontainer("change", "#pageDashboard");
        $('#dashboardOptionsLink').addClass('selected');
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
        $('#dialogText').html('Wrong username or password.');
        $('#password').val('');
        $.mobile.changePage( "#dialog", { role: "dialog" } );
    },
  });
}

function loginSubmitOnEnter() {
  if (13 === event.which) {
    if (0 === $('#username').val().length) {
      $('#username').focus();
    }
    else if (0 === $('#password').val().length) {
      $('#password').focus();
    }
    else {
      loginSubmit();
    }
  }
}

function sendRequest(api, options, callbackSuccess, callbackError) {
  $.mobile.loading( 'show', {
    text: 'Loading',
    textVisible: true,
    theme: 'b',
    textonly: false,
    html: ''
  });

  $.ajax({
    type: "GET",
    url: 'api/'+api,
    data: options,
    success: callbackSuccess,
    error: callbackError,
  });

}

function loadDevicesSuccess(data, status) {
  var htmlListItems = '';
  if (0 === data.devices.length) {
    htmlListItems += '<li>No devices found.</li>';
  }
  else {
    for (var deviceId=0; deviceId<data.devices.length; deviceId++) {
      var device = data.devices[deviceId];
      htmlListItems += '<li><a href="#device">';
      htmlListItems += device.name;
      if (true === device.power) {
        htmlListItems += ' <span class="ui-li-count powerOn">on</span></a></li>';
      }
      else {
        htmlListItems += ' <span class="ui-li-count powerOff">off</span></a></li>';
      }
    }
  }
  $('#pageDevicesList').empty();
  $('#pageDevicesList').append(htmlListItems);
  $('#pageDevicesList').listview('refresh');
  $.mobile.loading('hide');
}

function loadDevicesError(XMLHttpRequest, textStatus, errorThrown) {
  if (401 === XMLHttpRequest.status) {
    $.mobile.changePage( "#pageLogin" );
  }
  else {
    var errorMessage = 'Error ';
    errorMessage += XMLHttpRequest.status+': '+XMLHttpRequest.statusText;
    $('#pageDevicesList').empty();
    $('#pageDevicesList').append('<li>'+errorMessage+'</li>');
    $('#pageDevicesList').listview('refresh');
  }
  $.mobile.loading('hide');
}

$(document).ready(function() {

  $( "body>[data-role='panel']" ).panel().enhanceWithin();

  $('#username').focus();

  $("#username").keypress(function(event) {
    loginSubmitOnEnter();
  });

  $("#password").keypress(function(event) {
    loginSubmitOnEnter();
  });

  $('#loginLogIn').bind('click', function(event) {
    loginSubmit();
  });

  $('#options').on('click','a',function(event) {
    $('#options a').removeClass('selected');
    if ('logoutOptionsLink' !== event.target.id) {
      $(this).addClass('selected');
    }
  });

  $( "#device" ).on( "pagecreate", function( event, ui ) {

    $( "#deviceUsageLastWeek" ).on( "collapsibleexpand", function( event, ui ) {
      charts.chartUsageLastWeek('deviceChartUsageLastWeek');
    });

    $( "#deviceUsageLastYear" ).on( "collapsibleexpand", function( event, ui ) {
      charts.chartUsageLastYear('deviceChartUsageLastYear');
    });

  } );

});

$(document).on('pagecontainerbeforeshow', function(e, ui) {
  var pageId = $('body').pagecontainer('getActivePage').prop('id');
  if ('pageDashboard' === pageId) {
    charts.destroyCharts();
  }
  else if ('device' === pageId) {
    charts.destroyCharts();
  }
});

$(document).on('pagecontainershow', function(e, ui) {
    var pageId = $('body').pagecontainer('getActivePage').prop('id');
    if ('pageLogin' === pageId) {
      $('#username').focus();
    }
    else if ('pageDashboard' === pageId) {
      charts.chartUsageLastWeek('dashboardChartUsageLastWeek');
      charts.chartUsageLastYear('dashboardChartUsageLastYear');
    }
    else if ('pageDevices' === pageId) {
      sendRequest('devices', {}, loadDevicesSuccess, loadDevicesError);
    }
});

var charts = {
  chartWeek: null,

  chartYear: null,

  destroyCharts: function() {
    if (this.chartWeek !== null) {
      this.chartWeek.destroy();
    }
    if (this.chartYear !== null) {
      this.chartYear.destroy();
    }
  },

  chartUsageLastWeek: function(chartId) {
    $.jqplot.config.enablePlugins = true;
    var s1 = [2, 6, 7, 10, 3, 5, 8];
    var ticks = ['7 Aug', '8 Aug', '9 Aug', '11 Aug', '12 Aug', '13 Aug', '14 Aug'];

    if (this.chartWeek !== null) {
      this.chartWeek.destroy();
    }

    this.chartWeek = $.jqplot(chartId, [s1], {
      // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
      animate: !$.jqplot.use_excanvas,
      seriesDefaults:{
        renderer:$.jqplot.BarRenderer,
        pointLabels: { show: true }
      },
      axes: {
        xaxis: {
          renderer: $.jqplot.CategoryAxisRenderer,
          ticks: ticks
        }
      },
      highlighter: { show: false }
    });

  },

  chartUsageLastYear : function(chartId) {
    $.jqplot.config.enablePlugins = true;
    var s1 = [200, 250, 300, 360, 350, 425, 375, 300, 150, 250, 260, 150];
    var ticks = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb',
                'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

    if (this.chartYear !== null) {
      this.chartYear.destroy();
    }

    this.chartYear = $.jqplot(chartId, [s1], {
      // Only animate if we're not using excanvas (not in IE 7 or IE 8)..
      animate: !$.jqplot.use_excanvas,
      seriesDefaults:{
        renderer:$.jqplot.BarRenderer,
        pointLabels: { show: true }
      },
      axes: {
        xaxis: {
            renderer: $.jqplot.CategoryAxisRenderer,
            ticks: ticks
        }
      },
      highlighter: { show: false }
    });
  }
};
