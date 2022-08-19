let FIELDS = {};
chrome.storage.sync.get(fields, (data) => FIELDS = data);


class BaseDataRenderer {
  constructor(data) {
    this.data = data;
    this.lines = [];
  }

  getFieldsCollectionName(){
    throw new Error('Implement this method in nested class');
  }

  getFields() {
    return FIELDS[this.getFieldsCollectionName()];
  }

  getTitle() {
    return this.data.id;
  }
  getTitleAttributes(){
    return [];  
  }

  render() {
    const out = [];
    out.push('<table class="dataTable">');
    out.push(this.renderTitle());
    this.getFields().forEach(field => {
      out.push(this.renderRow(field, this.data[field]));
    });
    out.push('</table>');
    return out.join('\n');
  }

  renderTitle() {
    return `
    <tr class="title">
      <td colspan="2">
        <h4 ${this.getTitleAttributes().join(' ')}>
          ${this.getTitle()}
          <a href="#" title="Copy whole data" data-data="${JSON.stringify(this.data).replace(/\"/g, '&quot;')}" class="material-icons copy-button whole-data">content_copy</a>
        </h4> 
      </td>
    </tr>`;
  }

  renderRow(label, value) {
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
  
    this.postRowContentCreation(label, value, content);
  
    content.push('</td>');
    content.push('</tr>');
    return content.join('\n');
  }

  postRowContentCreation(label, value, content) {

  }
}