const server    = require('./app').server;
const app       = require('./app').app;
const initStats = require('./app').initStats;

const db = require('./models/db').init(() => initStats(() => {

  server.listen(app.get('port'));
  server.once('error', error => {
    let bind = app.get('port');
    switch (error.code) {
      case 'EACCES':
        console.log(`[server]: ${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.log(`[server]: ${bind} is already in use`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  server.once('listening', () => {
    let addr = server.address();
    let bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.log(`[server]: Listening on ${bind}`);
  });

  process.title = "Deadbird_Server";
}));
