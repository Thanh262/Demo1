/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/format', 'N/record', 'N/runtime', 'N/ui/serverWidget', 'N/url', '../lib/scv_lib_report', '../lib/scv_lib_cmms'],
    
    (format, record, runtime, serverWidget, url, lrp,  libCmms) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let request =  scriptContext.request;
            let response = scriptContext.response;
            
            let parameters = request.parameters;
            let subsidiary = runtime.getCurrentUser().subsidiary;
            
            if(request.method === 'GET') {
                let form = serverWidget.createForm({title: "Thuê ngoài", hideNavBar: true});
                form.addSubmitButton({label: 'Thuê ngoài'});
                lrp.addFieldHidden(form, 'custpage_scbd', parameters.custpage_scbd);
                let fieldTextConfirm = form.addField({id: 'custpage_textconfirm', label: ' ', type: serverWidget.FieldType.INLINEHTML});
                fieldTextConfirm.defaultValue = 'Bạn có muốn tạo thuê ngoài không?';
                
                response.writePage(form);
            } else {
                let recPurchaseRequest = record.create({type: libCmms.CmmsRecordType.PURCHASE_REQUEST, isDynamic: true});
                setHeaderFieldPurchaseRequest(recPurchaseRequest, subsidiary, parameters);
                let recScbd = record.load({type: libCmms.CmmsRecordType.SUA_CHUA_BAO_DUONG, id: parameters.custpage_scbd});
                let lineCountThueNgoai = recScbd.getLineCount({sublistId: libCmms.CmmsSublistId.SCBD_THUE_NGOAI});
                let todayText = format.format({type: format.Type.DATE, value: libCmms.getDateNow(7)});
                
                for(let i = 0; i < lineCountThueNgoai; i++) {
                    setCurrentSublistValuePurchaseRequest(recPurchaseRequest, libCmms.CmmsSublistId.ITEM, recScbd, i, todayText);
                }
                
                let purchaseRequestId = recPurchaseRequest.save({ignoreMandatoryFields: true});
                
                writeRedirectToPurchaseRequest(response, purchaseRequestId);
            }
        }
        
        const writeRedirectToPurchaseRequest = (response, purchaseRequestId) => {
            let redirectUrl = url.resolveRecord({recordType: libCmms.CmmsRecordType.PURCHASE_REQUEST, recordId: purchaseRequestId, isEditMode: false});
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
        
        const setHeaderFieldPurchaseRequest = (recPurchaseRequest, subsidiary, parameters) => {
            recPurchaseRequest.setValue('entity', libCmms.Entity.DEFAULT_PURCHASE_REQUEST);
            recPurchaseRequest.setValue('subsidiary', subsidiary);
            recPurchaseRequest.setValue('custbody_scv_cmms_workorder', parameters.custpage_scbd);
        }
        
        const setCurrentSublistValuePurchaseRequest = (recPurchaseRequest, sublistId, recScbd, line, todayText) => {
            recPurchaseRequest.setCurrentSublistValue({sublistId: sublistId, fieldId: 'item', value: recScbd.getSublistValue({sublistId: libCmms.CmmsSublistId.SCBD_THUE_NGOAI, fieldId: 'custrecord_scv_cmms_os_item', line: line})});
            recPurchaseRequest.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_plan_qty', value: recScbd.getSublistValue({sublistId: libCmms.CmmsSublistId.SCBD_THUE_NGOAI, fieldId: 'custrecord_scv_cmms_os_quantity', line: line})});
            recPurchaseRequest.setCurrentSublistValue({sublistId: sublistId, fieldId: 'custcol_scv_vendor', value: recScbd.getSublistValue({sublistId: libCmms.CmmsSublistId.SCBD_THUE_NGOAI, fieldId: 'custrecord_scv_cmms_os_vendor', line: line})});
            recPurchaseRequest.setCurrentSublistText({sublistId: sublistId, fieldId: 'custcol_scv_day_of_needs', text: todayText});
            
            recPurchaseRequest.commitLine({sublistId: sublistId});
        }
        
        return {onRequest}

    });
