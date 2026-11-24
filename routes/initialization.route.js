const express = require("express");
const multer = require("multer");
const initController = require("../controllers/initialization.controller");
const router = express.Router();

//multer
const storage = multer.memoryStorage();
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });
const upload = multer({ storage });

router.post(
  "/bulkusersupload",
  upload.single("bulk_upload_template"),
  initController.bulk_users_file_upload,
);

router.get("/bulkusersdownload", initController.bulk_users_file_download);

module.exports = router;
