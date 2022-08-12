let fieldsMap = {};
chrome.storage.sync.get(fields, (data) => fieldsMap = data);


const solrLinksGenCallbacks = {
  profile: {
    intid: (s) => `http://lcnas11q-con-23.portal.webmd.com:8080/solr/phydir/select?q=id%3A${s}`
  },
  primaryLocation: {
    id: (s) => `http://lcnas11q-con-23.portal.webmd.com:8080/solr/facility/select?q=id%3A${s}`
  }
}

const getInfoObj = (label, value) => ({ label, value });

const renderRowSpan = (value, span = 2, cls = '') => `<tr class="${cls}"><td colspan="${span}">${value}</td></tr>`;

const renderRow = ({ label, value }, solrLinksCbs) => {
  const id = 'copy-btn-' + Math.round(Math.random() * 10000);
  let str = value || '';
  if (typeof str === 'object') {
    str = JSON.stringify(str, null, 2);
  }
  const collapse = typeof str === 'string' && (str.match(/\n/g) || []).length > 2;

  const content = [];
  content.push('<tr>');
  content.push(`<td>${label}</td>`);
  content.push(`<td class="grow">`);
  if (collapse) {
    content.push('<span class="material-icons collapseControl"></span>')
  }

  content.push(`<span class="value ${collapse && 'collapsible'}" style="${collapse && 'max-height:0'}" data-copy-button="${id}"><pre>${str}</pre></span>`);
  if (value) {
    content.push(`<a href="#" id="${id}" class="material-icons copy-button">content_copy</a>`);
  }

  if (solrLinksCbs && solrLinksCbs[label]) {
    const url = solrLinksCbs[label](value);
    content.push(`<a href="${url}" target="_blank">SOLR</a>`);
  }

  content.push('</td>');
  content.push('</tr>');
  return content.join('\n');
};


const getRows = (fields = [], data, solrLinksCbs) => {
  const rows = fields.map(f => getInfoObj(f, data[f]));
  return rows.map((r) => renderRow(r, solrLinksCbs));
}

const getContent = (state) => {
  const { profile, featured_serp, result = {}, practiceData } = state;
  const out = [];
  if (profile) {
    out.push('<table class="dataTable">');
    out.push(renderRowSpan(`<h4>${profile.fullname}</h4>`, 2, 'profileTitle'));
    out.push(...getRows(fieldsMap.profileFields, profile, solrLinksGenCallbacks.profile));
    out.push('</table>');
  }
  else if (featured_serp || result.serp) {
    out.push(`<div class="inner-container">`);
    out.push(`<div class="top-bar">`);
    out.push(`<input type="text" id="searchField" placeholder="Search provider by name. Use Enter to run search.">`);
    out.push(`</div>`);
    out.push(`<div class="content">`);
    let providerIdx = 0;
    if (featured_serp && featured_serp.length > 0) {
      out.push(`<h4>${featured_serp.length} Featured results</h4>`);
      out.push('<table class="dataTable">');
      featured_serp.forEach((p, idx) => {
        out.push(renderRowSpan(`<h4 data-fullname="${p.fullname}" data-providerIdx="${providerIdx++}">[${idx}]: ${p.fullname}</h4>`, 2, 'profileTitle'));
        out.push(...getRows(fieldsMap.serpFields, p, solrLinksGenCallbacks.profile));
      });
      out.push('</table>');
    }
    const { serp = [] } = result;
    if (serp.length > 0) {
      out.push(`<h4>${serp.length} Organic results</h4>`);
      out.push('<table class="dataTable">');
      serp.forEach((p, idx) => {
        out.push(renderRowSpan(`<h4 data-fullname="${p.fullname}" data-providerIdx="${providerIdx++}">[${idx}]: ${p.fullname}</h4>`, 2, 'profileTitle'));
        out.push(...getRows(fieldsMap.serpFields, p, solrLinksGenCallbacks.profile));
      });
      out.push('</table>');
    }
    out.push(`</div>`);
    out.push(`</div>`);
  }
  else if (practiceData) {
    const { primaryLocation, locations = [] } = practiceData;
    out.push(`<h4>primaryLocation</h4>`);
    out.push('<table class="dataTable">');
    out.push(...getRows(fieldsMap.primaryLocationFields, primaryLocation, solrLinksGenCallbacks.primaryLocation));
    out.push('</table>');

    if (locations.length > 0) {
      out.push(`<h4>${locations.length} Locations</h4>`);
      out.push('<table class="dataTable">');
      locations.forEach((l, idx) => {
        out.push(renderRowSpan(`<h4>[${idx}]: ${l.name}</h4>`, 2, 'profileTitle'));
        out.push(...getRows(fieldsMap.locationsFields, l));
      });
      out.push('</table>');
    }
  }

  else {
    out.push('<div>Looks like this page type is not supported <span class="material-symbols-outlined">sentiment_dissatisfied</span></div>')
  }

  return out.join('\n');
}


const onCopyClickEventHandler = (e) => {
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

const bindCopyButtons = () => {
  Array.from(document.querySelectorAll('a.copy-button'))
    .forEach(b => b.addEventListener('click', onCopyClickEventHandler))
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

      if (idx < providerId) {
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

