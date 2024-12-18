/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url'] ,  function (url) {

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
            let currentRecord = scriptContext.currentRecord;
            let fieldId = scriptContext.fieldId;

            switch (fieldId) {
                case 'custrecord_scv_cmms_tc_age_h' :
                    calRemainAge(currentRecord);
                    calResidualPercent(currentRecord);
                    calDeprValue(currentRecord);
                    break;

                case 'custrecord_scv_cmms_tc_agecheck_h' :
                    calRemainAge(currentRecord);
                    calDeprValue(currentRecord);
                    break;

                case 'custrecord_scv_cmms_tc_remainage_h' :
                    calResidualPercent(currentRecord);
                    break;

                case 'custrecord_scv_cmms_tc_origincost_h' :
                    calResidualValue(currentRecord);
                    calDeprValue(currentRecord);
                    break;

                // case 'custrecord_scv_cmms_tc_residualpercent_h':
                //     calDeprValue(currentRecord);
                //     break;

                case 'custrecord_scv_cmms_tc_residualstatus_h':
                    calResidualValue(currentRecord);
                    break;
            }
        }

        const calRemainAge = (currentRecord) => {
            let age = currentRecord.getValue('custrecord_scv_cmms_tc_age_h') ?? 0;
            let ageCheck = currentRecord.getValue('custrecord_scv_cmms_tc_agecheck_h') ?? 0;

            currentRecord.setValue({
                fieldId: 'custrecord_scv_cmms_tc_remainage_h',
                value: (age - ageCheck) >= 0 ? age - ageCheck : 0
            });
        }

        const calResidualPercent = (currentRecord) => {
            let remainAge = currentRecord.getValue("custrecord_scv_cmms_tc_remainage_h");
            let age = currentRecord.getValue('custrecord_scv_cmms_tc_age_h');

            if (remainAge > 0 && age > 0) {
                currentRecord.setValue({
                    fieldId: 'custrecord_scv_cmms_tc_residualpercent_h',
                    value: remainAge / age * 100
                });
            } else {
                currentRecord.setValue('custrecord_scv_cmms_tc_residualpercent_h', 0);
            }

        }

        const calResidualValue = (currentRecord) => {
            let originCost = currentRecord.getValue('custrecord_scv_cmms_tc_origincost_h') ?? 0;
            let residualStatus = currentRecord.getValue('custrecord_scv_cmms_tc_residualstatus_h') ?? 0;

            currentRecord.setValue({
                fieldId: 'custrecord_scv_cmms_tc_residualvalue_h',
                value: originCost * residualStatus / 100,
            });
        }

        const calDeprValue = (currentRecord) => {
            let originCost = currentRecord.getValue('custrecord_scv_cmms_tc_origincost_h') ?? 0;
            let residualPercent = currentRecord.getValue('custrecord_scv_cmms_tc_residualpercent_h') ?? 0;

            currentRecord.setValue({
                fieldId: 'custrecord_scv_cmms_tc_deprvalue_h',
                value: originCost * residualPercent / 100,
            });
        }

        const redirectToDisposal = () => {
            let targetUrl = url.resolveScript({
                scriptId: 'customscript_fam_disposal_su',
                deploymentId: 'customdeploy_fam_disposal_su',
                returnExternalUrl: false,
            });

            window.location.replace(targetUrl);
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
            redirectToDisposal: redirectToDisposal,
            postSourcing: postSourcing,
            // sublistChanged: sublistChanged,
            // lineInit: lineInit,
            // validateField: validateField,
            // validateLine: validateLine,
            // validateInsert: validateInsert,
            // validateDelete: validateDelete,
            // saveRecord: saveRecord
        };

    });


