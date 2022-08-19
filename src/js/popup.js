const getContent = (state) => {
  const { profile, featured_serp, result = {}, practiceData } = state;
  const out = [];
  if (profile) {
    const render = new ProfileRenderer(profile);
    out.push(render.render());
  }
  else if (featured_serp || result.serp) {
    const render = new SERPDataRender(featured_serp, result.serp);
    out.push(render.render());
  }
  else if (practiceData) {
    const render = new PracticeDataRenderer(practiceData);
    out.push(render.render());
  }

  else {
    out.push('<div>Looks like this page type is not supported <span class="material-symbols-outlined">sentiment_dissatisfied</span></div>')
  }

  return out.join('\n');
}


const onCopyValueClickEventHandler = (e) => {
  const { id } = e.target;
  const text = document.querySelector(`[data-copy-button=${id}]`).textContent;
  navigator.clipboard.writeText(text).then(() => {
    //clipboard successfully set
    console.log('success');
  }, () => {
    //clipboard write failed, use fallback
    console.log('fail');
  });
}

const onCopyDataClickEventHandler = (e) => {
  const data = JSON.parse(e.target.attributes['data-data'].value);
  navigator.clipboard.writeText(JSON.stringify(data,'', 2)).then(() => {
    //clipboard successfully set
    console.log('success');
  }, () => {
    //clipboard write failed, use fallback
    console.log('fail');
  });
}

const bindCopyButtons = () => {
  Array.from(document.querySelectorAll('a.copy-button:not(.whole-data)'))
    .forEach(b => b.addEventListener('click', onCopyValueClickEventHandler))

  Array.from(document.querySelectorAll('a.copy-button.whole-data'))
    .forEach(b => b.addEventListener('click', onCopyDataClickEventHandler))
}

const bindCollapseButtons = () => {
  const coll = document.getElementsByClassName("collapseControl");
  
  for (let i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
      this.classList.toggle("active");
      const expanded = this.classList.contains('active');
      var content = this.nextElementSibling;
      if (!expanded) {
        content.style.maxHeight = null;
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
      }
    });
  }
}

const bindSearchField = () => {
  const searchField = document.getElementById('searchField');
  if (!searchField) {
    return;
  }
  searchField.addEventListener('keyup', function(e){
    const val = (this.value || '').trim()
    if (e.keyCode !== 13 || !val) {
      return;
    }
    const providerId = this.currentProviderId || -1;
    const els = document.querySelectorAll('h4[data-fullname]');
    let found = false;
    const re = new RegExp(val, "gi")
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      const fullname = el.attributes['data-fullname'].value;
      if (!fullname.match(re)) {
        continue;
      }
      const idx = el.attributes['data-providerIdx'].value;

      if (idx <= providerId) {
        continue;
      }

      if (idx >= providerId) {
        this.currentProviderId = idx
        const headerOffset = 35;
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        found = true;
        break;
      }
    }
    
    if (!found) {
      this.currentProviderId = -1;
    }

  });
}

var data = 'na'

document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('container');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { greeting: "fetchData" }, (response) => {
      if (response) {
        container.innerHTML = getContent(JSON.parse(response));
        bindCopyButtons();
        bindCollapseButtons();
        bindSearchField();
      }
    });
  });
}, false);

