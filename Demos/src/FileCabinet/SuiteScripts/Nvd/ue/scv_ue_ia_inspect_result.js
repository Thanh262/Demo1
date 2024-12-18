/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', '../lib/scv_lib_function.js', '../lib/scv_lib_qaqc.js'],
    (record, search, lfunc, qaqc) => {

        const beforeSubmit = (scriptContext) => {
            if (scriptContext.type === "delete") {
                onDeleteInspecResult(scriptContext.oldRecord);
            }
        }

        const afterSubmit = (context) => {
            if (context.type === "create" || context.type === 'edit') {
                createInspectionResult(context.newRecord);
            }
        }

        const onDeleteInspecResult = (oldRec) => {
            let arrIRM_Rec = search.create({
                type: "customrecord_scv_inspection_result_tb",
                columns: ['internalid', 'name'],
                filters: [["custrecord_scv_irt_receipt_no", "is", oldRec.id]]
            }).run().getRange(0, 1);
            if (arrIRM_Rec.length > 0) throw "Không xóa được chứng từ này do có các chứng từ liên quan: " + arrIRM_Rec[0].getValue("name");
        }

        const createInspectionResult = (newRecord) => {
            const slInv = "inventory";
            const slIVD = 'inventoryassignment';
            const slIRT = 'recmachcustrecord_scv_ir_irt';
            let newRec = record.load({type: record.Type.INVENTORY_ADJUSTMENT, id: newRecord.id});
            const subsidiary = newRec.getValue("subsidiary");
            const createdTrans = newRec.getValue("custbody_scv_created_transaction");
            let vendor = null;
            let trandate = newRec.getValue("trandate");
            const yearMonth = lfunc.makePrefix(trandate.getMonth() + 1, 2, '0') + trandate.getFullYear().toString().substring(2, 4);
            const lcIA = newRec.getLineCount(slInv);
            const arrPlanInsId = getArrInsPlanIdOnSublist(newRec);
            const arrInsFields = getElementInsFields(arrPlanInsId)
            for (let idx_item = 0; idx_item < lcIA; idx_item++) {
                const inspect_started = newRec.getSublistValue({
                    sublistId: slInv,
                    fieldId: 'custcol_scv_inspect_started',
                    line: idx_item
                });
                const inspection_plan = newRec.getSublistValue({
                    sublistId: slInv,
                    fieldId: 'custcol_scv_inspection_plan',
                    line: idx_item
                });
                let arrDataInsFieldsLine = arrInsFields.filter(o => o.insPlan === inspection_plan);
                let ins_rs = newRec.getSublistValue({
                    sublistId: slInv,
                    fieldId: 'custcol_scv_inbound_inspection_result',
                    line: idx_item
                });
                if (lfunc.isContainValue(ins_rs)) {
                    let item = newRec.getSublistValue({sublistId: slInv, fieldId: "item", line: idx_item});
                    let qty = newRec.getSublistValue({sublistId: slInv, fieldId: 'adjustqtyby', line: idx_item});
                    let InsResRec = record.load({type: "customrecord_scv_inspection_result_tb", id: ins_rs});
                    if (InsResRec.getText("custrecord_scv_inbound_qa_approval_statu")?.toLowerCase() === 'pending sc approve') { //11 - Pending SC Approve
                        InsResRec.setValue("custrecord_scv_irt_item", item);
                        InsResRec.setValue("custrecord_scv_irt_receipt_qty", qty);
                        InsResRec.setValue("custrecord_scv_iqc_po_quantity", qty);
                        InsResRec.save({enableSourcing: false, ignoreMandatoryFields: true});
                    }
                }
                if (!lfunc.isContainValue(inspect_started) || !qaqc.checked(inspect_started) || !lfunc.isContainValue(inspection_plan) || lfunc.isContainValue(ins_rs)) {
                    continue;
                }

                if (lfunc.isContainValue(createdTrans)) {
                    let custRec = record.load({type: lfunc.getTranRecordType(createdTrans), id: createdTrans});
                    vendor = custRec.getText("entity");
                }
                let item = newRec.getSublistValue({sublistId: slInv, fieldId: "item", line: idx_item});
                let lineID = newRec.getSublistValue({sublistId: slInv, fieldId: 'line', line: idx_item});
                let loc = newRec.getSublistValue({sublistId: slInv, fieldId: "location", line: idx_item});
                let supplier_lot = newRec.getSublistValue({
                    sublistId: slInv,
                    fieldId: 'custcol_supplier_lot',
                    line: idx_item
                });
                let supplier_mfg_date = newRec.getSublistValue({
                    sublistId: slInv,
                    fieldId: 'custcol_scv_supplier_mfg_date',
                    line: idx_item
                });
                let manufacturer = newRec.getSublistText({
                    sublistId: slInv,
                    fieldId: 'custcol_scv_manufacture_item',
                    line: idx_item
                });
                let invDetailRec = newRec.getSublistSubrecord({
                    sublistId: slInv,
                    fieldId: 'inventorydetail',
                    line: idx_item
                });
                let po_qty = newRec.getSublistValue({
                    sublistId: slInv,
                    fieldId: 'custcol_scv_purchased_quantity',
                    line: idx_item
                });
                if (invDetailRec.getLineCount(slIVD) > 0) {
                    const lcInvDetail = invDetailRec.getLineCount(slIVD);
                    for (let idx_ivd = 0; idx_ivd < lcInvDetail; idx_ivd++) {
                        let qty = invDetailRec.getSublistValue({sublistId: slIVD, fieldId: 'quantity', line: idx_ivd});
                        let lot_number = invDetailRec.getSublistValue({
                            sublistId: slIVD,
                            fieldId: 'receiptinventorynumber',
                            line: idx_ivd
                        });
                        let doc_number = getInspectionNumber(subsidiary, yearMonth);
                        let newIRM_Rec = record.create({type: "customrecord_scv_inspection_result_tb"});
                        lfunc.setValueData(newIRM_Rec, [
                                'custrecord_scv_irt_inspection_plan', 'custrecord_scv_irt_item',
                                'custrecord_scv_irt_lot_number', 'custrecord_scv_irt_subsidiary',
                                'custrecord_scv_irt_inspect_number', 'custrecord_scv_irt_receipt_qty',
                                'custrecord_scv_irt_supplier_lot', 'custrecord_scv_irt_supplier_mfg_date',
                                'custrecord_scv_irt_manufacturer', 'custrecord_scv_irt_supplier',
                                'custrecord_scv_irt_sampling_place', 'custrecord_scv_irt_receipt_from',
                                'custrecord_scv_irt_receipt_no', 'custrecord_scv_iqc_po_quantity',
                                'custrecord_scv_irt_item', 'custrecord_scv_irt_mat_date',
                                'custrecord_scv_irt_po_quantity', 'custrecord_scv_irt_receiptno_line_id'
                            ],
                            [inspection_plan, item,
                                lot_number, subsidiary,
                                doc_number, qty,
                                supplier_lot, supplier_mfg_date,
                                manufacturer, vendor,
                                loc, createdTrans,
                                newRec.id, qty,
                                item, trandate,
                                po_qty, lineID
                            ]);
                        const lcDataPlanD = arrDataInsFieldsLine.length;
                        for (let idx_planD = 0; idx_planD < lcDataPlanD; idx_planD++) {
                            newIRM_Rec.insertLine({sublistId: slIRT, line: idx_planD});
                            lfunc.setSublistValueData(newIRM_Rec, slIRT, [
                                'custrecord_scv_ir_item_number', 'custrecord_scv_ir_inspect_plan',
                                'custrecord_scv_ir_inspect_tdesc', 'custrecord_scv_ir_lot_number',
                                'custrecord_scv_ir_inspect_field', 'custrecord_scv_ir_inspect_method',
                                'custrecord_scv_ir_insp_document', 'custrecord_scv_irt_sequences',
                                'custrecord_scv_ir_purchase_order', 'custrecord_scv_ir_receipt_no',
                                'custrecord_scv_ir_item_number'
                            ], idx_planD, [
                                item, inspection_plan,
                                arrDataInsFieldsLine[idx_planD].description, lot_number,
                                arrDataInsFieldsLine[idx_planD].id, arrDataInsFieldsLine[idx_planD].insMethod,
                                doc_number, arrDataInsFieldsLine[idx_planD].sequence,
                                createdTrans, newRec.id,
                                item
                            ]);
                        }
                        let newIRM_ID = newIRM_Rec.save({enableSourcing: false, ignoreMandatoryFields: true});
                        newRec.setSublistValue({
                            sublistId: slInv,
                            fieldId: 'custcol_scv_inbound_inspection_result',
                            line: idx_item,
                            value: newIRM_ID
                        });
                    }
                } else {
                    let qty = newRec.getSublistValue({sublistId: slInv, fieldId: 'adjustqtyby', line: idx_item});
                    let doc_number = getInspectionNumber(subsidiary, yearMonth);
                    let newIRM_Rec = record.create({type: "customrecord_scv_inspection_result_tb"});
                    lfunc.setValueData(newIRM_Rec, [
                            'custrecord_scv_irt_inspection_plan', 'custrecord_scv_irt_item',
                            'custrecord_scv_irt_subsidiary',
                            'custrecord_scv_irt_inspect_number', 'custrecord_scv_irt_receipt_qty',
                            'custrecord_scv_irt_supplier_lot', 'custrecord_scv_irt_supplier_mfg_date',
                            'custrecord_scv_irt_manufacturer', 'custrecord_scv_irt_supplier',
                            'custrecord_scv_irt_sampling_place', 'custrecord_scv_irt_receipt_from',
                            'custrecord_scv_irt_receipt_no', 'custrecord_scv_iqc_po_quantity',
                            'custrecord_scv_irt_item', 'custrecord_scv_irt_mat_date',
                            'custrecord_scv_irt_po_quantity', 'custrecord_scv_irt_receiptno_line_id'
                        ],
                        [inspection_plan, item,
                            subsidiary,
                            doc_number, qty,
                            supplier_lot, supplier_mfg_date,
                            manufacturer, vendor,
                            loc, createdTrans,
                            newRec.id, qty,
                            item, trandate,
                            po_qty, lineID
                        ]);
                    const lcDataPlanD = arrDataInsFieldsLine.length;
                    for (let idx_planD = 0; idx_planD < lcDataPlanD; idx_planD++) {
                        newIRM_Rec.insertLine({sublistId: slIRT, line: idx_planD});
                        lfunc.setSublistValueData(newIRM_Rec, slIRT,
                            [
                                'custrecord_scv_ir_item_number', 'custrecord_scv_ir_inspect_plan',
                                'custrecord_scv_ir_inspect_tdesc',
                                'custrecord_scv_ir_inspect_field', 'custrecord_scv_ir_inspect_method',
                                'custrecord_scv_ir_insp_document', 'custrecord_scv_irt_sequences',
                                'custrecord_scv_ir_purchase_order', 'custrecord_scv_ir_receipt_no',
                                'custrecord_scv_iird_subsidiary'
                            ],
                            idx_planD, [
                                item, inspection_plan,
                                arrDataInsFieldsLine[idx_planD].description,
                                arrDataInsFieldsLine[idx_planD].id, arrDataInsFieldsLine[idx_planD].insMethod,
                                doc_number, arrDataInsFieldsLine[idx_planD].sequence,
                                createdTrans, newRec.id, subsidiary
                            ]);
                    }
                    let newIRM_ID = newIRM_Rec.save({enableSourcing: false, ignoreMandatoryFields: true});
                    newRec.setSublistValue({
                        sublistId: slInv,
                        fieldId: 'custcol_scv_inbound_inspection_result',
                        line: idx_item,
                        value: newIRM_ID
                    });
                }
            }
            newRec.save({enableSourcing: false, ignoreMandatoryFields: true});
        }

        const getArrInsPlanIdOnSublist = (curRec) => {
            let arrInsPlan = [];
            const lc = curRec.getLineCount('inventory');
            for (let i = 0; i < lc; i++) {
                const insPlanId = curRec.getSublistValue({
                    sublistId: 'inventory',
                    fieldId: 'custcol_scv_inspection_plan',
                    line: i
                });
                if (!!insPlanId && arrInsPlan.indexOf(insPlanId) === -1) arrInsPlan.push(insPlanId);
            }
            return arrInsPlan;
        }

        const getElementInsFields = (arrInsPlan) => {
            if (arrInsPlan.length === 0) return [];
            let f = [
                search.createFilter({name: 'custrecord_scv_if_inspec_plan', operator: 'anyof', values: arrInsPlan}),
                search.createFilter({name: 'isinactive', operator: 'is', values: false})
            ];
            let c =
                [
                    'custrecord_scv_if_test_description', 'custrecord_scv_if_test_method',
                    'custrecord_scv_if_inspec_method',
                    {name: 'custrecord_scv_if_sequence', sort: 'ASC'}, 'custrecord_scv_if_inspec_plan', 'internalid'];
            let s = search.create({
                type: 'customrecord_scv_inspection_field',
                filters: f,
                columns: c
            });
            let cols = s.columns;
            let r = s.run().getRange({start: 0, end: 1000});
            return r.map(o => ({
                description: o.getValue(cols[0]),
                method: o.getValue(cols[1]),
                insMethod: o.getValue(cols[2]),
                sequence: o.getValue(cols[3]),
                insPlan: o.getValue(cols[4]),
                id: o.getValue(cols[5]),
            }));
        }

        const getInspectionNumber = (subsidiary, yearMonth) => {
            let columns = ['custrecord_scv_in_subsidiary_prefix', 'custrecord_scv_in_input_prefix', 'custrecord_scv_in_input_no'];
            let sVN = qaqc.searchInspectionNumber(subsidiary, columns, yearMonth);
            let doc_no = '';
            let doc_number = '';
            if (!sVN) return '';
            doc_no = +sVN.getValue('custrecord_scv_in_input_no') + 1;
            doc_number = sVN.getValue('custrecord_scv_in_subsidiary_prefix') + '.' + sVN.getValue('custrecord_scv_in_input_prefix') + '.' + yearMonth;
            doc_number = doc_number + '.' + lfunc.makePrefix(doc_no, 5, '0');
            record.submitFields({
                type: 'customrecord_scv_inspection_number',
                id: sVN.id,
                values: {custrecord_scv_in_input_no: doc_no},
                options: {enableSourcing: false, ignoreMandatoryFields: true}
            });
            return doc_number;
        }


        return {
            //beforeLoad,
            beforeSubmit,
            afterSubmit
        }

    });
