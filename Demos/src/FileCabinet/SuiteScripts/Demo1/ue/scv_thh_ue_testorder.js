/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/url'],
    (record, search, url) => {
    
    const beforeLoad = (scriptContext) => {
        let tgType = scriptContext.type;
        if(tgType === scriptContext.UserEventType.VIEW ) {
            let form = scriptContext.form;
            addButtonPrintTestOrder(form, scriptContext.newRecord);
        }
    }

    const addButtonPrintTestOrder = (form, newRecord) => {
        let viewUrl = url.resolveScript({
            scriptId: 'customscript_scv_thh_sl_flowsavedsearch',
            deploymentId: 'customdeploy_scv_thh_sl_flowsavedsearch',
            returnExternalUrl: false,
            params: {
                trid: newRecord.id,
                trtype: newRecord.type,
                templateid: 'CUSTTMPL_SCV_TEST_ORDER_NEW'
            }
        });
        form.addButton({id: 'custpage_bt_print_testorder', label: 'Print Test Order', functionName: "window.open('" + viewUrl + "');"});
    }
    
    const beforeSubmit = (scriptContext) => {
        let newRecord = scriptContext.newRecord;
        let fieldId = 'custrecord_scv_test_order_code';
        let recordType = newRecord.type;
        
        if (scriptContext.type === scriptContext.UserEventType.CREATE ||
            (scriptContext.type === scriptContext.UserEventType.EDIT && !newRecord.getValue(fieldId))) {
            let prefix = 'TORD/';
            let nextCode = getNextCode(recordType, prefix, fieldId);
            
            newRecord.setValue({
                fieldId: fieldId,
                value: prefix + nextCode
            });
        }
    };
    
    const getNextCode = (recordType, prefix, fieldId) => {
        let searchResult = search.create({
            type: recordType,
            columns: [
                search.createColumn({
                    name: fieldId,
                    summary: search.Summary.MAX
                })
            ],
            filters: [
                search.createFilter({
                    name: fieldId,
                    operator: search.Operator.ISNOTEMPTY
                })
            ]
        }).run().getRange({start: 0, end: 1});
        
        let lastCode = (searchResult.length ? searchResult[0].getValue(fieldId) : null) || prefix + '000000';
        let nextNumber = Number(lastCode.split('/')[1]) + 1;
        return nextNumber.toString().padStart(6, '0');
    };
    
    return {
        beforeLoad,
        beforeSubmit
    };
});
