const excel = require("../util/excel");

module.exports.bulk_users_file = async (req, res) => {
  // console.log(req.bulk_upload_template);
  excel.readfile(req.file.buffer);
  res.json(req.file);
};
