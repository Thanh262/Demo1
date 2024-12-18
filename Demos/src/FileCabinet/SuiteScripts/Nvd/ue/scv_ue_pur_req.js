/**
 * Nội dung:
 * * =======================================================================================
 *  Date                Author                  Description
 *  27 Sep 2024         Khanh Tran	    		Init, create file
 *  */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/runtime',
    '../cons/scv_cons_search_pr_remaining_po.js'
],
    (search, runtime,
        constSearchPRRPO
    ) => {
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
            loadQtyRemain(scriptContext);
        }

        const loadQtyRemain = (scriptContext) => {
            if(!['edit', 'view'].includes(scriptContext.type)) return;
            if(runtime.executionContext !== runtime.ContextType.USER_INTERFACE) return;

            let curRec = scriptContext.newRecord;
            let sl = 'item';
            let subsidiaryId = curRec.getValue('subsidiary')
            let arrSS_prRPO = getDataSS_prRPO(subsidiaryId);
            for(let i = 0; i < curRec.getLineCount(sl); i++){
                let ori_lineid = curRec.getSublistValue(sl, 'custcol_scv_ori_lineid', i);
                let objSS = arrSS_prRPO.find(e => e.ori_lineid == ori_lineid);
                if(!objSS) continue;

                let conversion_rate = curRec.getSublistValue(sl, 'custcol_scv_conversion_rate', i) * 1;
                let qty_remaining = objSS.qty_remaining/conversion_rate;
                curRec.setSublistValue({sublistId: sl, fieldId: 'custcol_scv_pr_qty_remaining', line: i, value: qty_remaining});
            };
        }

        const getDataSS_prRPO = (subsidiaryId) => {
            let myFilters = [];
            if(subsidiaryId){
                myFilters.push(
                    search.createFilter({name: 'subsidiary', operator: 'anyof', values: subsidiaryId})
                );
            }

            return constSearchPRRPO.getDataSource();
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

        return {
            beforeLoad, 
            // beforeSubmit, 
            // afterSubmit
        }

    });
