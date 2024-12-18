/**
 * Nội dung: Chuc Nang Yeu Cau Van Chuyen
 * * =======================================================================================
 *  Date                Author                  Description
 *  27 Sep 2024         Duy Nguyen	    		Init, create file, move from ELMICH
 *                                              - Chuyển chức năng "Yêu cầu xuất kho" từ Elmich sang NVD, BA. Viet (https://app.clickup.com/t/86cwkzeb4)
 *  */
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([],
    function () {

        const setDefEntity = (scriptContext) => {
            if (scriptContext.mode === 'create') {
                let newRecord = scriptContext.currentRecord;
                const entityDefaultId = 1044;
                if (newRecord.getValue('entity')) return;
                newRecord.setValue('entity', entityDefaultId);
            }
        }

        const pageInit = (scriptContext) => {
            setDefEntity(scriptContext);
        }

        const setDefaultAmountOnLine = (curRec, sublistId) => {
            curRec.setCurrentSublistValue({
                sublistId: sublistId,
                fieldId: 'amount',
                value: 1,
                ignoreFieldChange: true,
                forceSyncSourcing: false
            });
        }

        const fieldChanged = (scriptContext) => {
            let currentRecord = scriptContext.currentRecord;
            let fieldId = scriptContext.fieldId;
            let sublistId = scriptContext.sublistId;
            if (sublistId === 'item' && fieldId === 'description')
                setDefaultAmountOnLine(currentRecord, sublistId);
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
        };

    });
