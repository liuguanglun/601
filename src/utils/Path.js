const app = require('electron').app;

const systempath = app && app.getPath('appData');

module.exports = systempath;