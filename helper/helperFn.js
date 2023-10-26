module.exports = {
  
  // ================date format changer========================
  formatDate: function (date) {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear().toString();
    return `${day}-${month}-${year}`;
  },
};
