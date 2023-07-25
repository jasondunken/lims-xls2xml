const { dialog } = require("electron");
const fs = require("fs");

function saveFile(window, data) {
    dialog
        .showSaveDialog(window, {
            defaultPath: data.filename,
            properties: ["showHiddenFiles"],
            filters: [{ name: "", extensions: ["xml"] }],
        })
        .then((result) => {
            if (!result.canceled) {
                try {
                    fs.writeFile(result.filePath, data.xmlOutput, (err) => {
                        if (err) {
                            window.webContents.send("error", err);
                        } else {
                            window.webContents.send("info", `${data.filename} saved to`);
                            window.webContents.send("info", result.filePath);
                        }
                    });
                } catch (err) {
                    window.webContents.send("error", err);
                }
            }
        })
        .catch((err) => {
            window.webContents.send("error", err);
        });
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
