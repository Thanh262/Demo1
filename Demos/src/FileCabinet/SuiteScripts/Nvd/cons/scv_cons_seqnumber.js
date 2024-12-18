/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  19 Nov 2024         Huy Pham                Init & create file, Sinh số lô tự động trong màn hình WO, from mr.Bính(https://app.clickup.com/t/86cx2y1j1)
 *  26 Nov 2024         Huy Pham                Đổi logic đánh số lô, from mr.Bính(https://app.clickup.com/t/86cx2y1j1?comment=90160075747267)
 */
define(['N/search', 'N/record',
    './scv_cons_search.js'
],
    function(search, record,
        constSearch
    ) {
        const TYPE = "customrecord_scv_rcnumber";
        const FIELD = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        }
    
        const SUBLIST = {
            
        }
    
        const RECORDS = {
        }

        const SEQUENCE_TYPE = {
            INVENTORY_LOTNUMBER: "INVENTORYLOTNUMBER"
        }

        const getDataSource = (_filters) => {
            let resultSearch =  constSearch.createSearchWithFilter({
                type: "customrecord_scv_rcnumber",
                filters:
                [
                    ["isinactive","is","F"]
                ],
                columns:
                [
                    "internalid",
                    "name", "custrecord_scv_rcn_subsidiary",
                    "custrecord_scv_rcn_type", "custrecord_scv_rcn_accountnumber",
                    "custrecord_scv_rcn_yearmonth", "custrecord_scv_rcn_prefix",
                    "custrecord_scv_rcn_currentnumber"
                ]
            }, _filters);
            
            let arrResult = constSearch.fetchResultSearchRunEach(resultSearch, function(_objTmpl, _column){
                let objResTmpl = constSearch.getObjResultFromSearchByKey(_objTmpl, _column, [
                    "internalid",
                    "name", "custrecord_scv_rcn_subsidiary",
                    "custrecord_scv_rcn_type", "custrecord_scv_rcn_accountnumber",
                    "custrecord_scv_rcn_yearmonth", "custrecord_scv_rcn_prefix",
                    "custrecord_scv_rcn_currentnumber"
                ]);

                return objResTmpl;
            });
            
            return arrResult;
        }

        const formatDatePrefix_YYMM = (_date) =>{
            return _date.getFullYear().toString().substring(2,4) + ((_date.getMonth() + 1) + '').padStart(2,'0');
        }

        const genAssemblyLotNumber = (curRec) =>{
            let assemblyLotNo = curRec.getValue("custbody_scv_assembly_lot");
            if(!!assemblyLotNo) return null;

            let prefix_zzzz = curRec.getValue("custbody_scv_qc_serial_code") + "";
            if(!!prefix_zzzz){
                prefix_zzzz = prefix_zzzz.padStart(4, "0");
            }

            let today = new Date();
            let prefix_yymm = formatDatePrefix_YYMM(today);

            let seqType = SEQUENCE_TYPE.INVENTORY_LOTNUMBER;
            let currentNumber = 1;

            let objRes = {
                name: seqType + prefix_yymm,
                custrecord_scv_rcn_currentnumber: currentNumber,
                custbody_scv_assembly_lot: ""
            }

            let arrSeqNumber = getDataSource([
                search.createFilter({
                    name: 'custrecord_scv_rcn_type', 
                    operator: "is", 
                    values: seqType
                }),
                search.createFilter({
                    name: 'custrecord_scv_rcn_yearmonth', 
                    operator: "is", 
                    values: prefix_yymm
                }),
            ]);

            if(arrSeqNumber.length  == 0){
                let seqNumRec = record.create({type: "customrecord_scv_rcnumber", isDynamic: true});
                seqNumRec.setValue("name", objRes.name);
                seqNumRec.setValue("custrecord_scv_rcn_type", seqType);
                seqNumRec.setValue("custrecord_scv_rcn_yearmonth", prefix_yymm);
                seqNumRec.setValue("custrecord_scv_rcn_currentnumber", currentNumber);
                seqNumRec.save({enableSourcing: false, ignoreMandatoryFields: false});
            }
            else{
                let objSeqNumber = arrSeqNumber[0];

                currentNumber = objSeqNumber.custrecord_scv_rcn_currentnumber * 1;
                currentNumber += 1;

                record.submitFields({
                    type: 'customrecord_scv_rcnumber',
                    id: objSeqNumber.internalid, 
                    values: {
                        custrecord_scv_rcn_currentnumber: currentNumber
                    },
                    options: {
                        enableSourcing: false, ignoreMandatoryFields : true
                    }
                });
            }

            if(!!prefix_zzzz){
                objRes.custbody_scv_assembly_lot = prefix_zzzz + "_";
            }
            objRes.custbody_scv_assembly_lot += prefix_yymm + currentNumber.toString().padStart(5, '0');

            curRec.setValue("custbody_scv_assembly_lot", objRes.custbody_scv_assembly_lot);

            return objRes;
        }
    
        return {
            TYPE,
            FIELD,
            SUBLIST,
            RECORDS,
            getDataSource,
            genAssemblyLotNumber
        };
        
    });
    