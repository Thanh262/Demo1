/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/search', 'N/record', 'N/ui/serverWidget', 'N/runtime', 'N/query',
    'N/cache', 'N/ui/message', 'N/task', 'N/redirect',
    '../lib/scv_lib_function.js',
    '../cons/scv_cons_search_prod_loss_fail_listing.js',
    '../cons/scv_cons_search_prod_labor_search.js',
    '../cons/scv_cons_search_mfg_by_product_listing.js',
    '../cons/scv_cons_search_production_labor.js'
],
    (
        search, record, serverWidget, runtime, query,
        cache, message, task, redirect,
        lbf, constLossFail, constProdLaborSearch, constProductListing,
        constProductionLabor
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */

        const ACTION_TYPE = {
            EMPTY: { ID: "", NAME: "" },
            UNCHANGED: { ID: 1, NAME: "Unchanged" },
            EDIT: { ID: 2, NAME: "Edit" },
            ADD: { ID: 3, NAME: "Add" },
        };

        const onRequest = (scriptContext) => {
            let request = scriptContext.request;
            let response = scriptContext.response;
            let params = request.parameters;

            let myCache = cache.getCache({
                name: 'cUpdateStt',
                scope: cache.Scope.PRIVATE
            });
            if(request.method == "GET"){
                onRequestMethodGET(response, params, myCache);
            } else {
                onRequestMethodPOST(request, params, myCache);
            }
        }

        const onRequestMethodPOST = (request, params, myCache) => {
            let objParams = getObjParams(params);
            let arrAssembly = getDataSublistAssemblyBuild(request);
            let arrSublist = getDataSublistProdLabor(arrAssembly, request);
            // run map/ reduce
            let mrTask = task.create({
                taskType: task.TaskType.MAP_REDUCE,
                scriptId: 'customscript_scv_mr_crud_prod_labor',
                deploymentId: 'customdeploy_scv_mr_crud_prod_labor'
            });
            mrTask.params = {
                custscript_scv_production_labor: JSON.stringify(arrSublist),
            };
            let mrTaskId = mrTask.submit();
            myCache.put({
                key: 'mrTaskId',
                value: mrTaskId
            });
            redirect.toSuitelet({
                scriptId: "customscript_scv_sl_prod_labor_statistic",
                deploymentId: "customdeploy_scv_sl_prod_labor_statistic",
                parameters: objParams
            });
        }

        const getDataSublistAssemblyBuild = (request) => {
            let sublistId = "custpage_sl_assembly_build";
            let lc = request.getLineCount(sublistId);

            let arrResult = [];
            for(let i = 0; i < lc; i++) {
                let jsonData = request.getSublistValue(sublistId, "custpage_col_json_data", i);
                jsonData = JSON.parse(jsonData);

                arrResult.push(jsonData);
            }
            return arrResult;
        }

        const getDataSublistProdLabor = (arrAssembly, request) => {
            let sublistId = "custpage_sl_prod_labor";
            let lc = request.getLineCount(sublistId);

            let arrResult = [];
            for(let i = 0; i < lc; i++) {
                let obj = {
                    "prd_labor_sub": request.getSublistValue(sublistId, "custpage_col_subsidiary", i) || "",
                    "prd_op_sequences": request.getSublistValue(sublistId, "custpage_col_op_sequence", i) || "",
                    "prd_op_name": request.getSublistValue(sublistId, "custpage_col_op_name", i) || "",
                    "prd_labor_wo_center": request.getSublistValue(sublistId, "custpage_col_work_center", i) || "",
                    "prod_labor_start_d_time": request.getSublistValue(sublistId, "custpage_col_start_date", i) || "",
                    "prd_labor_e_time": request.getSublistValue(sublistId, "custpage_col_end_date", i) || "",
                    "prd_labor_minutes": request.getSublistValue(sublistId, "custpage_col_times", i) || "",
                    "prd_labor_shift": request.getSublistValue(sublistId, "custpage_col_shift", i) || "",
                    "prd_labor_location": request.getSublistValue(sublistId, "custpage_col_location", i) || "",
                    "prd_labor_emp": request.getSublistValue(sublistId, "custpage_col_employee", i) || "",
                    "prd_labor_date": request.getSublistValue(sublistId, "custpage_col_date", i) || "",
                    "prd_labor_title": request.getSublistValue(sublistId, "custpage_col_job_title", i) || "",

                    "internalid": request.getSublistValue(sublistId, "custpage_col_internalid", i) || "",
                    "action_id": request.getSublistValue(sublistId, "custpage_col_action", i) || "",
                };

                if(obj.action_id == ACTION_TYPE.ADD.ID) {
                    obj.prd_labor_wo = groupDataByFieldId(arrAssembly, "createdfrom_id");
                    obj.prd_labor_wo_completion = groupDataByFieldId(arrAssembly, "internalid");
                };
                arrResult.push(obj);
            }
            return arrResult;
        }

        const groupDataByFieldId = (arrData, field) => {
            let objGroup = {};
            for(let i = 0; i < arrData.length; i++) {
                let fieldValue = arrData[i][field];
                if(objGroup[fieldValue] === undefined && !!fieldValue) {
                    objGroup[fieldValue] = fieldValue;
                }
            }
            return Object.values(objGroup);
        }

        const getObjParams = (params) => {
            return {
                custpage_subsidiary: params.custpage_subsidiary,
                custpage_shift: params.custpage_shift,
                custpage_work_center: params.custpage_work_center,
                custpage_lot_no: params.custpage_lot_no,
                custpage_location: params.custpage_location,
                custpage_fromdt: params.custpage_fromdt,
                custpage_todt: params.custpage_todt
            };
        }

        const onRequestMethodGET = (response, params, myCache) => {
            let MainForm = onCreateFormUI(params, myCache);
            if(params.isrun == "T") {
                insertDataSublistProdLabor(MainForm.slProdLabor, params);
                insertDataSublistProdLossFail(MainForm.slProdLossFail, params);
                insertDataSublistProdAssembly(MainForm.slAssemblyBuild, params);
                insertDataSublistProdByProduct(MainForm.slByProduct, params);
            }
            response.writePage(MainForm.form);
        }

        const insertDataSublistProdLabor = (sublist, params) => {
            let searchResult = getDataProductionLabor(params);
            
            let fields = [
                'custpage_col_date', 'custpage_col_employee', 'custpage_col_times', 'custpage_col_job_title', 'custpage_col_shift',
                'custpage_col_work_center', 'custpage_col_op_sequence', 'custpage_col_op_name', 'custpage_col_start_date', 
                'custpage_col_end_date', 'custpage_col_subsidiary', 'custpage_col_location', 'custpage_col_internalid',
                'custpage_col_action', 'custpage_col_json_data'
            ];
            for(let i = 0; i < searchResult.length; i++) {
                let jsonData = getDataJsonDataProdLabor(searchResult[i]);
                let data = [
                    searchResult[i].date, searchResult[i].employee_id, searchResult[i].time_minutes, searchResult[i].job_title_id,
                    searchResult[i].shift_id, searchResult[i].work_center_id, searchResult[i].op_sequence, searchResult[i].op_name,
                    searchResult[i].start_time, searchResult[i].end_time, searchResult[i].subsidiary_id, searchResult[i].location_id,
                    searchResult[i].internalid, ACTION_TYPE.EDIT.ID, JSON.stringify(jsonData)
                ];
                setSublistValueInlineEditor(sublist, fields, i, data);
            }
        }

        const getDataJsonDataProdLabor = (objSearch) => {
            return {
                date: objSearch.date, employee_id: objSearch.employee_id,
                time_minutes: objSearch.time_minutes, job_title_id: objSearch.job_title_id,
                shift_id: objSearch.shift_id, work_center_id: objSearch.work_center_id,
                op_sequence: objSearch.op_sequence, op_name: objSearch.op_name,
                start_time: objSearch.start_time, end_time: objSearch.end_time
            };
        }

        const setSublistValueInlineEditor = (sublist, fields, line, data) => {
            for(let i = 0; i < fields.length; i++) {
                let value = data[i];
                if(!!value) {
                    sublist.setSublistValue({
                        id: fields[i], line: line, value: value
                    });
                }
            }
        }

        const insertDataSublistProdLossFail = (sublist, params) => {
            let searchResult = getDataProdLossFail(params);

            for (let i = 0; i < searchResult.length; i++) {
                let obj = searchResult[i];
                setRowDataSublist(sublist, i, [
                    "custpage_col_0", "custpage_col_1", "custpage_col_2", "custpage_col_3", "custpage_col_4", 
                    "custpage_col_5", "custpage_col_6", "custpage_col_7", "custpage_col_8", "custpage_col_9", 
                    "custpage_col_10", "custpage_col_11", "custpage_col_12", "custpage_col_13", 
                    "custpage_col_14", "custpage_col_15", "custpage_col_16"
                ], [
                    obj.op_sequence, obj.op_name, obj.loss_reason_nm, obj.loss_category_nm, obj.pl_4m_reason_nm, 
                    obj.time_stop, obj.shift_nm, obj.work_center_nm, obj.date_recorded, obj.employee_nm, 
                    obj.assembly_nm, obj.location_nm, obj.subsidiary_nm, obj.work_order_nm, obj.wo_completion_nm, 
                    obj.lot_no, obj.serial
                ]);
            }
        }

        const insertDataSublistProdAssembly = (sublist, params) => {
            let searchResult = getDataProdAssembly(params);

            for (let i = 0; i < searchResult.length; i++) {
                let obj = searchResult[i];
                setRowDataSublist(sublist, i, [
                    "custpage_col_0", "custpage_col_1", "custpage_col_2", "custpage_col_3", "custpage_col_4", 
                    "custpage_col_5", "custpage_col_6", "custpage_col_7", "custpage_col_8", "custpage_col_9", 
                    "custpage_col_10", "custpage_col_11", "custpage_col_json_data"
                ], [
                    obj.id_link, obj.trandate, obj.hyperlink, obj.item_nm, obj.quantity, obj.lot_no,
                    obj.work_center_nm, obj.work_bench_nm, obj.shift_nm, obj.subsidiary_nm, obj.location_nm, 
                    obj.createdfrom_nm, JSON.stringify({
                        internalid: obj.internalid,
                        createdfrom_id: obj.createdfrom_id
                    })
                ]);
            }
        }

        const insertDataSublistProdByProduct = (sublist, params) => {
            let searchResult = getDataProdByProduct(params);

            for (let i = 0; i < searchResult.length; i++) {
                let obj = searchResult[i];
                setRowDataSublist(sublist, i, [
                    "custpage_col_0", "custpage_col_1", "custpage_col_2", "custpage_col_3", "custpage_col_4", 
                    "custpage_col_5", "custpage_col_6", "custpage_col_7", "custpage_col_8", "custpage_col_9", 
                    "custpage_col_10", "custpage_col_11", 
                ], [
                    obj.item_nm, obj.quantity, obj.rate, obj.work_order_nm, obj.wo_completion_nm,
                    obj.subsidiary_nm, obj.work_center_nm, obj.shift_nm, obj.lot_no, obj.hyperlink,
                    obj.date, obj.location_nm
                ]);
            }
        }

        const getDataProductionLabor = (params) => {
            let myFilters = [];

            if(!!params.custpage_subsidiary) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_prd_labor_sub", 
                    operator: "anyof", 
                    values: params.custpage_subsidiary
                }));
            }

            if(!!params.custpage_shift) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_prd_labor_shift", 
                    operator: "anyof", 
                    values: params.custpage_shift
                }));
            }

            if(!!params.custpage_work_center) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_prd_labor_wo_center", 
                    operator: "anyof", 
                    values: params.custpage_work_center
                }));
            }

            if(!!params.custpage_location) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_prd_labor_location", 
                    operator: "anyof", 
                    values: params.custpage_location
                }));
            }

            if(!!params.custpage_fromdt) {
                myFilters.push(search.createFilter({
                    name: 'custrecord_scv_prd_labor_date',
                    operator: "onorafter",
                    values: params.custpage_fromdt
                }));
            }

            if(!!params.custpage_todt) {
                myFilters.push(search.createFilter({
                    name: 'custrecord_scv_prd_labor_date',
                    operator: "onorbefore",
                    values: params.custpage_todt
                }));
            }
            
            return constProductionLabor.getDataSource(myFilters);
        }

        const getDataProdLossFail = (params) => {
            let myFilters = [];

            if(!!params.custpage_subsidiary) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_pl_subsidiary", 
                    operator: "anyof", 
                    values: params.custpage_subsidiary
                }));
            }

            if(!!params.custpage_shift) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_pl_shift", 
                    operator: "anyof", 
                    values: params.custpage_shift
                }));
            }

            if(!!params.custpage_work_center) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_loss_fail_work_center", 
                    operator: "anyof", 
                    values: params.custpage_work_center
                }));
            }

            if(!!params.custpage_lot_no) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_pl_prod_lot_no", 
                    operator: "is", 
                    values: params.custpage_lot_no
                }));
            }

            if(!!params.custpage_location) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_pl_location", 
                    operator: "anyof", 
                    values: params.custpage_location
                }));
            }

            if(!!params.custpage_fromdt) {
                myFilters.push(search.createFilter({
                    name: 'custrecord_scv_pl_date_recorded',
                    operator: "onorafter",
                    values: params.custpage_fromdt
                }));
            }

            if(!!params.custpage_todt) {
                myFilters.push(search.createFilter({
                    name: 'custrecord_scv_pl_date_recorded',
                    operator: "onorbefore",
                    values: params.custpage_todt
                }));
            }

            return constLossFail.getDataSource(myFilters);
        }

        const getDataProdAssembly = (params) => {
            let myFilters = [];

            if(!!params.custpage_subsidiary) {
                myFilters.push(search.createFilter({
                    name: "subsidiary", 
                    operator: "anyof", 
                    values: params.custpage_subsidiary
                }));
            }

            if(!!params.custpage_shift) {
                myFilters.push(search.createFilter({
                    name: "custbody_scv_shift", 
                    operator: "anyof", 
                    values: params.custpage_shift
                }));
            }

            if(!!params.custpage_work_center) {
                myFilters.push(search.createFilter({
                    name: "custbody_mfgmob_workcenter", 
                    operator: "anyof", 
                    values: params.custpage_work_center
                }));
            }

            if(!!params.custpage_lot_no) {
                myFilters.push(search.createFilter({
                    name: "custbody_scv_assembly_lot", 
                    operator: "is", 
                    values: params.custpage_lot_no
                }));
            }

            if(!!params.custpage_location) {
                myFilters.push(search.createFilter({
                    name: "location", 
                    operator: "anyof", 
                    values: params.custpage_location
                }));
            }

            if(!!params.custpage_fromdt) {
                myFilters.push(search.createFilter({
                    name: 'trandate',
                    operator: "onorafter",
                    values: params.custpage_fromdt
                }));
            }

            if(!!params.custpage_todt) {
                myFilters.push(search.createFilter({
                    name: 'trandate',
                    operator: "onorbefore",
                    values: params.custpage_todt
                }));
            }

            return constProdLaborSearch.getDataSource(myFilters);
        }

        const getDataProdByProduct = (params) => {
             let myFilters = [];

            if(!!params.custpage_subsidiary) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_by_product_sub", 
                    operator: "anyof", 
                    values: params.custpage_subsidiary
                }));
            }

            if(!!params.custpage_shift) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_by_product_shift", 
                    operator: "anyof", 
                    values: params.custpage_shift
                }));
            }

            if(!!params.custpage_work_center) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_by_product_work_center", 
                    operator: "anyof", 
                    values: params.custpage_work_center
                }));
            }

            if(!!params.custpage_lot_no) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_by_product_lot_no", 
                    operator: "is", 
                    values: params.custpage_lot_no
                }));
            }

            if(!!params.custpage_location) {
                myFilters.push(search.createFilter({
                    name: "custrecord_scv_by_product_location", 
                    operator: "anyof", 
                    values: params.custpage_location
                }));
            }

            if(!!params.custpage_fromdt) {
                myFilters.push(search.createFilter({
                    name: 'custrecord_scv_by_product_date',
                    operator: "onorafter",
                    values: params.custpage_fromdt
                }));
            }

            if(!!params.custpage_todt) {
                myFilters.push(search.createFilter({
                    name: 'custrecord_scv_by_product_date',
                    operator: "onorbefore",
                    values: params.custpage_todt
                }));
            }

            return constProductListing.getDataSource(myFilters);
        }

        const onCreateFormUI = (params, myCache) => {
            let mainForm = serverWidget.createForm({title: "Thống kê Nhân công và xem các thông tin khác"});
            mainForm.clientScriptModulePath = '../cs/scv_cs_sl_prod_labor_statistic.js';
            let filterGrp = addFieldGroup(mainForm, "fieldgrp_main", "Filters");

            // add button
            mainForm.addSubmitButton({label : 'Submit'});
            mainForm.addButton({
                id: "custpage_btn_search",
                label: "Search",
                functionName: "onSearchResult()"
            });
            // update status
            let mrTaskId = params.mrTaskId;

            if (lbf.isContainValue(mrTaskId) == false) {
                mrTaskId = myCache.get({
                    key: 'mrTaskId',
                    loader: 'loader'
                });
            }
            if (lbf.isContainValue(mrTaskId)) {
                let taskStatus = task.checkStatus(mrTaskId);
                let messageInfo = 'Status of Update Approve Status is: ' + taskStatus.status;
                mainForm.addPageInitMessage({
                    type: message.Type.INFORMATION,
                    message: messageInfo,
                    duration: -1
                });
                if(taskStatus.status == 'COMPLETE') {
                    myCache.remove({ key: 'mrTaskId' });
                }
            }
            // add field
            let custpage_subsidiary = mainForm.addField({
                id: "custpage_subsidiary",
                type: serverWidget.FieldType.SELECT,
                label: "Subsidairy",
                container: filterGrp.id
            });
            let custpage_shift = mainForm.addField({
                id: "custpage_shift",
                type: serverWidget.FieldType.SELECT,
                label: "Shift",
                source: "customrecord_mfgmob_shift",
                container: filterGrp.id
            });
            let custpage_fromdt = mainForm.addField({
                id: 'custpage_fromdt',
                type: serverWidget.FieldType.DATE,
                label: 'From Date',
                container: filterGrp.id
            });
            let custpage_todt = mainForm.addField({
                id: 'custpage_todt',
                type: serverWidget.FieldType.DATE,
                label: 'To Date',
                container: filterGrp.id
            });
            
            let custpage_work_center = mainForm.addField({
                id: "custpage_work_center",
                type: serverWidget.FieldType.SELECT,
                label: "Work Center",
                container: filterGrp.id
            });
            let custpage_lot_no = mainForm.addField({
                id: "custpage_lot_no",
                type: serverWidget.FieldType.TEXT,
                label: "Lot No",
                container: filterGrp.id
            });

            let custpage_location = mainForm.addField({
                id: "custpage_location",
                type: serverWidget.FieldType.SELECT,
                label: "Location",
                source: "location",
                container: filterGrp.id
            });

            let arrEntGroup = getDataEntityGroup();
            onLoadEntityGroup(custpage_work_center, arrEntGroup);
            onLoadSubsidiaryRole(custpage_subsidiary);
            custpage_subsidiary.isMandatory = true;
            custpage_location.isMandatory = true;
            custpage_work_center.isMandatory = true;
            custpage_fromdt.updateLayoutType({layoutType: 'STARTROW'});
            custpage_todt.updateLayoutType({layoutType: 'ENDROW'});

            let fields = [
                custpage_subsidiary, custpage_fromdt, custpage_todt, custpage_shift, 
                custpage_work_center, custpage_lot_no, custpage_location
            ];
            applyCustomFieldSettings(fields, params, true);
            custpage_fromdt.defaultValue = getFromDate(params.custpage_fromdt);
            custpage_todt.defaultValue = getToDate(params.custpage_todt);

            // add tab
            let tabProdLabor = addTab(mainForm, "tab_prod_labor", "Production Labor");
            let tabProdLossFail = addTab(mainForm, "tab_prod_loss_fail", "Production Loss/Fail");
            let tabAssemblyBuild = addTab(mainForm, "tab_assembly_build", "Assembly Build");
            let tabByProduct = addTab(mainForm, "tab_by_product", "By Product");

            // add sublist
            let slProdLabor = mainForm.addSublist({
                id: "custpage_sl_prod_labor",
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'Result',
                tab: tabProdLabor.id
            });

            let slProdLossFail = mainForm.addSublist({
                id: "custpage_sl_prod_loss_fail",
                type: serverWidget.SublistType.LIST,
                label: 'Result',
                tab: tabProdLossFail.id
            });

            let slAssemblyBuild = mainForm.addSublist({
                id: "custpage_sl_assembly_build",
                type: serverWidget.SublistType.LIST,
                label: 'Result',
                tab: tabAssemblyBuild.id
            });

            let slByProduct = mainForm.addSublist({
                id: "custpage_sl_by_product",
                type: serverWidget.SublistType.LIST,
                label: 'Result',
                tab: tabByProduct.id
            });
            
            onCrtSublistProductionLabor(slProdLabor, arrEntGroup);
            onCrtSublistProdLossFail(slProdLossFail);
            onCrtSublistAssemblyBuild(slAssemblyBuild);
            onCrtSublistByProduct(slByProduct);

            return { 
                form: mainForm, 
                slProdLabor, slProdLossFail,
                slAssemblyBuild, slByProduct
            };
        }

        const onCrtSublistProductionLabor = (sublist, arrEntGroup) => {
            let arrColumn = [
                {id: "custpage_col_date", label: "Date", type: "date"},
                {id: "custpage_col_employee", label: "Employee", type: "select", source: "employee", isMandatory: true},
                {id: "custpage_col_times", label: "Time (minutes)", type: "float", isMandatory: true},
                {id: "custpage_col_job_title", label: "Job Title", type: "select", source: "customlist_scv_operation_titble", isMandatory: true},
                {id: "custpage_col_shift", label: "Shift", type: "select", source: "customrecord_mfgmob_shift"},
                {id: "custpage_col_work_center", label: "Work Center", type: "select", displayType: "disabled"},
                {id: "custpage_col_op_sequence", label: "Operation Seq", type: "text"},
                {id: "custpage_col_op_name", label: "Operation Name", type: "text"},
                {id: "custpage_col_start_date", label: "Start Date Time", type: "datetimetz"},
                {id: "custpage_col_end_date", label: "End Date Time", type: "datetimetz"},
                {id: "custpage_col_subsidiary", label: "Subsidiary", type: "select", source: "subsidiary", displayType: "disabled", isMandatory: true},
                {id: "custpage_col_location", label: "Location", type: "select", source: "location", displayType: "disabled", isMandatory: true},
                {id: "custpage_col_internalid", label: "Internal ID", type: "text", displayType: "disabled"},
                {id: "custpage_col_action", label: "Action", type: "select", displayType: "disabled"},
                {id: "custpage_col_json_data", label: "JSON Data", type: "textarea", displayType: "hidden"},
            ];

            for(let i = 0; i< arrColumn.length; i++){
                let objCol = arrColumn[i];
                let field = sublist.addField({
                    id: objCol.id,
                    type : objCol.type,
                    source: objCol.source||null,
                    label : objCol.label
                }).updateDisplayType({displayType: objCol.displayType||"entry"});
                
                if(arrColumn[i].id === 'custpage_col_work_center') {
                    onLoadEntityGroup(field, arrEntGroup);
                }
                if(arrColumn[i].id === 'custpage_col_action') {
                    onLoadAction(field);
                }

                field.isMandatory = objCol.isMandatory ?? false;

                if(!!objCol.defaultValue){
                    field.defaultValue = objCol.defaultValue;
                }
            }
        }

        const onCrtSublistProdLossFail = (sublist) => {
            let arrColumn = [
                { label: "Operation Seq", type: "float" },
                { label: "Operation Name", type: "text" },
                { label: "Loss Group", type: "text" },
                { label: "Loss Category", type: "text" },
                { label: "(4M) Reason", type: "text" },
                { label: "Stop Time (Minute)", type: "float" },
                { label: "Shift", type: "text" },
                { label: "Work Center", type: "text" },
                { label: "Date Recorded", type: "text" },
                { label: "Employee", type: "text" },
                { label: "Assembly", type: "text" },
                { label: "Location", type: "text" },
                { label: "Subsidiary", type: "text" },
                { label: "Work Order", type: "text" },
                { label: "Work Order Completion", type: "text" },
                { label: "Prod Lot Number", type: "text" },
                { label: "Serial", type: "text" },
            ];

            onCreateSublistColumn(arrColumn, sublist);
        }

        const onCrtSublistAssemblyBuild = (sublist) => {
            let arrColumn = [
                { label: "Internal ID", type: "text" },
                { label: "Date", type: "text" },
                { label: "Document Number", type: "text" },
                { label: "Item", type: "text" },
                { label: "Quantity", type: "float" },
                { label: "Prod Lot Number (Custom Body)", type: "text" },
                { label: "Work Center (Custom Body)", type: "text" },
                { label: "Work Bench (Custom Body)", type: "text" },
                { label: "Shift (Custom Body)", type: "text" },
                { label: "Subsidiary", type: "text" },
                { label: "Location", type: "text" },
                { label: "Created From", type: "text" },
                { id: "custpage_col_json_data", label: "JSON Data", type: "textarea", displayType: "hidden"},
            ];

            onCreateSublistColumn(arrColumn, sublist);
        }

        const onCrtSublistByProduct = (sublist) => {
            let arrColumn = [
                { label: "By Product", type: "text" },
                { label: "By Product Qty", type: "float" },
                { label: "Rate", type: "float" },
                { label: "Work Order", type: "text" },
                { label: "Work Order Completion", type: "text" },
                { label: "Subsidiary", type: "text" },
                { label: "Work Center", type: "text" },
                { label: "Shift", type: "text" },
                { label: "Prod Lot Number", type: "text" },
                { label: "Internal ID", type: "text" },
                { label: "Date", type: "text" },
                { label: "MFG Location", type: "text" },
            ];

            onCreateSublistColumn(arrColumn, sublist);
        }

        function onCreateSublistColumn(arrColumn, sublist){
            let index = 0;
            for(let i = 0; i< arrColumn.length; i++){
                let field = sublist.addField({
                    id: arrColumn[i].id || ("custpage_col_"+ index),
                    type: arrColumn[i].type,
                    label: arrColumn[i].label,
                    source: arrColumn[i].source || null,
                });
                field.updateDisplayType({ displayType: arrColumn[i].displayType || "inline"});

                if(!arrColumn[i].id) {
                    index++;
                }
            }
        }

        const applyCustomFieldSettings = (fields, params, isHelpText) => {
            for(let objField of fields) {
                objField.defaultValue = params[objField.id];
                if(isHelpText) {
                    objField.setHelpText({ help: objField.label });
                }
            }
        }

        function onLoadAction(_actionField) {
            for(let property in ACTION_TYPE) {
                _actionField.addSelectOption({
                    value: ACTION_TYPE[property].ID, 
                    text: ACTION_TYPE[property].NAME 
                });
            }
        }

        function onLoadEntityGroup(_workCenterField, _data) {
            _workCenterField.addSelectOption({value : "", text : ""});

            for(let i in _data) {
                _workCenterField.addSelectOption({value: _data[i].id, text: _data[i].groupname});
            }
        }

        const getDataEntityGroup = () => {
            let resultSQL = query.runSuiteQL({
                query: `SELECT id, groupname FROM entitygroup
                    WHERE custentity_mfgmob_wclocation IS NOT NULL AND isinactive = 'F'`
            });
            let resultQuery = resultSQL.asMappedResults();
            return resultQuery;
        }

        function onLoadSubsidiaryRole(_subsidiaryField){
            let arrDataSubsidiary = getDataSubsidiaryByRole();
            _subsidiaryField.addSelectOption({value : "", text : ""});
            for(let i in arrDataSubsidiary){
                _subsidiaryField.addSelectOption({value : arrDataSubsidiary[i].id, text : arrDataSubsidiary[i].name});
            }
        }

        const getDataSubsidiaryByRole = () => {
            let curUser = runtime.getCurrentUser()
            let roleRec = record.load({type: "role", id: curUser.role});
            let subsidiary_op = roleRec.getValue("subsidiaryoption");
            let myFilter = [];
            switch (subsidiary_op){
                case 'ALL':
                    myFilter = [];
                    break;
                case 'ALLACTIVE':
                    myFilter = [['isinactive', 'is', false]];
                    break;
                case 'OWN':
                    let entityLKF = search.lookupFields({type: "entity", id: curUser.id, columns: "subsidiary"});
                    let sub_id = "";
                    if(!!entityLKF.subsidiary){
                        if(entityLKF.subsidiary.length > 0){
                            sub_id = entityLKF.subsidiary[0].value;
                        }
                    }
    
                    myFilter = ['internalid', "anyOf", sub_id];
                    break;
                case 'SELECTED':
                    let arrSubSel = roleRec.getValue("subsidiaryrestriction");
                    myFilter = ['internalid', "anyOf", arrSubSel]
                    break;
            }
            let subSearch = search.create({
                type: "subsidiary",
                filters: myFilter,
                columns: ["namenohierarchy"]
            });
            subSearch = subSearch.run().getRange(0, 1000);

            let arrResult = [];
            for(let i in subSearch){
                arrResult.push({
                    id: subSearch[i].id,
                    name: subSearch[i].getValue('namenohierarchy')
                })
            }

            return arrResult;
        }

        function setRowDataSublist(_sublist, _line, _field, _data){
            for(let i = 0; i<_field.length; i++){
                addValueColField(_sublist, _field[i], _line, _data[i]);
            }
        }

        function addValueColField(sublist, id, line, value) {
            if(lbf.isContainValue(value)){
                sublist.setSublistValue({
                    id: id,
                    line: line,
                    value: value
                });
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

        function addTab(_form, _id,_label){
            let _obj = {id: _id, label: _label}
            _form.addTab(_obj);
            return _obj;
        }

        function addFieldGroup(_form, _id, _label){
            let _obj = {id: _id, label: _label}
            _form.addFieldGroup(_obj);
            return _obj;
        }

        return {onRequest}

    });
