const ExcelJS = require("exceljs");

const USER_COLUMNS = {
  1: "name",
  2: "email",
  3: "password",
  4: "national_id",
  5: "phonenumber",
  6: "birth_day",
  7: "birth_month",
  8: "birth_year",
  9: "address",
  10: "gender",
  11: "role",
};

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

function userCellValue(field, cell) {
  const value = cellValue(cell.value);

  // IDs and phone numbers are stored as strings so that leading zeroes are kept.
  if (field === "national_id" || field === "phonenumber") {
    return value == null ? null : cell.text.trim();
  }

  return value;
}

/**
 * Parses an Excel file uploaded through Multer's memory storage.
 *
 * The upload template has two header rows: row 1 contains the main columns
 * and the merged `birth_date` label, while row 2 contains day, month, and year.
 * User records therefore begin at row 3. Each record uses the field names from
 * the User model, including `birth_day`, `birth_month`, and `birth_year`.
 *
 * @param {Buffer} filebuffer The uploaded file contents from `req.file.buffer`.
 * @returns {Promise<Record<string, Array<{ rowNumber: number, user: Record<string, unknown> }>>>} User records grouped by worksheet name.
 */
module.exports.readfile = async (filebuffer) => {
  const workbook = new ExcelJS.Workbook();
  // `load` accepts a Buffer. `readFile` would instead expect a disk file path.
  await workbook.xlsx.load(filebuffer);

  const sheets = {};
  workbook.eachSheet((worksheet) => {
    const users = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber <= 2) {
        return;
      }

      const user = {};
      let hasValues = false;

      Object.entries(USER_COLUMNS).forEach(([column, field]) => {
        const value = userCellValue(field, row.getCell(Number(column)));
        user[field] = value;
        hasValues ||= value != null && value !== "";
      });

      // Ignore rows that Excel considers non-empty but contain no user data.
      if (hasValues) {
        users.push({ rowNumber, user });
      }
    });

    sheets[worksheet.name] = users;
  });

  return sheets;
};
