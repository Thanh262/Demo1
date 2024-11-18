/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],

    function (record, search) {

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            let sublistId = scriptContext.sublistId;
            let fieldId = scriptContext.fieldId;
            let currentRecord = scriptContext.currentRecord;

            switch (fieldId) {
                case 'custrecord_scv_test_odl_item':
                    setCurrentTaxcode(currentRecord, sublistId);
                    break;
                case 'custrecord_scv_test_odl_taxcode':
                    setCurrentTaxrate(currentRecord, sublistId);
                    break;
                case 'custrecord_scv_test_odl_quantity':
                case 'custrecord_scv_test_odl_price':
                    setCurrentAmount(currentRecord, sublistId);
                    break;
                case 'custrecord_scv_test_odl_amount':
                case 'custrecord_scv_test_odl_taxrate':
                    setCurrentTaxAmount(currentRecord, sublistId);
                    break;
                case 'custrecord_scv_test_odl_taxamount':
                    setCurrentGrossAmount(currentRecord, sublistId);
                    break;
                case 'custrecord_scv_tof_sub':
                    setCurrentSublistSubsidiary(currentRecord);
            }
        }

        const setCurrentSublistSubsidiary = (currentRecord) => {
            // custrecord_scv_tol_itsub is the fieldId
            let fieldValue = currentRecord.getValue({
                fieldId: 'custrecord_scv_tof_sub'
            });
            let sublistLines = currentRecord.getLineCount('recmachcustrecord_scv_test_odl_order');

            for (let i = 0; i < sublistLines; i++) {
                currentRecord.selectLine('recmachcustrecord_scv_test_odl_order', i);
                currentRecord.setCurrentSublistValue({
                    sublistId: 'recmachcustrecord_scv_test_odl_order',
                    fieldId: 'custrecord_scv_tol_itsub',
                    value: fieldValue ? fieldValue : null,
                })
            }
        }

        function setCurrentTaxcode(currentRecord, sublistId) {
            let itemId = currentRecord.getCurrentSublistValue({
                sublistId: sublistId,
                fieldId: 'custrecord_scv_test_odl_item'
            });

            if (itemId) {
                let lkFieldsItem = search.lookupFields({type: search.Type.ITEM, id: itemId, columns: ['taxschedule']});
                let taxschedule = lkFieldsItem.taxschedule;
                if (taxschedule && taxschedule.length > 0) {
                    let recTaxschdule = record.load({type: 'taxschedule', id: lkFieldsItem.taxschedule[0].value});
                    let salestaxcode = recTaxschdule.getSublistValue({
                        sublistId: 'nexuses',
                        fieldId: 'salestaxcode',
                        line: 0
                    });

                    currentRecord.setCurrentSublistValue({
                        sublistId: sublistId,
                        fieldId: 'custrecord_scv_test_odl_taxcode',
                        value: salestaxcode
                    });
                }
            } else {
                currentRecord.setCurrentSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_test_odl_taxcode',
                    value: null
                });
            }
        }

        function setCurrentTaxrate(currentRecord, sublistId) {
            // salestaxitem has itemid === taxcode
            // take out recordtype: 'salestaxitem' => field 'rate' (this is the rate we need);
            let taxCode = currentRecord.getCurrentSublistValue({
                sublistId: sublistId,
                fieldId: 'custrecord_scv_test_odl_taxcode'
            });

            if (taxCode) {
                let recTaxcode = record.load({type: 'salestaxitem', id: taxCode});
                let taxrate = recTaxcode.getValue({fieldId: 'rate'});
                currentRecord.setCurrentSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_test_odl_taxrate',
                    value: taxrate
                });
            } else {
                currentRecord.setCurrentSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_test_odl_taxrate',
                    value: null
                });
            }
        }

        function setCurrentAmount(currentRecord, sublistId) {
            let quantity = currentRecord.getCurrentSublistValue(sublistId, 'custrecord_scv_test_odl_quantity');
            let price = currentRecord.getCurrentSublistValue(sublistId, 'custrecord_scv_test_odl_price');
            if (quantity && price) {
                currentRecord.setCurrentSublistValue(sublistId, 'custrecord_scv_test_odl_amount', quantity * price);
            } else {
                currentRecord.setCurrentSublistValue(sublistId, 'custrecord_scv_test_odl_amount', '');
            }
        }

        function setCurrentTaxAmount(currentRecord, sublistId) {
            let amount = currentRecord.getCurrentSublistValue(sublistId, 'custrecord_scv_test_odl_amount');
            let taxrate = currentRecord.getCurrentSublistValue(sublistId, 'custrecord_scv_test_odl_taxrate') || 0;

            let taxAmount = (amount || amount === 0) ? amount * taxrate / 100 : '';

            currentRecord.setCurrentSublistValue(sublistId, 'custrecord_scv_test_odl_taxamount', taxAmount);
        }

        function setCurrentGrossAmount(currentRecord, sublistId) {
            let amount = currentRecord.getCurrentSublistValue(sublistId, 'custrecord_scv_test_odl_amount');
            let taxAmount = currentRecord.getCurrentSublistValue(sublistId, 'custrecord_scv_test_odl_taxamount');

            let grossAmount = (amount || 0) + (taxAmount || 0);
            if (!amount && !taxAmount && amount !== 0 && taxAmount !== 0) {
                grossAmount = '';
            }

            currentRecord.setCurrentSublistValue(sublistId, 'custrecord_scv_test_odl_grossamt', grossAmount);
        }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

        }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {
            let currentRecord = scriptContext.currentRecord;
            let sublistId = scriptContext.sublistId;
            let sublistLines = scriptContext.currentRecord.getLineCount(sublistId);

            setCurrentTotalAmount(currentRecord, sublistId, sublistLines);
        }

        function setCurrentTotalAmount(currentRecord, sublistId, sublistLines) {
            let totalAmount = 0;
            let totalTaxamount = 0;
            let totalGrossamount = 0;

            for (let i = 0; i < sublistLines; i++) {
                let amountOfLine = parseFloat(currentRecord.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_test_odl_amount',
                    line: i
                }));

                let taxamountOfline = parseFloat(currentRecord.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_test_odl_taxamount',
                    line: i
                }));

                let grossamountOfline = parseFloat(currentRecord.getSublistValue({
                    sublistId: sublistId,
                    fieldId: 'custrecord_scv_test_odl_grossamt',
                    line: i
                }));

                totalAmount     += amountOfLine ?? 0;
                totalTaxamount  += taxamountOfline ?? 0;
                totalGrossamount += grossamountOfline ?? 0;

            }

            currentRecord.setValue( 'custrecord_scv_test_order_totalamount', totalAmount    ?? 0 );
            currentRecord.setValue( 'custrecord_scv_test_order_totaltax', totalTaxamount    ?? 0 );
            currentRecord.setValue( 'custrecord_scv_test_order_totalgrossamt', totalGrossamount ?? 0 );

        }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {
            let currentRecord = scriptContext.currentRecord;
            let sublistId = scriptContext.sublistId;
            let subsidiaryId = currentRecord.getValue('custrecord_scv_tof_sub');

            currentRecord.setCurrentSublistValue({
                sublistId: sublistId,
                fieldId: 'custrecord_scv_tol_itsub',
                value: subsidiaryId,
            });
        }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {

        }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

        }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {

        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            postSourcing: postSourcing,
            sublistChanged: sublistChanged,
            lineInit: lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord: saveRecord
        };

    }
)
;
