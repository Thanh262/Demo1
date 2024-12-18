define(['N/search', 'N/record'], (search, record) => {
    const CustomFormId = {
        THANH_PHAM_HHTM_NHOM_I: '110',
        THANH_PHAM_CO_KHI_NHOM_II: '415',
        NVL_ACP_AC_LCN_NHOM_III: '526',
        VAT_TU_KY_THUAT_CO_NHOM_IV: '111',
        VAT_TU_KY_THUAT_DIEN_NHOM_V: '521',
        TAI_SAN_KY_THUAT_NHOM_VI: '413',
        VAT_TU_VA_TAI_SAN_KHAC_NHOM_VII: '414'
    };

    function getDataUPCCodeItems(curRecItem) {
        const objDataItemConfig = getDataConfigItem(curRecItem);
        let {
            upccode,
            displayName
        } = getDataUPCCode(objDataItemConfig);
        if (!displayName) displayName = objDataItemConfig.displayname;
        const itemid = upccode + '_' + displayName;
        return {
            upccode: upccode,
            itemid: itemid,
            displayname: displayName
        };
    }

    function validFormGenerateUPCCode(customFormId) {
        return Object.values(CustomFormId).includes(customFormId);
    }

    function isChangeFieldsRelatedWithMakeUPCCode(scriptContext) {
        const triggerType = scriptContext.type;
        if (triggerType === 'create') return true;
        let newRecord = scriptContext.newRecord;
        let oldRecord = scriptContext.oldRecord;
        const customFormId = newRecord.getValue('customform');
        let arrFields = getArrayFields(customFormId, true);
        return arrFields.some(fldId => newRecord.getValue(fldId) !== oldRecord.getValue(fldId));
    }

    function getArrayFields(customform, isFieldChanged =  false) {
        let arrFields;
        switch (customform) {
            case CustomFormId.THANH_PHAM_HHTM_NHOM_I:
                arrFields = [
                    'custitem_scv_group_lv1',
                    'custitem_scv_group_lv2',
                    'custitem_scv_color_code',
                    'custitem_scv_bottom_color_code',
                    'custitem_scv_ddsp',
                    'custitem_scv_ddn',
                    'custitem_scv_width',
                    'custitem_scv_length',
                    'custitem_scv_pbv',
                    'custitem_scv_ls',
                    'custitem_scv_htd',
                    'custitem_scv_kd',
                    'custitem_scv_step',
                    'custitem_scv_last_symbol'
                ];
                break;
            case CustomFormId.THANH_PHAM_CO_KHI_NHOM_II:
                arrFields = [
                    'custitem_scv_group_lv1',
                    'custitem_scv_lr',
                    'custitem_scv_last_symbol'
                ];
                break;
            case CustomFormId.NVL_ACP_AC_LCN_NHOM_III:
                arrFields = [
                    'custitem_scv_group_lv1',
                    'custitem_scv_group_lv2',
                    'custitem_scv_color_code',
                    'custitem_scv_class',
                    'custitem_svc_lkd',
                    'custitem_scv_dd',
                    'custitem_scv_width',
                    'custitem_scv_tcdb',
                    'custitem_scv_width',
                    'custitem_scv_length',
                    'custitem_scv_ls',
                    'custitem_scv_last_symbol'
                ];
                break;
            case CustomFormId.VAT_TU_KY_THUAT_CO_NHOM_IV:
                arrFields = [
                    'custitem_scv_group_lv1',
                    'custitem_scv_group_lv2',
                    'custitem_scv_group_lv3',
                    'custitem_scv_group_lv4',
                    'custitem_scv_dtlv',
                    'custitem_scv_kl',
                    'custitem_scv_lrktc',
                    'custitem_scv_dkn',
                    'custitem_scv_dkt',
                    'custitem_scv_cdlv',
                    'custitem_scv_length',
                    'custitem_scv_width',
                    'custitem_scv_cdz',
                    'custitem_scv_cv',
                    'custitem_scv_sr',
                    'custitem_scv_step',
                    'custitem_scv_last_symbol'
                ];
                break;
            case CustomFormId.VAT_TU_KY_THUAT_DIEN_NHOM_V:
                arrFields = [
                    'custitem_scv_group_lv1',
                    'custitem_scv_group_lv2',
                    'custitem_scv_group_lv3',
                    'custitem_scv_group_lv4',
                    'custitem_scv_sgt',
                    'custitem_scv_kl',
                    'custitem_scv_dkn',
                    'custitem_scv_cdlv',
                    'custitem_scv_width',
                    'custitem_scv_cdz',
                    'custitem_scv_model',
                    'custitem_scv_cs',
                    'custitem_scv_da',
                    'custitem_scv_dda',
                    'custitem_scv_last_symbol',
                ];
                if (!isFieldChanged) arrFields.push('custitem_scv_ttbvcs');
                break;
            case CustomFormId.TAI_SAN_KY_THUAT_NHOM_VI:
                arrFields = [
                    'custitem_scv_group_lv3',
                    'custitem_scv_group_lv4',
                    'custitem_scv_dtlv',
                    'custitem_scv_tt_tan',
                    'custitem_scv_bks',
                    'custitem_scv_dk_mm',
                    'custitem_scv_length',
                    'custitem_scv_da',
                    'custitem_scv_last_symbol',
                ];
                break;
            case CustomFormId.VAT_TU_VA_TAI_SAN_KHAC_NHOM_VII:
                arrFields = [
                    'custitem_scv_group_lv1',
                    'custitem_scv_group_lv2',
                    'custitem_scv_group_lv3',
                    'custitem_scv_group_lv4',
                    'custitem_scv_ktgn',
                    'custitem_scv_ts',
                    'custitem_scv_last_symbol'
                ];
                break;
        }
        return arrFields;
    }

    function getDataConfigItem(curRec) {
        const customform = curRec.getValue('customform');
        const displayName = curRec.getValue('displayname');
        let arrFields = getArrayFields(customform);
        const sizeFields = arrFields.length;
        let objValues = {
            customform: customform,
            displayname: displayName
        };
        let isDynamic = curRec.isDynamic;
        for (let i = 0; i < sizeFields; i++) {
            const objField = curRec.getField(arrFields[i]);
            let val = '';
            if (objField.type === 'select') {
                val = curRec.getValue(arrFields[i]) || '';
                if (val) {
                    val = isDynamic ? curRec.getText(arrFields[i]) : getDataNameOfField(arrFields[i], val);
                }
            } else {
                val = curRec.getValue(arrFields[i]) || '';
            }
            objValues[arrFields[i]] = val;
        }
        return objValues;
    }

    function getDisplayNameVatTuKTDV(objDataConfig) {
        return joinArray([
            extractSuffix(objDataConfig.custitem_scv_group_lv3),
            extractSuffix(objDataConfig.custitem_scv_group_lv4),
            extractSuffix(objDataConfig.custitem_scv_sgt),
            extractPrefix(objDataConfig.custitem_scv_ttbvcs),
            objDataConfig.custitem_scv_kl,
            objDataConfig.custitem_scv_dkn,
            objDataConfig.custitem_scv_cdlv,
            objDataConfig.custitem_scv_width,
            objDataConfig.custitem_scv_cdz,
            objDataConfig.custitem_scv_cs,
            objDataConfig.custitem_scv_da
        ], ' ');
    }

    function getDataUPCCode(objDataConfig) {
        let upccode = '', prefixUPCCode = '', suffixUPCCode = '', displayName = '';
        switch (objDataConfig.customform) {
            case CustomFormId.THANH_PHAM_HHTM_NHOM_I:
                upccode = joinArray([
                    extractPrefix(objDataConfig.custitem_scv_group_lv1),
                    extractPrefix(objDataConfig.custitem_scv_group_lv2),
                    extractPrefix(objDataConfig.custitem_scv_color_code),
                    extractPrefix(objDataConfig.custitem_scv_bottom_color_code),
                    extractPrefix([objDataConfig.custitem_scv_ddsp, objDataConfig.custitem_scv_ddn]),
                    [objDataConfig.custitem_scv_width,objDataConfig.custitem_scv_length].join(''),
                    extractPrefix([objDataConfig.custitem_scv_pbv, objDataConfig.custitem_scv_ls]),
                    extractPrefix([objDataConfig.custitem_scv_htd, objDataConfig.custitem_scv_kd, objDataConfig.custitem_scv_step]),
                    objDataConfig.custitem_scv_last_symbol
                ]);
                break;
            case CustomFormId.THANH_PHAM_CO_KHI_NHOM_II:
                prefixUPCCode = joinArray([
                    extractPrefix(objDataConfig.custitem_scv_group_lv1),
                    extractPrefix(objDataConfig.custitem_scv_lr),
                ]);
                suffixUPCCode = objDataConfig.custitem_scv_last_symbol;
                displayName = extractSuffix(objDataConfig.custitem_scv_lr);
                break;
            case CustomFormId.NVL_ACP_AC_LCN_NHOM_III:
                upccode = joinArray([
                    extractPrefix(objDataConfig.custitem_scv_group_lv1),
                    extractPrefix(objDataConfig.custitem_scv_group_lv2),
                    extractPrefix(objDataConfig.custitem_scv_color_code),
                    extractPrefix([objDataConfig.custitem_scv_class, objDataConfig.custitem_svc_lkd, objDataConfig.custitem_scv_dd, objDataConfig.custitem_scv_ls]),
                    extractPrefix(objDataConfig.custitem_scv_tcdb).concat([objDataConfig.custitem_scv_width, objDataConfig.custitem_scv_length].join('')),
                    objDataConfig.custitem_scv_last_symbol
                ]);
                break;
            case CustomFormId.VAT_TU_KY_THUAT_CO_NHOM_IV:
                prefixUPCCode = joinArray([
                    extractPrefix(objDataConfig.custitem_scv_group_lv1),
                    extractPrefix(objDataConfig.custitem_scv_group_lv2),
                    extractPrefix(objDataConfig.custitem_scv_group_lv3),
                    extractPrefix(objDataConfig.custitem_scv_group_lv4),
                    extractPrefix(objDataConfig.custitem_scv_dtlv),
                    objDataConfig.custitem_scv_kl,
                    objDataConfig.custitem_scv_lrktc,
                    objDataConfig.custitem_scv_dkn,
                    objDataConfig.custitem_scv_dkt,
                    objDataConfig.custitem_scv_cdlv,
                    objDataConfig.custitem_scv_length,
                    objDataConfig.custitem_scv_width,
                    objDataConfig.custitem_scv_cdz,
                    objDataConfig.custitem_scv_cv,
                    objDataConfig.custitem_scv_sr,
                    objDataConfig.custitem_scv_step
                ]);
                suffixUPCCode = extractPrefix(objDataConfig.custitem_scv_last_symbol);
                displayName = joinArray([
                    extractSuffix(objDataConfig.custitem_scv_group_lv3),
                    extractSuffix(objDataConfig.custitem_scv_group_lv4),
                    extractSuffix(objDataConfig.custitem_scv_dtlv),
                    objDataConfig.custitem_scv_kl,
                    objDataConfig.custitem_scv_lrktc,
                    objDataConfig.custitem_scv_dkn,
                    objDataConfig.custitem_scv_dkt,
                    objDataConfig.custitem_scv_cdlv,
                    objDataConfig.custitem_scv_length,
                    objDataConfig.custitem_scv_width,
                    objDataConfig.custitem_scv_cdz
                ], ' ');
                break;
            case CustomFormId.VAT_TU_KY_THUAT_DIEN_NHOM_V:
                prefixUPCCode = joinArray([
                    extractPrefix(objDataConfig.custitem_scv_group_lv1),
                    extractPrefix(objDataConfig.custitem_scv_group_lv2),
                    extractPrefix(objDataConfig.custitem_scv_group_lv3),
                    extractPrefix(objDataConfig.custitem_scv_group_lv4),
                    objDataConfig.custitem_scv_sgt,
                    objDataConfig.custitem_scv_kl,
                    objDataConfig.custitem_scv_dkn,
                    objDataConfig.custitem_scv_cdlv,
                    objDataConfig.custitem_scv_width,
                    objDataConfig.custitem_scv_cdz,
                    objDataConfig.custitem_scv_model,
                    objDataConfig.custitem_scv_cs,
                    objDataConfig.custitem_scv_da,
                    objDataConfig.custitem_scv_dda
                ]);
                suffixUPCCode = extractPrefix(objDataConfig.custitem_scv_last_symbol);
                displayName = getDisplayNameVatTuKTDV(objDataConfig);
                break;
            case CustomFormId.TAI_SAN_KY_THUAT_NHOM_VI:
                prefixUPCCode = joinArray([
                    extractPrefix(objDataConfig.custitem_scv_group_lv3),
                    extractPrefix(objDataConfig.custitem_scv_group_lv4),
                    extractPrefix(objDataConfig.custitem_scv_dtlv),
                    objDataConfig.custitem_scv_tt_tan,
                    objDataConfig.custitem_scv_bks,
                    objDataConfig.custitem_scv_dk_mm,
                    objDataConfig.custitem_scv_length,
                    objDataConfig.custitem_scv_da
                ]);
                suffixUPCCode = extractPrefix(objDataConfig.custitem_scv_last_symbol);
                displayName = joinArray([
                        extractSuffix(objDataConfig.custitem_scv_group_lv3),
                        extractSuffix(objDataConfig.custitem_scv_group_lv4),
                        extractSuffix(objDataConfig.custitem_scv_dtlv),
                        objDataConfig.custitem_scv_tt_tan,
                        objDataConfig.custitem_scv_bks,
                        objDataConfig.custitem_scv_dk_mm,
                        objDataConfig.custitem_scv_length,
                        objDataConfig.custitem_scv_da
                    ]
                    , ' ');
                break;
            case CustomFormId.VAT_TU_VA_TAI_SAN_KHAC_NHOM_VII:
                upccode = joinArray([
                    extractPrefix(objDataConfig.custitem_scv_group_lv1),
                    extractPrefix(objDataConfig.custitem_scv_group_lv2),
                    extractPrefix(objDataConfig.custitem_scv_group_lv3),
                    extractPrefix(objDataConfig.custitem_scv_group_lv4),
                    extractPrefix(objDataConfig.custitem_scv_ktgn),
                    objDataConfig.custitem_scv_ts,
                    objDataConfig.custitem_scv_last_symbol
                ]);
                break;
        }
        if (upccode.length > 0) {
            const upcCodeItemDataId = createRecordDataUPCCodeItem(upccode, '', '');
            return {
                upccode: upccode,
                displayName: displayName,
                upcCodeItemDataId: upcCodeItemDataId
            };
        }
        const objData = {
            prefix: prefixUPCCode,
            suffix: suffixUPCCode,
            delimiterBeforeNumber: '.',
            delimiterAfterNumber: '.',
            digit: 1
        };
        const maxNumber = getNextMaxNumberByPrefix({prefix: objData.prefix});
        upccode = generateUPCCodeItem(objData, maxNumber);
        return {
            upccode: upccode,
            displayName: displayName
        };
    }

    function generateUPCCodeItem(objDataConfig, maxNumber, counter = 1) {
        if (counter === 5) return 'notfoundupccode';
        const upccode = getUPCCodeItem(objDataConfig, maxNumber);
        if (createRecordDataUPCCodeItem(upccode, objDataConfig.prefix, maxNumber)) {
            return upccode
        } else {
            return generateUPCCodeItem(objDataConfig, maxNumber + 1, counter + 1);
        }
    }

    function createRecordDataUPCCodeItem(upccode, prefix, maxNumber) {
        try {
            let rec = record.create({type: 'customrecord_scv_dt_upccode_item'});
            rec.setValue({fieldId: 'externalid', value: upccode});
            rec.setValue({fieldId: 'name', value: upccode});
            rec.setValue({fieldId: 'custrecord_dt_upc_it_prefix', value: prefix});
            rec.setValue({fieldId: 'custrecord_dt_upc_it_number', value: maxNumber});
            return rec.save({ignoreMandatoryFields: true});
        } catch (e) {
            log.error('error '.concat(upccode), e);
            return null;
        }
    }

    function getUPCCodeItem(objDataConfig, maxNumber) {
        const delimiterBeforeNumber = objDataConfig.delimiterBeforeNumber;
        const delimiterAfterNumber = objDataConfig.delimiterAfterNumber;
        let upccode = [
            objDataConfig.prefix,
            maxNumber.toString().padStart(objDataConfig.digit, '0'),
        ]
            .join(delimiterBeforeNumber);
        if (objDataConfig.suffix) {
            upccode += delimiterAfterNumber + objDataConfig.suffix;
        }
        return upccode;
    }

    function getNextMaxNumberByPrefix(objData) {
        const prefix = objData.prefix;
        let searchObj = search.create({
            type: 'customrecord_scv_dt_upccode_item',
            columns: [
                search.createColumn({
                    name: 'custrecord_dt_upc_it_number',
                    summary: 'MAX'
                }),
                search.createColumn({
                    name: 'custrecord_dt_upc_it_prefix',
                    summary: 'GROUP'
                })
            ],
            filters: [
                search.createFilter({
                    name: 'custrecord_dt_upc_it_prefix',
                    operator: search.Operator.IS,
                    values: prefix
                })
            ]
        });
        let cols = searchObj.columns;
        let searchData = searchObj.run().getRange(0, 1);
        if (searchData.length) {
            const maxNumber = searchData[0].getValue(cols[0]) * 1 || 0;
            return maxNumber + 1;
        }
        return 1;
    }

    function joinArray(arr, char = '.') {
        const lc = arr.length;
        let str = '';
        for (let i = 0; i < lc; i++) {
            if (!isValidValue(arr[i])) continue;
            str += arr[i] + char;
        }
        const lenChar = char.length;
        if (lenChar === 0) return str;
        return str.substring(0, str.length - lenChar);
    }

    function extractPrefix(word, char = ':') {
        if (Array.isArray(word)) {
            let str = '';
            for (let i = 0; i < word.length; i++) {
                str += extractPrefix(word[i].toString(), char);
            }
            return str.trim();
        } else {
            if (!isValidValue(word)) return '';
            const indexChar = word.indexOf(char);
            if (indexChar === -1) return word;
            return word.substring(0, indexChar).trim();
        }
    }

    function extractSuffix(word, char = ':') {
        if (Array.isArray(word)) {
            let str = '';
            for (let i = 0; i < word.length; i++) {
                str += extractSuffix(word[i], char);
            }
            return str.trim();
        } else {
            if (!isValidValue(word)) return '';
            const lastIndexChar = word.lastIndexOf(char);
            if (lastIndexChar === -1) return word;
            return word.substring(lastIndexChar + 1).trim();
        }
    }

    function isValidValue(value) {
        return value !== '' && value !== undefined && value !== null;
    }

    function getRecordTypeOfField(fieldId) {
        let recordType = '';
        switch (fieldId) {
            case 'custitem_scv_group_lv1':
            case 'custitem_scv_group_lv2':
            case 'custitem_scv_group_lv3':
            case 'custitem_scv_group_lv4':
                recordType = 'customrecord_scv_group_level';
                break;
            case 'custitem_scv_bottom_color_code':
            case 'custitem_scv_color_code':
                recordType = 'customrecord_scv_color_code_list';
                break;
            case 'custitem_scv_ddsp':
                recordType = 'customlist_scv_ddsp_list';
                break;
            case 'custitem_scv_ddn':
                recordType = 'customlist_scv_ddn_list';
                break;
            case 'custitem_scv_pbv':
                recordType = 'customlist_svc_pbv_list';
                break;
            case 'custitem_scv_ls':
                recordType = 'customlist_scv_ls_list';
                break;
            case 'custitem_scv_kd':
                recordType = 'customlist_scv_kd_list';
                break;
            case 'custitem_scv_htd':
                recordType = 'customlist_scv_htd_list';
                break;
            case 'custitem_scv_lr':
                recordType = 'customlist_scv_lr_list';
                break;
            case 'custitem_scv_class':
                recordType = 'customlist_svc_nhom_nvl_list';
                break;
            case 'custitem_svc_lkd':
                recordType = 'customlist_scv_lkd_list';
                break;
            case 'custitem_scv_dd':
                recordType = 'customlist_scv_dd_list';
                break;
            case 'custitem_scv_tcdb':
                recordType = 'customlist_scv_tcdb_list';
                break;
            case 'custitem_scv_dtlv':
                recordType = 'customlist_scv_dm_dtlv';
                break;
            default:
        }
        return recordType;
    }

    function getDataNameOfField(fieldId, id) {
        if (!id) return '';
        const recordType = getRecordTypeOfField(fieldId);
        if (!recordType) {
            log.error('Error getRecordTypeOfField', fieldId);
            return '';
        }
        let arrFields = ['name'];
        if (recordType === 'customrecord_scv_group_level') {
            arrFields.push('parent');
        }
        let lkRecord = search.lookupFields({
            type: recordType,
            id: id,
            columns: arrFields
        });
        let name = lkRecord.name || '';
        if (arrFields.length >1 ) {
            let nameParent = lkRecord.parent?.[0]?.text || '';
            if (nameParent.length > 0) {
                name = name.substring(nameParent.length + 2).trim();
            }
        }
        return name;
    }

    function getNewDisplayName(newRecord, oldRecord) {
        let result = {
            isChanged : false,
            displayName : ''
        };
        const customFormId = newRecord.getValue('customform');
        if (customFormId === CustomFormId.VAT_TU_KY_THUAT_DIEN_NHOM_V) {
            const isChangedFieldsTenTuyBien = newRecord.getValue('custitem_scv_ttbvcs') !== oldRecord.getValue('custitem_scv_ttbvcs');
            if (isChangedFieldsTenTuyBien) {
                return {
                    displayName : getDisplayNameVatTuKTDV(getDataConfigItem(newRecord)),
                    isChanged: true
                }
            }
        }

        let isChangedDisplay = newRecord.getValue('displayname') !== oldRecord.getValue('displayname');
        if (isChangedDisplay) return Object.assign(result, {
            idChanged : true,
            displayName : newRecord.getValue('displayname')
        });
        return result;
    }

    return {
        getDataUPCCodeItems: getDataUPCCodeItems,
        validFormGenerateUPCCode: validFormGenerateUPCCode,
        isChangeFieldsRelatedWithMakeUPCCode : isChangeFieldsRelatedWithMakeUPCCode,
        getNewDisplayName : getNewDisplayName
    }
});
