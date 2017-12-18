const Utils = require("./utils/Utils");

module.exports = checkForUpdates = function()
{
	var {version, updateUrl} = require('../package.json');
	
	const systempath = require('./utils/Path'),
		fs = require("fs"),
		Utils = require("./utils/Utils");
	
	updateUrl = "http://filestorage-base.ntalker.com/file/?key=L2NsaWVudC8xNTEzMDcwOTk4NTcwMjA1ODkxNjk3NC5qc29u"
	
	if(!updateUrl)
		return;
	
	var request = require('request');
	
	request(updateUrl, function(error, response, body)
	{
		console.log('error:', error); // Print the error if one occurred
		console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
		console.log('body:', body); // Print the HTML for the Google homepage.
		
		if(!body)
			return;
		
		try
		{
			packageInfo = JSON.parse(body) || {};
			
			let {version: nextVersion, url} = packageInfo;
			
			url = "http://filestorage-base.ntalker.com/file/?key=L2NsaWVudC8xNTEzMDcyNDg2MDc5LTc1NDI3MTExNi5leGU="
			
			if(!version || !nextVersion || !url)
				return;
			
			version = version.split("_")
			.pop();
			nextVersion = nextVersion.split("_")
			.pop();
			
			let exePath = systempath + "/xiaoneng/down/exe/" + nextVersion + ".exe";
			
			if(nextVersion.charAt(0) > version.charAt(0) || nextVersion.charAt(2) > version.charAt(2))
			{
				//强制升级
				downExe(url, exePath, downEnd.bind(null, exePath))
			}
			else if(nextVersion > version)
			{
				//推荐升级
				const {dialog} = require('electron');
				
				const options = {
					type: 'info',
					title: '信息',
					message: "有新版本，是否升级？",
					buttons: ['是', '否']
				}
				
				dialog.showMessageBox(options, function(index)
				{
					console.log(arguments, index);
					
					if(index === 0)
					{
						downExe(url, exePath, downEnd.bind(null, exePath))
					}
				});
			}
		}
		catch(jsonError)
		{
			console.log(`Invalid result:\n${jsonError}`)
			
		}
	});
}

function downExe(sourceUrl, fileName, callback)
{
	Utils.downloadFile(sourceUrl, fileName, callback);
}

function downEnd(exePath, type)
{
	if(type === "close")
	{
		setTimeout(() =>
		{
			const ChildProcess = require('child_process')
			spawnedProcess = ChildProcess.spawn(exePath);
		}, 1000)
	}
}