$(document).ready(function() {

  $( "body>[data-role='panel']" ).panel().enhanceWithin();

  $('#loginLogIn').bind('click', function(event) {
    $.mobile.pageContainer.pagecontainer("change", "#dashboard");
    $('#dashboardOptionsLink').addClass('selected');
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
  if ('dashboard' === pageId) {
    charts.destroyCharts();
  }
  else if ('device' === pageId) {
    charts.destroyCharts();
  }
});

$(document).on('pagecontainershow', function(e, ui) {
    var pageId = $('body').pagecontainer('getActivePage').prop('id');
    if ('dashboard' === pageId) {
      charts.chartUsageLastWeek('dashboardChartUsageLastWeek');
      charts.chartUsageLastYear('dashboardChartUsageLastYear');
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
