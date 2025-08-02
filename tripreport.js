// Set up the 'Add-ons' button and exit
if (window.location.href.includes('tripreport/')) {
	console.log('Entering tripreport.js');
	var currentSort;
	addAddOnsButton();
}
// That's all for now!

function checklistListWait(action) {	// Wait until the list of checklists is displayed (ReportList-checklists is in the DOM), then perform function
	if (!document.getElementsByClassName('ReportList-checklists')[0]) { // class on ul of checklists
		console.log('Waiting in checklistListWait,', action);
		setTimeout(checklistListWait, 100, action);
	} else {
		console.log('checklistListWait wait complete for', action,'-- doing restoreButton');
		restoreButton();
//		console.log('restoreButton complete');
		let options = getOptions();

		if (currentSort === undefined) {
			console.log('currentSort was undefined');
			currentSort = 'descend';

			if (options.sortTrip == 'descend') {
				console.log('Initial call, returning');
				return;
			}
		}

		console.log('Continuing with', action);


		switch (action) {
			case 'sort':
				if (options.sortTrip != currentSort) {
					console.log('Reversed sort from', currentSort, 'to', options.sortTrip);
					currentSort = options.sortTrip;
					reverseList();
				} else {
					console.log('Current sort is', currentSort, 'option is', options.sortTrip,'Already sorted; no action');
				}
				break;
			case 'flip':
				currentSort = (currentSort == 'descend') ? 'ascend' : 'descend';
				console.log('Flipped sort to', currentSort);
				reverseList();
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

	ascendChoice.addEventListener('click', () => {
		ascendChoice.textContent = checkedBallotBox + ' ascending';
		descendChoice.textContent = uncheckedBallotBox + ' descending';
		setOption('sortTrip', 'ascend');
		beOnChecklists();
		console.log('ascendChoice');
		if (document.getElementsByClassName('ReportList-checklists')[0]) {
			checklistListWait('sort');
		} else console.log('Let flip handle it');
	});

	descendChoice.addEventListener('click', () => {
		descendChoice.textContent = checkedBallotBox + ' descending';
		ascendChoice.textContent = uncheckedBallotBox + ' ascending';
		setOption('sortTrip', 'descend');
		beOnChecklists();
		console.log('descendChoice');
		if (document.getElementsByClassName('ReportList-checklists')[0]) {
			checklistListWait('sort');
		} else console.log('Let flip handle it');
	});

	// click handler on checklists button for toggling sort
	let link = document.getElementById('stat-checklists');
	link.addEventListener('click', () => {
		console.log('Click handler');
		checklistListWait('flip');
	});

	// Check for reload on checklist panel
	const searchParams = new URLSearchParams(window.location.search);
	if (searchParams.get('view') == 'checklists' && options.sortTrip == 'ascend') {
		console.log('Reinitializing ascending sort on reload');
		checklistListWait('sort');
	}

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
	li.addEventListener('click', () => { csvExport(); restoreButton(); });
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

function restoreButton() {
	//	document.getElementById('KLFdiv').remove();	// Remove the button after click--this is the only way I can find to close the dropdown
//	document.getElementById('menuDiv').remove();	
	document.getElementById('menuDiv').blur();
	
//	addMenuDiv();	// Put a fresh button back
}

function beOnChecklists() {
	let rc;
	if (!document.getElementsByClassName('ReportList-checklists')[0]) {
		console.log('There is no list of checklists');
		const searchParams = new URLSearchParams(window.location.search);
		if (searchParams.get('view') == 'checklists') {
			alert('This trip report has no checklists in it!');
			rc = false;
		} else {
			document.getElementById('stat-checklists').click();
			rc = true;
		}
	} else
		console.log('There is a list of checklists');
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
