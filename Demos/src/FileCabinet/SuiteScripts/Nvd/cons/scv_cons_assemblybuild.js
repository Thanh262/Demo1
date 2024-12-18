/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  22 Nov 2024         Huy Pham                Init, create file, Tính toán phân bổ trọng lượng nâng hạ trong sản xuất, from mr.Bính(https://app.clickup.com/t/86cx40ye7)
 */
define(['N/search', 'N/record',
    './scv_cons_search.js'
],
    function(search, record,
        constSearch
    ) {
        const TYPE = "assemblybuild";
        const FIELD = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        }
    
        const SUBLIST = {
            COMPONENT: {
                ID: "component",
                TYPE : "transactionline",
                FIELD: {}
            },
        }
    
        const RECORDS = {
        }

        const getDataSource = (_filters) => {
            let resultSearch =  constSearch.createSearchWithFilter({
                type: "assemblybuild",
                filters:
                [
                    
                ],
                columns:
                [
                    "internalid",
                    "tranid", "subsidiary"
                ]
            }, _filters);
            
            let arrResult = constSearch.fetchResultSearchRunEach(resultSearch, function(_objTmpl, _column){
                let objResTmpl = constSearch.getObjResultFromSearchByKey(_objTmpl, _column, [
                    "internalid",
                    "tranid", "subsidiary"
                ]);

                return objResTmpl;
            });
            
            return arrResult;
        }

        const allocateComponent = (_asbRecId, _arrLineComponent) =>{
            let asbRec = record.load({type: "assemblybuild", id: _asbRecId, isDynamic: true});

            let componentSublistId = SUBLIST.COMPONENT.ID;
            let inventoryAssignmentSulistId = 'inventoryassignment';

            let sizeComponentSublist = asbRec.getLineCount(componentSublistId);

            for(let i = 0; i < sizeComponentSublist; i++){
                let linenumber = asbRec.getSublistValue(componentSublistId, "linenumber", i);

                let objLine_find = _arrLineComponent.find(e => e.linenumber == linenumber);
                if(!objLine_find) continue;

                asbRec.selectLine(componentSublistId, i);

                asbRec.setCurrentSublistValue(componentSublistId, "quantity", objLine_find.quantity);

                let inventoryDetailRec = asbRec.getCurrentSublistSubrecord(componentSublistId, "componentinventorydetail");
                let sizeInventoryDetail = inventoryDetailRec.getLineCount(inventoryAssignmentSulistId);
                for(let j = 0; j < sizeInventoryDetail; j++){
                    let lotno_display = inventoryDetailRec.getSublistText(inventoryAssignmentSulistId, "issueinventorynumber", j);
                    if(lotno_display != objLine_find.inventorynumber) continue;

                    inventoryDetailRec.selectLine(inventoryAssignmentSulistId, j);

                    inventoryDetailRec.setCurrentSublistValue(inventoryAssignmentSulistId, "quantity", objLine_find.quantity);

                    inventoryDetailRec.commitLine(inventoryAssignmentSulistId);
                }

                asbRec.commitLine(componentSublistId);
            }

            asbRec.save({enableSourcing: false, ignoreMandatoryFields: true});
        }
    
        return {
            TYPE,
            FIELD,
            SUBLIST,
            RECORDS,
            getDataSource,
            allocateComponent
        };
        
    });
    