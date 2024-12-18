/**
 * Nội dung: Function QC
 * Deployment: Inventory Adjustment
 * * =======================================================================================
 *  Date                Author                  Description
 *  25 Sep 2024         Duy Nguyen	    		Init, create file
 *  */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/url'],

    (url) => {
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
            let form = scriptContext.form;
            let newRec = scriptContext.newRecord;
            if (isShowBtnToIQC(newRec)) {
                const slUrl = url.resolveScript({scriptId: "customscript_scv_sl_po_create_iqc", deploymentId: "customdeploy_scv_sl_po_create_iqc", params: {poid: scriptContext.newRecord.id, trtype: scriptContext.newRecord.type}});
                form.addButton({
                    id: "custpage_btn_iqc",
                    label: "To IQC",
                    functionName: "let isConfirm = confirm('Are you sure create IQC?'); if(isConfirm) window.location.replace('" + slUrl + "')"
                });
            }
        }

        function isShowBtnToIQC(newRec) {
            let isShow = false;
            const lc = newRec.getLineCount("item");
            if (lc !== 1) return false;
            for (let i = 0; i < lc; i++) {
                if (!newRec.setSublistValue("item", "custcol_scv_inspection_number", i)) {
                    isShow = true;
                    break;
                }
            }
           return isShow;
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

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
