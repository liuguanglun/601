const {app, ipcMain, globalShortcut, remote} = require("electron"),
	path = require("path"),
	fs = require("fs");

const XiaoNeng = require("./src/Xiaoneng"),
	AppTray = require("./src/app/AppTray"),
	LogUtil = require("./src/utils/LogUtil"),
	Utils = require("./src/utils/Utils"),
	Channel = require("./src/utils/Channel"),
	UserStatus = require("./src/app/UserStatus"),
	{startSnapshot} = require("./src/utils/Utils");

let initData = {};

app.on("ready", () =>
{
	initView();
	initEvent();
	
	initGlobalShortcut();
	
	var checkForUpdates = require("./src/autoUpdater");
	
	checkForUpdates();
	

});

app.on("before-quit", () =>
{
	globalShortcut.unregisterAll();
});

// Quit when all windows are closed.
app.on("window-all-closed", () =>
{
	console.log("window-all-closed");
	
	if(process.platform !== "darwin")
	{
		app.quit();
	}
});

app.on("activate", () =>
{

});

let xiaoNeng, tray, logUtil, shutcutMethods = {
	"quit": () =>
	{
		appQuit();
	},
	"show": () =>
	{
		if(xiaoNeng) xiaoNeng.show(!xiaoNeng.visible)
	}
};

function initView()
{
	xiaoNeng = new XiaoNeng();
	tray = new AppTray();
	tray.setToolTip("小能");
	logUtil = new LogUtil();
	tray.onContextMenu = onContextMenu;
	tray.onTrayDoubleClick = onTrayDoubleClick;
}

function onContextMenu(mode)
{
	onOperate(null, mode);
}

function onTrayDoubleClick()
{
	if(xiaoNeng)
	{
		let visible = !xiaoNeng.visible;
		xiaoNeng.show(visible);
		xiaoNeng.sendToRender("show", [{activate: visible}]);
	}
}

function initGlobalShortcut()
{
	globalShortcut.unregisterAll();
	
	globalShortcut.register('ctrl+shift+x', () =>
	{
		onSnapshot();
	});
	
	//return;
	
	//Object.keys(shortcut)
	//.forEach(key =>
	//{
	//	if(shutcutMethods.hasOwnProperty(key))
	//	{
	//		globalShortcut.register(shortcut[key], shutcutMethods[key]);
	//	}
	//	else
	//	{
	//		globalShortcut.register(shortcut[key], () =>
	//		{
	//			xiaoNeng.sendToRender("shortcut", [key]);
	//		});
	//	}
	//})
}

function initEvent()
{
	ipcMain.on(Channel.OPERATE, onOperate);
	ipcMain.on(Channel.NEW_MESSAGE, (event, forceOpenWindow) => onNewMessage(forceOpenWindow));
	ipcMain.on(Channel.USER_STATUS, (event, status) => setMode(status));
	ipcMain.on(Channel.WRITE_LOG, (event, message) => logUtil.write(message));
	ipcMain.on(Channel.SHORT_CUT, (event) => onSnapshot());
	ipcMain.on(Channel.QUIT, (event) => appQuit());
	ipcMain.on("onresize", (event, width, height) => onResize(width, height));
	ipcMain.on("init_ipc", (event, initData) => onIpcInit(initData));
	
	xiaoNeng.on("focus", onXiaonengFocus);
}

function onIpcInit(value)
{
	if(value)
	{
		Object.assign(initData, value);
	}
}

function onResize(width, height)
{
	//console.log("main onResize ...");
	
	if(xiaoNeng)
	{
		//xiaoNeng.setContentSize(width, height);
	}
}

function onXiaonengFocus()
{
	if(tray.mode === "newmessage")
	{
		tray.setMode(null);
	}
}

function appQuit()
{
	console.log("main appQuit...");
	
	if(xiaoNeng)
		xiaoNeng.close();
	
	if(tray)
		tray.destroy();
	
	app.quit();
	
	tray = null;
	xiaoNeng = null;
}

function onSnapshot()
{
	let isShowScreen = initData.isShowScreen;
	
	if(!isShowScreen)
		xiaoNeng.show(false);
	
	startSnapshot(function(image)
	{
		if(image)
		{
			let toJPEG = image.toDataURL();
			xiaoNeng.sendToRender(Channel.SHORT_CUT, [toJPEG]);
		}
		
		if(!isShowScreen)
		{
			xiaoNeng.show(true);
		}
	})
}

function onOperate(event, operate)
{
	//console.log("onOperate operate = " + operate);
	
	switch(operate)
	{
		case "quit":
			if(xiaoNeng)
			{
				xiaoNeng.sendToRender(Channel.QUIT);
			}
			
			setTimeout(appQuit, 500);
			break;
		
		case "relaunch":
			app.relaunch({
				args: process.argv.slice(1)
				.concat(['--relaunch'])
			});
			app.exit(0);
			break;
		
		case "show":
			if(xiaoNeng) xiaoNeng.show(!xiaoNeng.visible);
			break;
		
		case "minimizable":
			if(xiaoNeng) xiaoNeng.minimize();
			break;
		
		case "maximizable":
			if(xiaoNeng) xiaoNeng.maximize();
			break;
		default:
			if(Number.isInteger(operate))
			{
				xiaoNeng.sendToRender(Channel.USER_STATUS, operate);
			}
			break;
	}
}

function onNewMessage(forceOpenWindow)
{
	if(xiaoNeng)
	{
		xiaoNeng.forceOpenWindow(forceOpenWindow === 1);
		xiaoNeng.flashFrame = true;
	}
	
	setMode(UserStatus.NEWMESSAGE, true);
}

function setMode(mode, flash = false)
{
	if(tray)
	{
		let key = tray.getStatusKey(mode);
		tray.setMode(key, flash);
	}
}

function initLoad()
{
	fs.readFile(require("./src/config/init.json"), (err, data) =>
	{
		if(err) throw err;
		
		try
		{
			let initStr = data.toString("utf-8"), loadList;
			if(!initStr)
				return;
			
			loadList = JSON.parse(initStr);
			
			for(let i = 0, len = loadList.length; i < len; i++)
			{
				//readFile(loadList[i]);
			}
		}
		catch(e)
		{
			console.log("e", e);
		}
	});
}

function readFile(fpath)
{
	try
	{
		logUtil.write("fs.readFile path = " + fpath + ", _path = " + __dirname);
		
		if(!fpath)
			return Promise.resolve();
		
		if(fpath.indexOf("/") <= -1)
		{
			fpath = "./src/config/" + fpath;
			
			if(fpath.indexOf(".") <= -1)
			{
				fpath = +".json";
			}
		}
		
		fs.readFile(require(fpath), (err, data) =>
		{
			if(err)
				logUtil.write("fs.readFile path = " + fpath + ", err = " + err);
			
			switch(fpath)
			{
				case "shortcut":
					onShortCut(data);
					break;
				
				case "visitorSource":
					onVisitorSource(data);
					break;
			}
		});
	}
	catch(e)
	{
		logUtil.write("fs.readFile path = " + fpath + ", e = " + e.stack + ", _path = " + __dirname);
	}
}

function onVisitorSource(data)
{
	let str = data.toString("utf-8"), visitorSource;
	if(!str)
		return;
	
	visitorSource = JSON.parse(str);
	
	xiaoNeng.sendToRender("visitorSource", [visitorSource]);
}

function onShortCut(data)
{
	let shortcutStr = data.toString("utf-8"), shortcut;
	if(!shortcutStr)
		return;
	
	shortcut = JSON.parse(shortcutStr);
	
	initGlobalShortcut(shortcut);
}