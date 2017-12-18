const {ipcRenderer, remote} = require('electron'),
	{batchDownload} = require("../utils/Utils"),
	path = require("path");

let common = {};
common.ipc = ipcRenderer;
common.device = "exe";
common.batchDownload = batchDownload;
common.path = path;

window.resize = function(width, height)
{
	ipcRenderer.send("onresize", width, height);
};

window["common_electron"] = common;