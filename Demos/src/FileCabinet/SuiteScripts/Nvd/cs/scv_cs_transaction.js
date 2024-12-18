/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record'],

    function (record) {
        function pageInit(scriptContext) {

        }


        function validateLine(scriptContext) {
            const currentRecord = scriptContext.currentRecord;
            const sublistId = scriptContext.sublistId;
            if (!!sublistId && sublistId === getSublistId(currentRecord.type) && lineIsCopied(currentRecord, sublistId)) {
                currentRecord.setCurrentSublistValue(sublistId, 'custcol_scv_ori_lineid', '', true);
            }
            return true;
        }

        const getSublistId = (recType) => {
            if (recType === record.Type.INVENTORY_ADJUSTMENT) return 'inventory';
            return 'item';
        };

        const lineIsCopied = (curRec, sublistId) => !curRec.getCurrentSublistValue({
            sublistId: sublistId,
            fieldId: 'line'
        });

        return {
            pageInit: pageInit,
            validateLine: validateLine
        };

    });
