/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/format', 'N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/ui/serverWidget', '../lib/scv_lib_report', '../lib/scv_lib_cmms', '../olib/lodash.min'],
    
    (format, record, redirect, runtime, search, serverWidget, lrp,  libCmms, lodash) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let request =  scriptContext.request;
            let parameters = request.parameters;
            let response = scriptContext.response;
            
            let subsidiary = parameters.custpage_subsidiary || (runtime.getCurrentUser().subsidiary + '');
            let isRun = parameters.custpage_subsidiary && parameters.custpage_period && parameters.issearch === 'T';
            
            let master = getMaster();
            
            if(request.method === 'GET') {
                let form = createForm(parameters, subsidiary);
                let sublist = createSublist(form, master.sublistId);
                lrp.addFieldHeaderColList(sublist, master.col);
                
                let listData = isRun ? getListDataChiTietMay(parameters, subsidiary) : [];
                if(listData.length > 0) {
                    listData = buildDataKeHoachBaoDuong(listData, parameters);
                    setSublistValueLine(master, sublist, listData);
                }
                response.writePage(form);
            } else {
                let lineCountGroup = request.getLineCount({group: master.sublistId});
                let isSave;
                let recKeHoachBaoDuong = record.create({type: libCmms.CmmsRecordType.KE_HOACH_BAO_DUONG, isDynamic: true});
                setHeaderFieldKeHoachBaoDuong(recKeHoachBaoDuong, parameters);
                isSave = setCurrentSublistValueKeHoachBaoDuongChiTiet(recKeHoachBaoDuong, master, request, lineCountGroup);
                
                if (isSave) {
                    let transactionId = recKeHoachBaoDuong.save({ignoreMandatoryFields: true});
                    redirect.toRecord({type: recKeHoachBaoDuong.type, id: transactionId});
                } else {
                    redirect.toSuitelet({
                        scriptId: 'customscript_scv_sl_cmms_thongke_vtscbd',
                        deploymentId: 'customdeploy_scv_sl_cmms_thongke_vtscbd',
                        isExternal: false,
                        parameters: copyParameters(parameters)
                    });
                }
            }
            
        }
        
        const setDateZeroNeed = (currentDate, startDate) => {
            currentDate.setFullYear(startDate.getFullYear());
            currentDate.setMonth(startDate.getMonth());
            currentDate.setMinutes(0);
            currentDate.setSeconds(0);
            currentDate.setMilliseconds(0);
        }
        
        const buildDataKeHoachBaoDuong = (listData, parameters) => {
            let lkAccountPeriod = search.lookupFields({type: search.Type.ACCOUNTING_PERIOD, id: parameters.custpage_period, columns: ['startdate']});
            let startDate = format.parse({type: format.Type.DATE, value: lkAccountPeriod.startdate});
            const hourStart = 8;
            let currentDate = libCmms.getDateNow(7);
            currentDate.setHours(hourStart);
            setDateZeroNeed(currentDate, startDate);
            let currentToDate = libCmms.getDateNow(7);
            setDateZeroNeed(currentToDate, startDate);
            let currentMonth = String(currentDate.getMonth() + 1);
            let listNewData = [];
            for(let objData of listData) {
                let listDay;
                if(objData.custrecord_scv_cmms_eq_dayofmonth) {
                    listDay = objData.custrecord_scv_cmms_eq_dayofmonth.split(libCmms.CmmsCharToSplit.SEMICOLON);
                } else {
                    listDay = ['1'];
                }
                let inMonths = objData.custrecord_scv_cmms_mf_month.split(libCmms.CmmsCharToSplit.SEMICOLON);
                if(inMonths.includes(currentMonth)) {
                    for(let day of listDay) {
                        let objNewData = JSON.parse(JSON.stringify(objData));
                        currentDate.setDate(parseInt(day, 10));
                        currentToDate.setDate(parseInt(day, 10));
                        currentToDate.setHours(hourStart + parseInt(objData.custrecord_scv_cmms_eq_duration || 0, 10));
                        
                        objNewData.custrecord_scv_cmms_mp_fromdate_l = format.format({type: format.Type.DATE, value: currentDate});
                        objNewData.custrecord_scv_cmms_mp_todate_l = format.format({type: format.Type.DATE, value: currentToDate});
                        objNewData.custrecord_scv_cmms_mp_type_l = libCmms.CmmsScbdType.HANG_THANG;
                        objNewData.custrecord_scv_cmms_mp_fromtime_l = format.format({type: format.Type.TIMEOFDAY, value: currentDate});//'08:00 am';
                        objNewData.custrecord_scv_cmms_mp_totime_l = format.format({type: format.Type.TIMEOFDAY, value: currentToDate});//'08:00 am';
                        listNewData.push(objNewData);
                    }
                }
            }
            return listNewData;
        }
        
        const copyParameters = (parameters) => {
            return {
                custpage_subsidiary: parameters.custpage_subsidiary,
                custpage_period: parameters.custpage_period,
                custpage_period_text: parameters.custpage_period_text,
                custpage_famasset: parameters.custpage_famasset
            }
        }
        
        const prefixNameKHBD = 'Kế hoạch bảo dưỡng kỳ';
        
        const setHeaderFieldKeHoachBaoDuong = (recKeHoachBaoDuong, parameters) => {
            recKeHoachBaoDuong.setValue('name', prefixNameKHBD  + " " + parameters.custpage_period_text);
            recKeHoachBaoDuong.setValue('custrecord_scv_cmms_mp_period', parameters.custpage_period);
        }
        
        const setCurrentSublistValueKeHoachBaoDuongChiTiet = (recKeHoachBaoDuong, master, request, lineCountGroup) => {
            let isSave = true;
            for(let i = 0; i < lineCountGroup; i++) {
                setCurrentSublistValueKeHoachBaoDuongChiTietLine(recKeHoachBaoDuong, libCmms.CmmsSublistId.KHBD_CHI_TIET, master, request, i);
            }
            return isSave;
        }
        
        const setCurrentSublistValueKeHoachBaoDuongChiTietLine = (recKeHoachBaoDuong, sublistId, master, request, line) => {
            let chiTietMayId = request.getSublistValue({group: master.sublistId, name: 'id', line: line});
            if(chiTietMayId) {
                recKeHoachBaoDuong.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custrecord_scv_cmms_mp_asset_l', value: request.getSublistValue({group: master.sublistId, name: 'custrecord_scv_cmms_eq_asset', line: line})});
                recKeHoachBaoDuong.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custrecord_scv_cmms_mp_component_l', value: request.getSublistValue({group: master.sublistId, name: 'custrecord_scv_cmms_eq_component', line: line})});
                recKeHoachBaoDuong.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custrecord_scv_cmms_mp_equipment_l', value: chiTietMayId});
                recKeHoachBaoDuong.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custrecord_scv_cmms_mp_type_l', value: request.getSublistValue({group: master.sublistId, name: 'custrecord_scv_cmms_mp_type_l', line: line})});
                recKeHoachBaoDuong.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custrecord_scv_cmms_mp_workitem_l', value: request.getSublistValue({group: master.sublistId, name: 'custrecord_scv_cmms_eq_workitem', line: line})});
                recKeHoachBaoDuong.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custrecord_scv_cmms_mp_description_l', value: request.getSublistValue({group: master.sublistId, name: 'custrecord_scv_cmms_wi_description', line: line})});
                recKeHoachBaoDuong.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custrecord_scv_cmms_mp_department_l', value: request.getSublistValue({group: master.sublistId, name: 'department', line: line})});
                
                recKeHoachBaoDuong.setCurrentSublistText({sublistId: sublistId, fieldId: 'custrecord_scv_cmms_mp_fromdate_l', text: request.getSublistValue({group: master.sublistId, name: 'custrecord_scv_cmms_mp_fromdate_l', line: line})});
                recKeHoachBaoDuong.setCurrentSublistText({sublistId: sublistId, fieldId: 'custrecord_scv_cmms_mp_fromtime_l', text: request.getSublistValue({group: master.sublistId, name: 'custrecord_scv_cmms_mp_fromtime_l', line: line})});
                recKeHoachBaoDuong.setCurrentSublistText({sublistId: sublistId, fieldId: 'custrecord_scv_cmms_mp_todate_l', text: request.getSublistValue({group: master.sublistId, name: 'custrecord_scv_cmms_mp_todate_l', line: line})});
                recKeHoachBaoDuong.setCurrentSublistText({sublistId: sublistId, fieldId: 'custrecord_scv_cmms_mp_totime_l', text: request.getSublistValue({group: master.sublistId, name: 'custrecord_scv_cmms_mp_totime_l', line: line})});
                
                recKeHoachBaoDuong.commitLine({sublistId: sublistId});
            }
        }
        
        const setSublistValueLine = (master, sublist, listData) => {
            let line = 0;
            let listDataGroup = lodash.groupBy(listData, o => o.custrecord_scv_cmms_eq_asset + '>>' + o.custrecord_scv_cmms_eq_component);
            let colChildren = master.col.filter(o => o.id !== 'custrecord_scv_cmms_eq_asset_display' && o.id !== 'custrecord_scv_cmms_eq_component_display');
            for(let key in listDataGroup) {
                let listDataChildren = listDataGroup[key];
                line = setSublistValueLineGroup(sublist, listDataChildren, line);
                
                for(let objData of listDataChildren) {
                    for(let objCol of colChildren) {
                        let tempValue = objData[objCol.id];
                        if(tempValue) {
                            sublist.setSublistValue({id : objCol.id, line : line, value : tempValue});
                        }
                    }
                    line++;
                }
            }
            
        }
        
        const setSublistValueLineGroup = (sublist, listDataChildren, lineIp) => {
            let line = lineIp;
            let objDataChildZero = listDataChildren[0];
            sublist.setSublistValue({id : 'custrecord_scv_cmms_eq_asset_display', line : line, value : objDataChildZero.custrecord_scv_cmms_eq_asset_display});
            line++;
            sublist.setSublistValue({id : 'custrecord_scv_cmms_eq_component_display', line : line, value : objDataChildZero.custrecord_scv_cmms_eq_component_display});
            line++;
            return line;
        }
        
        const createForm = (parameters, subsidiary) => {
            let form = serverWidget.createForm({title: "Kế hoạch sửa chữa bảo dưỡng"});
            form.clientScriptModulePath = '../cs/scv_cs_cmms_kehoach_scbd.js';
            form.addButton({id: 'custpage_bt_search', label: 'Tìm kiếm', functionName: 'searchReport()'});
            let container = 'fieldgroup_dc_main';
            form.addFieldGroup({id: container, label: 'Filter'});
            
            let fieldSubsidiary = form.addField({
                id: 'custpage_subsidiary',
                type: serverWidget.FieldType.SELECT,
                label: 'CÔNG TY',
                container: container
            });
            fieldSubsidiary.isMandatory = true;
            lrp.addSelectSubsidiary(fieldSubsidiary, subsidiary);
            
            let fieldPeriod = form.addField({
                id: 'custpage_period',
                type: serverWidget.FieldType.SELECT,
                label: 'Kỳ', //source: 'accountingperiod',
                container: container
            });
            fieldPeriod.isMandatory = true;
            let sqlAcc = `select acc.id value, acc.periodname text from accountingperiod acc where acc.isinactive = 'F' and acc.isadjust = 'F' and acc.isquarter = 'F' and acc.isyear = 'F' and acc.closed = 'F'`;
            lrp.addSelectionViaSql(fieldPeriod, sqlAcc, [], true, parameters.custpage_period);
            
            let fieldFamAsset = form.addField({
                id: 'custpage_famasset',
                type: serverWidget.FieldType.SELECT,
                label: 'Tài sản', source: 'customrecord_ncfar_asset',
                container: container
            });
            fieldFamAsset.defaultValue = parameters.custpage_famasset;
            
            form.addSubmitButton({label: 'Tạo kế hoạch'});
            
            return form;
        }
        
        const createSublist = (form, sublistId) => {
            let sublist = form.addSublist({
                id: sublistId,
                type: serverWidget.SublistType.LIST,
                label: 'Kết quả'
            });
            sublist.addMarkAllButtons();
            
            return sublist;
        }
        
        const getMaster = () => {
            let col = [
                {id: 'custrecord_scv_cmms_eq_asset', label: 'Tài sản', type: 'text', display: 'hidden'},
                {id: 'custrecord_scv_cmms_eq_asset_display', label: 'Tài sản', type: 'text', display: 'disabled'},
                {id: 'custrecord_scv_cmms_eq_component', label: 'Thành phần', type: 'text', display: 'hidden'},
                {id: 'custrecord_scv_cmms_eq_component_display', label: 'Thành phần', type: 'text', display: 'disabled'},
                {id: 'name', label: 'Chi tiết máy', type: 'text', display: 'disabled'},
                {id: 'id', label: 'Internal ID', type: 'text', display: 'hidden'},
                {id: 'custrecord_scv_cmms_mp_type_l', label: 'Loại SCBD', type: serverWidget.FieldType.SELECT, display: serverWidget.FieldDisplayType.ENTRY, source: 'customlist_scv_cmms_type'},
                
                {id: 'custrecord_scv_cmms_eq_workitem', label: 'Công việc thực hiện', type: 'text', display: 'hidden'},
                {id: 'custrecord_scv_cmms_eq_workitem_display', label: 'Công việc thực hiện', type: 'text', display: 'disabled'},
                
                {id: 'custrecord_scv_cmms_wi_description', label: 'Mô tả', type: 'text', display: 'disabled'},
                {id: 'department', label: 'Bộ phận', type: serverWidget.FieldType.SELECT, display: serverWidget.FieldDisplayType.ENTRY, source: 'department'},
                
                {id: 'custrecord_scv_cmms_mp_fromdate_l', label: 'KHBD - Từ ngày', type: serverWidget.FieldType.DATE, display: serverWidget.FieldDisplayType.ENTRY},
                {id: 'custrecord_scv_cmms_mp_fromtime_l', label: 'KHBD - Từ giờ', type: serverWidget.FieldType.TIMEOFDAY, display: serverWidget.FieldDisplayType.ENTRY},
                {id: 'custrecord_scv_cmms_mp_todate_l', label: 'KHBD - Đến ngày', type: serverWidget.FieldType.DATE, display: serverWidget.FieldDisplayType.ENTRY},
                {id: 'custrecord_scv_cmms_mp_totime_l', label: 'KHBD - Đến giờ', type: serverWidget.FieldType.TIMEOFDAY, display: serverWidget.FieldDisplayType.ENTRY}
            ];
            return {sublistId: 'custpage_sl_result', col};
        }
        
        const getListDataChiTietMay = (parameters, subsidiary) => {
            let listData = [], params = [subsidiary];
            let strWhereAdd = '';
            if(parameters.custpage_famasset) {
                strWhereAdd += ' and eqm.custrecord_scv_cmms_eq_asset = ?';
                params.push(parameters.custpage_famasset);
            }
            let sqlChiTietMay = `
                select eqm.id, eqm.name, eqm.custrecord_scv_cmms_eq_asset, (asset.name || ' ' || asset.altname) custrecord_scv_cmms_eq_asset_display,
                    eqm.custrecord_scv_cmms_eq_component, cpn.name custrecord_scv_cmms_eq_component_display,
                    eqm.custrecord_scv_cmms_eq_workitem, wi.custrecord_scv_cmms_wi_description custrecord_scv_cmms_eq_workitem_display,
                    eqm.custrecord_scv_cmms_eq_dayofmonth, freq.custrecord_scv_cmms_mf_month, eqm.custrecord_scv_cmms_eq_duration
                from customrecord_scv_cmms_equipment eqm
                    join customrecord_ncfar_asset asset on eqm.custrecord_scv_cmms_eq_asset = asset.id
                    join customrecord_scv_cmms_component cpn on cpn.id = eqm.custrecord_scv_cmms_eq_component
                    left join customrecord_scv_cmms_workitem wi on wi.id = eqm.custrecord_scv_cmms_eq_workitem
                    left join customrecord_scv_cmms_maintenance_freq freq on freq.id = eqm.custrecord_scv_cmms_eq_maint_frequency
                where asset.custrecord_assetsubsidiary = ? ${strWhereAdd}
            `;
            lrp.doSearchSqlAll(listData, sqlChiTietMay, params);
            return listData;
        }
        
        return {onRequest}

    });
