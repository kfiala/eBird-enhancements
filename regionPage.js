if (window.location.pathname.includes('region/') | window.location.href.includes('hotspot/')) {
	let pathArray = window.location.pathname.slice(1).split('/');
	// Don't redirect if the first two path elements are the same as in referrer
	// In Firefox but not Chrome, document.referrer is empty string on a redirect; check for length of 0
	if (document.referrer.length && !document.referrer.includes(window.location.origin + '/' + pathArray[0] + '/' + pathArray[1])) {
		let options = getOptions();
		if (options.regionView != 'Month') {	// Redirect unless they are asking for the default
			switchTo(options.regionView);
		}
	}

	addRegionButton();
}

function switchTo(target) {	// Redirect to the desired view
	let URLarray = window.location.pathname.slice(1).split('/');
	let URL = window.location.origin + '/' + URLarray[0] + '/' + URLarray[1];	// Keep only the first two elements of the path

	switch (target) {
		case 'Month':
			break;
		case 'Year':
			URL += '?yr=cur';
			break;
		case 'Bird List':
			URL += '/bird-list';
			break;
		case 'Recent Checklists':
			URL += '/recent-checklists';
			break;
		default:
	}
	window.location.href = URL;
}

function selectListener() {
	let select = document.getElementById('selectView');
	let selected = select.options[select.selectedIndex].value;
	let options = getOptions();
	options.regionView = selected;
	setOption('regionView', selected);

	switchTo(selected);
}
	
function addRegionButton() {
	const focusColor = '#eeddbb';
	
	let containerDiv = document.querySelector('div.RegionSearch');

	let myDiv = document.createElement('div');
	myDiv.setAttribute('tabindex', '-1');
	myDiv.setAttribute('class', 'Dropdown');;

	let h3 = document.createElement('h3');
	h3.setAttribute('tabindex', '-1');
	h3.setAttribute('class', 'Dropdown-heading');
	h3.classList.add('u-text-3');
	myDiv.append(h3);

	let h3div = document.createElement('div');
	h3.append(h3div)
	h3div.append('Add-ons');

	let closerSpan = document.createElement('span');
	closerSpan.setAttribute('class', 'Dropdown-closer');
	h3.append(closerSpan);

	let panelDiv = document.createElement('div');
	panelDiv.setAttribute('tabindex', '-1');
	panelDiv.setAttribute('class', 'Dropdown-panel');
	myDiv.append(panelDiv);

	let panelTitleDiv = document.createElement('div');
	panelTitleDiv.append('Add-on Options');
	panelDiv.append(panelTitleDiv);

	let selectDiv = document.createElement('div');
	selectDiv.setAttribute('dontsaveselection', '');
	selectDiv.setAttribute('class', 'InputSelect');
	panelDiv.append(selectDiv);

	let label = document.createElement('label');
	label.append('Default view');
	selectDiv.append(label);
	let select = document.createElement('select');
	selectDiv.append(select);
	let optionNull = document.createElement('option');
	optionNull.setAttribute('value', '');
	optionNull.setAttribute('selected', 'selected');
	optionNull.setAttribute('disabled', 'disabled');
	optionNull.append('Change default view');
	select.style.height = '3em';
	select.setAttribute('id', 'selectView');
	select.addEventListener('change', selectListener);
	select.append(optionNull);

	let options = getOptions();

	let option1 = document.createElement('option');
	option1.setAttribute('value', 'Month');
	if (options.regionView == 'Month') {
		option1.style.backgroundColor = focusColor;
	}
	option1.append('This Month');
	select.append(option1);

	let option2 = document.createElement('option');
	option2.setAttribute('value', 'Year');
	if (options.regionView == 'Year') {
		option2.style.backgroundColor = focusColor;
	}
	option2.append('This Year');
	select.append(option2);


	let option3 = document.createElement('option');
	option3.setAttribute('value', 'Bird List');
	if (options.regionView == 'Bird List') {
		option3.style.backgroundColor = focusColor;
	}
	option3.append('Bird List');
	select.append(option3);


	let option4 = document.createElement('option');
	option4.setAttribute('value', 'Recent Checklists');
	if (options.regionView == 'Recent Checklists') {
		option4.style.backgroundColor = focusColor;
	}
	option4.append('Recent Checklists');
	select.append(option4);

	setTimeout(appendMyDiv, 200, containerDiv, myDiv);
}

function appendMyDiv(containerDiv, myDiv) {
	containerDiv.appendChild(myDiv);
}
