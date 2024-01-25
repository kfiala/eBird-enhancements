if (document.getElementById("checklist-tools")) {
	let h3 = document.getElementById('checklist-comments');
	if (h3) {
		console.log('Doing checklistButton');

		let button = document.createElement('button');
		button.setAttribute('class', 'Button');
		button.classList.add('Button--tiny');
		button.classList.add('Button--hollow');
		button.classList.add('u-margin-none');
		button.classList.add('u-showForMedium');
		button.style.padding = '.25rem .4rem';
		button.append('Add-on settings');
		h3.parentNode.parentNode.append(button);

		button.addEventListener('click', () => {
			document.getElementById('Eoptions').style.display = 'block';

			let NoSharingStatus = localStorage.getItem('NoSharingURL');
			let shareButton = document.getElementById('ShareBId');
			if (NoSharingStatus) {
				shareButton.textContent = 'Enable Sharing URL';
			} else {
				shareButton.textContent = 'Disable Sharing URL';
			}

			let NoDownloadStatus = localStorage.getItem('NoTrackDownload');
			let downloadButton = document.getElementById('TrackBId');
			if (NoDownloadStatus) {
				console.log('Download is disabled');
				downloadButton.textContent = 'Enable Download track';
			} else {
				console.log('Download is enabled');
				downloadButton.textContent = 'Disable Download track';
			}

			setTimeout(() => {
				window.addEventListener('click', () => { document.getElementById('Eoptions').style.display = 'none'; }, { once: true });				
			}, 10);
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
		/////////////////////////////////////////////////////////////
		shareButton.addEventListener('mouseenter', () => { shareButton.style.backgroundColor = itemBackgroundColor });
		shareButton.addEventListener('mouseenter', () => { shareButton.style.color = 'white' });
		shareButton.addEventListener('mouseleave', () => { shareButton.style.backgroundColor = BackgroundColor });
		shareButton.addEventListener('mouseleave', () => { shareButton.style.color = choicesColor });
		/////////////////////////////////////////////////////////////

		shareButton.addEventListener('click', () => { toggleItem('NoSharingURL') });

		let trackButton = document.createElement('li');
		trackButton.setAttribute('id', 'TrackBId');
		/////////////////////////////////////////////////////////////
		trackButton.addEventListener('mouseenter', () => { trackButton.style.backgroundColor = itemBackgroundColor });
		trackButton.addEventListener('mouseenter', () => { trackButton.style.color = 'white' });
		trackButton.addEventListener('mouseleave', () => { trackButton.style.backgroundColor = BackgroundColor });
		trackButton.addEventListener('mouseleave', () => { trackButton.style.color = choicesColor });
		/////////////////////////////////////////////////////////////
		trackButton.addEventListener('click', () => { toggleItem('NoTrackDownload') });
	
	
		let helpButton = document.createElement('li');
		helpButton.append('Help');
		/////////////////////////////////////////////////////////////
		helpButton.addEventListener('mouseenter', () => { helpButton.style.backgroundColor = itemBackgroundColor });
		helpButton.addEventListener('mouseenter', () => { helpButton.style.color = 'white' });
		helpButton.addEventListener('mouseleave', () => { helpButton.style.backgroundColor = BackgroundColor });
		helpButton.addEventListener('mouseleave', () => { helpButton.style.color = choicesColor });
		/////////////////////////////////////////////////////////////

		choices.append(shareButton, trackButton, helpButton);

		optionDiv.append(choices);
	} else {
		console.log('No h3');
	}
}

function toggleItem(item) {
	let onoff;
	if (localStorage.getItem(item)) 
	{
		localStorage.removeItem(item);
		onoff = 'on';
	} else {
		localStorage.setItem(item, 1);
		onoff = 'off';
	}
	if (item == 'NoTrackDownload') {
		let downloadSpan = document.getElementById('downloadGPX');
		if (downloadSpan) {
			console.log('onoff is ' + onoff)
			if (onoff == 'on')
				downloadSpan.style.display = 'block';
			else
				downloadSpan.style.display = 'none';
		}
	} else if (item == 'NoSharingURL') {
		let shareSpan = document.getElementById('KShareBtn');
		if (shareSpan) {
			if (onoff == 'on')
				shareSpan.style.display = 'block';
			else
				shareSpan.style.display = 'none';
		}
	}
}
