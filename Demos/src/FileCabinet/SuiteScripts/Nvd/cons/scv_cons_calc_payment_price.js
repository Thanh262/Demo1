/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  04 Dec 2024         Phu Pham			    Init, create file
 */
define([
    'N/query', 'N/search', 'N/format',
    '../lib/scv_lib_function.js',
    './scv_cons_list_type_phi.js',
    './scv_cons_search_rate_phi.js'
],
    function(
        query, search, format,
        lbf, constTypePhi,
        constSearchRatePhi
    ) {
        const CHARACTER = {
            DOT: ".",
            PIPE: "|",
            MULTIPLICATION: "*",
            IS: "is",
            ANYOF: "anyof",
            HASH: "#",
            EQUAL: "=",
            GREATER_THAN: ">",
            LESS_THAN: "<",
            GREATER_THAN_OR_EQUAL: ">=",
            LESS_THAN_OR_EQUAL: "<=",
            SQUARE_BRACKETS: {
                OPEN: "[",
                CLOSE: "]"
            },
            ROUND_BRACKETS: {
                OPEN: "(",
                CLOSE: ")"
            },
        };

        const THROW_ERROR = {
            "001": "Vui lòng setup công thức tính cho giá trị nhóm!"
        };

        const hanldeCalcPaymentPrice = (soRec) => {
            // get data saved search
            let arrRatePhi = getDataSSRatePhi(soRec);
            // data phi cat
            let arrPhiCat = arrRatePhi.filter(e => e.phan_loai_id == constTypePhi.RECORDS.PHI_CAT.ID && e.chk_total_order === false);
            let arrPhiCatDB = arrRatePhi.filter(e => e.phan_loai_id == constTypePhi.RECORDS.PHI_CAT.ID && e.chk_total_order === true);
            let objCondition = getDataConditionPhiCatDB(arrPhiCatDB);
            let arrCondPhiCatDB = objCondition.arrResult;
            // data sublist item
            let sublistId = "item";
            let arrData = hanldeDataSublistItem(soRec, sublistId, objCondition.itemFields, objCondition.sublistFields);
            // tinh phi cat
            let arrUpdate = hanldeCalculationPhiCat(soRec, arrPhiCat, arrCondPhiCatDB, arrData);
            arrUpdate.sort((a, b) => a.linenumber - b.linenumber);
            log.error("res", arrUpdate);
            // save record
            // let soId = soRec.save({enableSourcing: false, ignoreMandatoryFields: true});
        }

        const hanldeCalculationPhiCat = (soRec, arrPhiCat, arrCondPhiCatDB, arrData) => {
            let arrResult = [];
            let arrCopy = JSON.parse(JSON.stringify(arrData));
            // tinh phi cat dac biet
            for(let objCondPhiCatDB of arrCondPhiCatDB) {
                if(objCondPhiCatDB.arrItemGroup.length > 0 && objCondPhiCatDB.arrSumFormula.length > 0) {
                    let arrGrpData = lbf.onGroupByArray(arrCopy, [...objCondPhiCatDB.arrItemGroup]);
                    
                    let arrItem = getListItemCalcPhiDBWithSumFormula(objCondPhiCatDB, arrGrpData, arrCopy);
                    for (let i = arrCopy.length - 1; i >= 0; i--) {
                        if (arrItem.includes(arrCopy[i].item)) {
                            let phi_cat_db = (arrCopy[i].custcol_scv_bp_rate * parseFloat(objCondPhiCatDB.phi_percent)) + objCondPhiCatDB.phi_amt;
                            arrResult.push({
                                item: arrCopy[i].item,
                                linenumber: arrCopy[i].linenumber,
                                custcol_scv_phi_cat: phi_cat_db
                            });
                            arrCopy.splice(i, 1);
                        }
                    }
                } 
                else if(objCondPhiCatDB.arrCompare.length > 0) {
                    let arrHeader = objCondPhiCatDB.arrCompare.filter(e => !e.join);
                    let arrLineItem = objCondPhiCatDB.arrCompare.filter(e => e.join);

                    let isCompareHeader = compareHeaderPhiCatDB(soRec, arrHeader);
                    if(isCompareHeader === true) {
                        let arrItem = getListItemCalcPhiDacBiet(objCondPhiCatDB, arrLineItem, arrCopy);

                        for (let i = arrCopy.length - 1; i >= 0; i--) {
                            if (arrItem.includes(arrCopy[i].item)) {
                                let phi_cat_db = (arrCopy[i].custcol_scv_bp_rate * parseFloat(objCondPhiCatDB.phi_percent)) + objCondPhiCatDB.phi_amt;
                            
                                arrResult.push({
                                    item: arrCopy[i].item,
                                    linenumber: arrCopy[i].linenumber,
                                    custcol_scv_phi_cat: phi_cat_db
                                });
                                arrCopy.splice(i, 1);
                            }
                        }
                    }
                }
            }
            // tinh phi cat voi conversion_rate = null or = 1
            let arrFilterConvRate = arrCopy.filter(e => !e.custcol_scv_unit_conversion_rate || e.custcol_scv_unit_conversion_rate == 1);
            for(let obj of arrFilterConvRate) {
                arrResult.push({
                    item: obj.item,
                    linenumber: obj.linenumber,
                    custcol_scv_phi_cat: 0
                });
            }
            // tinh phi cat binh thuong
            let arrNewItem = arrCopy.filter(e => !!e.custcol_scv_unit_conversion_rate && e.custcol_scv_unit_conversion_rate !== 1);
            let arrGrpItem = lbf.onGroupByArray(arrNewItem, ["item"]);

            for(let i = 0; i < arrGrpItem.length; i++) {
                let arr_filter_item = arrData.filter(e => e.item == arrGrpItem[i].item);
                let total_qty = arr_filter_item.reduce((a, b) => a + (b.quantity * 1), 0);
                
                let objPhiCat = checkTotalQtyWithinRangePhiCat(total_qty, arrPhiCat);
                if(objPhiCat.internalid) {
                    for(let obj of arr_filter_item) {
                        let phi_cat_db = (obj.custcol_scv_bp_rate * parseFloat(objPhiCat.phi_percent)) + objPhiCat.phi_amt;
                        arrResult.push({
                            item: obj.item,
                            linenumber: obj.linenumber,
                            custcol_scv_phi_cat: phi_cat_db
                        });
                    }
                }
            }
            
            return arrResult;
        }

        const getListItemCalcPhiDBWithSumFormula = (objCondPhiCatDB, arrGrpData, arrData) => {
            let arrItem = [];
            let fields = objCondPhiCatDB.arrSumFormula.map(e => e.field);
            for(let i = 0; i < arrGrpData.length; i++) {
                let arr_filter_item = arrData.filter(e => {
                    return objCondPhiCatDB.arrItemGroup.every(fieldId => e[fieldId] == arrGrpData[i][fieldId]);
                });
                let total_formula = 0;

                for(let j = 0; j < arr_filter_item.length; j++) {
                    total_formula += fields.reduce((a, b) => {
                        return a * (arr_filter_item[j][b] || 0);
                    }, 1);
                }

                let objData = {
                    [objCondPhiCatDB.objOperator.field]: total_formula
                };

                let isCompare = compareData(objCondPhiCatDB.objOperator, objData);
                if(!isCompare) continue;

                let arrItemId = arr_filter_item.map(e => e.item);
                arrItem = [...arrItem, ...arrItemId];
            }
            return arrItem;
        }

        const getListItemCalcPhiDacBiet = (objCondPhiCatDB, arrLineItem, arrData) => {
            let arrGrpItem = lbf.onGroupByArray(arrData, ["item"]);
            let arrItem = [];
            for(let i = 0; i < arrGrpItem.length; i++) {
                let arr_filter_item = arrData.filter(e => e.item == arrGrpItem[i].item);
                let total_qty = arr_filter_item.reduce((a, b) => a + (b.quantity * 1), 0);

                let isInRange = checkWithinRangeQty(total_qty, objCondPhiCatDB.from_qty, objCondPhiCatDB.to_qty);
                if(!isInRange) continue;

                let isValid = comparePhiCatDacBiet(arrLineItem, arr_filter_item[0]);
                if(!isValid) continue;

                arrItem.push(arrGrpItem[i].item);
            }
            return arrItem;
        }

        const comparePhiCatDacBiet = (arrLineItem, objItem) => {
            for(let objSetup of arrLineItem) {
                let isCompare = compareData(objSetup, objItem);
                if(!isCompare) return false;
            }
            return true;
        }

        const compareHeaderPhiCatDB = (soRec, arrHeader) => {
            let objData = {};
            for(let objHeader of arrHeader) {
                objData[objHeader.field] = soRec.getValue(objHeader.field);

                let isCompare = compareData(objHeader, objData);
                if(!isCompare) return false;
            }
            return true;
        }

        const checkWithinRangeQty = (total_qty, from_qty, to_qty) => {
            let isInRange = false;

            let from_qty_num = parseInt(from_qty.replace(/[[(]/, ''));
            let to_qty_num = parseInt(to_qty.replace(/[\])]/, ''));
            let isFromInclusive = from_qty.includes(CHARACTER.SQUARE_BRACKETS.OPEN);
            let isToInclusive = to_qty.includes(CHARACTER.SQUARE_BRACKETS.CLOSE);

            if(!!from_qty && !!to_qty) {
                isInRange = (isFromInclusive ? total_qty >= from_qty_num : total_qty > from_qty_num) &&
                    (isToInclusive ? total_qty <= to_qty_num : total_qty < to_qty_num);
            } else if(!!from_qty) {
                isInRange = (isFromInclusive ? total_qty >= from_qty_num : total_qty > from_qty_num);
            } else if(!!to_qty) {
                isInRange = (isToInclusive ? total_qty <= to_qty_num : total_qty < to_qty_num);
            }
            return isInRange;
        }

        const checkTotalQtyWithinRangePhiCat = (total_qty, arrPhiCat) => {
            let objPhiCat = {};
            for(let i = 0; i < arrPhiCat.length; i++) {
                let isInRange = checkWithinRangeQty(total_qty, arrPhiCat[i].from_qty, arrPhiCat[i].to_qty);
                if(isInRange === true){
                    objPhiCat = arrPhiCat[i];
                    break;
                }
            }
            return objPhiCat;
        }

        const compareData = (objSetup, objData) => {
            let isCompare = false;
            switch (objSetup.operator) {
                case CHARACTER.IS:
                case CHARACTER.ANYOF:
                    var arrValue = objSetup.value.split(CHARACTER.PIPE);
                    isCompare = arrValue.includes(objData[objSetup.field]);
                    break;
                case CHARACTER.EQUAL:
                    var arrValue = objSetup.value.split(CHARACTER.PIPE);
                    arrValue = arrValue.map(number => number * 1);

                    isCompare = arrValue.includes(objData[objSetup.field] * 1);
                    break;
                case CHARACTER.HASH:
                    var arrValue = objSetup.value.split(CHARACTER.PIPE);
                    arrValue = arrValue.map(number => number * 1);

                    isCompare = !arrValue.includes(objData[objSetup.field] * 1);
                    break;
                case CHARACTER.GREATER_THAN: 
                case "&gt;":
                    isCompare = Number(objData[objSetup.field]) > Number(objSetup.value);
                    break;
                case CHARACTER.LESS_THAN:
                case "&lt;":
                    isCompare = Number(objData[objSetup.field]) < Number(objSetup.value);
                    break;
                case CHARACTER.GREATER_THAN_OR_EQUAL: 
                case "&gt;=":
                    isCompare = Number(objData[objSetup.field]) >= Number(objSetup.value);
                    break;
                case CHARACTER.LESS_THAN_OR_EQUAL:
                case "&lt;=":
                    isCompare = Number(objData[objSetup.field]) <= Number(objSetup.value);
                    break;
            }
            return isCompare;
        }

        const getDataConditionPhiCatDB = (arrPhiCatDB) => {
            /**
             * TODO: rules condition
             * ? giá trị nhóm: chỉ group theo thông tin bên trong item
             * ? sum line field: chỉ tính công thức theo field dưới line item và field trong màn hình item (chỉ phép nhân)
             * ? header id: field id trên header của so (không được phép lấy 2 cấp)
             * ? line id: chỉ lấy field trong màn hình item (sublist item)
             * ? so sánh: so sánh giá trị trên so và màn hình setup
             * ? giá trị so sánh: giá trị đc setup sẵn
             * --- logic xử lý---
             * ? nếu có nhiều record setup phí đặc biệt thì thêm điều kiện hoặc
             * ? lấy danh sách field cần sử dụng cho màn hình item từ record setup
             * ? trường hợp giá trị nhóm có data thì chỉ có duy nhất 1 dòng
             * ? nếu [from quantity, to quantity] trên màn hình được nhập phải so sánh với quantity (sublist item)
             */

            let arrResult = [];
            let itemFields = [], sublistFields = [];
            let arrGrpPhiCat = groupDataByFieldId(arrPhiCatDB, "internalid");
            for(let phiCatId of arrGrpPhiCat) {
                let arrFilterPhiCat = arrPhiCatDB.filter(e => e.internalid == phiCatId);
                
                let objRes = {
                    internalid: phiCatId,
                    name: arrFilterPhiCat[0].name,
                    phan_loai_id: arrFilterPhiCat[0].phan_loai_id,
                    phan_loai_nm: arrFilterPhiCat[0].phan_loai_nm,
                    from_qty: arrFilterPhiCat[0].from_qty,
                    to_qty: arrFilterPhiCat[0].to_qty,
                    phi_amt: arrFilterPhiCat[0].phi_amt,
                    phi_percent: arrFilterPhiCat[0].phi_percent,
                    arrCategory: arrFilterPhiCat[0].category_id.split(","),
                    arrItemGroup: [], arrSumFormula: [],
                    arrCompare: []
                };

                for(let objFilter of arrFilterPhiCat) {
                    if(!!objFilter.gia_tri_nhom?.trim()) {
                        let arrGTN = objFilter.gia_tri_nhom.split(CHARACTER.PIPE);
                        arrGTN.forEach(e => {
                            let fieldId = getFieldOnItem(e);
                            if(!!fieldId) {
                                itemFields.push(fieldId);
                                objRes.arrItemGroup.push(fieldId);
                            }
                        });
                        // sum công thức
                        objRes.objOperator = {
                            field: "sumformula",
                            operator: objFilter.so_sanh,
                            value: objFilter.gia_tri_so_sanh
                        };
                        objRes.arrSumFormula = getDataSumFormula(objFilter.sum_line_field, itemFields, sublistFields);
                    }
                    else if(!!objFilter.header_field) {
                        objRes.arrCompare.push({
                            field: objFilter.header_field,
                            operator: objFilter.so_sanh,
                            value: objFilter.gia_tri_so_sanh
                        });
                    } 
                    else if(!!objFilter.line_field) {
                        let parts = objFilter.line_field.split(CHARACTER.DOT);
                        if(parts[0] === "item") {
                            itemFields.push(parts[1]);
                            objRes.arrCompare.push({
                                field: parts[1],
                                join: parts[0],
                                operator: objFilter.so_sanh,
                                value: objFilter.gia_tri_so_sanh
                            });
                        }
                    }
                }
                arrResult.push(objRes);
            }

            itemFields = [...new Set(itemFields)];
            return {arrResult, itemFields, sublistFields};
        }

        const getDataSumFormula = (cong_thuc, itemFields, sublistFields) => {
            if(!cong_thuc) throw THROW_ERROR["001"];

            let arrResult = [];
            let arrCongThuc = cong_thuc.split(CHARACTER.MULTIPLICATION);
            arrCongThuc.forEach(value => {
                let parts = value.split(CHARACTER.DOT);
                if(parts.length === 1) {
                    arrResult.push({
                        field: parts[0]
                    });
                    sublistFields.push(parts[0]);
                } else if(parts.length === 2) {
                    arrResult.push({
                        field: parts[1],
                        join: parts[0]
                    });
                    itemFields.push(parts[1]);
                }
            });
            return arrResult;
        }

        const getFieldOnItem = (value) => {
            let parts = value.split(CHARACTER.DOT);
            if(parts[0] === "item") {
                return parts[1];
            }
            return null;
        }

        const getDataSSRatePhi = (soRec) => {
            let subsidiary_id = soRec.getValue("subsidiary");
            let trandate = soRec.getValue("trandate");
            // filters 
            let myFilters = [];
            myFilters.push(search.createFilter({
                name: 'custrecord_scv_phi_type', operator: 'anyof', 
                values: [constTypePhi.RECORDS.PHI_CAT.ID, constTypePhi.RECORDS.PHI_MOQ.ID]
            }));
            // myFilters.push(search.createFilter({
            //     name: 'custrecord_scv_phi_sum_order', operator: 'is', 
            //     values: 'F'
            // }));

            if(!!subsidiary_id) {
                myFilters.push(search.createFilter({
                    name: 'custrecord_scv_phi_subsidiary', operator: 'anyof', 
                    values: subsidiary_id
                }));
            }
            
            if(!!trandate) {
                trandate = format.format({ value: trandate, type: "date" });

                myFilters.push(search.createFilter({
                    name: 'custrecord_scv_phi_start_date', operator: 'onorbefore', 
                    values: trandate
                }));
                myFilters.push(search.createFilter({
                    name: 'custrecord_scv_phi_end_date', operator: 'onorafter', 
                    values: trandate
                }));
            }

            let arrResult = constSearchRatePhi.getDataSource(myFilters);
            return arrResult;
        }

        const hanldeDataSublistItem = (soRec, sublistId, itemFields, sublistFields) => {
            let arrSublist = getDataSublistItem(soRec, sublistId, sublistFields);

            let arrItemId = groupDataByFieldId(arrSublist, "item");
            let arrItem = getDataItem(arrItemId, itemFields);

            let arrResult = [];
            for(let i = 0; i < arrSublist.length; i++) {
                let obj_find_item = arrItem.find(e => e.id == arrSublist[i].item) || {};
                let { id, ...objData } = obj_find_item;
                let objRes = {
                    ...arrSublist[i],
                    ...objData
                };
                arrResult.push(objRes);
            }
            return arrResult;
        }

        const getDataItem = (arrItemId, arrItemField) => {
            if(arrItemId.length === 0) return [];
            let columns = [
                'id', 'class', 'custitem_scv_color_code', 'custitem_scv_ddsp',
                'custitem_scv_ddn', 'custitem_scv_width', 'custitem_scv_length',
                ...arrItemField,
            ];
            columns = [...new Set(columns)];

            let sqlQuery = `SELECT ${columns.join(', ')} FROM item
		        WHERE id IN ('${arrItemId.join("','")}') AND isinactive = 'F'`;
            
            let resultSearch = query.runSuiteQL({
                query: sqlQuery,
                params: [],
                pageSize: 1000
            });

		    resultSearch = resultSearch.asMappedResults();
		    return resultSearch;
        }

        const getDataSublistItem = (soRec, sublistId, sublistFields) => {
            let arrResult = [];
            let lc = soRec.getLineCount(sublistId);
            let fields = [
                "item", "item_display", "custcol_scv_ori_lineid", "custcol_scv_unit_conversion_rate", 
                "quantity", ...sublistFields
            ];
            fields = [...new Set(fields)];

            for(let i = 0; i < lc; i++) {
                let base_price = soRec.getSublistValue(sublistId, "custcol_scv_bp_rate", i) * 1;
                if(!!base_price) {
                    let obj = {
                        linenumber: i,
                        custcol_scv_bp_rate: base_price
                    };
                    for(let fieldId of fields) {
                        obj[fieldId] = soRec.getSublistValue(sublistId, fieldId, i);
                    }
                    arrResult.push(obj);
                }
            }
            return arrResult;
        }

        const groupDataByFieldId = (data, field) => {
            let objGroup = {};
            for(let i = 0; i < data.length; i++) {
                let fieldValue = data[i][field];
                if(objGroup[fieldValue] === undefined && !!fieldValue) {
                    objGroup[fieldValue] = fieldValue;
                }
            }
            return Object.values(objGroup);
        }

        return {
            hanldeCalcPaymentPrice
        };
        
    });
    