/**
 * Nội dung: 
 * Key:
 * * =======================================================================================
 *  Date                Author                  Description
 *  25 Nov 2024         Khanh Tran	    		Init & create file, Tính giá cơ sở của Item chuẩn và Item lệch chuẩn theo Conversion Rate, from ms.Ngọc(https://app.clickup.com/t/86cx3r94u)
 *  */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([
  '../cons/scv_cons_calc_base_price.js',
],
    (
        constCalcBasePrice,
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
                constCalcBasePrice.updateOriginalRecord(scriptContext)
                
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
