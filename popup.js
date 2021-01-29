// background.js

var copyButton = document.getElementById("copy");
var srcDomainInput = document.getElementById("srcDomain");
var targetDomainInput = document.getElementById("targetDomain");
var helperTextSpan = document.getElementById("helper-text");
var clearCookiesInput = document.getElementById("clear");

document.addEventListener(
  "DOMContentLoaded",
  async function () {
    var currentTab = await getCurrentTab();

    loadStoredDomains(currentTab);
    loadStoredOptions();

    handleCopyButtonClick(currentTab);
    handleSourceDomainEnter(currentTab);
  },
  false
);

function handleCopyButtonClick(currentTab) {
  copyButton.addEventListener(
    "click",
    async function () {
      copyCookies(currentTab);
    },
    false
  );
}

function handleSourceDomainEnter(currentTab) {
  srcDomainInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      copyCookies(currentTab);
    }
  });
}

async function loadStoredOptions(currentTab) {
  var storedClearOption = await read("clearOption");
  if (storedClearOption.checked)
    clearCookiesInput.value = storedClearOption.checked;
}

async function loadStoredDomains(currentTab) {
  var storedSrcDomain = await read("srcDomain");
  if (storedSrcDomain.srcDomain)
    srcDomainInput.value = storedSrcDomain.srcDomain;
  srcDomainInput.select();
  var targetDomain = new URL(currentTab.url).hostname;
  targetDomainInput.value = targetDomain;
}

var timer;
var warningTimer;
var errorTimer;
async function copyCookies(currentTab) {
  var srcDomain = srcDomainInput.value;
  await save("srcDomain", srcDomain);
  var targetDomain = new URL(currentTab.url).hostname;

  if (clearCookiesInput.checked) clearCookies(targetDomain);

  chrome.cookies.getAll({ domain: srcDomain }, (cookies) => {
    if (cookies.length === 0) {
      helperTextSpan.innerHTML = "This domain has no cookies";
      helperTextSpan.classList.remove("hidden");
      clearTimeout(errorTimer);
      errorTimer = setTimeout(() => {
        helperTextSpan.classList.add("hidden");
      }, 2000);
      return;
    }
    cookies.forEach((cookie) => {
      delete cookie["hostOnly"];
      delete cookie["session"];

      chrome.cookies.set(
        {
          ...cookie,
          secure: false,
          sameSite: "unspecified",
          domain: targetDomain,
          url: currentTab.url,
        },
        (cookie) => {
          if (cookie === undefined) {
            if (chrome.runtime.lastError) {
              console.log(chrome.runtime.lastError);
              helperTextSpan.innerHTML = "Some cookies failed to copy";
              helperTextSpan.classList.remove("hidden");
              helperTextSpan.classList.add("warning");
              clearTimeout(warningTimer);
              warningTimer = setTimeout(() => {
                helperTextSpan.classList.add("hidden");
                helperTextSpan.classList.remove("warning");
              }, 2000);
            }
          }
        }
      );

      copyButton.innerHTML = "Copied!";
      clearTimeout(timer);
      timer = setTimeout(() => {
        copyButton.innerHTML = "Copy Cookies";
      }, 1000);
    });
  });
}

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

function clearCookies(domain) {
  chrome.cookies.getAll({ domain: domain }, (cookies) => {
    cookies.forEach((cookie) => {
      var domain = cookie.domain;
      chrome.cookies.remove(
        { url: `https://${domain}${cookie.path}`, name: cookie.name },
        () => {}
      );
    });
  });
}

function getCurrentTab() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      function (tabs) {
        resolve(tabs[0]);
      }
    );
  });
}

function save(key, obj) {
  return new Promise((resolve, reject) => {
    var jsonfile = {};
    jsonfile[key] = obj;

    chrome.storage.local.set(jsonfile, function (saved) {
      read(key).then((val) => {});
      resolve();
    });
  });
}
