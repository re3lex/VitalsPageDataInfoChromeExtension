const injectScript = () => {
  var s = document.createElement('script');
  s.src = chrome.runtime.getURL('js/script.js');
  s.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.greeting === "fetchData") {
    document.addEventListener('RW759_connectExtension', (e) => {
      //debugger;
      const state = e.detail;
      sendResponse(state ? JSON.stringify(state) : '');
    }, { once: true });

    injectScript();
    return true;
  }
}
);


// Add default fields into storage if needed
const profileFields = [
  "intid",
  "profiletype",
  "fullname",
  "is_ddcprofile",
  "sponsorid",
  "providerguid",
  "dynamic_olb_enabled_b",
  "appointmentlinkurl",
  "is_telehealth_enabled",
  "telehealthlinkurl",
];

const defaultFields = {
  profileFields: profileFields,
  serpFields: profileFields,
  primaryLocationFields: ['id'],
}

chrome.storage.sync.get(fields, (storedData) => {
  const data = {}
  fields.forEach(f => {
    const d = storedData[f];
    if (!d || d.length === 0) {
      data[f] = [...(defaultFields[f] || [])]
    }
  })

  if (Object.keys(data).length > 0) {
    chrome.storage.sync.set(data, () => {
      // Update status to let user know options were saved.
      console.log('Default data saved successfully');
    });
  }
});