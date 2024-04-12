// Set up the 'Add-ons' button and exit
if (window.location.href.includes('tripreport/')) {
	addTripReportButton();
}
// That's all for now!

function wait() {	// Wait until ReportList-checklists is in the DOM, then perform function
	if (!document.getElementsByClassName('ReportList-checklists')[0]) {
		setTimeout(wait, 100);
	} else {
		let action = sessionStorage.getItem('wait');
		restoreButton();
		switch (action) {
			case 'sort':	reverseList();
				break;
			case 'clipboard': listAllChecklists();
				break;
			case 'GPS': getAllTracks();
				break;
			default:
		}
		sessionStorage.removeItem('wait');
	}
}

function addTripReportButton() {	// Add our 'Add-ons' button
	let containerDiv = document.querySelector('div.ReportMetaTools');

	let myDiv = document.createElement('div');
	myDiv.setAttribute('tabindex', '-1');
	myDiv.setAttribute('class', 'Dropdown');
	myDiv.setAttribute('id', 'KLFdiv');
	containerDiv.appendChild(myDiv);

	let span1 = document.createElement('span');
	span1.setAttribute('tabindex', '-1');
	span1.setAttribute('class', 'Dropdown-heading');
	myDiv.appendChild(span1);

	let myButton = document.createElement('button');
	myButton.setAttribute('class', 'Button');
	myButton.classList.add('Button--reverse');
	myButton.classList.add('Button--small');
	myButton.classList.add('Button--hollow');
	myButton.setAttribute('id', 'addon-button');
	span1.appendChild(myButton);

	let span2 = document.createElement('span');
	span2.setAttribute('class', 'u-showForMedium');
	let addonsText = document.createTextNode('Add-ons');
	span2.appendChild(addonsText);
	myButton.appendChild(span2);

	let menuDiv = document.createElement('div');
	menuDiv.setAttribute('tabindex', '-1');
	menuDiv.setAttribute('class', 'Dropdown-panel');
	myDiv.appendChild(menuDiv);

	let ul = document.createElement('ul');
	ul.setAttribute('class', 'u-unlist');
	menuDiv.appendChild(ul);

	// List item 1

	let li = document.createElement('li');
	li.setAttribute('id', 'KLFsort');
	let a1 = document.createElement('a');
	a1.appendChild(document.createTextNode('Sort checklists'));
	a1.setAttribute('href', '#');
	li.appendChild(a1);
	ul.appendChild(li);
	a1.addEventListener('click', () => {
		beOnChecklists();
		let link = document.getElementById('stat-checklists');
		if (!link.classList.contains('Khandled')) {
			link.addEventListener('click', () => { sessionStorage.setItem('wait', 'sort'); wait() });	// Checklists button
			link.classList.add('Khandled');
		}
		sessionStorage.setItem('wait', 'sort');
		wait();
	});

	// List item 2

	li = document.createElement('li');
	li.setAttribute('id', 'KLFchecklists');
	let a2 = document.createElement('a');
	a2.appendChild(document.createTextNode('Copy checklist URLs to clipboard'));
	li.appendChild(a2);
	a2.setAttribute('href', '#');
	a2.addEventListener('click', () => {
		beOnChecklists();
		sessionStorage.setItem('wait', 'clipboard');
		wait();
	});
	ul.appendChild(li);

	// List item 3

	li = document.createElement('li');
	li.setAttribute('id', 'KLFgpsButton');
	let a3 = document.createElement('a');
	a3.appendChild(document.createTextNode('Download GPS tracks'));
	a3.setAttribute('href', '#');
	li.appendChild(a3);
	ul.appendChild(li);
	a3.addEventListener('click', () => {
		beOnChecklists();
		sessionStorage.setItem('wait', 'GPS');
		wait();
	});

	// List item 4

	li = document.createElement('li');
	li.setAttribute('id', 'KLFexport');
	let a4 = document.createElement('a');
	a4.appendChild(document.createTextNode('Export to spreadsheet'));
	a4.setAttribute('href', '#');
	li.appendChild(a4);
	ul.appendChild(li);
	a4.addEventListener('click', () => { csvExport(); restoreButton(); });
}

function restoreButton() {
	document.getElementById('KLFdiv').remove();	// Remove the button after click--this is the only way I can find to close the dropdown
	addTripReportButton();	// Put a fresh button back
}

function beOnChecklists() {
	let rc;
	if (!document.getElementsByClassName('ReportList-checklists')[0]) {
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.get('view') == 'checklists') {
			alert('This trip report has no checklists in it!');
			rc = false;
		} else {
			document.getElementById('stat-checklists').click();
			rc = true;
		}
	}
	return rc;
}

function reverseList() {
	let sorted = [];
	let theList = document.querySelector('ul.ReportList-checklists');
	let items = theList.querySelectorAll('li');
	items.forEach((li) => { sorted.push(li); li.remove(); });

	while (sorted.length) {
		theList.appendChild(sorted.pop());
		}
}

function listAllChecklists() {
	let list = document.getElementsByClassName('ReportList-checklists')[0];
	let URL = [];
	const checklists = list.getElementsByClassName('ChecklistItem');
	for (let i = 0; i < checklists.length; i++) {
		URL.push('https://ebird.org' + checklists[i].getElementsByTagName('a')[0].getAttribute('href'));
	}
	navigator.clipboard.writeText(URL.join('\n'));
}


function getAllTracks() {
	// Get the list of checklists
	let list = document.getElementsByClassName('ReportList-checklists')[0];
	let subIdList = [];
	let promises = [];

	let TripURL = document.querySelector('link[rel="canonical"]').href;
	let XML = '<?xml version="1.0" encoding="UTF-8" ?><gpx version="1.1" creator="eBird"><metadata>'
		+ '<name><![CDATA[' + document.title + ']]></name>'
		+ '<link href="' + TripURL + '"><text>' + TripURL + '</text></link>'
		+ '<desc><![CDATA[' + document.title + ']]></desc>'
		+ '<author><![CDATA[' + document.querySelector('meta[name="description"]').content + ']]></author>'
		+ '</metadata>';

	const checklists = list.getElementsByClassName('ChecklistItem');
	let returnValue;
	for (let i = 0; i < checklists.length; i++) {	// Iterate through the checklist URLs
		// Get the subId from the end of the URL
		let URL = 'https://demo.ebird.org' + checklists[i].getElementsByTagName('a')[0].getAttribute('href');
		let lastslash = URL.lastIndexOf('/');
		let subId = URL.slice(lastslash + 1);
		subIdList.push(subId);

		// Get a promise for the GPS track for this checklist
		returnValue = getTrack(URL, subId);
		promises.push(returnValue);	// Save a list of the promises.
	}
	finishTracks(promises, XML, subIdList);	// Retrieve the tracks and write the xml.
}


async function getTrack(URL, subId) {	// Get the GPS track for one checklist
	let response = await fetch(URL);		// Fetch the URL
	let text = await response.text();	// Get the html for the checklist as text
	let checklistTitleA = text.match('<title>.*</title>');	// Get the html title
	let checklistTitle = checklistTitleA[0].slice(7, -8);

	// Find the checklist URL
	let URLoffset = text.search('<link rel="canonical" href=".*">');
	if (URLoffset) {
		let URL = text[URLoffset + '<link rel="canonical" href="'.length];
		URL = URL.split('"')[0];
	}

	if (text.search('<h3 id="flagged"') < 0) {	// Exclude flagged checklists
		let offset = text.indexOf('data-maptrack-data');	// Look for the GPS data in the text
		if (offset > 0) {	// If it's there, process it
			let linend = text.indexOf('"', offset + 'data-maptrack-data="'.length + 2);
			let data = text.slice(offset + 'data-maptrack-data="'.length, linend);
			saveTrack(subId, { points: data, title: checklistTitle, URL: URL });
		}
	}
}

function saveTrack(subId, checklistObject) {	// Take the string of coordinates and turn them into xml
	let ar = checklistObject.points.split(',');	// Convert the coordinate string into an array
	let trackPoint = [];	// Set up the array that we will put in the xml
	for (let i = 0, c = 0; i < ar.length; i += 2, c++) {
		trackPoint[c] = '<trkpt lon="' + ar[i] + '" lat="' + ar[i + 1] + '"></trkpt>';
	}
	sessionStorage.setItem(subId, '<trk><name>' + subId + '</name><desc><![CDATA[' + checklistObject.URL + ' ' + checklistObject.title + ']]></desc><trkseg>' + trackPoint.reduce(joiner) + '</trkseg></trk>');
}

function joiner(complete, element) {
	return complete + element;
}

async function finishTracks(promises, XML, subIdList) { // Wait for all the xml to be ready then save it
	let total = 0;
	let spinner = addSpinner();
	await Promise.allSettled(promises);
	document.body.removeChild(spinner);

	for (let i = 0; i < subIdList.length; i++) {
		let subId = subIdList[i];
		let track = sessionStorage.getItem(subId);
		if (track) {
			XML += track;
			total += track.length;
		}
	}
	XML += '</gpx>';

	// If a shared trip report, see who the current user is.
	let current;
	let peopleDiv = document.getElementsByClassName('ReportFilter-change')[0];
	if (peopleDiv) {
		current = peopleDiv.getElementsByClassName('current')[0].textContent;
	}

	if (!total) {	// If no tracks found
		setTimeout(abort, 50, current);
		return;
	}

	// Set up a dummy anchor for downloading the xml file, then click it
	const link = document.createElement('a')
	link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(XML))
	link.setAttribute('download', document.title + '.gpx');
	link.style.display = 'none'
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link);
}

function abort(current) {
	if (typeof current == 'undefined') {
		alert('No tracks were found in this trip report.');
	} else {
		let dataFor = document.getElementsByClassName('ReportFilter-current-label')[0].textContent;

		alert('There are no tracks for ' + current + '. \nWhere it says "' + dataFor.toLocaleUpperCase() + ' ' + current + '", change it by selecting your own name from the list.');
	}
}

function addSpinner() {
	let spinOuter = document.createElement('div');	// Outer container for spinner and text
	spinOuter.style.position = 'absolute';
	spinOuter.style.top = '45%';
	spinOuter.style.left = '45%';
	spinOuter.style.width = '160px';
	spinOuter.style.height = '160px';

	let spinInner = document.createElement('div');	// Inner container for spinner
	spinInner.style.border = '16px solid #f3f3f3';
	spinInner.style.borderTop = '16px solid #34ab98';
	spinInner.style.borderRadius = '50%';
	spinInner.style.width = '160px';
	spinInner.style.height = '160px';
	spinInner.style.animation = 'spin 2s linear infinite';

	let spinText = document.createElement('div');	// Inner container for text
	spinText.appendChild(document.createTextNode('Finding tracks'));
	spinText.style.position = 'absolute';
	spinText.style.top = '65px';
	spinText.style.left = '25px';
	spinText.style.backgroundColor = '#34ab98';
	spinText.style.color = 'white';
	spinText.style.padding = '5px';
	spinText.style.borderRadius = '5px';

	spinOuter.appendChild(spinInner);
	spinOuter.appendChild(spinText);

	document.body.appendChild(spinOuter);
	return (spinOuter);
}

function csvExport() {
	window.open('https://www.faintlake.com/eBird/compiler/?trip=' + document.location.origin + document.location.pathname,'_blank');
}
