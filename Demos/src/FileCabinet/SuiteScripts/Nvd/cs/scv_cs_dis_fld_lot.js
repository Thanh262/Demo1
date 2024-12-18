/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
window.SCV = window.SCV || {};
define([],
    function () {
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
            const objParams = getObjDataParentTransaction(scriptContext.currentRecord);
            const objRes = getAPIDisableFieldsLot(objParams);
            if (!util.isObject(objRes)) return;
            if (objRes.isValid) {
                let objField = scriptContext.currentRecord.getCurrentSublistField('inventoryassignment', 'inventorystatus');
                if (typeof objField === 'object') {
                    objField.isDisabled = true;
                }
            }
        }

        const getObjDataParentTransaction = (currentRecord) => {
            let ntype = window.parent.nlapiGetFieldValue('ntype');
            let subsidiary = window.parent.nlapiGetFieldValue('subsidiary');
            let location = window.nlapiGetFieldValue('location');
            return {
                ntype,
                location,
                subsidiary
            };
        };

        const getAPIDisableFieldsLot = (objParams) => {
            let resCall = window.nlapiRequestURL('/app/site/hosting/scriptlet.nl?script=customscript_scv_sl_dis_fld_lot&deploy=customdeploy_scv_sl_dis_fld_lot', {...objParams});
            if (resCall.code === 200) return JSON.parse(resCall.getBody());
            else {
                alert(resCall.error.toString())
            }
            return null;
        };

        return {
            pageInit: pageInit,
        };

    });
