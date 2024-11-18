/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/record'], (log, record) => {
    /**
     * Defines the function definition that is executed after record is submitted.
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
     * @since 2015.2
     */
    function beforeSubmit(scriptContext) {
        let customerRecord = scriptContext.newRecord;

        let fieldIds = customerRecord.getFields();
        let fieldValues = {}

        fieldIds.forEach(function (fieldId) {
            let fieldValue = customerRecord.getValue({fieldId: fieldId});
            fieldValues[fieldId] = fieldValue; // Store the field ID and value in an object
        });

        // Convert the object to JSON and log it
        let jsonString = JSON.stringify(fieldValues);

        let customerId = customerRecord.getValue({
            fieldId: 'entitytitle'
        });
        let customerEmail = customerRecord.getValue({fieldId: 'email'});

        let couponCode = customerRecord.getValue('custentity_sdr_coupon_code');

        log.audit({
            title: customerRecord.name,
            details: 'ID: ' + customerId +
                ', email: ' + customerEmail +
                ', couponCode: ' + couponCode
        });

        log.debug({
            title: 'Customer Record',
            details: jsonString
        });

    }

    return {
        beforeSubmit: beforeSubmit
    }

});
