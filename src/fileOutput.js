const path = require("path");
const fs = require("fs");

function saveFile(data) {
  const filename = `${data.filename}_${getTimestamp()}${data.extension}`;
  try {
    fs.writeFile(
      path.join(__dirname, "../../xls2xml-output/", filename),
      data.xmlOutput,
      (err) => {
        if (err) {
          console.log("error: ", err);
        } else {
          console.log(`${data.filename} saved.`);
        }
      }
    );
  } catch (err) {
    console.log("error: ", err);
  }
}

function getTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

module.exports = {
  saveFile,
};
