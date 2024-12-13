if (document.getElementById("checklist-tools"))
{
	var URL =  window.location.href.replace(/\/$/,'');
	var subID = URL.split("/").pop();

	var shareDiv=document.createElement('div');
	shareDiv.style='width:100%';

	var shareSpan = document.createElement('span');
	shareSpan.setAttribute('id', 'KShareBtn');
	shareDiv.appendChild(shareSpan);
	shareSpan.style = 'margin:0 0 0 7px;padding:0 8px;border:thin green solid;background-color:#F3F7FB;font-size:.75rem;float:right;';
	shareSpan.style.cursor = 'pointer';

	var msgSpan=document.createElement('span');
	msgSpan.appendChild(document.createTextNode("URL copied to clipboard"));
	msgSpan.style='display:none;';
	msgSpan.setAttribute('id','KLFmsgSpan');

	var p = document.getElementById('share-success');
	var div = p.parentElement.previousElementSibling;
	div.parentElement.insertBefore(shareDiv,p.parentElement);
	shareDiv.appendChild(msgSpan);

	var a = document.createElement('a');
	a.appendChild(document.createTextNode("Sharing URL"));
	shareSpan.appendChild(a);
	a.setAttribute("href",'#');
	a.onclick=function(){
		navigator.clipboard.writeText('https://ebird.org/mychecklists?subID='+btoa(subID)+'&s=t');
		document.getElementById("KLFmsgSpan").style='background-color:#F3F7FB;font-size:.75rem;display:block';
		return false
	}

	let options = JSON.parse(localStorage.getItem("extensionOptions"));
	if (options.sharingURL == 'off')
		shareSpan.style.display = 'none';
	else
		shareSpan.style.display = 'block';
}
