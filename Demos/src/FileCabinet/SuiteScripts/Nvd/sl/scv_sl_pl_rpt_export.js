/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(
    ['N/file', 'N/encode', 'N/record', 'N/search', '../lib/scv_lib_function.js',
        'N/render'
    ],
    function (file, encode, record, search, lfunc, render) {

        const objSavedSearch = {
            REPORT_PL: 'customsearch_scv_report_pl'
        };

        function onRequest(context) {
            let request = context.request;
            let parameters = request.parameters;
            if (request.method === 'GET') {
                let dataHeader = getDataHeader(parameters);
                let dataDetail = getDataDetail(parameters);
                if (parameters.hasOwnProperty("isPrint") && parameters.isPrint === "T") {
                    let fileObj = onRenderPdf(parameters, dataHeader, dataDetail);
                    fileObj.name = "PL report.pdf";
                    context.response.writeFile(fileObj, true);
                    return;
                }

                let templatePath = '../xml/fs_report/scv_fs_pl.xml';
                let namefile = 'PL Reports.xls';
                let fileObject = file.load({
                    id: templatePath
                });
                let content = fileObject.getContents();
                content = content.replace(/{pSubsidiary}/gi, dataHeader.SubName);
                content = content.replace(/{pAddress}/gi, dataHeader.SubAddress);
                content = content.replace(/{pYear}/gi, dataHeader.YearCurrent);
                let namnay = parameters.custpage_curfromdt + ' - ' + parameters.custpage_curtodt;
                let namtruoc = parameters.custpage_beffromdt + ' - ' + parameters.custpage_beftodt;
                content = content.replace(/{namnay}/gi, namnay);
                content = content.replace(/{namtruoc}/gi, namtruoc);

                for (let idx_maso = 0; idx_maso < dataDetail.length; idx_maso++) {
                    content = content.replace("{pCur_" + dataDetail[idx_maso].maso + "}", dataDetail[idx_maso].amtCur);
                    content = content.replace("{pBef_" + dataDetail[idx_maso].maso + "}", dataDetail[idx_maso].amtBef);
                }
                let f = file.create({
                    name: namefile,
                    fileType: file.Type.XMLDOC,
                    contents: content,
                    encoding: file.Encoding.UTF8,
                });

                context.response.writeFile(f, false);
            }
        }

        function onRenderPdf(parameters, dataHeader, dataDetail) {
            let namnay = parameters.custpage_curfromdt + ' - ' + parameters.custpage_curtodt;
            let namtruoc = parameters.custpage_beffromdt + ' - ' + parameters.custpage_beftodt;

            let content = file.load("../xml/pdf/scv_render_rp_kqhd_kinhdoanh_pdf.xml").getContents();
            content = content
                .replace(/{pSubsidiary}/gi, dataHeader.SubName)
                .replace(/{pAddress}/gi, dataHeader.SubAddress)
                .replace(/{pYear}/gi, dataHeader.YearCurrent)
                .replace(/{namnay}/gi, namnay)
                .replace(/{namtruoc}/gi, namtruoc);

            let listSumCalc = {
                "0": {
                    "10": ["01", "-02"],
                    "22": ["23", "22a"],
                    "40": ["31", "32"],
                },
                "1": {
                    "20": ["10", "-11"],
                },
                "2": {
                    "30": ["20", "21", "-22", "-25", "-26"],
                    "40": ["31", "-32"]
                },
                "3": {
                    "50": ["30", "40"],
                },
                "4": {
                    "60": ["50", "-51"]
                }
            }
            //Create hashMap [maso: {amtCur, amtBef}]
            let listMaSoVal = dataDetail.reduce((pre, curr) => ({
                ...pre,
                [curr.maso]: {amtCur: curr.amtCur, amtBef: curr.amtBef}
            }), {})
            // ReCalc chi tieu
            for (let iLv = 0; iLv < 5; iLv++) {
                const level = iLv.toString();
                Object
                    .entries(listSumCalc[level])
                    .forEach(([root, listChild]) =>
                        listMaSoVal[root] = listChild.reduce((sum, maso) => {
                            const factor = maso.includes("-") ? -1 : 1;
                            const newMaso = maso.replace("-", "");
                            sum.amtCur += factor * listMaSoVal[newMaso].amtCur;
                            sum.amtBef += factor * listMaSoVal[newMaso].amtBef;
                            return sum;
                        }, {amtCur: 0, amtBef: 0}))
            }
            Object.entries(listMaSoVal).forEach(([maso, obj]) => content = content.replace(`{pCur_${maso}}`, changeCurrency(obj.amtCur)).replace(`{pBef_${maso}}`, changeCurrency(obj.amtBef)));
            return render.xmlToPdf({xmlString: content});
        }

        function changeCurrency(number) {
            if (!!number && number !== 0) {
                let parts = number.toString().split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                if (parts[1] !== '00') {
                    return parts.join(".");
                } else {
                    return parts[0];
                }
            }
            return number;
        }

        function getDataHeader(_params) {
            let subsidiary = _params.custpage_subsidiary;
            let infoSub = getInfoSub(subsidiary.split(","));
            return {
                SubName: infoSub.SubName,
                SubAddress: infoSub.SubAddress,
                YearCurrent: _params.curtodt_year
            };
        }

        function getInfoSub(arrSub) {
            let subSearch = search.create({
                type: "subsidiary",
                filters:
                    [
                        ["internalid", "anyof", arrSub[0]]
                    ],
                columns:
                    [
                        search.createColumn({name: "legalname", label: "legalname"}),
                        search.createColumn({
                            name: "address",
                            join: "address",
                            label: "Address"
                        })
                    ]
            });
            subSearch = subSearch.run().getRange(0, 1000);
            let SubName = "", SubAddress = "";
            for (let i = 0; i < subSearch.length; i++) {
                SubName += (i > 0 ? " - " : "") + subSearch[i].getValue("legalname");
                SubAddress += (i > 0 ? " - " : "") + subSearch[i].getValue({name: "address", join: "address"});
            }
            return {SubName: SubName, SubAddress: SubAddress};
        }

        function getDataDetail(_params) {
            let myData = [];
            let myDataCur = getDataDetailCur(_params);
            let myDataBef = getDataDetailBef(_params);
            let arrMaSo = getListMaSo();
            for (let i = 0; i < arrMaSo.length; i++) {
                let objData = {
                    maso: arrMaSo[i].maso,
                    amtCur: 0,
                    amtBef: 0
                };
                let objCur = findByMaSo(myDataCur, objData.maso);
                let objBef = findByMaSo(myDataBef, objData.maso);
                if (lfunc.isContainValue(objCur)) objData.amtCur = Number(objCur.amt) * arrMaSo[i].factor;
                if (lfunc.isContainValue(objBef)) objData.amtBef = Number(objBef.amt) * arrMaSo[i].factor;
                myData.push(objData);
            }
            return myData;
        }

        function getDataDetailCur(_params) {
            let resultSearch = search.load(objSavedSearch.REPORT_PL);
            let myFilter = resultSearch.filters;
            if (lfunc.isContainValue(_params.custpage_subsidiary)) {
                myFilter.push(search.createFilter({
                    name: 'subsidiary',
                    operator: search.Operator.ANYOF,
                    values: _params.custpage_subsidiary.split(","),
                }));
            }

            if (lfunc.isContainValue(_params.custpage_curfromdt)) {
                myFilter.push(search.createFilter({
                    name: 'trandate',
                    operator: search.Operator.ONORAFTER,
                    values: _params.custpage_curfromdt
                }));
            }

            if (lfunc.isContainValue(_params.custpage_curtodt)) {
                myFilter.push(search.createFilter({
                    name: 'trandate',
                    operator: search.Operator.ONORBEFORE,
                    values: _params.custpage_curtodt
                }));
            }

            return getEleDataResultSavedSearch(resultSearch);
        }

        function getDataDetailBef(_params) {
            let resultSearch = search.load("customsearch_scv_report_pl");
            let myFilter = resultSearch.filters;
            if (lfunc.isContainValue(_params.custpage_subsidiary)) {
                myFilter.push(search.createFilter({
                    name: 'subsidiary',
                    operator: search.Operator.ANYOF,
                    values: _params.custpage_subsidiary.split(","),
                }));
            }

            if (lfunc.isContainValue(_params.custpage_beffromdt)) {
                myFilter.push(search.createFilter({
                    name: 'trandate',
                    operator: search.Operator.ONORAFTER,
                    values: _params.custpage_beffromdt
                }));
            }
            if (lfunc.isContainValue(_params.custpage_beftodt)) {
                myFilter.push(search.createFilter({
                    name: 'trandate',
                    operator: search.Operator.ONORBEFORE,
                    values: _params.custpage_beftodt
                }));
            }
            return getEleDataResultSavedSearch(resultSearch);
        }

        function getEleDataResultSavedSearch(searchObj) {
            let myColumns = searchObj.columns;
            let resultSearch = searchObj.runPaged({pageSize: 1000});
            let myData = [];
            const lRP = resultSearch.pageRanges.length;
            for (let i = 0; i < lRP; i++) {
                let dataPage = resultSearch.fetch(i).data;
                for (let idx in dataPage) {
                    let obj = {};
                    const chitieu = dataPage[idx].getValue(myColumns[0]);
                    obj.maso = chitieu.substr(0, chitieu.indexOf("-")).trim();
                    obj.amt = Number(dataPage[idx].getValue(myColumns[1]));
                    myData.push(obj);
                }
            }
            return myData;
        }

        function getListMaSo() {
            return [
                {maso: "01", factor: 1},
                {maso: "02", factor: -1},
                {maso: "11", factor: -1},
                {maso: "21", factor: 1},
                {maso: "23", factor: -1},
                {maso: "22", factor: -1},
                {maso: "22a", factor: -1},
                {maso: "25", factor: -1},
                {maso: "26", factor: -1},
                {maso: "31", factor: 1},
                {maso: "32", factor: -1},
                {maso: "51", factor: -1},
                {maso: "52", factor: -1},
                {maso: "70", factor: 1},
                {maso: "71", factor: 1}
            ];
        }

        function findByMaSo(_arrFind, _maso) {
            return _arrFind.find(function (item) {
                return item.maso === _maso
            });
        }

        return {
            onRequest: onRequest
        };

    });
