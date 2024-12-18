/**
 * Nội dung: Function QC
 * * =======================================================================================
 *  Date                Author                  Description
 *  18 Oct 2024         Duy Nguyen	    		Init, create file
 *  */
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/redirect', '../lib/scv_lib_qaqc.js'],
    function ( redirect,  libQC) {
        function onRequest(scriptContext) {
            let request = scriptContext.request;
            let params = request.parameters;
            let tranId = params.createdfromid;
            let tranType = params.createdrectype;
            libQC.generateInspectionResultsOfTrans(tranType, tranId);
            redirect.toRecord({type: tranType, id: tranId});
        }
        return {
            onRequest: onRequest
        };
    });
