var session = {
  userId: 0,
  deviceId: 0,
  homePage: 'pageDevices'
}

function loginSuccess(data, status) {
  $.mobile.loading('hide');

  if ( (undefined !== data.user.name) && (undefined !== data.user.surname) ) {
    $("#optionsUsername").text(data.user.name + ' ' + data.user.surname);
  }

  $('#username').val('');
  $('#password').val('');

  if ( (undefined === data.settings.home) || (0 === $('#'+data.settings.home).length) ) {
    session.homePage = 'pageDashboard';
  }
  else {
    session.homePage = data.settings.home;
  }

  $.mobile.pageContainer.pagecontainer("change", '#'+session.homePage);
  $('#dashboardOptionsLink').addClass('selected');
}

function loginError(XMLHttpRequest, textStatus, errorThrown) {
  $.mobile.loading('hide');
  $('#dialogText').html('Wrong username or password.');
  $('#password').val('');
  $.mobile.changePage( "#dialog", { role: "dialog" } );
}

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

  sendRequest('/login', { username: loginUsername, password: loginPassword },
  loginSuccess, loginError, 'POST');

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

function sendRequest(api, options, callbackSuccess, callbackError, type) {
  $.mobile.loading( 'show', {
    text: 'Loading',
    textVisible: true,
    theme: 'b',
    textonly: false,
    html: ''
  });

  var requestType = ( (undefined === type) || ("POST" != type) ) ? "GET" : "POST";

  $.ajax({
    type: requestType,
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
      htmlListItems += '<li><a href="#" onclick="javascript: handleClickDevices('
      htmlListItems += device.id;
      htmlListItems += ');">';
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

function deviceTurnOnOff() {
  var powerState = ('on' === $('#pageDevicePower').val()) ? 'true' : 'false';
  sendRequest('device/'+session.deviceId+'/power/'+powerState, { }, function() {
    $.mobile.loading('hide');
  } , function() {
    //TODO: handle API response on error
    $.mobile.loading('hide');
  });
}

function handleClickDevices(deviceId) {
  session.deviceId = deviceId;
  $.mobile.changePage( "#pageDevice" );
}

function loadDeviceSuccess(data, status) {
  $('#pageDeviceHeaderTitle').text(data.name);
  $('#pageDeviceTitle').text(data.type);
  $.mobile.changePage( "#pageDevice" );

  $('#pageDevicePower').unbind('change');
  if (true === data.power) {
    $("#pageDevicePower").val("on").flipswitch("refresh");
  }
  else {
    $("#pageDevicePower").val("off").flipswitch("refresh");
  }
  $('#pageDevicePower').on('change', function() {
    deviceTurnOnOff();
  });

  $('#pageDeviceListFeatures').empty();
  for (var iter=0; iter< data.features.length; iter++) {
    var featureItem = '<li data-icon="check"><a href="#" data-role="button">';
    featureItem += data.features[iter];
    featureItem += '</a></li>';
    $('#pageDeviceListFeatures').append(featureItem);
  }
  $('#pageDeviceListFeatures').listview('refresh');
  $.mobile.loading('hide');
}

function loadDeviceError(XMLHttpRequest, textStatus, errorThrown) {
  if (401 === XMLHttpRequest.status) {
    $.mobile.changePage( "#pageLogin" );
  }
  else {
    //TODO: show error
    var errorMessage = 'Error ';
    errorMessage += XMLHttpRequest.status+': '+XMLHttpRequest.statusText;
    console.log(errorMessage);
  }
  $.mobile.loading('hide');
}

function loadSettingsSuccess(data, status) {
  $('#settingsHomePage').val(data.home).selectmenu('refresh');
  $.mobile.loading('hide');
}

function loadSettingsError(XMLHttpRequest, textStatus, errorThrown) {
  if (401 === XMLHttpRequest.status) {
    $.mobile.changePage( "#pageLogin" );
  }
  else {
    //TODO: show error
    var errorMessage = 'Error ';
    errorMessage += XMLHttpRequest.status+': '+XMLHttpRequest.statusText;
    console.log(errorMessage);
  }
  $.mobile.loading('hide');
}

function settingsSaved(data, status) {
  $.mobile.loading('hide');
  $.mobile.changePage( '#'+session.homePage );
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

  $('#settingsSave').bind('click', function(event) {
    var settingsHome = $('#settingsHomePage').val();
    sendRequest('settings/save', { settingsHomePage: settingsHome },
    settingsSaved, loadSettingsError, 'POST');
  });

  $('#options').on('click','a',function(event) {
    $('#options a').removeClass('selected');
    if ('logoutOptionsLink' !== event.target.id) {
      $(this).addClass('selected');
    }
    else {
      sendRequest('logout', {},
                  function(data, status) {
                    $.mobile.changePage( "#pageLogin" );
                  },
                  function(XMLHttpRequest, textStatus, errorThrown) {
                    $.mobile.changePage( "#pageLogin" );
                  });
    }
  });

  $( "#pageDevice" ).on( "pagecreate", function( event, ui ) {

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
    else if ('pageDevice' === pageId) {
      sendRequest('device/'+session.deviceId, { },
                    loadDeviceSuccess, loadDeviceError);
    }
    else if ('pageSettings' === pageId) {
      sendRequest('settings', { },
                    loadSettingsSuccess, loadSettingsError);
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
