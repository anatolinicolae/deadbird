$(() => {
  window.socket = io.connect(":" + $('socket').html());
  let stats = JSON.parse($('stats').html());

  socket.on('status', data => {
    data = JSON.parse(data);
    if (data.fetcher.nextCheck) {
      data.fetcher.nextCheck = `${Math.floor((data.fetcher.nextCheck - new Date().getTime())/1000)} seconds`;
    }
    if (data.checker.nextCheck) {
      data.checker.nextCheck = `${Math.floor((data.checker.nextCheck - new Date().getTime())/1000)} seconds`;
    }
    if (data.template.nextCheck) {
      data.template.nextCheck = `${Math.floor((data.template.nextCheck - new Date().getTime())/1000)} seconds`;
    }
    $('#fetcherLog').val(JSON.stringify(data.fetcher, null, 1));
    $('#checkerLog').val(JSON.stringify(data.checker, null, 1));
    $('#templateLog').val(JSON.stringify(data.template, null, 1));
  });
  setInterval(() => socket.emit('getStatus'), 1000);

  $(function () {
    Highcharts.chart('container', {
        chart: {
            type: 'column'
        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        title: {
            text: 'Tweets for last 30 days'
        },
        xAxis: {
            categories: stats.map((val, ind)=>moment(val.date.slice(0, 0-14)).format('MM/DD')).reverse()
        },
        yAxis: {
            labels: {
                formatter: function() {
                    return Math.abs(this.value);
                }
            }
        },
        tooltip: {
            formatter: function() {
                return this.x + '<br/><span style="color:'+ this.points[0].series.color +'">\u25CF</span> ' + this.points[0].series.name + ': <b>' + Math.abs(this.points[0].y) + '</b>' + '<br/><span style="color:'+ this.points[1].series.color +'">\u25CF</span> ' + this.points[1].series.name + ': <b>' + Math.abs(this.points[1].y) + '</b>';
            },
            shared: true
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Created',
            data: stats.map((val, ind) => val.added).reverse(),
            color: "#19C205"
        }, {
            name: 'Deleted',
            data: stats.map((val, ind) => -val.deleted).reverse(),
            color: "#BE0A07"
        }]
    });
});
});