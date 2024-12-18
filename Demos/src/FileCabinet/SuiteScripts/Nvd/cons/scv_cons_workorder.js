/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  19 Nov 2024         Huy Pham                Init & create file, Sinh số lô tự động trong màn hình WO, from mr.Bính(https://app.clickup.com/t/86cx2y1j1)
*   25 Nov 2024         Khanh Tran              Quản lý Hệ số quy đổi, from mr.Bính(https://app.clickup.com/t/86cx3r94u)
 */
define(['N/search', 'N/record',
    './scv_cons_search.js',
    '../cons/scv_cons_search_wo_revison_qty.js'
],
    function(search, record,
        constSearch, constSearchWORevisonQty
    ) {
        const TYPE = "workorder";
        const FIELD = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        }
    
        const SUBLIST = {
            ITEM: {
                ID: "item",
                TYPE : "transactionline",
                FIELD: {}
            },
        }
    
        const RECORDS = {
        }

        const getDataSource = (_filters) => {
            let resultSearch =  constSearch.createSearchWithFilter({
                type: "workorder",
                filters:
                [
                    
                ],
                columns:
                [
                    "internalid",
                    "tranid", "subsidiary",
                    "location", "assemblyitem"
                ]
            }, _filters);
            
            let arrResult = constSearch.fetchResultSearchRunEach(resultSearch, function(_objTmpl, _column){
                let objResTmpl = constSearch.getObjResultFromSearchByKey(_objTmpl, _column, [
                    "internalid",
                    "tranid", "subsidiary",
                    "location", "assemblyitem"
                ]);

                return objResTmpl;
            });
            
            return arrResult;
        }

        const genQCSerialCode = (curRec) =>{
            let itemSublistId = SUBLIST.ITEM.ID;
            let sizeItemSublist = curRec.getLineCount(itemSublistId);

            let colQCSerialCode = "";

            for(let i = 0; i < sizeItemSublist; i++){
                colQCSerialCode = curRec.getSublistValue(itemSublistId, "custcol_scv_qc_serial_code", i);

                if(!!colQCSerialCode) break;
            }

            if(!colQCSerialCode) return null;

            let bodyQCSerialCode_old = curRec.getValue("custbody_scv_qc_serial_code");
            let bodyQCSerialCode_new = colQCSerialCode.substring(0, 4).padStart(4,"0");

            if(bodyQCSerialCode_old == bodyQCSerialCode_new) return null;

            curRec.setValue("custbody_scv_qc_serial_code", bodyQCSerialCode_new);

            let objRes = {
                custbody_scv_qc_serial_code: bodyQCSerialCode_new
            }

            return objRes;
        }

        const updateQuantitySlItem = (curRec, oldRecord) => {
            let quantity = curRec.getValue('quantity') * 1;
            if(!quantity) return;
    
            let unit_conversion_rate = curRec.getValue('custbody_scv_unit_conversion_rate') * 1;
            if(!unit_conversion_rate || unit_conversion_rate == 1) return;

            if(oldRecord){
                if(quantity == oldRecord.getValue('quantity') && unit_conversion_rate == oldRecord.getValue('custbody_scv_unit_conversion_rate')) return;
            }
      
            let billofmaterialsrevision = curRec.getValue('billofmaterialsrevision');
            if(!billofmaterialsrevision) return;
    
            let arrSS_woRevisonQty = getDataSS_woRevisonQty(billofmaterialsrevision);
            if(arrSS_woRevisonQty.length == 0) return;
    
            let lkBOM = search.lookupFields({type: 'bom', id: billofmaterialsrevision, columns: ['usecomponentyield']});         
            let fieldUpd = 'quantity';
            if(lkBOM.usecomponentyield) fieldUpd = 'bomquantity';
            
            let slItem = 'item';
            for(let i = 0; i < curRec.getLineCount(slItem); i++){
                let use_std_bom_qty = curRec.getSublistValue(slItem, 'custcol_scv_use_std_bom_qty', i);log.error('use_std_bom_qty', use_std_bom_qty)
                let fieldQty = curRec.getSublistValue(slItem, fieldUpd, i);log.error('fieldQty', fieldQty)
                if(use_std_bom_qty) continue;
    
                let item = curRec.getSublistValue(slItem, 'item', i);
                let objSS_woRevisonQty = arrSS_woRevisonQty.find(e => e.key_mapping == billofmaterialsrevision + item);log.error('objSS_woRevisonQty', objSS_woRevisonQty)
                if(!objSS_woRevisonQty) continue;
    
                let val = quantity * unit_conversion_rate * objSS_woRevisonQty.qty;
                curRec.setSublistValue({sublistId: slItem, fieldId: fieldUpd, line: i, value: val});
            }
        }

        const getDataSS_woRevisonQty = (billofmaterialsrevision) => {
            let myFilters = [];
            myFilters.push(
                search.createFilter({name: 'internalid', operator: 'anyof', values: billofmaterialsrevision})
            );
            return constSearchWORevisonQty.getDataSource(myFilters)
        }
    
        return {
            TYPE,
            FIELD,
            SUBLIST,
            RECORDS,
            getDataSource,
            genQCSerialCode,
            updateQuantitySlItem
        };
        
    });
    