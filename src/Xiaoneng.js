const {BrowserWindow, ipcRenderer, nativeImage} = require('electron');
const path = require('path');
const url = require('url');
const Channel = require("./utils/Channel");

class Xiaoneng {
	
	constructor()
	{
		this._initWindows();
	}
	
	_initWindows()
	{
		this._window = new BrowserWindow({
			resizable: true,
			frame: true,
			transparent: false,
			center: true,
			show: false,
			// backgroundColor:'#00000000',
			skipTaskbar: false,
			//  autoHideMenuBar: true,
			//icon: 'view/logo.png',
			//titleBarStyle: 'hidden',
			//type: 'toolbar',
			//webpreferences: {
			//	javascript: true,
			//	plugins: true,
			//	nodeIntegration: false,
			//	webSecurity: false,
			icon: nativeImage.createFromPath(path.join(__dirname, './assets/XiaoNeng.ico')),
			hasShadow: true
			//},
		});
		
		this._window.loadURL(url.format({
			pathname: path.join(__dirname, 'app/index.html'),
			protocol: 'file',
			slashes: true
		}));
		
		this._window.on('close', this._onCloseHandle.bind(this));
		
		this.setSize();
		
		//this.openDevTools();
	}
	
	setContentSize(width, height)
	{
		this._window.setSize(width, height);
	}
	
	_onCloseHandle(e)
	{
		if(this._window && this._window.isVisible())
		{
			e.preventDefault();
			this._window.hide();
		}
	}
	
	on(eventType, fn)
	{
		if(this._window)
		{
			this._window.on(eventType, fn);
		}
	}
	
	show(visible)
	{
		if(this._window)
		{
			if(this._window.isMinimized())
			{
				this._window.restore();
				
				return;
			}
			
			visible ? this._window.show() : this._window.hide();
		}
		
		this.flashFrame = false;
	}
	
	forceOpenWindow(isForce = true)
	{
		if(!this._window || !this._window.isMinimized)
			return;
		
		if(isForce)
		{
			if(this._window.isMinimized())
			{
				this._window.restore();
			}
			else if(!this.visible)
			{
				this._window.show();
			}
			else
			{
				this._window.focus();
				this._window.setAlwaysOnTop(true);
				
				this.sendToRender(Channel.FORCE_OPEN_WINDOW);
				
				setTimeout(() =>
				{
					this._window.setAlwaysOnTop(false);
				}, 0);
			}
		}
		else if(!this._window.isMinimized())
		{
			this._window.focus();
		}
		
		this.flashFrame = false;
	}
	
	sendToRender(channel, messages)
	{
		if(this._window && this._window.webContents)
		{
			this._window.webContents.send(channel, messages);
		}
	}
	
	close()
	{
		if(this._window)
		{
			this._window.close();
		}
		
		this._window = null;
	}
	
	restore()
	{
		if(this._window)
		{
			this._window.restore();
		}
	}
	
	minimize()
	{
		if(this._window)
		{
			this._window.minimize();
		}
	}
	
	maximize()
	{
		if(this._window)
		{
			this._window.maximize();
		}
	}
	
	get visible()
	{
		if(this._window)
			return this._window.isVisible();
		
		return false;
	}
	
	set flashFrame(flag)
	{
		this._window.flashFrame(flag);
	}
	
	setSize(width = 1440, height = 900)
	{
		this._window.setSize(width, height);
		this._window.show();
		this._window.center();
	}
	
	openDevTools()
	{
		if(this._window)
		{
			this._window.openDevTools();
		}
	}
}

module.exports = Xiaoneng;