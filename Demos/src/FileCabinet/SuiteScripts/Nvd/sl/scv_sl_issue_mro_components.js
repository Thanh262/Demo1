/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define([
    'N/redirect', 'N/record',
    '../lib/scv_lib_function.js',
    '../cons/scv_cons_ordertype.js',
    '../cons/scv_cons_account.js',
    '../cons/scv_cons_approvalstatus.js',
    '../cons/scv_cons_search_mro_comp_usage.js',
    '../cons/scv_cons_search_item_receipt_by_lot.js'
],
    (
        redirect, record,
        lbf, constOrderType, 
        constAccount, constApprStatus,
        searchMROCompUsage, searchIRByLot
    ) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let request = scriptContext.request;
            let params = request.parameters;
            let iaId = createInventoryAdjust(params);
            
            redirect.toRecord({ type: "inventoryadjustment", id: iaId });
        }

        const createInventoryAdjust = (params) => {
            let woRec = record.load({ type: params.rectype, id: params.recid });
            let iaRec = record.create({
                type: "inventoryadjustment",
                isDynamic: true
            });
            // set body fields
            let assemblyitem = woRec.getValue("assemblyitem");
            let fields = ['subsidiary', 'memo', 'custbody_scv_assembly_lot'];
            lbf.setValue(iaRec, woRec, fields, fields);
            lbf.setValueData(iaRec, [
                'custbody_scv_order_type', 'account', 'custbody_scv_approval_status',
                'custbody_scv_assembly', 'custbody_scv_work_order_no', 'custbody_scv_created_transaction'
            ], [
                constOrderType.RECORDS.XUAT_TIEU_HAO_GC_CO_KHI.ID, constAccount.RECORDS._15410001.ID, constApprStatus.RECORDS.OPEN.ID,
                assemblyitem, params.recid, params.recid
            ]);
            // set line fields
            let arrSublist = handleDataSavedSearch(woRec, params);
            log.error("arrSublist", arrSublist);
            let sl = "inventory";
            for(let i = 0; i < arrSublist.length; i++) {
                let arrInvNumber = arrSublist[i].arrInvNumber;

                iaRec.selectNewLine(sl, i);
                iaRec.setCurrentSublistValue(sl, "item", arrSublist[i].component_id);
                iaRec.setCurrentSublistValue(sl, "location", arrSublist[i].location_id);
                iaRec.setCurrentSublistValue(sl, "adjustqtyby", arrSublist[i].adjustqtyby);
                iaRec.setCurrentSublistValue(sl, "custcol_scv_mro_line_related", arrSublist[i].mro_related_id);

                if(arrInvNumber.length > 0) {
                    insertInventoryDetail(iaRec, arrInvNumber, sl);
                }

                iaRec.commitLine(sl);
            }
            let internalid = iaRec.save();
            return internalid;
        }

        const insertInventoryDetail = (iaRec, arrInvNumber, sublistId) => {
            let inventorydetailavail = iaRec.getCurrentSublistValue({sublistId: sublistId, fieldId: 'inventorydetailavail'});
            let slIVD = 'inventoryassignment';
            if(inventorydetailavail == true || inventorydetailavail == 'T') {
                let invDetailRec = iaRec.getCurrentSublistSubrecord({sublistId: sublistId, fieldId: 'inventorydetail'});
                for(let i = 0; i < arrInvNumber.length; i++) {
                    invDetailRec.selectNewLine({sublistId: slIVD});
                    invDetailRec.setCurrentSublistValue(slIVD, "issueinventorynumber", arrInvNumber[i].item_num_id);
                    invDetailRec.setCurrentSublistValue(slIVD, "binnumber", arrInvNumber[i].binnumber);
                    invDetailRec.setCurrentSublistValue(slIVD, "quantity", arrInvNumber[i].lot_num_qty);

                    invDetailRec.commitLine({sublistId: slIVD});
                }
            }
        }

        const handleDataSavedSearch = (woRec, params) => {
            let arrMROCompUsage = searchMROCompUsage.getDataSourceByWorkOrder(params.recid);
            let arrIRByLot = searchIRByLot.getDataSourceByWorkOrder(params.recid);
            // arrIRByLot[3].lot_num_qty = 18;
            let arrResult = [];
            for(let i = 0; i < arrMROCompUsage.length; i++) {
                // filer inventory detail
                let arrFilterIRByLot = arrIRByLot.filter(e => e.mro_line_id == arrMROCompUsage[i].internalid && e.item_id == arrMROCompUsage[i].component_id);
                if(arrFilterIRByLot.length > 0) {
                    let adjustqtyby = arrMROCompUsage[i].quantity;
                    let objResult = {
                        mro_related_id: arrMROCompUsage[i].internalid,
                        component_id: arrMROCompUsage[i].component_id,
                        location_id: woRec.getValue("location"),
                        adjustqtyby: adjustqtyby * -1,
                    };

                    objResult.arrInvNumber = handleDataInventoryDetail(arrFilterIRByLot, adjustqtyby);
                    arrResult.push(objResult);
                }
            }
            return arrResult;
        }

        const handleDataInventoryDetail = (arrFilterIRByLot, adjustqtyby) => {
            let arrResult = [];
            let total_lot_num_qty = arrFilterIRByLot.reduce((a, b) => a + b.lot_num_qty, 0);
            // TODO: adjustqtyby = SUM(arrFilterIRByLot, "lot_num_qty");
            if(adjustqtyby === total_lot_num_qty) {
                for(let i = 0; i < arrFilterIRByLot.length; i++) {
                    let obj = {
                        lot_num: arrFilterIRByLot[i].lot_num,
                        item_num_id: arrFilterIRByLot[i].item_num_id,
                        binnumber: arrFilterIRByLot[i].binnumber,
                        lot_num_qty: arrFilterIRByLot[i].lot_num_qty * -1
                    };
                    arrResult.push(obj);
                }
            }
            // TODO: adjustqtyby < SUM(arrFilterIRByLot, "lot_num_qty");
            else if(adjustqtyby < total_lot_num_qty) {
                let total_cur_qty = 0;
                for(let i = 0; i < arrFilterIRByLot.length; i++) {
                    total_cur_qty += arrFilterIRByLot[i].lot_num_qty;
                    if(total_cur_qty >= adjustqtyby) {
                        let obj = {
                            lot_num: arrFilterIRByLot[i].lot_num,
                            item_num_id: arrFilterIRByLot[i].item_num_id,
                            binnumber: arrFilterIRByLot[i].binnumber,
                            lot_num_qty: (arrFilterIRByLot[i].lot_num_qty - (total_cur_qty - adjustqtyby)) * -1
                        };
                        arrResult.push(obj);
                        break;
                    } else {
                        let obj = {
                            lot_num: arrFilterIRByLot[i].lot_num,
                            item_num_id: arrFilterIRByLot[i].item_num_id,
                            binnumber: arrFilterIRByLot[i].binnumber,
                            lot_num_qty: arrFilterIRByLot[i].lot_num_qty * -1
                        };
                        arrResult.push(obj);
                    }
                }
            }
            // TODO: adjustqtyby > SUM(arrFilterIRByLot, "lot_num_qty");

            return arrResult;
        }

        return {onRequest}

    });
