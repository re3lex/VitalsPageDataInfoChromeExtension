
class SERPProfileRenderer extends ProfileRenderer {
  constructor(data, collectionIndex, throughIndex) {
    super(data);
    this.collectionIndex = collectionIndex;
    this.throughIndex = throughIndex;
  }

  getTitleAttributes(){
    return [`data-fullname="${this.data.fullname}"`, `data-providerIdx="${this.throughIndex}"`]
  }

  getFieldsCollectionName(){
    return 'serpFields';
  }

  getTitle() {
    const title = super.getTitle();
    return `[${this.collectionIndex}]: ${title}`;
  }
}

class SERPSectionRenderer {

  constructor(data, sectionTitle, throughIndexStart=0) {
    this.data = data;
    this.sectionTitle = sectionTitle;
    this.throughIndexStart = throughIndexStart;
  }

  render(){
    const out = [];

    out.push(this.renderTitle());
    this.data.forEach((profile, idx) => {
      const render = new SERPProfileRenderer(profile, idx, (this.throughIndexStart+idx));
      out.push(render.render());
    });

    return out.join('\n');
  }

  renderTitle() {
    return `<h4>${this.data.length} ${this.sectionTitle}</h4>`
  }
}


class SERPDataRender {
  constructor(featuredData, organicData) {
    this.featuredData = featuredData;
    this.organicData = organicData;
  }

  render(){
    const fSection = new SERPSectionRenderer(this.featuredData, 'Featured results', 0);
    const oSection = new SERPSectionRenderer(this.organicData, 'Organic results', this.featuredData.length);

    const out = `
      <div class="inner-container">
        <div class="top-bar">
          <input type="text" id="searchField" placeholder="Search provider by name. Use Enter to run search.">
        </div>
        <div class="content">
          ${fSection.render()}
          ${oSection.render()}
        </div>
      </div>
    `;

    return out;
  }
}