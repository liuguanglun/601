let Utils = {};
const {clipboard} = require("electron"),
	path = require("path"),
	childProcess = require("child_process"),
	fs = require("fs");

const LogUtil = require("./LogUtil");
const systempath = require('./Path');

let logUtil = new LogUtil()

const exec = childProcess.exec;

Utils.startSnapshot = function(callBack)
{
	if(typeof callBack !== "function")
		return;
	
	let updateDotExe = path.resolve(path.dirname(__dirname), ".", "config/snapshot.exe");
	
	logUtil.write("updateDotExe = " + updateDotExe);
	logUtil.write("exec = " + exec);
	
	let snapshot = exec(updateDotExe);
	
	logUtil.write("childProcess = " + snapshot);
	
	if(!snapshot)
		return;
	
	snapshot.on("close", (code, signal) =>
	{
		console.log("startSnapshot close...");
		
		callBack(clipboard.readImage());
		clipboard.clear();
		
		snapshot.kill(signal);
		snapshot = null;
	});
};

var request = require("request");
var progress = require('request-progress');

/**
 * 单个下载文件
 * url 网络文件地址
 * filename 文件名
 * callback 回调函数
 */
Utils.downloadFile = function(url, filename, callback)
{
	var stream = fs.createWriteStream(filename);
	callback = typeof callback === "function" ? callback : () =>
	{
	};
	
	progress(request(url))
	.on('progress', function(state)
	{
		// The state is an object that looks like this:
		// {
		//     percent: 0.5,               // Overall percent (between 0 to 1)
		//     speed: 554732,              // The download speed in bytes/sec
		//     size: {
		//         total: 90044871,        // The total payload size in bytes
		//         transferred: 27610959   // The transferred payload size in bytes
		//     },
		//     time: {
		//         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
		//         remaining: 81.403       // The remaining seconds to finish (3 decimals)
		//     }
		// }
		callback('progress', state);
		
		console.log("progress percent = ", state.percent);
	})
	.on('error', function(err)
	{
		// Do something with err
		callback('error', err);
		console.log("progress err");
	})
	.on('end', function()
	{
		callback('end');
		console.log("progress end");
	})
	.on('close', function()
	{
		callback('close');
		console.log("progress close");
	})
	.pipe(stream);
};

/**
 * 批量下载
 * @param Array urls 下载数组 [{fileName, sourceUrl}]
 * @param dist 下载文件夹
 * @param callback 下载完成回调函数
 * */
Utils.batchDownload = function(urls, dist = "image", callback = null)
{
	if(!Array.isArray(urls) || urls.length <= 0)
	{
		if(typeof callback === "function")
		{
			callback();
		}
		
		return;
	}
	
	let url = urls.pop(), path = systempath + "/xiaoneng/down/";
	
	Utils.mkdir(path);
	
	path = systempath + "/xiaoneng/down/" + dist + "/";
	
	Utils.mkdir(path);
	
	if(url)
	{
		let fileName = url.fileName,
			sourceUrl = url.sourceUrl;
		
		Utils.downloadFile(sourceUrl, path + fileName, function()
		{
			Utils.batchDownload(urls, dist, callback);
		});
	}
	else
	{
		Utils.batchDownload(urls, dist, callback);
	}
};

Utils.mkdir = function(path)
{
	if(!fs.existsSync(path))
	{
		fs.mkdirSync(path);
	}
};

module.exports = Utils;