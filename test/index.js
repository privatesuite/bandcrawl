const bandcrawl = require("../src");

(async () => {
	
	const locations = await bandcrawl.getLocations({

		location: "Los Angeles",
		amount: 10

	});

	console.log(locations)

	const albums = await bandcrawl.getAlbums({

		// amount: 100,
		pages: 47,
		genre: "electronic",
		subgenre: "vaporwave",
		location: 0,
		sortBy: "new"
	
	});

	console.log(albums.length);

})();
