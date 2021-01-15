chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        console.log(request.message)
        if (request.message == "log_cookies") {
            chrome.cookies.getAll({domain: "stackoverflow.com"}, (cookies) => {
                console.log(cookies)
            })
        }
    }
  );