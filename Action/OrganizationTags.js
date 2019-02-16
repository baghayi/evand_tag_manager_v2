'use strict';

const kernel = chrome.extension.getBackgroundPage().getKernel();
kernel.run(run);

function run(jwt, page, tabId) {
    document.getElementById('tag-box').addEventListener('keypress', function(e){
        const key = e.which || e.keyCode;
        const tag = e.target.value;
        const ENTER_KEY_CODE = 13;

        if(key != ENTER_KEY_CODE) {
            return;
        }

        displayEventsList(jwt, tag, page);
    });

    async function displayEventsList(jwt, tag, page) {
        const eventsList = await fetchEventsList(tag, page);

        const listContainer = document.querySelector("div#tag-box > ul");
        listContainer.innerText = "";

        eventsList.forEach(function(event){
            const itemIdentifier = "event_id_" + event.id;

            let li = document.createElement('li');

            let label = document.createElement('label');
            label.innerText = event.name;
            label.setAttribute("for", itemIdentifier);
            li.append(label);

            let input = document.createElement('input');
            input.setAttribute("type", "checkbox");
            input.setAttribute("id", itemIdentifier);
            input.setAttribute("data-event-slug", event.slug);
            if(event.tag_exists) input.checked = true;
            input.addEventListener('change', function(e){
                addRemoveTagHandler(e, jwt, tag);
            });
            label.prepend(input);

            listContainer.append(li);
        });
    }

    function fetchEventsList(tag, page) {
        const RESOURCE_URI = "https://api.evand.com/organizations/" + page.slug + "/saleable-events?per_page=100&tagName=" + tag;
        return fetch(RESOURCE_URI, {
            headers: {
                "Content-Type" : "application/json",
                "Accept" : "application/json"
            }
        })
        .then(function(response){
            if(response.status >= 200 && response.status < 300) {
                return Promise.resolve(response);
            }else {
                return Promise.reject(new Error(response.statusText));
            }
        })
        .then((r) => r.json())
            .then((r) => r.data);
    }

    function addRemoveTagHandler(e, jwt, tagName) {
        const eventSlug = e.target.getAttribute('data-event-slug');

        if(e.target.checked === true) {
            addTag(jwt, eventSlug, tagName, e.target);
        } 
        else {
            removeTag(jwt, eventSlug, tagName, e.target);
        }
    }

    function addTag(jwt, eventSlug, tagName, checkboxInput) {
        fetch("https://api.evand.com/v2/events/shahdana/tags", {
            method: "POST",
            headers: {
                "Authorization": jwt,
                "Content-Type" : "application/json"
            },
            body: JSON.stringify({
                "tagName": tagName
            })
        })
        .then(r => r.status >= 200 && r.status < 300 ? Promise.resolve(r) : Promise.reject(new Error(r.statusText)))
        .then(function(r) {
            // @TODO a success message of some sort.
        })
        .catch((e) => checkboxInput.checked = false);
    }

    function removeTag(jwt, eventSlug, tagName, checkboxInput) {
        fetch("https://api.evand.com/v2/events/shahdana/tags/" + tagName, {
            method: "DELETE",
            headers: {
                "Authorization": jwt,
                "Content-Type" : "application/json"
            }
        })
        .then(r => r.status >= 200 && r.status < 300 ? Promise.resolve(r) : Promise.reject(new Error(r.statusText)))
        .then(function(r) {
            // @TODO a success message of some sort.
        })
        .catch((e) => checkboxInput.checked = true);
    }
}

