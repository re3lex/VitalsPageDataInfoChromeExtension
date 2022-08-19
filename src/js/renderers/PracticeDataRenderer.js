class PrimaryPracticeRenderer extends BaseDataRenderer {

  getFieldsCollectionName(){
    return 'primaryLocationFields';
  }

  getTitle() {
    return this.data.name;
  }

  postRowContentCreation(label, value, content) {
    if (label === 'id') {
      const url = `http://lcnas11q-con-23.portal.webmd.com:8080/solr/facility/select?q=id%3A${value}`;
      content.push(`<a href="${url}" target="_blank">SOLR</a>`);
    }
  }
}

class LocationRenderer extends BaseDataRenderer {
  constructor(data, index) {
    super(data);
    this.index = index;
  }

  getFieldsCollectionName(){
    return 'locationsFields';
  }

  getTitle() {
    return `[${this.index}]: ${this.data.name}`;
  }
}


class PracticeDataRenderer {
  constructor(practiceData) {
    this.data = practiceData;
  }

  render(){
    const section1 = new PrimaryPracticeRenderer(this.data.primaryLocation);
    
    return `
      <h4>primaryLocation</h4>
      ${section1.render()}
      <h4>${this.data.locations.length} Locations</h4>
      ${
        this.data.locations.map((l, idx)=>{
          const renderer = new LocationRenderer(l, idx);
          return renderer.render();
        }).join('\n')
      }
    `;
  }
}