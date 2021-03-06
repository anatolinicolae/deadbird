$(() => {
  let base = $('base').attr('href');
  let handle = $('handle').html();
  let date = $('date').html();

  window.socket = io.connect(":" + $('socket').html());

  socket.on('status', data => {
    data = JSON.parse(data);
    if (data.fetcher.nextCheck) {
      data.fetcher.nextCheck = `${Math.floor((data.fetcher.nextCheck - Date.now())/1000)} seconds`;
    }
    if (data.checker.nextCheck) {
      data.checker.nextCheck = `${Math.floor((data.checker.nextCheck - Date.now())/1000)} seconds`;
    }
    if (data.template.nextCheck) {
      data.template.nextCheck = `${Math.floor((data.template.nextCheck - Date.now())/1000)} seconds`;
    }
    if (data.refetcher.nextCheck) {
      data.refetcher.nextCheck = `${Math.floor((data.refetcher.nextCheck - Date.now())/1000)} seconds`;
    }
    $('#fetcherLog').val(JSON.stringify(data.fetcher, null, 1));
    $('#checkerLog').val(JSON.stringify(data.checker, null, 1));
    $('#templateLog').val(JSON.stringify(data.template, null, 1));
    $('#refetcherLog').val(JSON.stringify(data.refetcher, null, 1));
  });
  setInterval(() => socket.emit('getStatus'), 1000);
  $(function () {
    if (window.location.href.slice(base.length-1).slice(0, 6) === '/stats') {
      let stats = JSON.parse($('stats').html() || "{}");
      let statUpdate = $('statUpdate').html();
      let categories = stats.map((val, ind)=>moment(val.date.slice(0, 0-14)).format('Y/MM/DD')).reverse();

      let ago = moment.duration((Date.now() - Number(statUpdate))).minutes();
      let chart = Highcharts.chart('container', {
        chart: {
          type: 'column'
        },
        plotOptions: {
          series: {
            stacking: 'normal',
            cursor: 'pointer',
            point: {
              events: {
                click: function () {
                  if (handle.length !== 0) handle += "/";
                  window.location.href = `${$('base').attr('href')}statsStream/${handle}${this.category.replace(/\//g, '-')}`;
                }
              }
            }
          }
        },
        title: {
          text: 'Tweets for last 30 days'
        },
        subtitle: {
          text: `Last updated ${ago === 0 ? "just now" : ago + " minutes ago"}`
        },
        xAxis: {
          type: 'datetime',
          labels: {
            formatter: function() {
              return this.value.slice(this.value.indexOf('/') + 1);
            }
          },
          categories: categories
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
            if (this.points.length === 2) {
              return this.x + '<br/><span style="color:'+ this.points[0].series.color +'">\u25CF</span> ' + this.points[0].series.name + ': <b>' + Math.abs(this.points[0].y) + '</b>' + '<br/><span style="color:'+ this.points[1].series.color +'">\u25CF</span> ' + this.points[1].series.name + ': <b>' + Math.abs(this.points[1].y) + '</b>';
            } else {
              return this.x + '<br/><span style="color:'+ this.points[0].series.color +'">\u25CF</span> ' + this.points[0].series.name + ': <b>' + Math.abs(this.points[0].y) + '</b>';
            }
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
      let colors = ['#07bbbe', '#ae05c2'];

      if (date !== undefined) {
        chart.series.forEach((set, index) => {
          set.data[categories.indexOf(date)].update({color:colors[index]});
        });
      }
    }
  });
});
