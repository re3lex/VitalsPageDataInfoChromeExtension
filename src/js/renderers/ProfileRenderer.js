class ProfileRenderer extends BaseDataRenderer {
  
  getFieldsCollectionName(){
    return 'profileFields';
  }

  getTitle() {
    return this.data.fullname;
  }

  postRowContentCreation(label, value, content) {
    if (label === 'intid') {
      const url = `http://lcnas11q-con-23.portal.webmd.com:8080/solr/phydir/select?q=id%3A${value}`;
      content.push(`<a href="${url}" target="_blank">SOLR</a>`);
    }
  }
}