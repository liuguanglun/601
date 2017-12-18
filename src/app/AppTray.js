const path = require('path'),
	{Menu, nativeImage, Tray} = require('electron');

const UserStatus = require("./UserStatus");

class AppTray {
	
	constructor()
	{
		this.intervalIndex = -1;
		this.premode = this.getStatusKey(UserStatus.ONLINE);
		this._emptyImage = nativeImage.createEmpty();
		this.tray = new Tray(this._emptyImage);
		this.setMode(this.getStatusKey(UserStatus.ONLINE));
		this._createMenu();
	}
	
	setToolTip(tip = "")
	{
		if(this.tray)
		{
			this.tray.setToolTip(tip);
		}
	}
	
	setMode(mode, flash = false)
	{
		console.log("setMode mode = " + mode + ", this.premode = " + this.premode);
		
		if(mode && mode.length > 0)
		{
			this.premode = this.mode === "newmessage" ? this.premode : this.mode;
			this.mode = mode;
		}
		else
		{
			mode = this.premode;
		}
		
		if(this.intervalIndex !== -1)
			clearInterval(this.intervalIndex);
		
		let icon = "../assets/" + mode + ".png";
		
		if(flash)
		{
			this._trayIcon = nativeImage.createFromPath(path.join(__dirname, icon));
			let curIcon = this._trayIcon;
			this.intervalIndex = setInterval(() =>
			{
				this.tray.setImage(curIcon);
				curIcon = curIcon.isEmpty() ? this._trayIcon : this._emptyImage;
			}, 500);
		}
		else
		{
			this._trayIcon = nativeImage.createFromPath(path.join(__dirname, icon));
			
			this.tray.setImage(this._trayIcon);
		}
	}
	
	getStatusKey(status)
	{
		let label = UserStatus.getLabel(status);
		if(label)
		{
			return label.key;
		}
		
		return "";
	}
	
	destroy()
	{
		clearInterval(this.intervalIndex);
		
		if(this.tray)
		{
			this.tray.destroy();
		}
	}
	
	_createMenu()
	{
		let menuArr = [1, 3, 4].map((key) =>
		{
			let v = UserStatus.getLabel(key);
			return {
				label: v.value,
				icon: nativeImage.createFromPath(path.join(__dirname, "../assets/" + v.key + ".png")),
				click: () => this._onContextMenu(key)
			};
		});
		
		menuArr.push({
				type: "separator"
			},
			{
				label: '退出',
				click: () => this._onContextMenu("quit")
			});
		
		let contextMenu = Menu.buildFromTemplate(menuArr);
		
		this.tray.setContextMenu(contextMenu);
		this.tray.on('double-click', this._onTrayDoubleClick.bind(this));
	}
	
	_onTrayDoubleClick()
	{
		if(this.mode === "newmessage")
			this.setMode(this.premode);
		
		if(typeof this.onTrayDoubleClick === "function")
		{
			this.onTrayDoubleClick();
		}
	}
	
	_onContextMenu(mode)
	{
		console.log("_onContextMenu mode = " + mode);
		
		if(mode !== "quit")
		{
			this.setMode(this.getStatusKey(mode));
		}
		
		if(typeof this.onContextMenu === "function")
		{
			this.onContextMenu(mode);
		}
	}
}

module.exports = AppTray;