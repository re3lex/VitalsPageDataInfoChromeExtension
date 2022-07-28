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
  const profileFieldsStr = document.getElementById('profile').value;
  const profileFields = splitFields(profileFieldsStr);

  const serpFieldsStr = document.getElementById('serp').value;
  const serpFields = splitFields(serpFieldsStr);

  chrome.storage.sync.set({ profileFields, serpFields }, () => {
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
  chrome.storage.sync.get(['profileFields', 'serpFields'], ({ profileFields = [], serpFields = [] }) => {
    document.getElementById('profile').value = profileFields.join('\n');
    document.getElementById('serp').value = serpFields.join('\n');
  });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);