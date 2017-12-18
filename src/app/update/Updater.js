class Updater 
{
    constructor()
    {
        
    }
    
    
}

export default  Updater;


//自动安装 自动更新
const handleSquirreEvent = function (){
	if(process.platform != 'win32') {
		return false;
	}
	
	function executeSquirreCommand(args,done){
		var updateDotExe = path.resolve(path.dirname(process.execPath),'..','update.exe');
		var child = cp.spawn(updateDotExe,args,{ detached:true });
		child.on('close',function(code){
			done();
		});
	}
	
	function install(done){
		var target = path.basename(process.execPath);
		executeSquirreCommand(["--creatShortcut",target],done);
	}
	
	function uninstall(done){
		var target = path.basename(progress.execPath);
		executeSquirreCommand(["--removeShortcut",target]);
	}
	
	var squirrelEvent = process.argv[1];
	switch (squirrelEvent) {
		case '--squirrel-install':
			install(app.quit);
			return true;
		case '--squirrel-updated':
			install(app.quit);
			return true;
		case '--squirrel-obsolete':
			install(app.quit);
			return true;
		case '--squirrel-uninstall':
			install(app.quit);
			return true;
	}
	
	return false
}
if (handleSquirreEvent()){
	return
}