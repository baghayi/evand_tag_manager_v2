
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

const kernel = new Kernel;
function getKernel() {
    return kernel;
}

chrome.tabs.onActivated.addListener(function(){

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo){ 
        if(changeInfo.status != "complete") return;

        getKernel().run(function(jwt, page, tabId){
            if(page) {
                chrome.pageAction.setPopup({ tabId: tabId, popup: getKernel().getPopup(page) });
            }
        });
    });

    getKernel().run(function(jwt, page, tabId){
        if(page) chrome.pageAction.setPopup({ tabId: tabId, popup: getKernel().getPopup(page) });
    });
});
