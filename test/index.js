const bandcrawl = require("../src");

(async () => {
	
	console.log(await bandcrawl.getReleaseListURL("https://timewavezer0.bandcamp.com/releases"));

})();
