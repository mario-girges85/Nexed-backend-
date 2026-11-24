const ExcelJS = require("exceljs");

// ExcelJS can represent dates, formula results, and rich text as objects.
// Convert those values into JSON-safe primitives before returning API data.
function cellValue(value) {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "object") return value;
  // Formula cells contain their calculated value in `result`.
  if (value.result !== undefined) return cellValue(value.result);
  if (typeof value.text === "string") return value.text;
  // Rich-text cells contain text in multiple parts that must be combined.
  if (Array.isArray(value.richText)) {
    return value.richText.map((part) => part.text).join("");
  }
  return value;
}

/**
 * Parses an Excel file uploaded through Multer's memory storage.
 *
 * The first row of each worksheet becomes the property names for its records.
 * The returned object is keyed by worksheet name, so callers can access both
 * the sheet names and their row data without reading the workbook again.
 *
 * @param {Buffer} filebuffer The uploaded file contents from `req.file.buffer`.
 * @returns {Promise<Record<string, Record<string, unknown>[]>>} Rows grouped by worksheet name.
 */
module.exports.readfile = async (filebuffer) => {
  const workbook = new ExcelJS.Workbook();
  // `load` accepts a Buffer. `readFile` would instead expect a disk file path.
  await workbook.xlsx.load(filebuffer);

  const sheets = {};
  workbook.eachSheet((worksheet) => {
    // Column positions are one-based in ExcelJS, so this array is intentionally
    // indexed by the `colNumber` value received from eachCell.
    const headers = [];
    const rows = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) {
        // Use the first populated row as the header row for this worksheet.
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          headers[colNumber] = cellValue(cell.value);
        });
        return;
      }

      const record = {};
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        // Empty header cells still get a stable property name in the response.
        const key = headers[colNumber] ?? `column${colNumber}`;
        record[key] = cellValue(cell.value);
      });
      rows.push(record);
    });

    // The key is also the worksheet's name, e.g. `sheets.Users`.
    sheets[worksheet.name] = rows;
  });

  return sheets;
};
