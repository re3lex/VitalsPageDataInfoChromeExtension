const injectScript = () => {
  var s = document.createElement('script');
  s.src = chrome.runtime.getURL('script.js');
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
      }, {once: true});

      injectScript();
      return true;
    }
  }
);


// Add default fields into storage if needed
const defaultFields = [
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

chrome.storage.sync.get(['profileFields', 'serpFields'], ({ profileFields = [], serpFields = [] }) => {
  const data = {}
  if (profileFields.length === 0) {
    data.profileFields = [...defaultFields];
  }
  if (serpFields.length === 0) {
    data.serpFields = [...defaultFields];
  }

  if(Object.keys(data).length > 0) {
    chrome.storage.sync.set(data, () => {
      // Update status to let user know options were saved.
      console.log('Default data saved successfully');
    });
  }
});