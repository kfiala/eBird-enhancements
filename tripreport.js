// Set up the 'Add-ons' button and exit
if (window.location.href.includes('tripreport/')) {
	console.log('Entering tripreport.js');
	var listExists = false;
	addAddOnsButton();
}
// That's all for now!

function checklistListWait(action) {	// Wait until the list of checklists is displayed (ReportList-checklists is in the DOM), then perform function
	if (!document.getElementsByClassName('ReportList-checklists')[0]) { // class on ul of checklists
		console.log('Waiting in checklistListWait,', action);
		setTimeout(checklistListWait, 100, action);
	} else {
		closeMenu();

		switch (action) {
			case 'sort':
			case 'flip':
				let options = getOptions();
			
				let prior = sessionStorage.getItem('currentSort');
				console.log('At entry to checklistListWait, option setting is', options.sortTrip, '-- previous was', prior, ' -- listExists is', listExists);
				if (!listExists) {
					if (prior == null) { // this is the first time through -- use option setting						
						if (options.sortTrip == 'ascend') {
							console.log('First time through. Sort reversed to ascending according to option setting');
							reverseList();
						} else { console.log('First time through. Already descending by default, no action'); }
						sessionStorage.setItem('currentSort', options.sortTrip);

					} else { // this is a reload -- use prior setting
						if (prior == 'ascend') {
							console.log('Reset/reload. Sort reversed to ascending according to prior setting');
							reverseList();
						} else { console.log('Reset/reload. Already descending by default, no action'); }
						sessionStorage.setItem('currentSort', prior);
					}
				} else { // This is a regular call continuing a session
					if (action == 'sort') { // sort option was set; sort by new setting
						if (prior == options.sortTrip) {
							console.log('Option stays the same, no action');
						} else {
							sessionStorage.setItem('currentSort', options.sortTrip);
							reverseList();
							console.log('Changed sort to', options.sortTrip);
						}
					} else { // reverse sort from prior setting
						let newSort = prior == 'descend' ? 'ascend' : 'descend';
						sessionStorage.setItem('currentSort', newSort);
						reverseList();
						console.log('Flipped sort from', prior, 'to', newSort);
					}
				}
				listExists = true;

				console.log('currentSort set to', sessionStorage.getItem('currentSort'));

				break;
			case 'clipboard': listAllChecklists();
				break;
			case 'GPS': getGPStracks();
				break;
			default:
		}
	}
}

function addAddOnsButton() {	// Add our 'Add-ons' button
	console.log('Entering addAddOnsButton');
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

	myButton.textContent = 'Add-ons';

	/* menuDiv is the container for the list of functions: sort checklists, copy checklist URLs, etc. */
	let menuDiv = document.createElement('div');
	menuDiv.setAttribute('tabindex', '-1');
	menuDiv.setAttribute('class', 'Dropdown-panel');
	menuDiv.setAttribute('id', 'menuDiv');
	menuDiv.style.border = 'thin solid blue';

	myDiv.appendChild(menuDiv);

	/* choices is the list of functions to choose from: sort checklists, copy checklist URLs, etc. */
	let choices = document.createElement('ul');
	choices.setAttribute('class', 'u-unlist');
	menuDiv.appendChild(choices);
	choices.style.listStyle = 'none';
	choices.style.marginLeft = '2px';
	choices.style.marginBottom = 0;
	choices.style.fontWeight = '700';
	choices.style.fontSize = '.88rem';

	// Set up the individual list items in the choices list

	// List item 1: Sort checklists

	let li = document.createElement('li');
	li.setAttribute('id', 'KLFsort');
	li.textContent = 'Sort checklists';
	choices.appendChild(li);
	mouseColors(li);

	// When 'Sort check lists" is clicked, open sort options choices
	li.addEventListener('click', () => {
		let optionSpan = document.getElementById('sortOptionBar');
		if (optionSpan.style.display == 'block')
			optionSpan.style.display = 'none';
		else
			optionSpan.style.display = 'block';
	});

	// sortOptionBar opens when Sort checklists is clicked
	let sortOptionBar = document.createElement('span');
	sortOptionBar.style.display = 'none';
	sortOptionBar.style.backgroundColor = 'white';
	sortOptionBar.setAttribute('id', 'sortOptionBar');
	li.append(sortOptionBar);

	const checkedBallotBox = '\u2611';
	const uncheckedBallotBox = '\u2610';
	let options = getOptions();

	ascendBox = options.sortTrip == 'ascend' ? checkedBallotBox : uncheckedBallotBox;
	descendBox = options.sortTrip == 'descend' ? checkedBallotBox : uncheckedBallotBox;

	ascendChoice = document.createElement('span');
	ascendChoice.style.marginLeft = '2em';
	ascendChoice.textContent = ascendBox + ' ascending';
	ascendChoice.setAttribute('id', 'ascendbtn');
	ascendChoice.style.cursor = 'pointer';
	sortOptionBar.append(ascendChoice);
	mouseColors(ascendChoice);

	descendChoice = document.createElement('span');
	descendChoice.style.marginLeft = '2em';
	descendChoice.textContent = descendBox + ' descending';
	descendChoice.setAttribute('id', 'descendbtn');
	descendChoice.style.cursor = 'pointer';
	sortOptionBar.append(descendChoice);
	mouseColors(descendChoice);

	listExists = (document.getElementsByClassName('ReportList-checklists')[0] != undefined);

	ascendChoice.addEventListener('click', () => {
		ascendChoice.textContent = checkedBallotBox + ' ascending';
		descendChoice.textContent = uncheckedBallotBox + ' descending';
		setOption('sortTrip', 'ascend');
		beOnChecklists();
		console.log('ascend chosen');
		if (listExists) {
			checklistListWait('sort');
		} else console.log('List not there yet, let flip handle it');
	});

	descendChoice.addEventListener('click', () => {
		descendChoice.textContent = checkedBallotBox + ' descending';
		ascendChoice.textContent = uncheckedBallotBox + ' ascending';
		setOption('sortTrip', 'descend');
		beOnChecklists();
		console.log('descend chosen');
		if (listExists) {
			checklistListWait('sort');
		} else console.log('List not there yet, let flip handle it');
	});

	// click handler on checklists button for toggling sort
	let link = document.getElementById('stat-checklists');
	link.addEventListener('click', () => {
		console.log('Click handler');
		checklistListWait('flip');
	});
/* -------------------------------------------------------------------------------------------------- */
	console.log('Previous sort was', sessionStorage.getItem('currentSort'));
		



	const searchParams = new URLSearchParams(window.location.search);
	console.log('View is', searchParams.get('view'));
	if (searchParams.get('view') == 'checklists') {
		console.log('View is checklists');
	
		console.log(sessionStorage.getItem('currentSort'));
		if (sessionStorage.getItem('currentSort') == 'ascend') {
			console.log('Reinitializing ascending sort on reload');
			checklistListWait('sort');
		}


	}

	
	console.log('Finished with sort setup');

	// List item 2: Copy checklist URLs to clipboard

	li = document.createElement('li');
	li.setAttribute('id', 'KLFchecklists');
	li.textContent = 'Copy checklist URLs to clipboard';
	li.addEventListener('click', () => {
		beOnChecklists();
		checklistListWait('clipboard');
	});
	choices.appendChild(li);
	mouseColors(li);

	// List item 3: Download GPS tracks

	li = document.createElement('li');
	li.setAttribute('id', 'KLFgpsButton');
	li.textContent = 'Download GPS tracks';
	choices.appendChild(li);
	mouseColors(li);
	li.addEventListener('click', () => {
		beOnChecklists();
		checklistListWait('GPS');
	});

	// List item 4: Export to spreadsheet

	li = document.createElement('li');
	li.setAttribute('id', 'KLFexport');
	li.textContent = 'Export to spreadsheet';
	choices.appendChild(li);
	mouseColors(li);
	li.addEventListener('click', () => { csvExport(); closeMenu(); });
}


function mouseColors(item) {
	const selectedBackgroundColor = '#113245';
	const selectedColor = '#ffffff';
	const itemBackgroundColor = '#F0F6FA';
	const itemColor = "#00609a";

	item.style.backgroundColor = itemBackgroundColor;
	item.style.color = itemColor;

	item.addEventListener('mouseenter', () => { item.style.backgroundColor = selectedBackgroundColor });
	item.addEventListener('mouseenter', () => { item.style.color = selectedColor });	// white
	item.addEventListener('mouseleave', () => { item.style.backgroundColor = itemBackgroundColor });
	item.addEventListener('mouseleave', () => { item.style.color = itemColor });
}

function closeMenu() {
	document.getElementById('menuDiv').blur();
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
