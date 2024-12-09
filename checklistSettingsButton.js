if (document.getElementById("checklist-totals")) {	// It's a checklist
	checklistGridBug();
}

if (document.getElementById("checklist-tools")) {	// It's a checklist that we own
	let h3 = document.getElementById('checklist-comments');
	if (h3) {
		let h3Parent = h3.parentNode; // Fix CLO bug; keep "Edit comments" displayed at all times.
		let commentBtn = h3Parent.querySelector('a');
		commentBtn.classList.remove('u-showForMedium');

		let button = document.createElement('button');
		button.setAttribute('class', 'Button');
		button.setAttribute('id', 'addon');
		button.classList.add('Button--tiny');
		button.classList.add('Button--hollow');
		button.classList.add('u-margin-none');
		button.style.padding = '.25rem .4rem';
		button.textContent = 'Add-on settings';
		h3.parentNode.parentNode.append(button);
		button.addEventListener('click', () => {
			let options = getOptions();

			if (document.getElementById('Eoptions').style.display == 'block') {
				document.getElementById('Eoptions').style.display = 'none';
				window.removeEventListener('click', hidePullDown, true);
			} else {
				document.getElementById('Eoptions').style.display = 'block';
				// click handler to close options window if click occurs outside it
				window.addEventListener('click', hidePullDown, true);
			}
			buttonTextContent('ShareBId', options.sharingURL);
			buttonTextContent('TrackBId', options.trackDownload);
		});

		let optionDiv = document.createElement('div');
		optionDiv.setAttribute('id', 'Eoptions');
		optionDiv.style.border = 'thin solid blue';
		optionDiv.style.width = '12em';
		h3.parentNode.parentNode.appendChild(optionDiv);
		optionDiv.style.display = 'none';

		let choices = document.createElement('ul')
		choices.style.listStyle = 'none';
		choices.style.marginLeft = '2px';
		choices.style.marginBottom = 0;
		choices.style.fontWeight = '700';
		choices.style.fontSize = '.88rem';
		let choicesColor = "#00609a";
		choices.style.color = choicesColor;

		let itemBackgroundColor = '#113245';
		let BackgroundColor = '#F0F6FA';
		let shareButton = document.createElement('li');
		shareButton.setAttribute('id', 'ShareBId');
		shareButton.addEventListener('mouseenter', () => { shareButton.style.backgroundColor = itemBackgroundColor });
		shareButton.addEventListener('mouseenter', () => { shareButton.style.color = 'white' });
		shareButton.addEventListener('mouseleave', () => { shareButton.style.backgroundColor = BackgroundColor });
		shareButton.addEventListener('mouseleave', () => { shareButton.style.color = choicesColor });
		shareButton.addEventListener('click', () => { checklistSettingToggle('SharingURL') });

		let trackButton = document.createElement('li');
		trackButton.setAttribute('id', 'TrackBId');
		trackButton.addEventListener('mouseenter', () => { trackButton.style.backgroundColor = itemBackgroundColor });
		trackButton.addEventListener('mouseenter', () => { trackButton.style.color = 'white' });
		trackButton.addEventListener('mouseleave', () => { trackButton.style.backgroundColor = BackgroundColor });
		trackButton.addEventListener('mouseleave', () => { trackButton.style.color = choicesColor });
		trackButton.addEventListener('click', () => { checklistSettingToggle('TrackDownload') });

		let formatButton = document.createElement('li');
		formatButton.setAttribute('id', 'FormatBId');
		formatButton.addEventListener('mouseenter', () => { formatButton.style.backgroundColor = itemBackgroundColor });
		formatButton.addEventListener('mouseenter', () => { formatButton.style.color = 'white' });
		formatButton.addEventListener('mouseleave', () => { formatButton.style.backgroundColor = BackgroundColor });
		formatButton.addEventListener('mouseleave', () => { formatButton.style.color = choicesColor });
		formatButton.addEventListener('click', () => { checklistSettingToggle('downloadBar') });
		formatButton.textContent = 'Download Format';

		const checkedBallotBox = '\u2611';
		const uncheckedBallotBox = '\u2610';
		let options = getOptions();
		gpxBox = options.trackFormat == 'GPX' ? checkedBallotBox : uncheckedBallotBox;
		kmlBox = options.trackFormat == 'KML' ? checkedBallotBox : uncheckedBallotBox;

		gpxChoice = document.createElement('span');
		gpxChoice.style.marginLeft = '2em';
		gpxChoice.textContent = gpxBox + ' GPX';
		gpxChoice.setAttribute('id', 'GPXbtn');

		kmlChoice = document.createElement('span');
		kmlChoice.style.marginLeft = '2em';
		kmlChoice.textContent = kmlBox + ' KML';
		kmlChoice.setAttribute('id','KMLbtn');

		gpxChoice.addEventListener('click', () => {
			setOption('trackFormat', 'GPX');
			gpxChoice.textContent = checkedBallotBox + ' GPX';
			kmlChoice.textContent = uncheckedBallotBox + ' KML';
		});


		kmlChoice.addEventListener('click', () => {
			setOption('trackFormat', 'KML');
			kmlChoice.textContent = checkedBallotBox + ' KML';
			gpxChoice.textContent = uncheckedBallotBox + ' GPX';
		});

		let downloadSettingBar = document.createElement('span');
		downloadSettingBar.append(gpxChoice);
		downloadSettingBar.append(kmlChoice);
		downloadSettingBar.style.display = 'none';
		downloadSettingBar.setAttribute('id', 'downloadBar');
		formatButton.append(downloadSettingBar);

		let helpButton = document.createElement('li');
		helpButton.append('Help');
		helpButton.addEventListener('mouseenter', () => { helpButton.style.backgroundColor = itemBackgroundColor });
		helpButton.addEventListener('mouseenter', () => { helpButton.style.color = 'white' });
		helpButton.addEventListener('mouseleave', () => { helpButton.style.backgroundColor = BackgroundColor });
		helpButton.addEventListener('mouseleave', () => { helpButton.style.color = choicesColor });
		helpButton.addEventListener('click', () => { location.href = 'https://www.faintlake.com/eBird/extension/Enhancements/' });

		choices.append(shareButton, trackButton, formatButton, downloadSettingBar, helpButton);

		optionDiv.append(choices);
	}
}

function hidePullDown(ev) {
	if (!['ShareBId', 'TrackBId', 'FormatBId', 'GPXbtn', 'KMLbtn', 'addon'].includes(ev.target.id)) {
		document.getElementById('Eoptions').style.display = 'none';
		document.getElementById('downloadBar').style.display = 'none';
		window.removeEventListener('click', hidePullDown, true);
	}
}

function checklistSettingToggle(item) {
	// handles click on option menu item
	let options = getOptions();
	if (item == 'TrackDownload') {
		let downloadSpan = document.getElementById('downloadGPX');

		if (options.trackDownload == 'off') {
			options.trackDownload = 'on';
			if (downloadSpan) downloadSpan.style.display = 'block';
		} else {
			options.trackDownload = 'off';
			if (downloadSpan) downloadSpan.style.display = 'none';
		}
		buttonTextContent('TrackBId', options.trackDownload);

	} else if (item == 'SharingURL') {
		let shareSpan = document.getElementById('KShareBtn');

		if (options.sharingURL == 'off') {
			options.sharingURL = 'on';
			shareSpan.style.display = 'block';
		} else {
			options.sharingURL = 'off';
			shareSpan.style.display = 'none';
		}
		buttonTextContent('ShareBId', options.sharingURL);

	} else if (item == 'downloadBar') {
		let optionSpan = document.getElementById('downloadBar');

		if (optionSpan.style.display == 'block')
			optionSpan.style.display = 'none';
		else
			optionSpan.style.display = 'block';
	}

	localStorage.setItem('extensionOptions', JSON.stringify(options));
}

function buttonTextContent(button, onoff) {
	// Set text on option menu item button
	let optionButton = document.getElementById(button);
	switch (button) {
		case 'TrackBId':
			if (onoff == 'on')
				optionButton.textContent = 'Disable Download track';
			else
				optionButton.textContent = 'Enable Download track';
			break;
		case 'ShareBId':
			if (onoff == 'on')
				optionButton.textContent = 'Disable Sharing URL';
			else
				optionButton.textContent = 'Enable Sharing URL';
			break;
		default:
	}
	
}

function checklistGridBug() {
	// Fix CLO's bug in grid layout
	let divList = document.querySelectorAll('.Observation-tools');
	for (let d of divList) {
		d.style.gridColumn = "3/4";
	}
}
