/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/search', 'N/record', 'N/redirect', '../lib/scv_lib_function'],
    function (search, record, redirect, lbf) {

        const SavedSearchId = {IA_YCXK_RELATED_QTY: "customsearch_scv_ia_ycxk_related_qty"};
        const CustomTypeYCXN = {NHAP: '2', XUAT: '1'};

        function onRequest(context) {
            const request = context.request;
            let params = request.parameters;
            let idYCXVT = params.recid;
            let recYCXVT = record.load({type: 'customsale_scv_ot_yc_xvt', id: idYCXVT});
            const invAdjId = createInventoryAdjustment(recYCXVT);
            if (invAdjId) {
                submitDataFieldsYCXVT(idYCXVT, getObjDataUpdateYCXVT(recYCXVT, invAdjId, idYCXVT));
                redirect.toRecord({type: record.Type.INVENTORY_ADJUSTMENT, id: invAdjId});
            } else {
                redirect.toRecord({type: 'customsale_scv_ot_yc_xvt', id: params.recid});
            }
        }

        const getObjDataUpdateYCXVT = (recYCXVT, invAdjId, idYCXVT) => {
            const totalQtyYCVT = getTotalQuantityYCXVT(recYCXVT);
            const totalQtyIA = getTotalQuantityInventoryAjustment(idYCXVT);
            const arrRelTransId = recYCXVT.getValue('custbody_scv_related_transaction');
            let arrRelTransIdNew = [].concat(arrRelTransId).concat([invAdjId]);
            let objUpd = {
                custbody_scv_related_transaction: arrRelTransIdNew,
                custbody_scv_ia_total_related_qty: totalQtyIA
            };
            if (totalQtyIA === totalQtyYCVT) objUpd.transtatus = 'C';
            return objUpd;
        }

        const submitDataFieldsYCXVT = (id, objUpd) => {
            record.submitFields({
                type: 'customsale_scv_ot_yc_xvt',
                id: id,
                values: objUpd,
                options: {ignoreMandatoryFields: true}
            });
        }

        const createInventoryAdjustment = (recYCXVT) => {
            const ycxvtId = recYCXVT.id;
            let isSave = false;
            let curRec = record.create({type: 'inventoryadjustment', isDynamic: true});
            const arrFieldsBodyYCXN = ['department', 'class', 'custbody_scv_employee_ycxvt', 'custbody_scv_employee_ycxvt'];
            const arrFieldsIA = ['department', 'class', 'custbody_scv_vpr_employee', 'custbody_scv_tb_entity_name'];
            const subId = recYCXVT.getValue('subsidiary');
            const entityId = recYCXVT.getValue('entity');
            const locIdHeader = recYCXVT.getValue('location');
            const typeYCXVT = recYCXVT.getValue('custbody_scv_ycxvt_type');
            const orderTypeId = recYCXVT.getValue('custbody_scv_order_type');
            const accId = getAdjustAccountIdInOrderType(orderTypeId);
            const slYCXN = 'item', slIA = 'inventory';
            const slIVD = 'inventoryassignment';
            lbf.setValueData(curRec, ['subsidiary', 'customer'], [subId, entityId]);
            if (accId) curRec.setValue('account', accId);
            lbf.setValueData(curRec, ['custbody_scv_order_type', 'custbody_scv_created_transaction', 'trandate', 'adjlocation'], [orderTypeId, ycxvtId, lbf.getDateNow(), locIdHeader]);
            lbf.setValue(curRec, recYCXVT, arrFieldsIA, arrFieldsBodyYCXN);
            let arrDataItemIA = getArrayDataItemIA(ycxvtId);
            const factor = CustomTypeYCXN.NHAP === typeYCXVT ? 1 : -1;
            const blNhap = factor === 1;
            const lc = recYCXVT.getLineCount("item");
            for (let i = 0; i < lc; i++) {
                let isCommit = false;
                const item = recYCXVT.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                const qty = factor * recYCXVT.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                const units = recYCXVT.getSublistValue({sublistId: 'item', fieldId: 'units', line: i});
                const unitslist = recYCXVT.getSublistValue({sublistId: 'item', fieldId: 'unitslist', line: i});
                if (qty === 0) {
                    const qtyPlan = recYCXVT.getSublistValue({sublistId: 'item', fieldId: 'custcol_scv_plan_qty', line: i}) * 1;
                    const qtyFullfill = recYCXVT.getSublistValue({sublistId: 'item', fieldId: 'fulfillmentstatusquantity', line: i}) * factor;
                    const statusItem = recYCXVT.getSublistValue({sublistId: 'item', fieldId: 'custcol_scv_item_status', line: i});
                    const lotSupplier = recYCXVT.getSublistValue({sublistId: 'item', fieldId: 'custcol_supplier_lot', line: i});
                    curRec.selectNewLine({sublistId: slIA});
                    setDataDefaultOnLine(curRec, slIA, {
                        item: item,
                        location: locIdHeader,
                        unitslist: unitslist,
                        units: units,
                        adjustqtyby: qtyPlan
                    });
                    curRec.setCurrentSublistValue({sublistId: slIA, fieldId: 'quantity', value: qtyFullfill});
                    setUnitCostOnLine(blNhap, curRec, slIA);
                    insertInventoryDetailCurrent(curRec, slIA, ['inventorystatus', 'quantity'], [statusItem, qtyPlan], '', lotSupplier);
                    isCommit = true;
                    isSave = true;
                }
                else {
                    const objItem = arrDataItemIA.find(d => d.item === item);
                    const qtyItem = objItem?.qty || 0;
                    let qtyRemain = qty - qtyItem;
                    if (qtyRemain === 0) continue;
                    setDataDefaultOnLine(curRec, slIA, {
                        item: item,
                        location: locIdHeader,
                        unitslist: unitslist,
                        units: units,
                        adjustqtyby: qtyRemain
                    });
                    setUnitCostOnLine(blNhap, curRec, slIA);
                    const hasInvAvail = recYCXVT.getSublistValue({sublistId: slYCXN, fieldId: 'inventorydetailavail', line: i});
                    if (!hasMarked(hasInvAvail)) {
                        curRec.commitLine({sublistId: slIA});
                        continue;
                    }
                    let recSubInvDet = recYCXVT.getSublistSubrecord({sublistId: slYCXN, fieldId: 'inventorydetail', line: i});
                    const lcInvAvail = recSubInvDet.getLineCount(slIVD);
                    for (let j = 0; j < lcInvAvail; j++) {
                        const binNum = recSubInvDet.getSublistValue({sublistId: slIVD, fieldId: 'binnumber', line: j});
                        const qtySign = recSubInvDet.getSublistValue({sublistId: slIVD, fieldId: 'quantity', line: j}) * factor;
                        const rLineData = [binNum, qtySign];
                        const issueInvNum = recSubInvDet.getSublistValue({sublistId: slIVD, fieldId: 'issueinventorynumber', line: j});
                        let receiptInvNum = recSubInvDet.getSublistValue({sublistId: slIVD, fieldId: 'receiptinventorynumber', line: j});
                        if (!lbf.isContainValue(receiptInvNum)) receiptInvNum = recSubInvDet.getSublistText({sublistId: slIVD, fieldId: 'issueinventorynumber', line: j});
                        insertInventoryDetailCurrent(curRec, slIA, ['binnumber', 'quantity'], rLineData, issueInvNum, receiptInvNum);
                    }
                    isCommit = true;
                    isSave = true;
                }
                if (isCommit) curRec.commitLine({sublistId: slIA});
            }
            if (isSave) {
                return curRec.save({ignoreMandatoryFields: true});
            }
            return null;
        }

        const setDataDefaultOnLine = (curRec, sublistId, objData) => {
            lbf.setCurrentSublistValueData(curRec, sublistId, [
                'item',
                'location',
                'unitslist',
                'units',
                'adjustqtyby'
            ], [
                objData.item,
                objData.location,
                objData.unitslist,
                objData.units,
                objData.adjustqtyby
            ]);
        }

        const setUnitCostOnLine = (isNhap, curRec, slIA) => {
            if (!isNhap) return;
            const avgCostUnit = curRec.getCurrentSublistValue({sublistId: slIA, fieldId: 'avgunitcost'});
            curRec.setCurrentSublistValue({sublistId: slIA, fieldId: 'unitcost', value: avgCostUnit});
        }

        const insertInventoryDetailCurrent = (newRecord, sublistId, nInvAssField, rLineData, issueinventorynumber, receiptinventorynumber) => {
            const hasSubDet = newRecord.getCurrentSublistValue({sublistId: sublistId, fieldId: 'inventorydetailavail'});
            const slIVD = 'inventoryassignment';
            if (!hasMarked(hasSubDet)) return;
            let recSubIVD = newRecord.getCurrentSublistSubrecord({sublistId: sublistId, fieldId: 'inventorydetail'});
            recSubIVD.selectNewLine({sublistId: slIVD});
            if (lbf.isContainValue(issueinventorynumber)) lbf.setCurrentSublistValueData(recSubIVD, slIVD, ['issueinventorynumber'], [issueinventorynumber]);
            if (lbf.isContainValue(receiptinventorynumber)) lbf.setCurrentSublistValueData(recSubIVD, slIVD, ['receiptinventorynumber'], [receiptinventorynumber]);
            lbf.setCurrentSublistValueData(recSubIVD, slIVD, nInvAssField, rLineData);
            recSubIVD.commitLine(slIVD);
            return recSubIVD;
        }

        function getAdjustAccountIdInOrderType(orderTypeId) {
            let accId = null;
            if (orderTypeId) {
                const lkOrderType = search.lookupFields({
                    type: 'customrecord_scv_order_type',
                    id: orderTypeId,
                    columns: ['custrecord_scv_adjust_account']
                });
                accId = lkOrderType?.custrecord_scv_adjust_account?.[0]?.value || '';
            }
            return accId;
        }

        function getArrayDataItemIA(id) {
            const c = [{name: 'item', summary: 'GROUP'}, {name: 'quantityuom', summary: 'SUM'}];
            const f = [
                search.createFilter({name: 'mainline', operator: search.Operator.IS, values: false}),
                search.createFilter({name: 'taxline', operator: search.Operator.IS, values: false}),
                search.createFilter({name: 'cogs', operator: search.Operator.IS, values: false}),
                search.createFilter({
                    name: 'custbody_scv_created_transaction',
                    operator: search.Operator.ANYOF,
                    values: id
                })
            ];
            let s = search.create({type: search.Type.INVENTORY_ADJUSTMENT, filters: f, columns: c});
            const cols = s.columns;
            let res = s.run().getRange(0, 1000);
            if (res.length === 0) return [];
            return res.map(r => ({item: r.getValue(cols[0]), qty: r.getValue(cols[1]) * 1}))
        }

        const getTotalQuantityInventoryAjustment = (ycxnId) => {
            if (!lbf.isContainValue(ycxnId)) return 0;
            let searchObj = search.load(SavedSearchId.IA_YCXK_RELATED_QTY);
            const myColumns = searchObj.columns;
            searchObj.filters.push(search.createFilter({
                name: "custbody_scv_created_transaction",
                operator: "anyof",
                values: ycxnId
            }));
            let searchData = searchObj.runPaged({pageSize: 1000});
            let totalQuantity = 0;
            const lenPage = searchData.pageRanges.length;
            for (let i = 0; i < lenPage; i++) {
                let currentPage = searchData.fetch({index: i}).data;
                const lcPage = currentPage.length;
                for (let idx = 0; idx < lcPage; idx++) {
                    totalQuantity += currentPage[idx].getValue(myColumns[7]) * 1;
                }
            }
            return totalQuantity;
        }

        const getTotalQuantityYCXVT = (recYCVT) => {
            let totalQuantity = 0;
            const lc = recYCVT.getLineCount("item");
            for (let i = 0; i < lc; i++)
                totalQuantity += recYCVT.getSublistValue("item", 'quantity', i) * 1;
            return totalQuantity;
        }

        const hasMarked = (value) => {
            if (typeof value === 'boolean') return value;
            return value === 'true' || value === 'T';
        }


        return {
            onRequest: onRequest
        }
    })