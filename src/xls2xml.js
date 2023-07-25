let inputData;
let outputData;

function loadFile() {
    const filePicker = document.getElementById("file-upload");
    if (filePicker.files.length > 0) {
        if (filePicker.files.length > 1) {
            console.log("XLSX can only load one file at a time");
            return;
        }
        const path = filePicker.files[0].path;
        document.getElementById("input-file-name").innerHTML = path;

        window.api.send("loadFile", {
            path,
        });
    }
}

function translateXML() {
    window.api.send("translateXLS", {
        colNames: inputData.colNames,
        colData: inputData.colData,
    });
}

function saveXML() {
    // TODO validate name
    outputData.filename = document.getElementById("output-file-name").value;
    window.api.send("saveFile", outputData);
}

window.api.receive("inputData", (data) => {
    inputData = data;

    let tableHTML = "<table><thead><tr>";
    for (let i = 0; i < data.colNames.length; i++) {
        tableHTML += `<th>${data.colNames[i]}</th>`;
    }
    tableHTML += "</tr></thead>";
    for (let i = 0; i < data.colData.length; i++) {
        tableHTML += "<tr>";
        for (let j = 0; j < data.colNames.length; j++) {
            tableHTML += `<td>${data.colData[i][j]}</td>`;
        }
        tableHTML += "</tr>";
    }
    tableHTML += "</table>";
    document.getElementById("input-file").innerHTML = tableHTML;
    document.getElementById("output-file-name").value = data.filename;
});

window.api.receive("outputData", (data) => {
    outputData = data;
    document.getElementById("output-file").textContent = data.xmlOutput;
});

window.api.receive("error", (error) => {
    console.log("ERROR: ", error);
    alert(`ERROR</br>${error}`);
});

window.api.receive("info", (info) => {
    console.log("INFO: ", info);
});
