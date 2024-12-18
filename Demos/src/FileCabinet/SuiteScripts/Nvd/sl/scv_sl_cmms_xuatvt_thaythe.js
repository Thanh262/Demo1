/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/format', 'N/record', 'N/redirect', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url', '../lib/scv_lib_report', '../lib/scv_lib_cmms'],
    
    (format, record, redirect, runtime, search, serverWidget, url, lrp,  libCmms) => {
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
            
            let subsidiary = runtime.getCurrentUser().subsidiary;
            let master = getMaster();
            
            if(request.method === 'GET') {
                let recScbd = record.load({type: libCmms.CmmsRecordType.SUA_CHUA_BAO_DUONG, id: parameters.custpage_scbd});
                parameters.custpage_asset = recScbd.getValue('custrecord_scv_cmms_wo_asset');
                
                let form = createForm(parameters, subsidiary);
                let sublist = createSublist(form, master.sublistId);
                lrp.addFieldHeaderColList(sublist, master.col);
                
                let listData = getListDataBudget(recScbd);
                if(listData) {
                    setSublistValueLine(master, sublist, listData);
                }
                response.writePage(form);
            } else {
                if(parameters.isGetData === 'T') {
                    let listItemId = JSON.parse(parameters.items);
                    let listItemAvailable = libCmms.getItemAvailable({location: parameters.custpage_location, items: listItemId}, lrp);
                    response.write({output: JSON.stringify({listItemAvailable})});
                } else {
                    let lineCountGroup = request.getLineCount({group: master.sublistId});
                    let isSave = false;
                    let recInventoryAdjustment = record.create({type: record.Type.INVENTORY_ADJUSTMENT, isDynamic: true});
                    setHeaderFieldInventoryAdjustment(recInventoryAdjustment, parameters, subsidiary);
                    
                    for(let i = 0; i < lineCountGroup; i++) {
                        let chon = request.getSublistValue({group: master.sublistId, name: 'chon', line: i});
                        if(chon === 'T') {
                            isSave = true;
                            setCurrentSublistValueInventoryAdjustment(recInventoryAdjustment, libCmms.CmmsSublistId.INVENTORY, master, parameters, request, i);
                        }
                    }
                    if (isSave) {
                        let inventoryAdjustmentId = recInventoryAdjustment.save({ignoreMandatoryFields: true});
                        writeRedirectToInventoryAdjustment(response, inventoryAdjustmentId);
                    } else {
                        redirect.toSuitelet({
                            scriptId: 'customscript_scv_sl_cmms_xuatvt_thaythe',
                            deploymentId: 'customdeploy_scv_sl_cmms_xuatvt_thaythe',
                            isExternal: false,
                            parameters: copyParameters(parameters)
                        });
                    }
                }
            }
            
        }
        
        const writeRedirectToInventoryAdjustment = (response, inventoryAdjustmentId) => {
            let redirectUrl = url.resolveRecord({recordType: record.Type.INVENTORY_ADJUSTMENT, recordId: inventoryAdjustmentId, isEditMode: false});
            response.write(`
                <script>
                    if (window.parent) {
                        window.parent.location.href = "${redirectUrl}";
                        window.close();
                    } else {
                        window.location.href = "${redirectUrl}";
                    }
                </script>
            `);
        }
        
        const copyParameters = (parameters) => {
            return {
                custpage_subsidiary: parameters.custpage_subsidiary,
                custpage_asset: parameters.custpage_asset,
                custpage_location: parameters.custpage_location,
                custpage_trandate: parameters.custpage_trandate,
                custpage_scbd: parameters.custpage_scbd
            }
        }
        
        const setHeaderFieldInventoryAdjustment = (recInventoryAdjustment, parameters, subsidiary) => {
            recInventoryAdjustment.setValue('subsidiary', subsidiary);
            recInventoryAdjustment.setValue('adjlocation', parameters.custpage_location);
            recInventoryAdjustment.setText('trandate', parameters.custpage_trandate);
            
            let lkOrderType = search.lookupFields({type: libCmms.CmmsRecordType.ORDER_TYPE, id: libCmms.CmmsOrderType.VAT_TU_SUA_CHUA_BAO_DUONG, columns: ['custrecord_scv_adjust_account']});
            recInventoryAdjustment.setValue('account', lkOrderType.custrecord_scv_adjust_account[0]?.value);
            
            recInventoryAdjustment.setValue('custbody_scv_cmms_workorder', parameters.custpage_scbd);
        }
        
        const setCurrentSublistValueInventoryAdjustment = (recPurchaseRequest, sublistId, master, parameters, request, line) => {
            let issueinventorynumber = request.getSublistValue({group: master.sublistId, name: 'custpage_issueinventorynumber', line: line});
            let binnumber = request.getSublistValue({group: master.sublistId, name: 'custpage_binnumber', line: line});
            let inventorystatus = request.getSublistValue({group: master.sublistId, name: 'custpage_inventorystatus', line: line});
            let quantity = request.getSublistValue({group: master.sublistId, name: 'custrecord_scv_cmms_bg_actualquantity', line: line}) * -1;
            recPurchaseRequest.setCurrentSublistValue({sublistId: sublistId, fieldId: 'item', value: request.getSublistValue({group: master.sublistId, name: 'custrecord_scv_cmms_bg_actualitem', line: line})});
            recPurchaseRequest.setCurrentSublistValue({sublistId: sublistId, fieldId: 'location', value: parameters.custpage_location});
            recPurchaseRequest.setCurrentSublistValue({sublistId: sublistId, fieldId: 'units', value: request.getSublistValue({group: master.sublistId, name: 'custrecord_scv_cmms_bg_unit', line: line})});
            recPurchaseRequest.setCurrentSublistValue({sublistId: sublistId, fieldId: 'adjustqtyby', value: 0});//Voi truong hop xuat can lam the nay thi cac phan lien quan den bin khi set detail se ko bi loi invalid
            recPurchaseRequest.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custcol_far_trn_relatedasset', value: parameters.custpage_asset});
            
            recPurchaseRequest.commitLine({sublistId: sublistId});
            recPurchaseRequest.selectLine({sublistId: sublistId, line: line});
            recPurchaseRequest.setCurrentSublistValue({sublistId: sublistId, fieldId: 'adjustqtyby', value: quantity});
            
            let subrecordInventoryDetail = recPurchaseRequest.getCurrentSublistSubrecord({sublistId: sublistId, fieldId: 'inventorydetail'});
            
            setCurrentInventoryDetail(subrecordInventoryDetail, {issueinventorynumber, binnumber, quantity, inventorystatus});
            recPurchaseRequest.commitLine({sublistId: sublistId});
        }
        
        const setCurrentInventoryDetail = (subrecordInventoryDetail, objInventory) => {
            if(subrecordInventoryDetail) {
                let lineCountIvd = subrecordInventoryDetail.getLineCount(libCmms.CmmsSublistId.INVENTORY_ASSIGNMENT);
                if(lineCountIvd) {
                    subrecordInventoryDetail.selectLine({sublistId: libCmms.CmmsSublistId.INVENTORY_ASSIGNMENT, line: 0});
                }
                subrecordInventoryDetail.setCurrentSublistValue({sublistId: libCmms.CmmsSublistId.INVENTORY_ASSIGNMENT, fieldId: 'issueinventorynumber', value: objInventory.issueinventorynumber});
                subrecordInventoryDetail.setCurrentSublistValue({sublistId: libCmms.CmmsSublistId.INVENTORY_ASSIGNMENT, fieldId: 'binnumber', value: objInventory.binnumber});
                subrecordInventoryDetail.setCurrentSublistValue({sublistId: libCmms.CmmsSublistId.INVENTORY_ASSIGNMENT, fieldId: 'inventorystatus', value: objInventory.inventorystatus});
                subrecordInventoryDetail.setCurrentSublistValue({sublistId: libCmms.CmmsSublistId.INVENTORY_ASSIGNMENT, fieldId: 'quantity', value: objInventory.quantity});
                subrecordInventoryDetail.commitLine({sublistId: libCmms.CmmsSublistId.INVENTORY_ASSIGNMENT});
            }
        }
        
        const setSublistValueLine = (master, sublist, listData) => {
            let line = 0;
            for(let objData of listData) {
                for(let objCol of master.col) {
                    let tempValue = objData[objCol.id];
                    if(tempValue) {
                        sublist.setSublistValue({id : objCol.id, line : line, value : tempValue});
                    }
                }
                line++;
            }
        }
        
        const createForm = (parameters, subsidiary) => {
            let form = serverWidget.createForm({title: "Xuất vật tư thay thế"});
            form.clientScriptModulePath = '../cs/scv_cs_cmms_xuatvt_thaythe.js';
            let container = 'fieldgroup_dc_main';
            form.addFieldGroup({id: container, label: ' '});
            
            lrp.addFieldHidden(form, 'custpage_subsidiary', subsidiary);
            //lrp.addFieldHidden(form, 'custpage_asset', parameters.custpage_asset);
            
            let fieldLocation = form.addField({
                id: 'custpage_location',
                type: serverWidget.FieldType.SELECT,
                label: 'Kho',
                container: container
            });
            fieldLocation.isMandatory = true;
            let filterLocation = [search.createFilter({name: 'isinactive', operator: search.Operator.IS, values: false}),
                search.createFilter({name: 'subsidiary', operator: search.Operator.ANYOF, values: subsidiary}),
                search.createFilter({name: 'custrecord_scv_cmms_location', operator: search.Operator.IS, values: true})
            ];
            lrp.addSelection(fieldLocation, 'location', ['internalid', 'name'], filterLocation, true, parameters.custpage_location);
            
            let dateDefault = getDateDefault(parameters);
            let fieldTrandate = form.addField({
                id: 'custpage_trandate',
                type: serverWidget.FieldType.DATE,
                label: 'Ngày',
                container: container
            });
            fieldTrandate.defaultValue = dateDefault.trandate;
            fieldTrandate.isMandatory = true;
            
            let fieldScbd = form.addField({
                id: 'custpage_scbd',
                type: serverWidget.FieldType.SELECT,
                label: 'Phiếu SCBD', source: 'customrecord_scv_cmms_workorder',
                container: container
            });
            fieldScbd.defaultValue = parameters.custpage_scbd;
            fieldScbd.isMandatory = true;
            fieldScbd.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
            
            let fieldAsset = form.addField({
                id: 'custpage_asset',
                type: serverWidget.FieldType.SELECT,
                label: 'Tài sản', source: 'customrecord_ncfar_asset',
                container: container
            });
            fieldAsset.defaultValue = parameters.custpage_asset;
            fieldAsset.isMandatory = true;
            fieldAsset.updateDisplayType({displayType: serverWidget.FieldDisplayType.DISABLED});
            
            form.addSubmitButton({label: 'Tạo'});
            
            return form;
        }
        
        const getDateDefault = (parameters) => {
            let trandate = parameters.custpage_trandate;
            if(!trandate) {
                trandate = format.format({type: format.Type.DATE, value: libCmms.getDateNow(7)});
            }
            return {trandate}
        }
        
        const createSublist = (form, sublistId) => {
            let sublist = form.addSublist({
                id: sublistId,
                type: serverWidget.SublistType.LIST,
                label: 'Kết quả'
            });
            //sublist.addMarkAllButtons();
            sublist.addButton({id: 'custpage_bt_markall',  label: 'Mark All', functionName: 'markAll'});
            sublist.addButton({id: 'custpage_bt_unmarkall',  label: 'Unmark All', functionName: 'unmarkAll'});
            
            return sublist;
        }
        
        const getMaster = () => {
            let col = [
                {id: 'chon', label: 'Chọn', type: serverWidget.FieldType.CHECKBOX},
                {id: 'custrecord_scv_cmms_bg_actualitem', label: 'Vật tư', type: 'text', display: 'hidden'},
                {id: 'custrecord_scv_cmms_bg_actualitem_display', label: 'Vật tư', type: 'text', display: 'disabled'},
                {id: 'custrecord_scv_cmms_bg_unit', label: 'Đơn vị tính', type: 'text', display: 'hidden'},
                {id: 'custrecord_scv_cmms_bg_unit_display', label: 'Đơn vị tính', type: 'text', display: 'disabled'},
                {id: 'custpage_issueinventorynumber', label: 'Searial/Lot Number', type: serverWidget.FieldType.SELECT, display: serverWidget.FieldDisplayType.ENTRY},
                {id: 'custpage_binnumber', label: 'Bin', type: serverWidget.FieldType.SELECT, display: serverWidget.FieldDisplayType.ENTRY},
                
                {id: 'custrecord_scv_cmms_bg_actualquantity', label: 'Số lượng', type: 'float', display: 'hidden'},
                {id: 'custpage_inventorystatus', label: 'Trạng thái', type: serverWidget.FieldType.SELECT, display: serverWidget.FieldDisplayType.ENTRY},//, source: 'inventorystatus'
                {id: 'custrecord_scv_cmms_bg_actualquantity_display', label: 'Số lượng', type: 'float', display: 'disabled'},
                {id: 'islotitem', label: 'IS LOT', type: 'text', display: 'hidden'},
                {id: 'usebins', label: 'Use Bins', type: 'text', display: 'hidden'}
            ];
            return {sublistId: 'custpage_sl_result', col};
        }
        
        const getListDataBudget = (recScbd) => {
            let listData = [];
            let lineCountDuToan = recScbd.getLineCount({sublistId: libCmms.CmmsSublistId.SCBD_DU_TOAN});
            for(let i = 0; i < lineCountDuToan; i++) {
                let actualquantity = recScbd.getSublistValue({sublistId: libCmms.CmmsSublistId.SCBD_DU_TOAN, fieldId: 'custrecord_scv_cmms_bg_actualquantity', line: i});
                let actualitem = recScbd.getSublistValue({sublistId: libCmms.CmmsSublistId.SCBD_DU_TOAN, fieldId: 'custrecord_scv_cmms_bg_actualitem', line: i});
                if(actualitem && actualquantity > 0) {
                    let lkItem = search.lookupFields({type: search.Type.ITEM, id: actualitem, columns: ['stockunit', 'islotitem', 'usebins']});
                    let stockUnit = lkItem.stockunit[0];
                    
                    listData.push({
                        chon: 'T',
                        custrecord_scv_cmms_bg_actualitem: actualitem,
                        custrecord_scv_cmms_bg_actualitem_display: recScbd.getSublistText({sublistId: libCmms.CmmsSublistId.SCBD_DU_TOAN, fieldId: 'custrecord_scv_cmms_bg_actualitem', line: i}),
                        custrecord_scv_cmms_bg_unit: stockUnit?.value,
                        custrecord_scv_cmms_bg_unit_display: stockUnit?.text,
                        custrecord_scv_cmms_bg_actualquantity: actualquantity,
                        custrecord_scv_cmms_bg_actualquantity_display: actualquantity,
                        custpage_inventorystatus: libCmms.InventoryStatus.MOI_DAT_CHAT_LUONG,
                        islotitem: lkItem.islotitem,
                        usebins: lkItem.usebins
                    });
                }
                
            }
            return listData;
        }
        
        return {onRequest}

    });
