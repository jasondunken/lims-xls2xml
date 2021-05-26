const XLSX = require('xlsx');
const toXML = require('to-xml').toXML;

const xmlVersion = '1.0';
const xmlEncoding = 'utf-16';

function loadFile(window, path) {
    // TODO error checking
    const workbook = XLSX.readFile(path);
    const wsName = workbook.SheetNames[0];
    const wsData = XLSX.utils.sheet_to_json(workbook.Sheets[wsName], {header: 1});
    const colNames = wsData[0];
    const colData = wsData.splice(1);
    window.webContents.send('inputData', { path, colNames, colData });
    
    path = path.split('\\');
    let filename = path[path.length - 1];
    filename = filename.slice(0, filename.indexOf('.'));
    translateXLS(window, filename, colNames);
}

function translateXLS(window, filename, colNames) {
    const names = [];
    // reformat names: IsPrepLimit--Lims.QCLimit -> Lims.QCLimit.IsPrepLimit
    for (let name of colNames) {
        name = name.split('--');
        let n = name[1].split('.');
        n.push(name[0]);
        names.push(n);  // n = [ 'Lims', 'QCLimit', 'IsPrepLimit' ]
    }

    // console.log('names: ', names);

    const rootArtifact = names[0][0] + '.' + names[0][1];
    const header = `<?xml version="${xmlVersion}" encoding="${xmlEncoding}"?>\n`;
    const start = `<DataExchangeTemplate RootArtifact="${rootArtifact}" Description="" IgnoreResultStateDuringImport="False" HideFromExportMenu="False">\n` +
                    `\t<Artifact Name="${rootArtifact}" Type="${rootArtifact}" ImportType="Update" Required="yes">\n`;
    const end = `\t</Artifact>\n</DataExchangeTemplate>`;

    const xmlObjs = [];
    /* SimpleProperty without Validator example */
    // <SimpleProperty Name="LowerControlLimit" Type="Decimal" Required="yes">
    //     <Validators />
    // </SimpleProperty>

    /* ComplexProperty example */
    // <ComplexProperty Name="ControlUnit" Type="Unit" ImportType="Reference" Required="yes">
    //     <SimpleProperty Name="Abbreviation" Type="String" Required="yes">
    //         <Validators>
    //             <LengthValidator MinLength="0" MaxLength="16" />
    //         </Validators>
    //     </SimpleProperty>
    //     <SimpleProperty Name="Name" Type="String" Required="yes">
    //         <Validators>
    //             <LengthValidator MinLength="0" MaxLength="64" />
    //         </Validators>
    //     </SimpleProperty>
    // </ComplexProperty>
    for (let name of names) {
        let xmlObj = `${getTabs(name.length)}VALUE\n`;
        for (let i = name.length - 1; i >= 2; i--) {
            // chack for and add parameters to xml tags
            const propertyType = i == name.length - 1? "SimpleProperty" : "ComplexProperty"
            const tabs = getTabs(i);
            xmlObj = `${tabs}<${propertyType} Name="${name[i]}" Type="" Required="">\n${xmlObj}${tabs}</${propertyType}>\n`;
        }
        xmlObjs.push(xmlObj);
    }

    const xmlOutput = `${header}${start}${xmlObjs.join('')}${end}`;
    window.webContents.send('outputData', { filename, xmlOutput });

    const rootArtifactObj = { ...names };
    for (let name of names) {
        for (let i = 0; i < name.length; i++) {
        }
    }
    console.log('obj: ', rootArtifactObj);
}

function getTabs(numTabs) {
    let tabs = '';
    for (let i = 0; i < numTabs; i++) {
        tabs += '\t';
    }
    return tabs;
}

module.exports = {
    loadFile
}