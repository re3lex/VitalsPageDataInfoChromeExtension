
const splitFields = (str) => {
  const fields = str.split('\n')
    .map(v => v.split(','))
    .flatMap(v => v)
    .map(v => v.trim())
    .filter(v => !!v);

  return [... new Set(fields)];
}

// Saves options to chrome.storage
const saveOptions = () => {
  const data = {};
  fields.forEach(f=>{
    const str = document.getElementById(f).value;
    data[f] = splitFields(str);
  });

  chrome.storage.sync.set(data, () => {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(() => {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
  chrome.storage.sync.get(fields, (data) => {
    fields.forEach(f=>{
      document.getElementById(f).value = (data[f] || []).join('\n');
    });
    
  });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);