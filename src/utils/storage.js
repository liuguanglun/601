const fs = require("fs");
const systempath = require('./Path');

let appDataPath = systempath + "/XiaoNeng/";

if(!fs.existsSync(appDataPath))
{
	fs.mkdirSync(appDataPath);
}

function mkdir(paths)
{
	if(paths.length >= 3)
		return "";
	
	let path;
	if(paths.length === 1)
	{
		return appDataPath;
	}
	else if(paths.length === 2)
	{
		path = appDataPath + paths[0];
	}
	
	if(!fs.existsSync(path))
	{
		fs.mkdirSync(path);
	}
	
	return path;
}

function getData(key, callback, extension = "json")
{
	try
	{
		let paths = key.split("/"), path = mkdir(paths) + paths.pop();
		
		path += extension ? "." + extension : extension;
		fs.readFile(path, function(error, object)
		{
			if(!error)
			{
				var objectJSON = JSON.parse(object);
				
				return callback(null, objectJSON);
			}
			
			if(error.code === "ENOENT")
				return callback(null, JSON.stringify({}));
			
			return callback(error);
		});
	}
	catch(error)
	{
		return callback(new Error("Invalid data"));
	}
}

function setData(key, json, callback = null, extension = "json")
{
	let paths = key.split("/"), path,
		data = JSON.stringify(json);
	
	path = mkdir(paths) + paths.pop();
	path += extension ? "." + extension : extension;
	
	if(!data)
		return callback(new Error("Invalid JSON data"));
	
	fs.writeFile(path, data, (err) =>
	{
		if(err)
		{
			callback(new Error("err"));
		}
	});
}

module.exports = {mkdir, getData, setData, appDataPath};