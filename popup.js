// background.js

document.addEventListener('DOMContentLoaded', async function() {
    var storedSrcDomain = await read('srcDomain')
    document.getElementById("srcDomain").value = storedSrcDomain.srcDomain;

    var copyButton = document.getElementById("copy");
    
    if(copyButton) {
    copyButton.addEventListener('click', async function() {
        var srcDomain = document.getElementById("srcDomain").value;
        await save('srcDomain', srcDomain);
        
        chrome.cookies.getAll({domain:srcDomain}, (cookies) => {
            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                // and use that tab to fill in out title and url
                var tab = tabs[0];
                var targetDomain = new URL(tab.url).hostname;
                cookies.forEach((cookie) => {
                    delete cookie["hostOnly"];
                    delete cookie["session"];
                    chrome.cookies.set({...cookie, domain: targetDomain, url: tab.url}, () => {})
                    copyButton.innerHTML='Copied!';
                })
            });
        })
    }, false);
    }
}, false)


function read(key) {
    return new Promise((resolve, reject) => {
        if (key != null) {
            chrome.storage.local.get(key, function (obj) {
                resolve(obj);
            });
        } else {
            reject(null);
        }
    });
}


function save(key, obj) {
    return new Promise((resolve, reject) => {
        var jsonfile = {};
        jsonfile[key] = obj;
    
        chrome.storage.local.set(jsonfile, function (saved) {
            resolve()
        });
    });
}