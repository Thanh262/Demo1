define(['N/record', 'N/search', './scv_lib_function'],

    function (record, search, libFn) {

        const CustomRecordStatus = {
            APPROVED: '5',
        };
        const CustomRecordType = {
            INBOUND_INSPECTION_RESULT: 'customrecord_scv_inspection_result_tb',
            MFG_INSPECTION_RESULTS: 'customrecord_scv_inspection_reswo_tb'
        };
        const CustomOrderTypeId = {
            CHUYEN_TP_KIEM_TRA_CHAT_LUONG: '41'
        };

        function setDataLotNumberRecordFromOriginRecord(recordType, id) {
            let curRec = record.load({type: recordType, id: id});
            if (!validateRunProcessUpdateLotNumber(curRec)) return;
            const objFieldsConfig = getObjFields(recordType);
            if (objFieldsConfig === undefined) return;
            const objDataRecord = getDataConfigRecord(curRec, objFieldsConfig);
            if (!libFn.isContainValue(objDataRecord.body?.[objFieldsConfig.fieldIdLotNum])) return;
            const objDataUpd = getDataLotNumberRecord(objDataRecord);
            record.submitFields({
                type: record.Type.INVENTORY_NUMBER,
                id: objDataRecord.body[objFieldsConfig.fieldIdLotNum],
                values: objDataUpd,
                options: {
                    ignoreMandatoryFields: true
                }
            });
        }

        function validateRunProcessUpdateLotNumber(curRec) {
            const recordType = curRec.type;
            if (recordType === CustomRecordType.INBOUND_INSPECTION_RESULT) {
                const idPO = curRec.getValue('custrecord_scv_irt_receipt_from');
                const idIR = curRec.getValue('custrecord_scv_irt_receipt_no');
                const statusId = curRec.getValue('custrecord_scv_inbound_qa_approval_statu');
                const lotNumId = curRec.getValue('custrecord_scv_irt_inentory_number');
                const objLotNum = getObjDataLotNum(lotNumId);
                return libFn.getTranRecordType(idPO) === record.Type.PURCHASE_ORDER
                    && libFn.getTranRecordType(idIR) === record.Type.ITEM_RECEIPT
                    && statusId === CustomRecordStatus.APPROVED
                    && !!lotNumId
                    && !objLotNum.custitemnumber_scv_inspection_number
            } else {
                const createFromId = curRec.getValue('custrecord_scv_irwt_workorder');
                if (!createFromId) return false;
                const createdFromRecordType = libFn.getTranRecordType(createFromId);
                if ([record.Type.ASSEMBLY_BUILD, record.Type.ITEM_RECEIPT].indexOf(createdFromRecordType) === -1) return false;
                const statusId = curRec.getValue('custrecord_scv_irwt_qa_approval_status');
                const lotNumId = curRec.getValue('custrecord_scv_mfg_inspect_qty_abs_lot');
                const objLotNum = getObjDataLotNum(lotNumId);
                if (createdFromRecordType === record.Type.ITEM_RECEIPT) {
                    let lkIR = search.lookupFields({
                        type: record.Type.ITEM_RECEIPT,
                        id: createFromId,
                        columns: ['custbody_scv_order_type']
                    });
                    const blChuyenTPKTChatLuong = lkIR.custbody_scv_order_type?.[0]?.value === CustomOrderTypeId.CHUYEN_TP_KIEM_TRA_CHAT_LUONG;
                    if (!blChuyenTPKTChatLuong) return;
                }
                return statusId === CustomRecordStatus.APPROVED
                    && !!lotNumId
                    && !objLotNum.custitemnumber_scv_inspection_number
            }
            return false;
        }

        function getObjDataLotNum(id) {
            if (!id) return;
            let lkLotNum = search.lookupFields({
                type: search.Type.INVENTORY_NUMBER,
                id: id,
                columns: ['custitemnumber_scv_inspection_number']
            });
            return {
                custitemnumber_scv_inspection_number: lkLotNum?.custitemnumber_scv_inspection_number || ''
            };
        }

        function getObjFields(recType) {
            const objFields = {
                [CustomRecordType.INBOUND_INSPECTION_RESULT]: {
                    fieldIdLotNum: 'custrecord_scv_irt_inentory_number',
                    body: [
                        'custrecord_scv_irt_inentory_number',
                        'custrecord_scv_color_id',
                        'custrecord_scv_qc_number',
                        'name'
                    ]
                },
                [CustomRecordType.MFG_INSPECTION_RESULTS]: {
                    fieldIdLotNum: 'custrecord_scv_mfg_inspect_qty_abs_lot',
                    body: [
                        'custrecord_scv_mfg_inspect_qty_abs_lot',
                        'custrecord_scv_mfg_seri_color',
                        'custrecord_scv_irwt_doc_num',
                        'name'
                    ]
                }
            }
            return objFields[recType];
        }

        function getDataLotNumberRecord(objData) {
            const {
                body,
                recordType
            } = objData;
            let objDataUpd = {};
            switch (recordType) {
                case CustomRecordType.INBOUND_INSPECTION_RESULT:
                    Object.assign(objDataUpd, {
                        custitemnumber_scv_item_num_color_seri: body.custrecord_scv_color_id,
                        custitemnumber_scv_qc_manual_number: body.custrecord_scv_qc_number,
                        custitemnumber_scv_inspection_number: body.name,
                    });
                    break;
                case CustomRecordType.MFG_INSPECTION_RESULTS:
                    Object.assign(objDataUpd, {
                        custitemnumber_scv_item_num_color_seri: body.custrecord_scv_mfg_seri_color,
                        custitemnumber_scv_qc_manual_number: body.custrecord_scv_irwt_doc_num,
                        custitemnumber_scv_inspection_number: body.name,
                    });
                    break;
            }
            return objDataUpd;
        }

        function getDataConfigRecord(curRec, objFieldsConfig) {
            const {body} = objFieldsConfig;
            const objDataBody = getDataFieldsHeaderRecord(curRec, body);
            return {
                recordType: curRec.type,
                body: objDataBody
            };
        }

        function getDataFieldsHeaderRecord(curRec, arrFields) {
            const sizeFields = arrFields.length;
            let objData = {};
            for (let i = 0; i < sizeFields; i++) {
                objData[arrFields[i]] = curRec.getValue(arrFields[i]) || '';
            }
            return objData;
        }

        /**
         * Des: Post from Transaction
         * @param options
         * @returns {{msg: string, response: null, error: null, isSuccess: boolean}}
         */
        function setDataMultiLotNumber(options) {
            let results = {isSuccess: true, response: null, error: null, msg: ''};
            try {
                const recordid = options.recordid;
                const recordtype = options.recordtype;
                let curRec = record.load({type: recordtype, id: recordid});
                const objConfigFields = getFieldsConfig(recordtype);
                setInformationMultiLot({
                    curRec: curRec,
                    objConfigFields: objConfigFields,
                });
            } catch (e) {
                results.error = e.name + ' : ' + e.message;
                results.isSuccess = false;
                log.error('Error setDataMultiLotNumber: ', e);
            }
            return results;
        }

        /**
         * Des : Get fields config
         * @param recType
         * @returns {{FIELD_LINE: *[], FIELD_HEADER_CHANGE: *[], FIELD_HEADER: *[], FIELD_LINE_CHANGE: *[]}}
         */
        function getFieldsConfig(recType) {
            let result = {
                FIELD_HEADER: [],
                FIELD_HEADER_CHANGE: [],
                FIELD_LINE: [],
                FIELD_LINE_CHANGE: []
            };
            switch (recType) {
                case record.Type.ITEM_RECEIPT:
                    result.FIELD_HEADER = ['trandate'];
                    result.FIELD_HEADER_CHANGE = ['trandate'];
                    result.FIELD_LINE = ['item'];
                    result.FIELD_LINE_CHANGE = [];
                    break;
                default:
                    break;
            }
            return result;
        }

        function setDataTransactionToInventoryNumber(scriptContext) {
            const triggerType = scriptContext.type;
            if (triggerType !== 'create' && triggerType !== 'edit') return;
            let curRec = scriptContext.newRecord;
            const recType = curRec.type;
            let newRecord = record.load({type: curRec.type, id: curRec.id});
            if (recType === record.Type.ITEM_RECEIPT) {
                if (!isCheckCreatedFromTrans(newRecord, [record.Type.PURCHASE_ORDER])) return;
            }
            const objConfigFields = getFieldsConfig(curRec.type);
            if (triggerType === 'edit' && !isUpdateDataWhenAddNewOrRemoveLineInvDetail({
                newRecord: newRecord,
                oldRecord: scriptContext.oldRecord
            })) {
                if (!isFieldChangedDataToUpdWhenEdit({
                    newRecord: newRecord,
                    oldRecord: scriptContext.oldRecord,
                    listFieldsHeader: objConfigFields.FIELD_HEADER_CHANGE,
                    listFieldsLine: objConfigFields.FIELD_LINE_CHANGE
                })) return;
            }
            setInformationMultiLot({
                curRec: newRecord,
                objConfigFields: objConfigFields,
            });
        }

        function setInformationMultiLot(options) {
            const curRec = options.curRec;
            const objConfigFields = options.objConfigFields;
            const recType = curRec.type;
            const arrayDataLine = getElementDataSublistHaveInvDetail(curRec, objConfigFields.FIELD_LINE);
            if (arrayDataLine.length < 1) return;
            const listItemId = arrayDataLine.map(o => o.item);
            const objDataInItem = getElementDataInItem(listItemId, []);
            const objDataHeader = getDataHeader(curRec, objConfigFields.FIELD_HEADER);
            const arrInvLot = [];
            setDataInventoryNumber({
                objDataInItem: objDataInItem,
                arrayDataLine: arrayDataLine,
                objDataHeader: objDataHeader,
                arrInvLot: arrInvLot,
                recType: recType
            });
        }

        /**
         * Check created from transaction: PO
         * @param curRec {object}
         * @param listCreatedFromTrans {array}
         * @returns {boolean}
         */
        function isCheckCreatedFromTrans(curRec, listCreatedFromTrans) {
            const createdFromTransId = curRec.getValue('createdfrom');
            if (!createdFromTransId) return false;
            const recordType = search.lookupFields({
                type: 'transaction',
                id: createdFromTransId,
                columns: ['recordtype']
            })?.recordtype || '';
            return listCreatedFromTrans.indexOf(recordType) !== -1;
        }

        /**
         * Check add Line or Remove Line Inv Number
         * @param options
         * @returns {boolean}
         */
        function isUpdateDataWhenAddNewOrRemoveLineInvDetail(options) {
            const triggerType = options.triggerType;
            if (triggerType !== 'edit') return true;
            const newRecord = options.newRecord || {};
            const oldRecord = options.oldRecord || {};
            const arrayInvNumberNew = getElementDataSublistHaveInvDetail(newRecord, ['item']).map(o => o.invNumId);
            const arrayInvNumberIdOld = getElementDataSublistHaveInvDetail(oldRecord, ['item']).map(o => o.invNumId);
            const isLineEqual = arrayInvNumberNew.length === arrayInvNumberIdOld.length;
            const isNotCtrNewInvNumber = arrayInvNumberNew.every(id => arrayInvNumberIdOld.indexOf(id) !== -1);
            return !isLineEqual || !isNotCtrNewInvNumber;
        }

        /**
         * Des : Check Field changed data field when edit field
         * @param options.newRecord {object}
         * @param options.oldRecord {object}
         * @param options.listFieldsHeader {array}
         * @param options.listFieldsLine {array}
         * @returns {boolean}
         */
        function isFieldChangedDataToUpdWhenEdit(options) {
            const newRecord = options.newRecord || {};
            const oldRecord = options.oldRecord || {};
            if (isCheckChangeDataFieldHeader({
                newRecord: newRecord,
                oldRecord: oldRecord,
                fieldHeaders: options.listFieldsHeader
            })) return true;
            else if (isCheckChangeDataFieldLine({
                newRecord: newRecord,
                oldRecord: oldRecord,
                fieldLines: options.listFieldsLine

            })) return true;
            return false;
        }

        /**
         * Check if the data in the header has been change
         * @param options
         * @param {object} options.newRecord - The new record object.
         * @param {object} options.oldRecord - The old record object.
         * @param {array} options.fieldHeaders - The array of field headers.
         * @returns {boolean}
         * */
        function isCheckChangeDataFieldHeader(options) {
            const newRecord = options.newRecord;
            const oldRecord = options.oldRecord;
            const fieldHeaders = options.fieldHeaders;
            let isUpd = false;
            const lengthFieldHeader = fieldHeaders.length;
            for (let i = 0; i < lengthFieldHeader; i++) {
                const fieldName = fieldHeaders[i];
                const valueOld = oldRecord.getValue(fieldName);
                const valueNew = newRecord.getValue(fieldName);
                if (valueOld !== valueNew) {
                    isUpd = true;
                    break;
                }
            }
            return isUpd;
        }

        /**
         * Check if the data in the Sublist has been change
         * @param options
         * @param {object} options.newRecord - The new record object.
         * @param {object} options.oldRecord - The old record object.
         * @param {string} options.sublistID - The sublist ID.
         * @param {array} options.fieldLines - The array of field lines.
         * @returns {boolean}
         * */
        function isCheckChangeDataFieldLine(options) {
            const newRecord = options.newRecord;
            const fieldLines = options.fieldLines
            const oldRecord = options.oldRecord;
            const sublistID = options.sublistID;
            let isUpd = false;
            const lengthFieldLine = fieldLines.length;
            const lineCount = newRecord.getLineCount({sublistId: sublistID});
            for (let line = 0; line < lineCount; line++) {
                for (let i = 0; i < lengthFieldLine; i++) {
                    const sublistFieldName = fieldLines[i];
                    const valueOld = oldRecord.getSublistValue({
                        sublistId: sublistID,
                        fieldId: sublistFieldName,
                        line: line
                    });
                    const valueNew = newRecord.getSublistValue({
                        sublistId: sublistID,
                        fieldId: sublistFieldName,
                        line: line
                    });
                    if (valueOld !== valueNew) {
                        isUpd = true;
                        break;
                    }
                }
            }
            return isUpd;
        }


        function setDataInventoryNumber(options) {
            // const objDataInItem = options.objDataInItem;
            const arrayDataLine = options.arrayDataLine;
            const objDataHeader = options.objDataHeader;
            // const arrInvLot = options.arrInvLot;
            const recType = options.recType;
            const listIdInvNumber = arrayDataLine.length;
            for (let i = 0; i < listIdInvNumber; i++) {
                const objDataLine = arrayDataLine[i];
                const invNumberId = objDataLine.invNumId;
                // const itemId = objDataLine.itemId;
                // const objDataItem = objDataInItem[itemId];
                const objUpd = {};
                if (recType === record.Type.ITEM_RECEIPT) {
                    Object.assign(objUpd, {custitemnumber_scv_import_date: objDataHeader.trandate || ''});
                }
                if (Object.keys(objUpd).length) {
                    record.submitFields({
                        type: record.Type.INVENTORY_NUMBER,
                        id: invNumberId,
                        values: objUpd,
                        options: {enableSourcing: false, ignoreMandatoryFields: true}
                    });
                }
            }
        }

        function getDataHeader(curRec, arrayFields) {
            const results = {internalid: curRec.id};
            if (arrayFields.length === 0) return results;
            const lengthFields = arrayFields.length;
            for (let i = 0; i < lengthFields; i++) {
                const objField = curRec.getField(arrayFields[i]);
                if (typeof objField === 'undefined') continue;
                results[arrayFields[i]] = curRec.getValue(arrayFields[i]);
                if (objField.type === 'date') results[arrayFields[i] + '_text'] = (!!results[arrayFields[i]]) ? curRec.getText(arrayFields[i]) : '';
            }
            return results;
        }

        function getElementDataInItem(arrayItemId, arrayColumns) {
            if (arrayColumns.length === 0) return {};
            const arrayColumnsTemp = JSON.parse(JSON.stringify(arrayColumns));
            const filterSS = [["internalid", "anyof", arrayItemId]]
            let searchObj = search.create({type: search.Type.ITEM, filters: filterSS, columns: arrayColumns});
            let searchResult = searchObj.run().getRange({start: 0, end: 1000});
            const lengthResult = searchResult.length;
            const resultsObjItem = {};
            const lengthColumn = arrayColumns.length;
            for (let i = 0; i < lengthResult; i++) {
                let obj = {};
                const itemId = searchResult[i].id;
                for (let j = 0; j < lengthColumn; j++) {
                    obj[arrayColumnsTemp[j]] = searchResult[i].getValue(arrayColumns[j]);
                }
                resultsObjItem[itemId] = obj;
            }
            return resultsObjItem;
        }

        function getElementDataSublistHaveInvDetail(curRec, arrayField) {
            if (arrayField.length === 0) return [];
            const results = [];
            const sublistId = getSublistId(curRec.type);
            const lineCount = curRec.getLineCount({sublistId: sublistId});
            for (let i = 0; i < lineCount; i++) {
                if (!haveInvDetail(curRec, sublistId, i)) continue;
                if (!isUseCaseUpdLotNumOnInvAss(curRec, sublistId, i)) continue;
                const objLineItem = getDataValueLine(curRec, sublistId, arrayField, i);
                const resultDataInvAssignment = getInventoryAssignment(curRec, sublistId, objLineItem.item, i);
                const arrayData = resultDataInvAssignment.map(obj => ({...obj, ...objLineItem}))
                results.push(...arrayData);
            }
            return results;
        }

        function getInventoryAssignment(curRec, sublistId, itemId, line) {
            const slDetId = 'inventoryassignment'
            const invDetSubRecord = curRec.getSublistSubrecord({
                sublistId: sublistId,
                fieldId: 'inventorydetail',
                line: line
            });
            const resultsDataInvAssignment = [];
            const lineCountInvAss = invDetSubRecord.getLineCount({sublistId: slDetId});
            for (let j = 0; j < lineCountInvAss; j++) {
                const invNumId = invDetSubRecord.getSublistValue({
                    sublistId: slDetId,
                    fieldId: 'numberedrecordid',
                    line: j
                });
                const issueinventorynumber = invDetSubRecord.getSublistValue({
                    sublistId: slDetId,
                    fieldId: 'issueinventorynumber',
                    line: j
                });
                const receiptinventorynumber = invDetSubRecord.getSublistValue({
                    sublistId: slDetId,
                    fieldId: 'receiptinventorynumber',
                    line: j
                });
                if (invNumId) {
                    resultsDataInvAssignment.push({
                        invNumId: invNumId,
                        itemId: itemId,
                        issueinventorynumber: issueinventorynumber,
                        receiptinventorynumber: receiptinventorynumber
                    });
                }
            }
            return resultsDataInvAssignment;
        }

        function getDataValueLine(curRec, sublistId, arrayField, line) {
            return arrayField.reduce((obj, fieldId) => {
                const objField = curRec.getSublistField({sublistId: sublistId, fieldId: fieldId, line: line});
                if (typeof objField !== "undefined") {
                    obj[fieldId] = curRec.getSublistValue({sublistId: sublistId, fieldId: fieldId, line: line});
                }
                return obj
            }, {});
        }

        function haveInvDetail(curRec, sublistId, line) {
            return !!curRec.getSublistValue({sublistId: sublistId, fieldId: 'inventorydetail', line: line});
        }


        function isUseCaseUpdLotNumOnInvAss(curRec, sublistId, line) {
            const recType = curRec.type;
            if (recType !== record.Type.INVENTORY_ADJUSTMENT) return true;
            let qty = curRec.getSublistValue({sublistId: sublistId, fieldId: 'adjustqtyby', line: line,}) * 1;
            return qty > 0;
        }

        function getSublistId(recType) {
            if (recType === record.Type.ITEM_RECEIPT) {
                return 'item';
            } else if (recType === record.Type.INVENTORY_ADJUSTMENT) {
                return 'inventory';
            }
        }

        return {
            setDataTransactionToInventoryNumber,
            setDataMultiLotNumber,
            setDataLotNumberRecordFromOriginRecord
        };
    });
