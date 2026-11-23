const ExcelJS = require("exceljs");

module.exports.readfile = async (file) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(file);

    workbook.eachSheet((sheet, sheetid) => {
      console.log(sheetid);
    });
  } catch (err) {
    console.log(err);
  }
};
