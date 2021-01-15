// background.js

document.addEventListener('DOMContentLoaded', async function() {
    var storedSrcDomain = await read('srcDomain')
    if(storedSrcDomain.srcDomain)
    document.getElementById("srcDomain").value = storedSrcDomain.srcDomain;

    var copyButton = document.getElementById("copy");
    var currentTab = await getCurrentTab();

    var targetDomain = new URL(currentTab.url).hostname;
    document.getElementById("targetDomain").value = targetDomain;


    if(copyButton) {
    copyButton.addEventListener('click', async function() {
        var srcDomain = document.getElementById("srcDomain").value;
        await save('srcDomain', srcDomain);
        
        chrome.cookies.getAll({domain:srcDomain}, (cookies) => {      
            cookies.forEach((cookie) => {
                delete cookie["hostOnly"];
                delete cookie["session"];
                chrome.cookies.set({...cookie, domain: targetDomain, url: currentTab.url}, () => {})
                copyButton.innerHTML='Copied!';
            })
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


function getCurrentTab() {
    return new Promise((resolve, reject) => {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        resolve(tabs[0])
    });
    })
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