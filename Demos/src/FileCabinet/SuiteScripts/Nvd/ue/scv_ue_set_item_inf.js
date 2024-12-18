/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', '../lib/scv_lib_invnumber'],
    
    function (record, search, libInvNumber) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {

        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {
            let newRecord = scriptContext.newRecord;
            let recType = newRecord.type;
            if (recType === 'customrecord_scv_inspection_result_tb') {
                let itemID = newRecord.getValue('custrecord_scv_irt_item');
                let lot_upccode = newRecord.getValue('custrecord_scv_irt_lot_upccode');
                if (!lot_upccode && itemID) {
                    let lkItem = search.lookupFields({type: 'item', id: itemID, columns: ['upccode']});
                    newRecord.setValue('custrecord_scv_irt_lot_upccode', lkItem.upccode);
                }
            }
        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {
            if (scriptContext.type === 'create' || scriptContext.type === 'edit') {
                libInvNumber.setDataLotNumberRecordFromOriginRecord(scriptContext.newRecord.type, scriptContext.newRecord.id);
            }
        }

        return {
            //beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });
