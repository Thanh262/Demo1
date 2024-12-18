/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/ui/serverWidget', 'N/runtime', '../lib/scv_lib_function.js', '../olib/lodash.min'],
    function (record, search, serverWidget, runtime, lbf, _) {

        const objSavedSearch = {
            REPORT_PL: 'customsearch_scv_report_pl'
        };
        const FLAG = {
            RUN: '1'
        };

        function onRequest(context) {
            let request = context.request;
            let params = request.parameters;
            let isrun = params.isrun;
            if (request.method === "GET") {
                let {
                    form,
                    sublist
                } = onCreateFormUI(params);
                form.clientScriptModulePath = '../cs/scv_cs_sl_pl_rpt.js';
                if (isrun === FLAG.RUN) {
                    let searchResult = runFilterSS(params);
                    onRenderData(params, sublist, searchResult);
                }
                context.response.writePage(form);
            }
        }

        function onCreateFormUI(_params) {
            let curUser = runtime.getCurrentUser();
            let mainForm = serverWidget.createForm({title: "PL Reports"});
            let mainGrp = addFieldGroup(mainForm, "fieldgrp_main", "Main");

            let custpage_subsidiary = mainForm.addField({
                id: 'custpage_subsidiary',
                type: serverWidget.FieldType.MULTISELECT,
                label: 'Subsidiary',
                source: "subsidiary",
                container: mainGrp.id
            });
            custpage_subsidiary.isMandatory = true;

            let custpage_curfromdt = mainForm.addField({
                id: 'custpage_curfromdt',
                type: serverWidget.FieldType.DATE,
                label: 'From Date Current',
                container: mainGrp.id
            }).updateLayoutType({layoutType: serverWidget.FieldLayoutType.STARTROW});

            let custpage_curtodt = mainForm.addField({
                id: 'custpage_curtodt',
                type: serverWidget.FieldType.DATE,
                label: 'To Date Current',
                container: mainGrp.id
            }).updateLayoutType({layoutType: serverWidget.FieldLayoutType.ENDROW});

            let custpage_beffromdt = mainForm.addField({
                id: 'custpage_beffromdt',
                type: serverWidget.FieldType.DATE,
                label: 'From Date Last',
                container: mainGrp.id
            }).updateLayoutType({layoutType: serverWidget.FieldLayoutType.STARTROW});

            let custpage_beftodt = mainForm.addField({
                id: 'custpage_beftodt',
                type: serverWidget.FieldType.DATE,
                label: 'To Date Last',
                container: mainGrp.id
            }).updateLayoutType({layoutType: serverWidget.FieldLayoutType.ENDROW});

            if (lbf.isContainValue(_params.custpage_subsidiary)) {
                custpage_subsidiary.defaultValue = _params.custpage_subsidiary.split(",");
            } else {
                custpage_subsidiary.defaultValue = curUser.subsidiary;
            }
            custpage_curfromdt.defaultValue = getFromDate(_params.custpage_curfromdt);
            custpage_curtodt.defaultValue = getToDate(_params.custpage_curtodt);
            custpage_beffromdt.defaultValue = getFromDate(_params.custpage_beffromdt);
            custpage_beftodt.defaultValue = getToDate(_params.custpage_beftodt);

            let rsSL = mainForm.addSublist({
                id: "custpage_sl_result",
                type: serverWidget.SublistType.LIST,
                label: 'Result'
            });

            rsSL.addButton({
                id: "custpage_btn_search", label: "Search",
                functionName: "onSearchResult()"
            });
            rsSL.addButton({
                id: "custpage_btn_export", label: "Export",
                functionName: "onExport()"
            });
            rsSL.addButton({
                id: "custpage_btn_printpdf", label: "Print",
                functionName: "onPrint()"
            });

            rsSL.addField({
                    id: "custpage_col_chitieu",
                    type: serverWidget.FieldType.TEXT, label: 'Chỉ tiêu'
                }
            ).updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
            rsSL.addField({
                    id: "custpage_col_maso",
                    type: serverWidget.FieldType.TEXT, label: 'Mã số'
                }
            ).updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
            rsSL.addField({
                    id: "custpage_col_thuyetminh",
                    type: serverWidget.FieldType.TEXT, label: 'Thuyết minh'
                }
            ).updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
            rsSL.addField({
                    id: "custpage_col_curyear",
                    type: serverWidget.FieldType.FLOAT, label: 'Năm nay'
                }
            ).updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
            rsSL.addField({
                    id: "custpage_col_lastyear",
                    type: serverWidget.FieldType.FLOAT, label: 'Năm trước'
                }
            ).updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});

            return {form: mainForm, sublist: rsSL};
        }

        function runFilterSS(_params) {
            let dataResult = [];
            let dataResultCur = getDataDetailCur(_params);
            let dataResultBef = getDataDetailBef(_params);
            let arrMaSo = getListMaSo();
            for (let i = 0; i < arrMaSo.length; i++) {
                let objData = {
                    index: i,
                    chitieu: arrMaSo[i].chitieu,
                    maso: arrMaSo[i].maso,
                    thuyetminh: "",
                    amtCur: 0,
                    amtBef: 0,
                    fomular: arrMaSo[i].fomular
                };
                let objCur = findByMaSo(dataResultCur, objData.maso);
                let objBef = findByMaSo(dataResultBef, objData.maso);
                if (lbf.isContainValue(objCur)) objData.amtCur = Number(objCur.amt) * arrMaSo[i].factor;
                if (lbf.isContainValue(objBef)) objData.amtBef = Number(objBef.amt) * arrMaSo[i].factor;
                dataResult.push(objData);
            }

            for (let i = 0; i < dataResult.length; i++) {
                if (!lbf.isContainValue(dataResult[i].fomular)) continue;
                let children = dataResult[i].fomular.split(",");
                let ttlAmtCur = 0, ttlAmtBef = 0;
                for (let j = 0; j < children.length; j++) {
                    let elChildren = children[j].split("|");
                    let objChildren = findByMaSo(dataResult, elChildren[1]);
                    if (!lbf.isContainValue(objChildren)) continue;
                    if (elChildren[0] === "+") {
                        ttlAmtCur += objChildren.amtCur;
                        ttlAmtBef += objChildren.amtBef;
                    } else if (elChildren[0] === "-") {
                        ttlAmtCur -= objChildren.amtCur;
                        ttlAmtBef -= objChildren.amtBef;
                    }
                }
                dataResult[i].amtCur = ttlAmtCur;
                dataResult[i].amtBef = ttlAmtBef;
            }
            return dataResult;
        }

        function getDataDetailCur(_params) {
            let resultSearch = search.load(objSavedSearch.REPORT_PL);
            let myFilter = resultSearch.filters;
            if (lbf.isContainValue(_params.custpage_subsidiary)) {
                myFilter.push(search.createFilter({
                    name: 'subsidiary',
                    operator: search.Operator.ANYOF,
                    values: _params.custpage_subsidiary.split(","),
                }));
            }

            if (lbf.isContainValue(_params.custpage_curfromdt)) {
                myFilter.push(search.createFilter({
                    name: 'trandate',
                    operator: search.Operator.ONORAFTER,
                    values: _params.custpage_curfromdt
                }));
            }

            if (lbf.isContainValue(_params.custpage_curtodt)) {
                myFilter.push(search.createFilter({
                    name: 'trandate',
                    operator: search.Operator.ONORBEFORE,
                    values: _params.custpage_curtodt
                }));
            }
            return getEleDataResultSavedSearch(resultSearch);
        }

        function getDataDetailBef(_params) {
            let resultSearch = search.load(objSavedSearch.REPORT_PL);
            let myFilter = resultSearch.filters;
            if (lbf.isContainValue(_params.custpage_subsidiary)) {
                myFilter.push(search.createFilter({
                    name: 'subsidiary',
                    operator: search.Operator.ANYOF,
                    values: _params.custpage_subsidiary.split(","),
                }));
            }

            if (lbf.isContainValue(_params.custpage_beffromdt)) {
                myFilter.push(search.createFilter({
                    name: 'trandate',
                    operator: search.Operator.ONORAFTER,
                    values: _params.custpage_beffromdt
                }));
            }
            if (lbf.isContainValue(_params.custpage_beftodt)) {
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

        function onRenderData(_params, _sublist, _result) {
            const lR = _result.length;
            for (let i = 0; i < lR; i++) {
                setRowDataSublist(_sublist, i, [
                    "custpage_col_chitieu", "custpage_col_maso", "custpage_col_thuyetminh",
                    "custpage_col_curyear", "custpage_col_lastyear"
                ], [
                    _result[i].chitieu, _result[i].maso, _result[i].thuyetminh,
                    (_result[i].amtCur).toFixed(0), (_result[i].amtBef).toFixed(0)
                ]);
            }
        }

        function getFromDate(_fromdt) {
            if (lbf.isContainValue(_fromdt)) {
                return _fromdt
            }
            let d = new Date();
            return new Date(d.getFullYear(), d.getMonth(), "01");
        }

        function getToDate(_todt) {
            if (lbf.isContainValue(_todt)) {
                return _todt
            }
            return new Date();
        }

        function setRowDataSublist(_sublist, _line, _field, _data) {
            for (let i = 0; i < _field.length; i++) {
                addValueColField(_sublist, _field[i], _line, _data[i]);
            }
        }

        function addFieldGroup(_form, _id, _label) {
            let _obj = {id: _id, label: _label}
            _form.addFieldGroup(_obj);
            return _obj;
        }

        function addValueColField(sublist, id, line, value) {
            if (!lbf.isContainValue(value)) return;
            sublist.setSublistValue({id: id, line: line, value: value});
        }

        function getListMaSo() {
            return [
                {maso: "01", factor: 1, lv: 0, chitieu: "1. Doanh thu bán hàng và cung cấp dịch vụ"},
                {maso: "02", factor: -1, lv: 0, chitieu: "2. Các khoản giảm trừ doanh thu"},
                {
                    maso: "10",
                    factor: 1,
                    lv: 0,
                    fomular: "+|01,-|02",
                    chitieu: "3. Doanh thu thuần về bán hàng và cung cấp dịch vụ (10= 01-02)"
                },
                {maso: "11", factor: -1, lv: 0, chitieu: "4. Giá vốn hàng bán"},
                {
                    maso: "20",
                    factor: 1,
                    lv: 0,
                    fomular: "+|10,-|11",
                    chitieu: "5. Lợi nhuận gộp về bán hàng và cung cấp dịch vụ (20=10 - 11)"
                },
                {maso: "21", factor: 1, lv: 0, chitieu: "6. Doanh thu hoạt động tài chính"},
                {maso: "22", factor: 1, lv: 0, fomular: "+|23,+|22a", chitieu: "7. Chi phí tài chính"},
                {maso: "23", factor: -1, lv: 0, chitieu: "  - Trong đó: Chi phí lãi vay "},
                {maso: "22a", factor: -1, lv: 0, chitieu: " Chi phí tài chính khác"},
                {maso: "25", factor: -1, lv: 0, chitieu: "8. Chi phí bán hàng"},
                {maso: "26", factor: -1, lv: 0, chitieu: "9. Chi phí quản lý doanh nghiệp"},
                {
                    maso: "30",
                    factor: 1,
                    lv: 0,
                    fomular: "+|20,+|21,-|22,-|25,-|26",
                    chitieu: "10 Lợi nhuận thuần từ hoạt động kinh doanh {30 = 20 + (21 - 22) - (25 + 26)}"
                },
                {maso: "31", factor: 1, lv: 0, chitieu: "11. Thu nhập khác"},
                {maso: "32", factor: -1, lv: 0, chitieu: "12. Chi phí khác"},
                {maso: "40", factor: 1, lv: 0, fomular: "+|31,-|32", chitieu: "13. Lợi nhuận khác (40 = 31 - 32)"},
                {
                    maso: "50",
                    factor: 1,
                    lv: 0,
                    fomular: "+|30,+|40",
                    chitieu: "14. Tổng lợi nhuận kế toán trước thuế (50 = 30 + 40)"
                },
                {maso: "51", factor: -1, lv: 0, chitieu: "15. Chi phí thuế TNDN hiện hành"},
                {maso: "52", factor: -1, lv: 0, chitieu: "16. Chi phí thuế TNDN hoãn lại"},
                {
                    maso: "60",
                    factor: 1,
                    lv: 0,
                    fomular: "+|50,-|51,-|52",
                    chitieu: "17. Lợi nhuận sau thuế thu nhập doanh nghiệp (60=50 – 51 - 52)"
                },
                {maso: "70", factor: 1, lv: 0, chitieu: "18. Lãi cơ bản trên cổ phiếu (*)"},
                {maso: "71", factor: 1, lv: 0, chitieu: "19. Lãi suy giảm trên cổ phiếu (*)"}
            ];
        }

        function findByMaSo(_arrFind, _maso) {
            return _arrFind.find(function (item) {
                return item.maso === _maso;
            })
        }

        return {
            onRequest: onRequest
        };

    });
