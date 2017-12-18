const fs = require("fs");
const systempath = require('./Path');

class LogUtil {
	
	constructor()
	{
		return;
		this._fileId = -1;
		this._messages = "";
		this._appDataPath = systempath + "/xiaoneng/log/";
		
		if(!fs.existsSync(systempath + "/xiaoneng/"))
		{
			fs.mkdirSync(systempath + "/xiaoneng/");
		}
		
		if(!fs.existsSync(this._appDataPath))
		{
			fs.mkdirSync(this._appDataPath);
		}
		
		this._createWriteStream();
		this.startWrite();
	}
	
	_createWriteStream()
	{
		let options = {
			autoClose: true,
		};
		
		this.stream = fs.createWriteStream(this._appDataPath + this._createFileName(), options);
	}
	
	_padTime(number)
	{
		return this._zeroFill(number, 2);
	}
	
	_zeroFill(number, targetLength, forceSign = false)
	{
		let absNumber = '' + Math.abs(number),
			zerosToFill = targetLength - absNumber.length,
			sign = number >= 0;
		
		return (sign ? (forceSign ? "+" : "") : "-") + Math.pow(10, Math.max(0, zerosToFill))
			.toString()
			.substr(1) + absNumber;
	}
	
	_createFileName()
	{
		let date = new Date(), now = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " "
			+ this._padTime(date.getHours()) + "-" + this._padTime(date.getMinutes()) + "-" + this._padTime(date.getSeconds())
			+ "-" + this._padTime(date.getMilliseconds(), true);
		
		return now + ".log";
	}
	
	write(message)
	{
		if(!this.stream)
		{
			this._createWriteStream();
		}
		
		this.stream.write(message + "\n");
	}
	
	startWrite()
	{
		this._id = setInterval(function()
		{
			this._streamEnd();
		}.bind(this), 30 * 60 * 1000 * 1000);
	}
	
	stopWrite()
	{
		clearInterval(this._id);
		
		this._streamEnd();
	}
	
	_streamEnd()
	{
		if(this.stream)
		{
			this.stream.end();
			this.stream.close();
			this.stream = null;
		}
	}
}

module.exports = LogUtil;