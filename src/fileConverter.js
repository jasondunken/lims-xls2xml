const XLSX = require("xlsx");
const toXML = require("to-xml").toXML;

const xmlVersion = "1.0";
const xmlEncoding = "utf-16";

function loadFile(window, data) {
  // TODO error checking
  let path = data.path;
  const workbook = XLSX.readFile(path);
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
  // artObj[rootArtifact] = {};
  // artObj[rootArtifact][`@${names[j].parameter}`] = row[j];

  const toXMLObjs = [];
  for (let artObj of artObjs) {
    const toXMLObj = {};
    toXMLObj[artObj.root] = {};
    for (let parameter of artObj.parameters) {
      if (!parameter.parent.length) {
        toXMLObj[artObj.root][`@${parameter.parameter}`] = parameter.value;
      } else {
        toXMLObj[artObj.root][parameter.parent] = {};
        toXMLObj[artObj.root][parameter.parent][`@${parameter.parameter}`] =
          parameter.value;
      }
    }
    toXMLObjs.push(toXML(toXMLObj));
  }

  console.log("elements: ", elements);
  console.log("artifacts: ", artifacts);
  console.log("artifact objects: ", artObjs);
  console.log("artifact object: ", artObjs[0].parameters);
  console.log("toXMLObjs: ", toXMLObjs);

  const xmlOutput = `${header}<list>\n\t${toXMLObjs.join("\n\t")}\n</list>`;
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

function getTabs(numTabs) {
  let tabs = "";
  for (let i = 0; i < numTabs; i++) {
    tabs += "\t";
  }
  return tabs;
}

module.exports = {
  loadFile,
  translateXLS,
};
