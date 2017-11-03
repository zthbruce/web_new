var config = {
	"appenders":
		[
			{
				"type":"console"
			},
			{
				"category":"blmlog",
				"type":"dateFile",
				"filename":"./logs/rizhi",
				"alwaysIncludePattern":true,
				"pattern":"yyyyMMdd.log"
			}
		]
};

function ConfigLog(){
	this.getConfig = function (){
		return config;
	};

}

module.exports = ConfigLog;