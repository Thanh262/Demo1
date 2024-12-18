/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record'],

    (record) => {
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
            let parameters = scriptContext.request.parameters;
            let recordId = parameters.recordId;
            let recordType = parameters.recordType;
            let form = scriptContext.form;
            let salesRecord = scriptContext.newRecord

            //form.clientScriptModulePath = '../cs/scv_thh_cs_popul_salesord'
            if (recordId && recordType) {
                let recordData = record.load({
                    type: recordType,
                    id: recordId
                });
                form.getField('entity').defaultValue = recordData.getValue('custrecord_scv_test_order_customer');
                form.getField('subsidiary').defaultValue = recordData.getValue('custrecord_scv_tof_sub');

                addItemData(recordData, salesRecord);

            }
        }

        const addItemData = (recordData, salesRecord) => {
            let lines = recordData.getLineCount('recmachcustrecord_scv_test_odl_order');

            for (let i = 0; i < lines; i++) {

                salesRecord.insertLine('item',i);

                setLineValue(salesRecord, 'item', getItemValue(recordData, 'custrecord_scv_test_odl_item', i), i);
                setLineValue(salesRecord, 'amount', getItemValue(recordData, 'custrecord_scv_test_odl_amount', i), i);
                
                //setLineValue(salesRecord, 'units', getItemValue(recordData, 'custrecord_scv_test_odl_unitstype', i), i);
                setLineValue(salesRecord, 'taxcode', getItemValue(recordData, 'custrecord_scv_test_odl_taxcode', i), i);
                setLineValue(salesRecord, 'taxrate1', getItemValue(recordData, 'custrecord_scv_test_odl_taxrate', i), i);
                setLineValue(salesRecord, 'quantity', getItemValue(recordData, 'custrecord_scv_test_odl_quantity', i), i);
                setLineValue(salesRecord, 'custcol_scv_don_gia', getItemValue(recordData, 'custrecord_scv_test_odl_price', i), i);

                setLineValue(salesRecord, 'grossamt', getItemValue(recordData, 'custrecord_scv_test_odl_grossamt', i), i);
                setLineValue(salesRecord, 'tax1amt', getItemValue(recordData, 'custrecord_scv_test_odl_taxamount', i), i);

            }
        }

        const setLineValue = (salesRecord, fieldId, value, lineNum) => {
            salesRecord.setSublistValue({
                sublistId: 'item',
                fieldId: fieldId,
                value: value,
                line: lineNum,
            });
        }

        const getItemValue = (recordData, fieldId, line) => {
            return recordData.getSublistValue({
                sublistId: 'recmachcustrecord_scv_test_odl_order',
                fieldId: fieldId,
                line: line,
            });
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

        return {beforeLoad}//, beforeSubmit, afterSubmit}

    });
