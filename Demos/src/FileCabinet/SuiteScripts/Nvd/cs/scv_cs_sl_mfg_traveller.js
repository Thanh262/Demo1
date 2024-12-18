/**
 * =======================================================================================
 *  Date                Author                  Description
 *  18 Nov 2024		    Khanh Tran			    Init, create file. Màn hình phiếu giao việc và phiếu in liên quan from mr. Bính(https://app.clickup.com/t/86cx3591d)
 */
/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
    'N/currentRecord', 'N/url', 'N/ui/dialog', 'N/query', 'N/https',
    '../lib/scv_lib_cs.js', '../lib/scv_lib_function.js', '../lib/scv_lib_cs_xls.js'
],

function(crr, url, dialog, query, https,
    libCs, lbf
) {
    const CUR_SCRIPT = {
        ID: 'customscript_scv_sl_mfg_traveller',
        DEPLOYID_UI: 'customdeploy_scv_sl_mfg_traveller',
        DEPLOYID_DATA: 'customdeploy_scv_sl_mfg_traveller_data'
    }

    const URL_DATA = "/app/site/hosting/scriptlet.nl?script=" + CUR_SCRIPT.ID + "&deploy=" + CUR_SCRIPT.DEPLOYID_DATA;
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
        let sl = scriptContext.sublistId;
        let fieldId = scriptContext.fieldId; 
        if(fieldId == 'custpage_subsidiary'){
            let subsidiary = curRec.getValue(fieldId);
            onLoadLocationBySub(curRec, 'custpage_location', subsidiary)
        }
    }

    const onLoadLocationBySub = (curRec, location_fieldId, subsidiary) => {
        let sql = `
            SELECT location.id, location.name, LocationSubsidiaryMap.subsidiary
            FROM location
            JOIN LocationSubsidiaryMap 
            ON location.id = LocationSubsidiaryMap.location
            WHERE isinactive = 'F'`;
        if(subsidiary) sql += ` AND LocationSubsidiaryMap.subsidiary IN (${subsidiary})`;

        let resultSQL = query.runSuiteQL({query: sql});
        let resultQuery = resultSQL.asMappedResults();
        let location_field = curRec.getField(location_fieldId);
        location_field.removeSelectOption({value: null});
        location_field.insertSelectOption({value: '', text: ''});
        for(let obj of resultQuery) {
            location_field.insertSelectOption({value: obj.id, text: obj.name});
        }
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
        window.onbeforeunload = null;
        let isSelected  = isRowSelected();
        if(!isSelected ) {
            return alert('You must select at least 1 line');
        }

        return true;
    }

    const isRowSelected = () => {
        let curRec = crr.get();
        let sl = 'custpage_sl_workorders';
        for(let i = 0; i < curRec.getLineCount(sl); i++){
            let vCheck = curRec.getSublistValue(sl, 'custpage_col_check', i);
            if(vCheck === true || vCheck === 'T'){
                return true
            }
        }
        return false;
    }

    const onSearchResult = () => {
        window.onbeforeunload = null;
        let curRec = crr.get();
        let isValid = libCs.validateFieldMandatory(curRec, [
            'custpage_work_center', 'custpage_subsidiary', 'custpage_location', 'custpage_wo_type', 'custpage_wo_fromdt', 'custpage_wo_todt'
        ]);
        if(!isValid) return;
        
        let params = getObjParams();
        let urlDC = url.resolveScript({
            scriptId: CUR_SCRIPT.ID,
            deploymentId: CUR_SCRIPT.DEPLOYID_UI,
            params: params,
        });
        urlDC = urlDC + '&isSearch=T';
        window.location.replace(urlDC);
    }

    const getObjParams = () => {
        let curRec = crr.get();
        return {
            custpage_work_center: curRec.getValue('custpage_work_center').join(','),
            custpage_subsidiary: curRec.getValue('custpage_subsidiary'),
            custpage_location: curRec.getValue('custpage_location'),
            custpage_wo_type: curRec.getValue('custpage_wo_type').join(','),
            custpage_wo_fromdt: curRec.getText('custpage_wo_fromdt'),
            custpage_wo_todt: curRec.getText('custpage_wo_todt'),
            custpage_so_source: curRec.getValue('custpage_so_source').join(','),
            custpage_supply_req_date: curRec.getText('custpage_supply_req_date'),
            custpage_status: curRec.getValue('custpage_status').join(','),
            custpage_assembly: curRec.getValue('custpage_assembly'),
        };
    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        saveRecord: saveRecord,
        onSearchResult: onSearchResult
    };
    
});
