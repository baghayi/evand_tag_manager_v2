
chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {
                    hostEquals: 'evand.com',
                    urlMatches: 'evand.com/events/.+'
                }}),
                new chrome.declarativeContent.PageStateMatcher({
                pageUrl: {
                    hostEquals: 'evand.com',
                    urlMatches: 'evand.com/organizations/.+'
                }}),
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

chrome.tabs.onActivated.addListener(function(){
    const kernel = new Kernel;

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo){ 
        if(changeInfo.status != "complete") return;

        kernel.run(function(jwt, page, tabId){
            if(page) {
                console.log(1);
                chrome.pageAction.setPopup({ tabId: tabId, popup: kernel.getPopup(page) });
            }
        });
    });

    kernel.run(function(jwt, page, tabId){
        console.log(2);
        if(page) chrome.pageAction.setPopup({ tabId: tabId, popup: kernel.getPopup(page) });
    });
});
