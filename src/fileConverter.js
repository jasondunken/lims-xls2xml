const XLSX = require("xlsx");
const toXML = require("to-xml").toXML;

const formatXML = require("xml-formatter");

const xmlVersion = "1.0";
const xmlEncoding = "utf-8";

function loadFile(window, data) {
    // TODO error checking
    let path = data.path;
    let workbook = null;
    try {
        workbook = XLSX.readFile(path);
    } catch (e) {
        window.webContents.send("error", e);
        return;
    }
    const wsName = workbook.SheetNames[0];
    const wsData = XLSX.utils.sheet_to_json(workbook.Sheets[wsName], {
        header: 1,
    });
    const colNames = wsData[0];
    const colData = wsData.splice(1);

    path = path.split("\\");
    let filename = path[path.length - 1];
    filename = filename.slice(0, filename.indexOf("."));
    window.webContents.send("inputData", { path, colNames, colData, filename });
}

function translateXLS(window, data) {
    const header = `<?xml version="${xmlVersion}" encoding="${xmlEncoding}"?>\n`;

    const elements = [];
    for (let name of data.colNames) {
        name = name.split("--");
        if (name.length < 2) {
            window.webContents.send("outputData", {
                xmlOutput: "Invalid file header. Header values must be in the format: child--root.parent...",
            });
            return;
        }
        const element = {};
        element["parameter"] = name[0];
        element["parent"] = name[1].split(".").slice(2);
        elements.push(element);
    }
    const rootName = data.colNames[0].split("--")[1].split(".");
    const rootArtifact = `${rootName[0]}.${rootName[1]}`;

    // <GeneralBusiness.Product Active="true" BasisQuantity="" Color="" Description="" DisplayName="Not specified" InventoryRequiresContainer="false" IsPurchased="true" Name="Not specified" PartNumber="" ProductCode="" SKUNumber="" Texture="" TrackInventory="false">
    //   <BasisQuantityUnit Abbreviation="mL" Name="Milliliter" />
    //   <ProductGroup />
    // </GeneralBusiness.Product>

    // <?xml version="1.0" encoding="utf-8"?>
    // <List>
    //   <GeneralBusiness.Asset AssetId="754" AssetNumber="A36679">
    //     <Facility Name="AWBERC" />
    //   </GeneralBusiness.Asset>
    //   <GeneralBusiness.Asset AssetId="755" AssetNumber="A36681">
    //     <Facility Name="AWBERC" />
    //   </GeneralBusiness.Asset>
    // </List>

    const artifacts = [];
    for (let i = 0; i < data.colData.length; i++) {
        const row = data.colData[i];
        for (let j = 0; j < row.length; j++) {
            const newObj = { ...elements[j] };
            newObj["artifact_id"] = i; // artifact_id == data.colData[row]
            newObj["value"] = row[j];
            artifacts.push(newObj);
        }
    }

    const artObjs = [];
    for (let artifact of artifacts) {
        if (artObjs[artifact.artifact_id] == null) {
            artObjs[artifact.artifact_id] = {
                parameters: [],
                root: rootArtifact,
            };
        }
        artObjs[artifact.artifact_id].parameters.push({
            parameter: artifact.parameter,
            value: artifact.value,
            parent: artifact.parent,
        });
    }

    const toXMLObjs = [];
    for (let artObj of artObjs) {
        const toXMLObj = {};
        if (artObj === undefined) {
            continue;
        }
        toXMLObj[artObj.root] = {};
        buildToXMLObj(artObj, toXMLObj);
        toXMLObjs.push(formatXML(toXML(toXMLObj)));
    }
    const xmlOutput = `${header}<List>\n${toXMLObjs.join("\n")}\n</List>`;
    window.webContents.send("outputData", { xmlOutput });

    // to-xml example
    // const testXML = {
    //   xml: {
    //     foo: {
    //       "@bar": "BAR",
    //       "#": "BAZ",
    //     },
    //   },
    // };
    // console.log("toXML: ", toXML(testXML));
    // <xml><foo bar="BAR">BAZ</foo></xml>
}

function buildToXMLObj(article, toXMLObj) {
    for (let parameter of article.parameters) {
        let root = toXMLObj[article.root];
        let parameterParent = [...parameter.parent];
        while (parameterParent.length > 0) {
            if (!root[parameterParent[0]]) {
                root[parameterParent[0]] = {};
            }
            root = root[parameterParent[0]];
            parameterParent = parameterParent.slice(1);
        }
        // if the value if null or undefined  make it an empty string
        if (parameter.value == "null" || parameter.value == "undefined") {
            parameter.value = "";
        }
        root[`@${parameter.parameter}`] = parameter.value;
    }
}

module.exports = {
    loadFile,
    translateXLS,
};
