/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/url'],
    function (search, url) {
        const CustomTypeYCXVTT = {
            NHAP: '2',
            XUAT: '1'
        };

        function beforeLoad(scriptContext) {
            addBtnMakeAdjustment(scriptContext);
        }

        const addBtnMakeAdjustment = (scriptContext) => {
            const triggerType = scriptContext.type;
            if (triggerType !== 'view') return;
            let newRecord = scriptContext.newRecord;
            const recType = newRecord.type;
            let form = scriptContext.form;
            if (!validCreateInventoryAdjust(newRecord)) return;
            const urlAdj = url.resolveScript({
                scriptId: 'customscript_scv_crt_inv_adj_from_ycxn',
                deploymentId: 'customdeploy_scv_crt_inv_adj_from_ycxn',
                returnExternalUrl: false,
                params: {
                    recid: newRecord.id,
                    rectype: recType
                }
            });
            form.addButton({
                id: 'custpage_bt_item_rqid',
                label: 'Make Adjustment',
                functionName: 'window.location.replace("' + urlAdj + '")'
            });
        }

        const validCreateInventoryAdjust = (newRecord) => {
            const APPROVED = '3';
            const statusId = newRecord.getValue('custbody_scv_approval_status');
            if (statusId !== APPROVED) return false;
            const relTrans = newRecord.getValue('custbody_scv_related_transaction');
            return relTrans.length === 0;
        };

        const beforeSubmit = (scriptContext) => {
        }

        const afterSubmit = (scriptContext) => {
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });
