
class Kernel
{
    retrieveJWT(then) {
        chrome.cookies.get({"url": "https://evand.com", "name": "jwt"}, function(cookie) {
            then(decodeURI(cookie.value));
        });
    }

    makePageByTabUrl(tabUrl) {
        let pieces = tabUrl.pathname.split("/");

        switch(pieces[1]) {
            case 'events': return { type: 'event', slug: pieces[2] };
            case 'organizations': return { type: 'organization', slug: pieces[2] };
        }
    }

    retrieveTabUrl(jwt, then) {
        const that = this;
        chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
            let tabUrl = document.createElement('a');
            tabUrl.href = tabs[0].url;

            const page = that.makePageByTabUrl(tabUrl); 
            then(jwt, page, tabs[0].id);
        });
    }

    run(callWhenReady) {
        this.retrieveJWT( (jwt) => this.retrieveTabUrl(jwt, (jwt, tabUrl, tabId) => callWhenReady(jwt, tabUrl, tabId)));
    }
    
    getPopup(page) {
        switch(page.type) {
            case 'event': return "Action/EventTags.html";
            case 'organization': return "Action/OrganizationTags.html";
        }
    }
}

