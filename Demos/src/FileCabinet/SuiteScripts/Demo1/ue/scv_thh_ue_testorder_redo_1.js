/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search'],

    (record, search) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            let newRecord = scriptContext.newRecord;
            let fieldId = 'custrecord_scv_test_order_code';
            let recordType = newRecord.type;

            if (scriptContext.type === scriptContext.UserEventType.CREATE ||
                scriptContext.type === scriptContext.UserEventType.EDIT ||
                !newRecord.getValue(fieldId)) {
                let prefix = 'TORD/';
                let nextCode = getNextCode(recordType, prefix, fieldId);

                newRecord.setValue(fieldId, prefix + nextCode);
            }
        }

        const getNextCode = (recordType, prefix, fieldId) => {
            let searchResult = search.create({
                type: recordType,
                columns: [
                    search.createColumn({
                        name: fieldId,
                        summary: search.Summary.MAX
                    })
                ],
                filters : [
                    search.createFilter({
                        name: fieldId,
                        operator: search.Operator.ISNOTEMPTY
                    })
                ]
            }).run().getRange({start: 0, end: 1});

            let lastCode = (searchResult.length ? searchResult[0].getValue(fieldId) : null) || prefix + '000000';
            let nextNumber = Number(lastCode.split('/')[1]) + 1;
            return nextNumber.toString().padStart(6, '0');
        }
        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {

        }

        //return {beforeLoad, beforeSubmit, afterSubmit}
        return {beforeSubmit};
    });
