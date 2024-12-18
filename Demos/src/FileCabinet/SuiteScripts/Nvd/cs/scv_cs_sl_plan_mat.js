/**
 * Nội dung: 
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  04 Dec 2024         Huy Pham			    Init, create file, Tính toán phân bổ trọng lượng nâng hạ trong sản xuất, from mr.Bính(https://app.clickup.com/t/86cx40ye7)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */ 
define(['N/currentRecord', 'N/url', 'N/search',
    '../lib/scv_lib_cs.js',

    '../cons/scv_cons_record.js',

    '../cons/scv_cons_purplan_ind.js',
],

function(currentRecord, url, search,
    libCs,

    constRecord,
    constPurPlanInd
) {
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
        
        
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function fieldChanged(scriptContext) {
        let curRec = scriptContext.currentRecord;
        let sublistId = scriptContext.sublistId;
        let fieldId = scriptContext.fieldId;

        switch(fieldId){
            case "custpage_subsidiary":
                let custpage_purplan_params = curRec.getField("custpage_purplan_params");
                let subsidiaryId = curRec.getValue("custpage_subsidiary");

                setTimeout(() => loadFieldDataPurPlanInd(custpage_purplan_params, subsidiaryId), 0);
                setTimeout(() => loadDataDefaultByPurPlanInd(curRec, ""), 0);
            break;
            case "custpage_purplan_params":
                let purPlanIndId = curRec.getValue("custpage_purplan_params");

                setTimeout(() => loadDataDefaultByPurPlanInd(curRec, purPlanIndId), 0);
                
            break;
        }

    }

    const loadFieldDataPurPlanInd = (_field, _subsidiaryId) => {
        if(!_subsidiaryId) return;

        let arrResult = constPurPlanInd.getDataSource(
            search.createFilter({
                name: 'custrecord_scv_pur_plan_ind_subsidiary',
                operator: "anyof",
                values: _subsidiaryId
            })
        );

        constRecord.initLoadFieldClient(_field, {
            displayExpr: "name", valueExpr: "internalid", data: arrResult
        }, true);
    }

    const loadDataDefaultByPurPlanInd = (_curRec, _purPlanIndId) =>{
        let objRes = {
            custpage_crtdt: "",
            custpage_expecteddt_nextmonth: "",
            custpage_stockdt: "",
            custpage_hsdc: "",
            custpage_usedfromdt: "",
            custpage_crtdt: "",
            custpage_usedtodt: "",
        };

        if(!!_purPlanIndId){
            let arrPurPlanInd = constPurPlanInd.getDataSource(
                search.createFilter({
                    name: 'internalid',
                    operator: "anyof",
                    values: _purPlanIndId
                })
            );
    
            let objPurPlanInd = arrPurPlanInd[0];
    
            objRes.custpage_hsdc = objPurPlanInd.custrecord_scv_pur_plan_ind_hsdc;

            if(!!objPurPlanInd.custrecord_scv_pur_plan_ind_date){
                objRes.custpage_crtdt = nlapiStringToDate(objPurPlanInd.custrecord_scv_pur_plan_ind_date);
            }
            if(!!objPurPlanInd.custrecord_scv_pur_plan_ind_dkhv){
                objRes.custpage_expecteddt_nextmonth = nlapiStringToDate(objPurPlanInd.custrecord_scv_pur_plan_ind_dkhv);
            }
            if(!!objPurPlanInd.custrecord_scv_pur_plan_ind_receipt_date){
                objRes.custpage_stockdt = nlapiStringToDate(objPurPlanInd.custrecord_scv_pur_plan_ind_receipt_date);
            }
            if(!!objPurPlanInd.custrecord_scv_pur_plan_date_used_from){
                objRes.custpage_usedfromdt = nlapiStringToDate(objPurPlanInd.custrecord_scv_pur_plan_date_used_from);
            }
            if(!!objPurPlanInd.custrecord_scv_pur_plan_ind_date_used_to){
                objRes.custpage_usedtodt = nlapiStringToDate(objPurPlanInd.custrecord_scv_pur_plan_ind_date_used_to);
            }
        }

        _curRec.setValue("custpage_crtdt", objRes.custpage_crtdt);
        _curRec.setValue("custpage_expecteddt_nextmonth", objRes.custpage_expecteddt_nextmonth);
        _curRec.setValue("custpage_stockdt", objRes.custpage_stockdt);
        _curRec.setValue("custpage_hsdc", objRes.custpage_hsdc);
        _curRec.setValue("custpage_usedfromdt", objRes.custpage_usedfromdt);
        _curRec.setValue("custpage_usedtodt", objRes.custpage_usedtodt);
        

        return objRes;
    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
        return true;
    }

    const onSearchResult = () =>{
        window.onbeforeunload = null;

        let curRec = currentRecord.get();
        let isValid = libCs.validateFieldMandatory(curRec, [
            "custpage_subsidiary", "custpage_purplan_params", "custpage_crtdt"
        ]);
        if(!isValid) return;

        let params = getObjParams(curRec);

        let urlScript = url.resolveScript({
            scriptId: 'customscript_scv_sl_plan_mat',
            deploymentId: 'customdeploy_scv_sl_plan_mat',
            params: params
        });

        urlScript += "&isSearch=T";

        window.location.replace(urlScript);
    }

    const getObjParams = (_curRec) => {
        let params = {
            custpage_subsidiary: _curRec.getValue("custpage_subsidiary"),
            custpage_purplan_params: _curRec.getValue("custpage_purplan_params"),
            custpage_crtdt: _curRec.getText("custpage_crtdt"),
        };

        return params;
    }

    return {
        pageInit,
        fieldChanged,
        saveRecord,
        onSearchResult
    };
    
});
