/**
 * Nội dung: 
 * Key:
 * * =======================================================================================
 *  Date                Author                  Description
 *  ?                   ?                       ?
 *  25 Nov 2024         Huy Pham                Chức năng load default Các item phụ phẩm, thu hồi, from mr.Bính(https://app.clickup.com/t/86cx4wmbg)
 *  */
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/url', '../lib/scv_lib_function.js', 
    '../cons/scv_cons_byproduct.js'
],
    function (record, search, url, lbf,
        constByProduct
    ) {

        function beforeLoad(scriptContext) {
            let form = scriptContext.form;
            let tgType = scriptContext.type;
            let newRecord = scriptContext.newRecord;
            form.clientScriptModulePath = '/SuiteScripts/Nvd/cs/scv_cs_assembly_build.js';
            if (['create', 'edit', 'copy'].indexOf(tgType) !== -1) {
                 form.addButton({id: 'custpage_bt_calscrap', label: 'Cal Scrap', functionName: "calscrap()"});
                 // form.addButton({id: 'custpage_bt_calaveragerate', label: "Cal Average Rate", functionName: "calAverageRate()"})
            }
            else if (tgType === 'view') {
                addButtonMFGIPC(form);
                if (!!newRecord.getValue('location') && checkNhapPhuPham(newRecord) && isCreateIAFromAB(newRecord)) {
                    form.addButton({id: 'custpage_bt_nhapphupham', label: 'Nhập phụ phẩm', functionName: "nhapphepham()"});
                }
            }
        }

        function addButtonMFGIPC(form) {
            form.addButton({
                id: 'custpage_bt_mfg_inspection',
                label: 'MFG Inspection',
                functionName: `createMFGInspection();`
            });
        }


        function isCreateIAFromAB(newRecord) {
            let valid = true;
            const f = [search.createFilter({name: 'custbody_scv_created_transaction', operator: search.Operator.ANYOF, values: newRecord.id})];
            const c = [{name: 'internalid'}]
            let s = search.create({type: 'inventoryadjustment', filters: f, columns: c});
            let r = s.run().getRange(0, 1);
            if (r.length > 0) valid = false;
            return valid;
        }

        function checkNhapPhuPham(newRecord) {
            const prefixQty = 'custbody_scv_byproduct_qty';
            let blNhap = false;
            for (let i = 1; i < 24; i++) {
                if ( lbf.isContainValue( newRecord.getValue(prefixQty + i) ) ) {
                    blNhap = true;
                    break;
                }
            }
            return blNhap;
        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {
            let triggerType = scriptContext.type;
            let newRec = scriptContext.newRecord;

            if (triggerType !== 'delete') {
                calCharge(newRec);
            }

            if(["create", "edit"].includes(triggerType)){
                constByProduct.addLineDefaultOfRecord(newRec);
            }
        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {}


        function calCharge (newRecord) {
            const productCost = newRecord.getValue('custbody_scv_byproduct_cost');
            const slComp = 'component';
            const lcComp = newRecord.getLineCount(slComp);
            const currencyVNDId = "69";
            for (let i = 0; i < lcComp; i++) {
                const itemId = newRecord.getSublistValue({sublistId: slComp, fieldId: 'item', line: i});
                const typeItem = search.lookupFields({type: search.Type.ITEM, id: itemId, columns: ["type"]}).type[0].value;
                const unitsCostVND = newRecord.getValue("units");
                const blRound = typeItem === "OthCharge" || unitsCostVND === currencyVNDId;
                const unitCost = newRecord.getSublistValue({sublistId: slComp, fieldId: 'unitcost', line: i}).toString();
                let qtyUpd = newRecord.getSublistValue({sublistId: slComp, fieldId: 'quantity', line: i});
                if ( unitCost === '-1' ) {
                    newRecord.setSublistValue({sublistId: slComp, fieldId: 'quantity', line: i, value: productCost});
                    qtyUpd = productCost;
                }
                if (blRound) newRecord.setSublistValue({sublistId: slComp, fieldId: 'quantity', line: i, value: Number(qtyUpd).toFixed(0)});
            }
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });
