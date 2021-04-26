const path = require("path");
const fs = require('fs');

function saveFile(data) {
    const filename = `${data.filename}_${getTimestamp()}${data.extension}`; 
    try {
        fs.writeFile(path.join(__dirname, '../xls2xml-output/', filename), JSON.stringify(data.colData), (err) => {
            if (err) {
                console.log('error: ', err);
            } else {
                console.log(`${data.filename} saved.`);
            }
        });
    } catch(err) {
        console.log('error: ', err);
    }
}

function getTimestamp() {
    const dateObj = new Date();
    const date = dateObj.toLocaleDateString().split("/");
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const seconds = dateObj.getSeconds();

    return `${[...date].join('-')}_${hours}-${minutes}-${seconds}`;
} 

module.exports = {
    saveFile
}