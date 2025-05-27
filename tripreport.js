// Set up the 'Add-ons' button and exit
if (window.location.href.includes('tripreport/')) {
	addTripReportButton();
}
// That's all for now!

function tripreportWait() {	// Wait until ReportList-checklists is in the DOM, then perform function
	if (!document.getElementsByClassName('ReportList-checklists')[0]) {
		setTimeout(tripreportWait, 100);
	} else {
		let action = sessionStorage.getItem('wait');
		sessionStorage.removeItem('wait');
		restoreButton();
		switch (action) {
			case 'sort':	reverseList();
				break;
			case 'clipboard': listAllChecklists();
				break;
			case 'GPS': getGPStracks();
				break;
			default:
		}
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

	myButton.append('Add-ons');

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
			link.addEventListener('click', () => { sessionStorage.setItem('wait', 'sort'); tripreportWait() });	// Checklists button
			link.classList.add('Khandled');
		}
		sessionStorage.setItem('wait', 'sort');
		tripreportWait();
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
		tripreportWait();
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
		tripreportWait();
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

function listAllChecklists() {	// Put list of all checklist URLs in clipboard
	let url = [];
	const checklists = document.getElementsByClassName('ReportList-checklists')[0].getElementsByClassName('ChecklistItem');	// DIV in each checklist LI in the UL
	for (let i = 0; i < checklists.length; i++) {
		url.push('https://ebird.org' + checklists[i].getElementsByTagName('a')[0].getAttribute('href'));
	}
	navigator.clipboard.writeText(url.join('\n'));
}


function getGPStracks() {
	const checklists = document.getElementsByClassName('ReportList-checklists')[0].getElementsByClassName('ChecklistItem');	// DIV in each checklist LI in the UL
	let promises = [];
	getOneTrack(checklists, 0, promises);
}

function csvExport() {
	window.open('https://www.faintlake.com/eBird/compiler/?trip=' + document.location.origin + document.location.pathname,'_blank');
}
