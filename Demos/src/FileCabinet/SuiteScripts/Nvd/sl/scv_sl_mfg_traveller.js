/**
 * =======================================================================================
 *  Date                Author                  Description
 *  18 Nov 2024		    Khanh Tran			    Init, create file. Màn hình phiếu giao việc và phiếu in liên quan from mr. Bính(https://app.clickup.com/t/86cx3591d)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/redirect', 'N/query', 'N/task', 'N/cache', 'N/ui/message',
    '../lib/scv_lib_function.js', '../cons/scv_cons_search_wo_printing.js', '../cons/scv_cons_search_wo_printing_details.js'
],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{serverWidget} serverWidget
 * @param{url} url
 */
    (record, runtime, search, serverWidget, url, redirect, query, task, cache, message,
        lbf, constSearchWOPrint, constSearchWOPrintDtl
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const CUR_SCRIPT = {
            ID: 'customscript_scv_sl_mfg_traveller',
            DEPLOYID_UI: 'customdeploy_scv_sl_mfg_traveller',
            DEPLOYID_DATA: 'customdeploy_scv_sl_mfg_traveller_data'
        }

        const onRequest = (scriptContext) => {
            let response = scriptContext.response;
            let request = scriptContext.request;
            let params = request.parameters;
            let curScript = runtime.getCurrentScript();
            let myCache = cache.getCache({
                name: 'crunMfgTraveller',
                scope: cache.Scope.PUBLIC
            });
            let mrTaskId = params.mrTaskId;
            if(!mrTaskId) {
                mrTaskId = myCache.get({key: 'mrTaskId', loader: 'loader'});
            }

            let messageInfo = '', iscomplete = true;
            if(lbf.isContainValue(mrTaskId)) {
                let taskStatus = task.checkStatus(mrTaskId);
                messageInfo = 'Update Work Order is: ' + taskStatus.status;
                if(taskStatus.status === 'COMPLETE' || taskStatus.status === 'FAILED') {
                    myCache.remove({key: 'mrTaskId'});
                } else {
                    iscomplete = false;
                } 
            }
            
            if(curScript.deploymentId == CUR_SCRIPT.DEPLOYID_DATA){ 
                let objResponse = {data: [], isSuccess: true, msg: ''};
                response.setHeader({name: 'Content-Type', value: 'application/json'});
                response.write(JSON.stringify(objResponse));
            }else{
                if(scriptContext.request.method == 'GET'){
                    let arrColWO = getColSlWO();
                    let arrColComponent = getColSlComponent();
                    let mainForm = onCreateFormUI(params, messageInfo, arrColWO, arrColComponent);
                    if(params.isSearch == 'T'){
                        if(!mrTaskId){
                            mainForm.form.addSubmitButton('Submit');
                        }
                     
                        let arrSS_woPrint = getDataSS_woPrint(params);
                        let arrSS_woPrintDtl = getDataSS_woPrintDtl(params);
                        renderDataSublist(mainForm.slWorkorders, arrColWO, arrSS_woPrint);
                        renderDataSublist(mainForm.slComponents, arrColComponent, arrSS_woPrintDtl);
                    }

                    response.writePage(mainForm.form);
                }else{
                    let sublistId = 'custpage_sl_workorders';
                    let lc = request.getLineCount({group: sublistId});
                    let prod_lot, vCheck, list_data = [];
                    for(let i = 0; i < lc; i++) {
                        vCheck = request.getSublistValue({group: sublistId, name: 'custpage_col_check', line: i});
                        if(vCheck === true || vCheck === 'T') {
                            wo_id = request.getSublistValue({group: sublistId, name: 'custpage_col_wo_id', line: i});
                            prod_lot = request.getSublistValue({group: sublistId, name: 'custpage_col_prod_lot', line: i});
                            list_data.push({id: wo_id, prod_lot: prod_lot});
                        }
                    }
                    
                    let mrTaskId = '';
                    let mrTask = task.create({taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_scv_mr_mfg_traveller',
                        deploymentId: 'customdeploy_scv_mr_mfg_traveller'
                    });
                    mrTask.params = {custscript_scv_mr_mfg_traveller: JSON.stringify(list_data)};
                    mrTaskId = mrTask.submit();	
                    myCache.put({key: 'mrTaskId', value: mrTaskId});  
                    let parametersToRedirect = copyParameters(params);
                    parametersToRedirect.mrTaskId = mrTaskId;
                    redirect.toSuitelet({
                        scriptId: CUR_SCRIPT.ID,
                        deploymentId: CUR_SCRIPT.DEPLOYID_UI,
                        parameters: parametersToRedirect
                    });
                }
            }
        }

        const copyParameters = (params) => {
            return {
                custpage_work_center: params.custpage_work_center.replaceAll('\u0005', ','),
                custpage_wo_type: params.custpage_wo_type.replaceAll('\u0005', ','),
                custpage_so_source: params.custpage_so_source.replaceAll('\u0005', ','),
                custpage_status: params.custpage_status.replaceAll('\u0005', ','),
                custpage_subsidiary: params.custpage_subsidiary,
                custpage_location: params.custpage_location,
                custpage_wo_fromdt: params.custpage_wo_fromdt,
                custpage_wo_todt: params.custpage_wo_todt,
                custpage_supply_req_date: params.custpage_supply_req_date,
                custpage_assembly: params.custpage_assembly,
            }
        }

        const renderDataSublist = (sl, arrColSl, arrData) => {
            arrData.forEach((objData, index) => {
                arrColSl.forEach(col => {
                    let val = objData[col.id];
                    if(val || val === 0) sl.setSublistValue({id: 'custpage_col_' + col.id, line: index, value: val});
                })
            }) 
        }

        const getDataSS_woPrintDtl = (params) => {
            let myFilters = [];
            if(params.custpage_subsidiary){
                myFilters.push(
                    search.createFilter({name: 'subsidiary', operator: 'anyof', values: params.custpage_subsidiary})
                );
            }
            
            if(params.custpage_wo_fromdt){
                myFilters.push(search.createFilter({name: 'custbody_scv_prod_start_date', operator: 'onorafter', values: params.custpage_wo_fromdt}));
            }

            if(params.custpage_wo_todt){
                myFilters.push(search.createFilter({name: 'custbody_scv_prod_start_date', operator: 'onorbefore', values: params.custpage_wo_todt}));
            }
           
            if(params.custpage_so_source){
                myFilters.push(
                    search.createFilter({name: 'custbody_scv_sales_order', operator: 'anyof', values: params.custpage_so_source.split(',')})
                );
            } 
            
            if(params.custpage_supply_req_date){
                myFilters.push(
                    search.createFilter({name: 'requesteddate', operator: 'on', values: params.custpage_supply_req_date})
                );
            }

            if(params.custpage_assembly){
                myFilters.push(
                    search.createFilter({name: 'item', operator: 'anyof', values: params.custpage_assembly})
                );
            }
            
            if(params.custpage_wo_type){
                myFilters.push(
                    search.createFilter({name: 'custbody_scv_work_order_type', operator: 'anyof', values: params.custpage_wo_type.split(',')})
                );
            }

            if(params.custpage_status){
                myFilters.push(
                    search.createFilter({name: 'custbody_scv_approval_status', operator: 'anyof', values: params.custpage_status.split(',')})
                );
            }

            if(params.custpage_location){
                myFilters.push(
                    search.createFilter({name: 'location', operator: 'anyof', values: params.custpage_location})
                );
            }

            if(params.custpage_work_center){
                myFilters.push(
                    search.createFilter({name: 'custbody_mfgmob_workcenter', operator: 'anyof', values: params.custpage_work_center.split(',')})
                );
            }

            return constSearchWOPrintDtl.getDataSource(myFilters);
        }

        const getDataSS_woPrint = (params) => {
            let myFilters = [];
            if(params.custpage_subsidiary){
                myFilters.push(
                    search.createFilter({name: 'subsidiary', operator: 'anyof', values: params.custpage_subsidiary})
                );
            }
            
            if(params.custpage_wo_fromdt){
                myFilters.push(search.createFilter({name: 'custbody_scv_prod_start_date', operator: 'onorafter', values: params.custpage_wo_fromdt}));
            }

            if(params.custpage_wo_todt){
                myFilters.push(search.createFilter({name: 'custbody_scv_prod_start_date', operator: 'onorbefore', values: params.custpage_wo_todt}));
            }
           
            if(params.custpage_so_source){
                myFilters.push(
                    search.createFilter({name: 'custbody_scv_sales_order', operator: 'anyof', values: params.custpage_so_source.split(',')})
                );
            } 
            
            if(params.custpage_supply_req_date){
                myFilters.push(
                    search.createFilter({name: 'requesteddate', operator: 'on', values: params.custpage_supply_req_date})
                );
            }

            if(params.custpage_assembly){
                myFilters.push(
                    search.createFilter({name: 'item', operator: 'anyof', values: params.custpage_assembly})
                );
            }
            
            if(params.custpage_wo_type){
                myFilters.push(
                    search.createFilter({name: 'custbody_scv_work_order_type', operator: 'anyof', values: params.custpage_wo_type.split(',')})
                );
            }

            if(params.custpage_status){
                myFilters.push(
                    search.createFilter({name: 'custbody_scv_approval_status', operator: 'anyof', values: params.custpage_status.split(',')})
                );
            }

            if(params.custpage_location){
                myFilters.push(
                    search.createFilter({name: 'location', operator: 'anyof', values: params.custpage_location})
                );
            }

            if(params.custpage_work_center){
                myFilters.push(
                    search.createFilter({name: 'custbody_mfgmob_workcenter', operator: 'anyof', values: params.custpage_work_center.split(',')})
                );
            }

            return constSearchWOPrint.getDataSource(myFilters);
        }

        const onCreateFormUI = (params, messageInfo, arrColWO, arrColComponent) => {
            let mainForm = serverWidget.createForm({title: 'Manufacturing Traveller'});
            if(!!messageInfo) {
                mainForm.addPageInitMessage({type: message.Type.INFORMATION, message: messageInfo, duration: -1});
            }
            lbf.pinHeaderSublist(mainForm);
            mainForm.clientScriptModulePath = '../cs/scv_cs_sl_mfg_traveller.js';
            mainForm.addButton({id: 'custpage_btn_search', label: 'Search', functionName: 'onSearchResult()'});
            let filterGrp = lbf.addFieldGroup(mainForm, 'fieldgrp_main', 'Filters');
            let tab_workorders = mainForm.addTab({id: 'tab_workorders', label: 'Work Orders'});
            let tab_components = mainForm.addTab({id: 'tab_components', label: 'Components'});

            let custpage_work_center = mainForm.addField({
                id: 'custpage_work_center', type: 'multiselect', label: 'Work Center', container: filterGrp.id
            }).setHelpText('Work Center').updateBreakType({breakType: 'STARTCOL'})
            custpage_work_center.isMandatory = true;

            let custpage_subsidiary = mainForm.addField({
                id: 'custpage_subsidiary', type: 'select', label: 'Subsidiary', container: filterGrp.id
            }).setHelpText('Subsidiary')
            custpage_subsidiary.isMandatory = true;

            let custpage_location = mainForm.addField({
                id: 'custpage_location', type: 'select', label: 'Location', container: filterGrp.id
            }).setHelpText('Location')
            custpage_location.isMandatory = true;
            
            let custpage_wo_type = mainForm.addField({
                id: 'custpage_wo_type', type: 'multiselect', label: 'WO Type', source: 'customrecord_scv_work_order_type', container: filterGrp.id
            }).setHelpText('WO Type').updateBreakType({breakType: 'STARTCOL'})
            custpage_wo_type.isMandatory = true;

            let custpage_wo_fromdt = mainForm.addField({
                id: 'custpage_wo_fromdt', type: 'date', label: 'WO Fr Date', container: filterGrp.id
            }).setHelpText('WO Fr Date').updateLayoutType({layoutType: 'startrow'})
            custpage_wo_fromdt.isMandatory = true;

            let custpage_wo_todt = mainForm.addField({
                id: 'custpage_wo_todt', type: 'date', label: 'WO To Date', container: filterGrp.id
            }).setHelpText('WO To Date').updateLayoutType({layoutType: 'endrow'})
            custpage_wo_todt.isMandatory = true;

            let custpage_so_source = mainForm.addField({
                id: 'custpage_so_source', type: 'multiselect', label: 'SO Source', source: 'salesorder', container: filterGrp.id
            }).setHelpText('SO Source').updateBreakType({breakType: 'STARTCOL'})
            
            let custpage_supply_req_date = mainForm.addField({
                id: 'custpage_supply_req_date', type: 'date', label: 'Supply Req Date', container: filterGrp.id
            }).setHelpText('Supply Req Date').updateLayoutType({layoutType: 'startrow'})

            let custpage_status = mainForm.addField({
                id: 'custpage_status', type: 'multiselect', label: 'Status', source: 'customrecord_scv_approval_status', container: filterGrp.id
            }).setHelpText('Status').updateBreakType({breakType: 'STARTCOL'})

            let custpage_assembly = mainForm.addField({
                id: 'custpage_assembly', type: 'select', label: 'Assembly', container: filterGrp.id
            }).setHelpText('Assembly')

            onLoadSubsidiaryRole(custpage_subsidiary);
            onLoadLocationBySub(custpage_location, params.subsidiary)
            onLoadEntityGroup(custpage_work_center);
            onLoadItemAssembly(custpage_assembly);
            if(params.custpage_work_center) custpage_work_center.defaultValue = params.custpage_work_center.split(',')
            if(params.custpage_wo_type) custpage_wo_type.defaultValue = params.custpage_wo_type.split(',')
            if(params.custpage_so_source) custpage_so_source.defaultValue = params.custpage_so_source.split(',')
            if(params.custpage_status) custpage_status.defaultValue = params.custpage_status.split(',')
    
            custpage_subsidiary.defaultValue = params.custpage_subsidiary;
            custpage_location.defaultValue = params.custpage_location;
            custpage_wo_fromdt.defaultValue = params.custpage_wo_fromdt;
            custpage_wo_todt.defaultValue = params.custpage_wo_todt;
            custpage_supply_req_date.defaultValue = params.custpage_supply_req_date;
            custpage_assembly.defaultValue = params.custpage_assembly;
            let slWorkorders = mainForm.addSublist({id: 'custpage_sl_workorders', type: 'list', label: 'Work Orders', tab: tab_workorders.id});
            let slComponents = mainForm.addSublist({id: 'custpage_sl_components', type: 'list', label: 'Components', tab: tab_components.id});
            slWorkorders.addMarkAllButtons();
            onCreateSublistColumn(slWorkorders, arrColWO);
            onCreateSublistColumn(slComponents, arrColComponent);
            return {
                form: mainForm, 
                slWorkorders: slWorkorders,
                slComponents: slComponents,
            };
        }

        const onLoadItemAssembly = (assembly_field) => {
            let arrResult = [];
            let assemblyitemSearchObj = search.create({
                type: 'assemblyitem', 
                filters: [
                    ["type","anyof","Assembly"]
                ], 
                columns: [
                    search.createColumn({name: "itemid", label: "Name"})
                ]
            });
            assemblyitemSearchObj = assemblyitemSearchObj.run().getRange(0, 1000);
            for(let objSearch of assemblyitemSearchObj) {
                let objRes = {
                    id: objSearch.id,
                    name: objSearch.getValue("itemid"),
                };
                arrResult.push(objRes);
            }

            assembly_field.addSelectOption({value: '', text : ''});
            for(let obj of arrResult) {
                assembly_field.addSelectOption({value: obj.id, text: obj.name});
            }
        }

        const onLoadEntityGroup = (wo_center_field) => {
            let resultSQL = query.runSuiteQL({
                query: `SELECT id, groupname FROM entitygroup
                    WHERE custentity_mfgmob_wclocation IS NOT NULL AND isinactive = 'F'`
            });
            let resultQuery = resultSQL.asMappedResults();
            for(let obj of resultQuery) {
                wo_center_field.addSelectOption({value: obj.id, text: obj.groupname});
            }
        }

        const onLoadLocationBySub = (location_field, subsidiary) => {
            let sql = `
                SELECT location.id, location.name, LocationSubsidiaryMap.subsidiary
                FROM location
                JOIN LocationSubsidiaryMap 
                ON location.id = LocationSubsidiaryMap.location
                WHERE isinactive = 'F'`;
            if(subsidiary) sql += ` AND LocationSubsidiaryMap.subsidiary IN (${subsidiary})`;

            let resultSQL = query.runSuiteQL({query: sql});
            let resultQuery = resultSQL.asMappedResults();
            location_field.addSelectOption({value: '', text : ''});
            for(let obj of resultQuery) {
                location_field.addSelectOption({value: obj.id, text: obj.name});
            }
        }
        const onLoadSubsidiaryRole = (subsidiary_field) => {
            let arrDataSubsidiary = getDataSubsidiaryByRole();
            subsidiary_field.addSelectOption({value: '', text : ''});
            for(let obj of arrDataSubsidiary){
                subsidiary_field.addSelectOption({value : obj.id, text : obj.name});
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
            for(let obj of subSearch){
                arrResult.push({
                    id: obj.id,
                    name: obj.getValue('namenohierarchy')
                })
            }

            return arrResult;
        }

        const onCreateSublistColumn = (sl, arrColumn) => {
            for(let col of arrColumn){
                if(['amt'].includes(col.id)){
                    sl.addField({id: 'custpage_col_' + col.id, type: col.type, label: col.label, source: col.source || []})
                    .updateDisplayType({displayType: col.displayType || 'inline'})
                    .updateDisplayType({ displayType: 'disabled' });
                }
                else{
                    sl.addField({id: 'custpage_col_' + col.id, type: col.type, label: col.label, source: col.source || []})
                    .updateDisplayType({displayType: col.displayType || 'inline'})
                }
            }
            
        }

        const getColSlComponent = () => {
            return [
                { id: 'wo_name', label: 'WO#', type: 'text'},
                { id: 'so_source', label: 'SO source', type: 'text'},
                { id: 'item', label: 'Items', type: 'text'},
                { id: 'prod_lot', label: 'Prod Lot', type: 'text'},
                { id: 'qc_serial', label: 'QC Serial', type: 'text'},  
                { id: 'qty', label: 'Quantity', type: 'float'},
                { id: 'units', label: 'Units', type: 'text'},
                { id: 'wo_type', label: 'WO Type', type: 'text'},
                { id: 'date', label: 'Date', type: 'text'},
                { id: 'status', label: 'Status', type: 'text'},
                { id: 'subsidiary', label: 'Đơn vị', type: 'text'},
            ]
        }

        const getColSlWO = () => {
            return [
                { id: 'check', label: 'Check', type: 'checkbox', displayType: 'entry'},
                { id: 'wo_name', label: 'WO#', type: 'text'},
                { id: 'so_source', label: 'SO source', type: 'text'},
                { id: 'assembly', label: 'Assembly ', type: 'text'},
                { id: 'prod_lot', label: 'Prod Lot', type: 'text', displayType: 'entry'},
                { id: 'qc_serial', label: 'QC Serial', type: 'text'},  
                { id: 'qty', label: 'Quantity', type: 'float'},
                { id: 'units', label: 'Units', type: 'text'},
                { id: 'wo_type', label: 'WO Type', type: 'text'},
                { id: 'date', label: 'Date', type: 'text'},
                { id: 'status', label: 'Status', type: 'text'},
                { id: 'memo_one', label: 'Memo 01', type: 'text'},
                { id: 'memo_two', label: 'Memo 02', type: 'text'},
                { id: 'subsidiary', label: 'Subsidiary', type: 'text'},
                { id: 'wo_id', label: 'wo_id', type: 'text', displayType: 'hidden'},
            ]
        }

        return {onRequest}

    });
