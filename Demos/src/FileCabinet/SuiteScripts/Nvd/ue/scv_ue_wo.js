/**
 * Nội dung: 
 * Key:
 * * =======================================================================================
 *  Date                Author                  Description
 *  19 Nov 2024         Huy Pham	    		Init & create file, Sinh số lô tự động trong màn hình WO, from mr.Bính(https://app.clickup.com/t/86cx2y1j1)
 *  25 Nov 2024         Huy Pham                Chức năng load default Các item phụ phẩm, thu hồi, from mr.Bính(https://app.clickup.com/t/86cx4wmbg)
 *  25 Nov 2024         Khanh Tran              Quản lý Hệ số quy đổi, from mr.Bính(https://app.clickup.com/t/86cx3r94u)
 *  */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search',
    '../cons/scv_cons_seqnumber',
    '../cons/scv_cons_workorder',
    '../cons/scv_cons_byproduct'
],
    /**
 * @param{search} search
 */
    (search, 
        constSeqNumber,
        constWorkOrder,
        constByProduct
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
            let triggerType = scriptContext.type;

            if(["create", "edit"].includes(triggerType)){
                let newRec = scriptContext.newRecord;

                constSeqNumber.genAssemblyLotNumber(newRec);

                constWorkOrder.genQCSerialCode(newRec);

                constByProduct.addLineDefaultOfRecord(newRec);

                constWorkOrder.updateQuantitySlItem(newRec, scriptContext.oldRecord);
               
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

        return {
            //beforeLoad, 
            beforeSubmit, 
            // afterSubmit
        }

    });
