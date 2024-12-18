/**
 * @NApiVersion 2.1
 * @NScriptType MassUpdateScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', '../olib/lodash.min'],

    (record, search, _) => {

        /**
         * Definition of Mass Update trigger point.
         *
         * @param {Object} params
         * @param {string} params.type - Record type of the record being processed by the mass update
         * @param {number} params.id - ID of the record being processed by the mass update
         *
         * @since 2016.1
         */
        const each = (params) => {
            eachProcess(params);
        }

        /**
         * @param {Object} params
         * @param {string} params.type - Record type of the record being processed by the mass update
         * @param {number} params.id - ID of the record being processed by the mass update
         */
        const eachProcess = (params) => {
            try {
                let newRecord = record.load({type: params.type, id: params.id});
                let slInvt = 'inventory';
                let lcInvt = newRecord.getLineCount(slInvt);
                let listXuatItem = [];
                for (let i = 0; i < lcInvt; i++) {
                    let obj = {};
                    obj.item = newRecord.getSublistValue({sublistId: slInvt, fieldId: 'item', line: i});
                    obj.quantiy = newRecord.getSublistValue({sublistId: slInvt, fieldId: 'adjustqtyby', line: i}) * 1;
                    obj.unitcost = newRecord.getSublistValue({sublistId: slInvt, fieldId: 'unitcost', line: i}) * 1;
                    obj.line = i;
                    if (obj.quantiy < 0)
                        listXuatItem.push(obj);
                }
                let updateFlag = false;
                for (let i = 0; i < lcInvt; i++) {
                    let item = newRecord.getSublistValue({sublistId: slInvt, fieldId: 'item', line: i});
                    let quantiy = newRecord.getSublistValue({sublistId: slInvt, fieldId: 'adjustqtyby', line: i}) * 1;
                    //Tim Nhap Item
                    if (quantiy > 0) {
                        let findXuatItem = _.find(listXuatItem, {item: item});
                        if (!_.isEmpty(findXuatItem)) {//Found
                            newRecord.setSublistValue({
                                sublistId: slInvt,
                                fieldId: 'unitcost',
                                line: i,
                                value: findXuatItem.unitcost
                            });
                            updateFlag = true;
                        }
                    }
                }
                if (updateFlag)
                    newRecord.save({enableSourcing: false, ignoreMandatoryFields: true});

            } catch (e) {
                log.error('eachProcess error', JSON.stringify(e));
            }
        }

        return {
            each
        };

    });
