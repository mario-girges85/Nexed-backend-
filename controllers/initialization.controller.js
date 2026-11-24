const excel = require("../util/excel");
const { create_user } = require("./user.controller");

function withoutPassword(user) {
  const userData =
    typeof user.toJSON === "function" ? user.toJSON() : { ...user };
  delete userData.password;
  return userData;
}

function importErrorMessage(error) {
  if (Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors.map((item) => item.message).join(", ");
  }

  return error.message || "Unable to add this user";
}

module.exports.bulk_users_file = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload an Excel file" });
  }

  try {
    const sheets = await excel.readfile(req.file.buffer);
    const report = {
      summary: {
        sheetsProcessed: Object.keys(sheets).length,
        totalRows: 0,
        successfullyAdded: 0,
        failedRows: 0,
      },
      successfullyAddedUsers: [],
      problematicRows: [],
    };

    for (const [sheetName, rows] of Object.entries(sheets)) {
      for (const { rowNumber, user } of rows) {
        report.summary.totalRows += 1;

        try {
          const result = await create_user(user);
          if (!result.success) {
            report.summary.failedRows += 1;
            report.problematicRows.push({
              sheet: sheetName,
              row: rowNumber,
              user: withoutPassword(user),
              message: result.message,
            });
            continue;
          }

          report.summary.successfullyAdded += 1;
          report.successfullyAddedUsers.push({
            sheet: sheetName,
            row: rowNumber,
            user: withoutPassword(result.user),
          });
        } catch (error) {
          report.summary.failedRows += 1;
          report.problematicRows.push({
            sheet: sheetName,
            row: rowNumber,
            user: withoutPassword(user),
            message: importErrorMessage(error),
          });
        }
      }
    }

    return res.status(200).json(report);
  } catch (error) {
    return res.status(400).json({
      message: "Unable to read the uploaded Excel file",
      error: error.message,
    });
  }
};
