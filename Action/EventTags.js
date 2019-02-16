'use strict';

const kernel = chrome.extension.getBackgroundPage().getKernel();
kernel.run(run);

let currentTags = [];

function run(jwt, page, tabId) {
    listEventTags(page.slug, jwt);

    document.getElementById('new-tag-please').addEventListener('keypress', function(e){
        const ENTER = 13;
        let key = e.which || e.keyCode;
        if (key !== ENTER) {
            return;
        }

        currentTags.push(this.value);
        saveTags(currentTags, page.slug, jwt);
        this.value = '';
    });
}

function listEventTags(slug, jwt) {
    fetch('https://api.evand.com/events/' + slug + '/tags?per_page=50&sort=created_at', {
        headers: {
            "Authorization": jwt,
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
        .then(function(response){
            return response.json();
        })
        .then(function(response){
            let tags = document.getElementById('fucking-tags')
            tags.innerHTML = '';
            currentTags = [];

            response.data.map(function(tag){
                currentTags.push(tag.name);
                let removeTag = document.createElement('button');
                removeTag.innerText = "X";
                removeTag.ondblclick = function(){
                    const tag = this.parentNode.getAttribute('data-tag-name');
                    const filteredTags = currentTags.filter(function(item){
                        return item != tag;
                    });

                    saveTags(filteredTags, slug, jwt);
                };

                let li = document.createElement('li');
                li.append(removeTag);
                li.append(" " + tag.name);
                li.setAttribute('data-tag-name', tag.name);
                tags.append(li);
            });
        }).catch(function(error){
            console.log('Holy SHIT', error);
        });
}

function saveTags(tags, slug, jwt) {

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (this.readyState == XMLHttpRequest.DONE && this.status >= 200 < 400) {
            listEventTags(slug, jwt);
        }else if (this.readyState == XMLHttpRequest.DONE && this.status >= 400){
            console.log('fucking-error', this);
        }
    };

    xhr.open("POST", "https://api.evand.com/events/" + slug + "/tags", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader("Authorization", jwt);
    xhr.send(JSON.stringify({
        names: tags
    }));
    return;
}

