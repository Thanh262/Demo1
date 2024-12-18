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
            if (scriptContext.type === scriptContext.UserEventType.VIEW) {
                addButtonThueNgoai(scriptContext.form, scriptContext.newRecord);
            }
        }
        
        const addButtonThueNgoai = (form, newRecord) => {
            let urlThueNgoai = url.resolveScript({
                scriptId: 'customscript_scv_sl_cmms_hieuchuan_tn',
                deploymentId: 'customdeploy_scv_sl_cmms_hieuchuan_tn',
                returnExternalUrl: false,
                params: {
                    custpage_hieuchuan_tbd: newRecord.id
                }
            });
            
            form.addButton({id: 'custpage_thuengoai', label: 'Thuê ngoài', functionName: `const offsetWidth = window.document.getElementById('main_form').children[0].offsetWidth - 200; nlExtOpenWindow('${urlThueNgoai}', 'thuengoai', offsetWidth / 2, 350, this, false, 'Thuê ngoài')`});
            
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
