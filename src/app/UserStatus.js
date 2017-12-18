let available_label = { key: "online", value: "在线" },
	busy_label = { key: "busy", value: "忙碌" },
	invisible_label = { key: "invisible", value: "隐身" },
	offline_label = { key: "offline", value: "离开" },
	newmessage_label = { key: "newmessage", value: "新消息" },
	
	UserStatus = {
		OFFLINE: 0,
		ONLINE: 1,
		INVISIBLE: 2,
		BUSY: 3,
		AWAY: 4,
		NEWMESSAGE: 6,
	};

UserStatus.getLabel = function(value)
{
	let label = null;
	
	switch(value)
	{
		case UserStatus.ONLINE:
			label = available_label;
			break;
		
		case UserStatus.BUSY:
			label = busy_label;
			break;
		
		case UserStatus.INVISIBLE:
			label = invisible_label;
			break;
		
		case UserStatus.AWAY:
		case UserStatus.OFFLINE:
			label = offline_label;
			break;
			
		case UserStatus.NEWMESSAGE:
			label = newmessage_label;
			break;
	}
	
	return label;
};

module.exports = UserStatus;