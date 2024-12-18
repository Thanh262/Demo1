/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/file'],
    
    (file) => {
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
                let newRec = scriptContext.newRecord;
                let form = scriptContext.form;
                let templateId  = 'scv_xlsx_export_transfer_order';

                if (!form.getField('custpage_inline_html_export_excel')) {
                        let htmlFile = file.load({id: '../html/scv_html_export_transfer_order.html'})
                        let htmlContent = htmlFile.getContents();
                        form.addField({
                                id: 'custpage_inline_html_export_excel',
                                type: 'inlinehtml',
                                label: 'inlinehtml'
                        }).defaultValue = htmlContent;
                }

                form.addButton({
                        id: 'custpage_btn_export_excel_transfer_order',
                        label: 'Excel (VN)',
                        functionName : `onExportExcel(${JSON.stringify({
                                recordId: newRec.id,
                                templateId
                        })})`,

                })
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
