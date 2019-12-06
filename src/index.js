(() => {
let proxy = "";
if (typeof fetch === "undefined") fetch = require("node-fetch");

function standardizeAlbum (album) {

	return {

		title: album.primary_text,

		url: `https://${album.url_hints.subdomain}.${"bandcamp.com"}/album/${album.url_hints.slug}`,
		genre: album.genre_text,
		artist: album.secondary_text,
		location: album.location_text || "Unknown",
		publish_date: new Date(album.publish_date),

		featured_track: album.featured_track,

		album_cover (size = 16) {return `https://f4.bcbits.com/img/${album.type}${album.art_id}_${size}.jpg`},
		bio_image (size = 16) {return `https://f4.bcbits.com/img/${album.bio_image.id}_${size}.jpg`}

	}

}

async function getLocations (options = {
	
	proxy,
	location: "Los Angeles",
	amount: 10
	
}) {

	return (await (await fetch(`${proxy}https://bandcamp.com/api/location/1/geoname_search?q=${options.location}&n=${options.amount}`)).json()).results;

}

async function getAlbums (options = {

	proxy,
	raw: false,

	amount: 10,
	pages: 0,

	sortBy: "new",
	location: 0,

	genre: "electronic",
	subgenre: "vaporwave"

}) {

	async function getPage (page) {

		return await (await fetch(`${proxy}https://bandcamp.com/api/discover/3/get_web?g=${options.genre}&s=${options.sortBy}&p=${page}&gn=${options.location}&f=all&t=${options.subgenre}&lo=true&lo_action_url=https%3A%2F%2Fbandcamp.com`)).json();

	}

	let page = 0;
	let promises = [];
	while (page !== (options.pages || Math.ceil(options.amount / 48))) {

		promises.push(getPage(page));
		page++;

	}

	promises = await Promise.all(promises);
	let final = [];

	for (const resolved of promises) {
		
		final.push(...resolved.items);

	}

	if (!options.pages) final = final.slice(0, options.amount);
	if (!options.raw) final = final.map(_ => standardizeAlbum(_));

	return final;
	
}

async function getPageType (url) {

	let pageSrc = await (await fetch(`${proxy}${url}`)).text();

	if (pageSrc.indexOf("var TralbumData =") !== -1) return "album";
	else if (pageSrc.indexOf("TralbumData =")) return "releases";

}

function getReleaseListURL (url) {

	return `${(new URL(url)).origin}/music`;

}

async function getReleases (url) {

	url = getReleaseListURL(url);

}

async function getAlbum (url) {

	let pageSrc = await (await fetch(`${proxy}${url}`)).text();

	let raw = (new Function("return " + pageSrc.slice(pageSrc.indexOf("var TralbumData =") + "var TralbumData =".length, pageSrc.indexOf("if ( window.FacebookData )") - 1).trim().slice(0, -1)))();

	var album = {

		url,
		title: raw.current.title,
		artist: raw.artist,
		
		description: raw.current.about,
		publish_date: new Date(raw.current.publish_date),
		minimum_price: raw.current.minimum_price

	}

	let i = 0;

	album.tracks = raw.trackinfo.map(_ => {

		return {

			album,

			position: i++,
			title: _.title,
			file: _.file,
			isFeatured: _.id === album.featured_track_id,
			duration: _.duration

		}

	});

	return album;

}

const _ = {

	setProxy (_proxy) {

		proxy = _proxy;

	},

	standardizeAlbum,
	getLocations,
	getAlbums,

	getPageType,
	getReleaseListURL,

	getAlbum

}

if (typeof module !== "undefined") module.exports = _;
else window.bandcrawl = _;

})();
