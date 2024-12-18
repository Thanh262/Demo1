/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['../lib/scv_lib_gen_upccode'],

    (lgu) => {
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
            try {
                let newRecord = scriptContext.newRecord;
                let triggerType = scriptContext.type;
                if (triggerType === 'create' || triggerType === 'copy') {
                    newRecord.setValue('itemid', 'TO BE GENERATED');
                    newRecord.setValue('upccode', '');
                    scriptContext.form.getField('itemid')?.updateDisplayType({displayType: 'disabled'});
                }
            } catch (e) {
                log.error('beforeLoad', e);
            }
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
            let triggerType = scriptContext.type;
            if (triggerType === 'create' || triggerType === 'edit') {
                const customformId = newRecord.getValue('customform');
                if (lgu.validFormGenerateUPCCode(customformId) && lgu.isChangeFieldsRelatedWithMakeUPCCode(scriptContext)) {
                    const objDataUPCCodeItems = lgu.getDataUPCCodeItems(newRecord);
                    if (objDataUPCCodeItems.displayname) newRecord.setValue('displayname', objDataUPCCodeItems.displayname);
                    if (objDataUPCCodeItems.upccode) newRecord.setValue('upccode', objDataUPCCodeItems.upccode);
                    if (objDataUPCCodeItems.itemid) newRecord.setValue('itemid', objDataUPCCodeItems.itemid);
                }
                else if (triggerType === 'edit') {
                    let resultDisplayName = lgu.getNewDisplayName(newRecord, scriptContext.oldRecord);
                    if (resultDisplayName.isChanged) {
                        let upcCode = newRecord.getValue('upccode');
                        newRecord.setValue('displayname', resultDisplayName.displayName);
                        newRecord.setValue('itemid', upcCode + '_' + resultDisplayName.displayName);
                    }
                }
            }
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
