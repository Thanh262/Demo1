/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/url',  '../lib/scv_lib_cmms'],
    (record, url, libCmms) => {
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
            let tgType = scriptContext.type;
            let newRecord = scriptContext.newRecord;
            let recType = newRecord.type;
            if (tgType === scriptContext.UserEventType.VIEW) {
                if (recType === libCmms.CmmsRecordType.KE_HOACH_BAO_DUONG) {
                    let form = scriptContext.form;
                    let wo_status = newRecord.getValue('custrecord_scv_cmms_mp_status');
                    if (wo_status === libCmms.CmmsScbdStatus.DA_DUYET) {
                        addButtonTaoGiaoViec(form, newRecord);
                    }
                }
            }
        }
        
        const addButtonTaoGiaoViec = (form, newRecord) => {
            let urlTaoGiaoViec = url.resolveScript({
                scriptId: 'customscript_scv_sl_cmms_taogiaoviec',
                deploymentId: 'customdeploy_scv_sl_cmms_taogiaoviec',
                returnExternalUrl: false,
                params: {
                    custpage_maintenanceplan: newRecord.id
                }
            });
            form.addButton({id: 'custpage_taogiaoviec', label: 'Tạo giao việc', functionName: `const offsetWidth = window.document.getElementById('main_form').children[0].offsetWidth + 200; nlExtOpenWindow('${urlTaoGiaoViec}', 'xuatvt_thaythe', offsetWidth / 2, 550, this, false, 'Tạo giao việc')`});
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
