function getOptions() {
	localStorage.length;
	let options = JSON.parse(localStorage.getItem("extensionOptions"));
	let changed = false;
	if (options == null)
		options = {};
	if ('regionView' in options == false) {
		options.regionView = 'Month';
		changed = true;
	}
	if ('sharingURL' in options == false) {
		options.sharingURL = 'on';
		changed = true;
	}
	if ('trackDownload' in options == false) {
		options.trackDownload = 'on';
		changed = true;
	}
	if ('trackFormat' in options == false) {
		options.trackFormat = 'KML';
		changed = true;
	}
	if (changed) {
		localStorage.setItem('extensionOptions', JSON.stringify(options));
		options = JSON.parse(localStorage.getItem("extensionOptions"));
	}
	return options;
}

function setOption(optionName, optionValue) {
	let options = getOptions();
	options[optionName] = optionValue;
	localStorage.setItem('extensionOptions', JSON.stringify(options));
	options = JSON.parse(localStorage.getItem("extensionOptions"));
}

async function getOneTrack(checklists, i, promises) {
	if (i == 0) {
		sessionStorage.removeItem('subIdList');
	}
	let li = checklists[i];
	let id = li.getAttribute('id');
	if (!id) {
		id = 'liid' + i;
		li.setAttribute('id', id);
	}

	promises.push(fetchPage(li.querySelector('a').getAttribute('href').trim(), id, fetchTrackData));

	if (i + 1 < checklists.length) {
		setTimeout(() => {
			getOneTrack(checklists, i + 1, promises);
		}, 235);
	} else {	// At the end
		await Promise.allSettled(promises);
		handleDownload();
	}
}

async function fetchPage(path, id, callback) {	// callback is checkIfFlagged or fetchTrackData
	const url = 'https://ebird.org' + path;
	
	const response = await fetch(url, { redirect: "follow" })
	const data = await response.text();
	callback(data, { id: id, url: url });
}

function fetchTrackData(data, parms) {
	let id = parms.id;
	let url = parms.url;
	let subId = url.slice(url.lastIndexOf('/') + 1);
	let checklistTitleA = data.match('<title>.*</title>');	// Get the html title
	let checklistTitle = checklistTitleA[0].slice(7, -8);
	let canonical = url;

	if (data.search('<h3 id="flagged"') < 0) {	// Do only non-flagged checklists
		// Find the checklist URL
		let URLoffset = data.search('<link rel="canonical" href=".*">');
		if (URLoffset) {
			let canonical = data.slice(URLoffset + '<link rel="canonical" href="'.length);
			canonical = canonical.split('"')[0];
		}

		let time = data.search(/<time datetime/i);
		if (time) {
			time = data.slice(time + 16).split('"', 1)[0];
		} else { time = false }

		let offset = data.indexOf('data-maptrack-data');	// Look for the GPS data in the text
		if (offset > 0) {	// If it's there, process it
			let linend = data.indexOf('"', offset + 'data-maptrack-data="'.length + 2);
			data = data.slice(offset + 'data-maptrack-data="'.length, linend);
			storeTrack(subId, { points: data, title: checklistTitle, canonical: canonical, time: time });
			if (id) {
				document.getElementById(id).style.backgroundColor = '#8f8';
				document.getElementById(id).classList.add('alwaysShow');
			}
		} else if (id) {
			document.getElementById(id).style.backgroundColor = '#CCC';
		}
	} else { document.getElementById(id).style.backgroundColor = 'yellow'; }
}

function storeTrack(subId, checklistObject) {
	let subIdList = sessionStorage.getItem('subIdList');
	if (subIdList == null) subIdList = subId;
	else subIdList += ',' + subId;

	sessionStorage.setItem('subIdList', subIdList);
	sessionStorage.setItem(subId, JSON.stringify(checklistObject));
}

function prepareGPX() {
	let List = sessionStorage.getItem('subIdList');
	if (!List) {	// If no tracks found
		// If a shared trip report, see who the current user is.
		let current;
		let peopleDiv = document.getElementsByClassName('ReportFilter-change')[0];
		if (peopleDiv) {
			current = peopleDiv.getElementsByClassName('current')[0].textContent;
		}

		setTimeout(noTracksFound, 50, current);
		return false;
	}

	subIdList = List.split(',');

	sessionStorage.removeItem('subIdList');

	let XML = '<?xml version="1.0" encoding="UTF-8" ?><gpx version="1.1" creator="eBird"><metadata>'
		+ '<name><![CDATA[' + document.title + ']]></name>';
	let sourceURL = document.querySelector('link[rel="canonical"]');
	if (sourceURL) { // valid for single checklist and trip report, not mychecklists
		XML += '<link href="' + sourceURL.href + '"><text>' + sourceURL.href + '</text></link>'
	}
	let author = document.querySelector('meta[name="author"]');
	if (author) { // valid only for single checklist
		XML += '<author><![CDATA[' + author.content + ']]></author>'
	}
	XML += '<desc><![CDATA[' + document.title + ']]></desc>'
		+ '</metadata>';
	let subId;
	for (let i = 0; i < subIdList.length; i++) {
		subId = subIdList[i];
		
		let checklistObject = JSON.parse(sessionStorage.getItem(subId));
		sessionStorage.removeItem(subId);

		let ar = checklistObject.points.split(',');	// Convert the coordinate string into an array
		let trackPoint = [];	// Set up the array that we will put in the xml
		for (let i = 0, c = 0; i < ar.length; i += 2, c++) {
			trackPoint[c] = '<trkpt lon="' + ar[i] + '" lat="' + ar[i + 1] + '"></trkpt>';
		}
		let metadata = '<name>' + subId + '</name><desc><![CDATA[' + checklistObject.canonical + ' ' + checklistObject.title + ']]></desc>'
		if (checklistObject.time) {
			metadata += '<time>' + checklistObject.time + '</time>';
		}
		let trk = '<trk>' + metadata + '<trkseg>' + trackPoint.reduce(joiner) + '</trkseg></trk>';

		function joiner(complete, element) {
			return complete + element;
		}

		XML += trk;
	}
	XML += '</gpx>';

	return XML;
}

function prepareKML() {
	let List = sessionStorage.getItem('subIdList');
	if (!List) {	// If no tracks found
		// If a shared trip report, see who the current user is.
		let current;
		let peopleDiv = document.getElementsByClassName('ReportFilter-change')[0];
		if (peopleDiv) {
			current = peopleDiv.getElementsByClassName('current')[0].textContent;
		}

		setTimeout(noTracksFound, 50, current);
		return false;
	}

	subIdList = List.split(',');

	sessionStorage.removeItem('subIdList');

	let XML = createKMLheader();

	let subId;
	for (let i = 0; i < subIdList.length; i++) {
		subId = subIdList[i];

		let checklistObject = JSON.parse(sessionStorage.getItem(subId));
		sessionStorage.removeItem(subId);

		XML += formatSubId(subId,checklistObject);
	}
	XML += '</Folder></Document></kml>';
	return XML;
}

function formatSubId(subId, checklistObject) {
	let splitPos = checklistObject.title.indexOf(' - ');
	let title = checklistObject.title.slice(splitPos + 3);

	let XML = '<Folder>\n<name>' + subId + '</name>\n<description><![CDATA[<a href=' + checklistObject.canonical + '>checklist</a> ' + title + ']]></description>\n';

	XML += '<Folder>\n<name>Points</name>\n';

	let ar = checklistObject.points.split(',');	// Convert the coordinate string into an array
	coordinates = '<coordinates>';

	for (let i = 0, p=0; i < ar.length; i+=2, p++) {
		XML += '<Placemark><name>' + subId + '-' + p + '</name><styleUrl>#track-none</styleUrl><Point><coordinates>' + ar[i] + ',' + ar[i + 1] + ',0</coordinates> </Point></Placemark>\n';
		coordinates += ar[i] + ',' + ar[i + 1] + ',0 ';
	}
	coordinates += '</coordinates>';

	XML += '</Folder>\n<Placemark><name>Path</name><styleUrl>#lineStyle</styleUrl><LineString><tessellate>1</tessellate>\n' + coordinates + '\n';
	XML += '</LineString>\n</Placemark>\n</Folder>\n';

	return XML;	
}

function createKMLheader() { 
	let XML = '<?xml version="1.0" encoding="UTF-8"?>\n';
	
	XML += '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">\n';

	XML += '<Document>\n\t<name>eBird</name>\n\t<open>1</open>\n';
	
	XML += '\t\t<Style id="lineStyle"><LineStyle><color>99ffac59</color><width>6</width></LineStyle></Style>\n';
	XML += '\t\t<StyleMap id="track-none"><Pair><key>normal</key><styleUrl>#track-none_n</styleUrl></Pair><Pair><key>highlight</key><styleUrl>#track-none_h</styleUrl></Pair></StyleMap>\n';

	XML += '\t\t<Style id="track-none_h"><IconStyle><scale>1.2</scale><heading>0</heading><Icon><href>https://earth.google.com/images/kml-icons/track-directional/track-none.png</href></Icon></IconStyle></Style>\n';

	XML += '\t\t<Style id="track-none_n"><IconStyle><scale>0.5</scale><heading>0</heading><Icon><href>https://earth.google.com/images/kml-icons/track-directional/track-none.png</href></Icon></IconStyle><LabelStyle><scale>0</scale></LabelStyle></Style>\n';

	XML += '\\t<Folder>\n\t\t\t<name>eBird Tracks</name>\n';


	return XML;
}

function performDownload(XML) {
	// Set up a dummy anchor for downloading the xml file, then click it
	let options = getOptions();

	const link = document.createElement('a')
	link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(XML));
	let filename = document.title;
	if (options.trackFormat == 'GPX') {
		filename += '.gpx';
	}
	else if (options.trackFormat == 'KML') { filename += '.kml' };

	link.style.display = 'none'
	link.setAttribute('download', filename);
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link);
}

function noTracksFound(current) {
	if (typeof current == 'undefined') {
		alert('No GPS tracks were found.');
	} else {
		let dataFor = document.getElementsByClassName('ReportFilter-current-label')[0].textContent;

		alert('There are no tracks for ' + current + '. \nWhere it says "' + dataFor.toLocaleUpperCase() + ' ' + current + '", change it by selecting your own name from the list.');
	}
}
 
function handleDownload() {
	let options = getOptions();
	let XML = false;
	if (options.trackFormat == 'GPX') {
		XML = prepareGPX();
	} else if (options.trackFormat == 'KML') {
		XML = prepareKML();		
	} else {
		alert('Unknown format!');
	}
	if (XML) {
		performDownload(XML)
	}
}