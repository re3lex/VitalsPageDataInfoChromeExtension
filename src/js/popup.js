let fieldsMap = {};
chrome.storage.sync.get(fields, (data) => fieldsMap = data);


const solrLinksGenCallbacks = {
  profile: {
    intid: (s) => `http://lcnas11q-con-23.portal.webmd.com:8080/solr/phydir/select?q=id%3A${s}`
  },
  primaryLocation:{
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
  const content = [];
  content.push('<tr>');
  content.push(`<td>${label}</td>`);
  content.push(`<td><span class="value" data-copy-button="${id}"><pre>${str}</pre></span>`);
  if (value) {
    content.push(`<a href="#" id="${id}" class="material-icons copy-button">content_copy</a>`);
  }

  if (solrLinksCbs && solrLinksCbs[label]) {
    const url = solrLinksCbs[label](value);
    content.push(`<a href="${url}" target="_blank">SOLR</a>`);
  }
/*   switch (label) {
    case 'intid':
      const url = `http://lcnas11q-con-23.portal.webmd.com:8080/solr/phydir/select?q=id%3A${value}`
      content.push(`<a href="${url}" target="_blank">SOLR</a>`);

      break;
  } */

  content.push('</td>');
  content.push('</tr>');
  return content.join('\n');
};


const getRows = (fields =[], data, solrLinksCbs) => {
  const rows = fields.map(f=>getInfoObj(f, data[f]));
  return rows.map((r) => renderRow(r, solrLinksCbs));
}

const getContent = (state) => {
  const { profile, featured_serp, result = {}, practiceData  } = state;
  const out = [];
  if (profile) {
    out.push('<table class="dataTable">');
    out.push(renderRowSpan(`<h4>${profile.fullname}</h4>`, 2, 'profileTitle'));
    out.push(...getRows(fieldsMap.profileFields, profile, solrLinksGenCallbacks.profile));
    out.push('</table>');
  }
  else if (featured_serp || result.serp) {
    if (featured_serp && featured_serp.length > 0) {
      out.push(`<h4>${featured_serp.length} Featured results</h4>`);
      out.push('<table class="dataTable">');
      featured_serp.forEach((p, idx) => {
        out.push(renderRowSpan(`<h4>[${idx}]: ${p.fullname}</h4>`, 2, 'profileTitle'));
        out.push(...getRows(fieldsMap.serpFields, p, solrLinksGenCallbacks.profile));
      });
      out.push('</table>');
    }
    const { serp = [] } = result;
    if (serp.length > 0) {
      out.push(`<h4>${serp.length} Organic results</h4>`);
      out.push('<table class="dataTable">');
      serp.forEach((p, idx) => {
        out.push(renderRowSpan(`<h4>[${idx}]: ${p.fullname}</h4>`, 2, 'profileTitle'));
        out.push(...getRows(fieldsMap.serpFields, p, solrLinksGenCallbacks.profile));
      });
      out.push('</table>');
    }
  }
  else if (practiceData) {
    const {primaryLocation, locations=[]} = practiceData;
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

var data = 'na'

document.addEventListener('DOMContentLoaded', function () {
  const container = document.getElementById('container');
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { greeting: "fetchData" }, (response) => {
      if (response) {
        container.innerHTML = getContent(JSON.parse(response));
        bindCopyButtons();
      }
    });
  });
}, false);

