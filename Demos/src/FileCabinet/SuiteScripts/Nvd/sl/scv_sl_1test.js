/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', '../cons/scv_cons_entity_category.js'],
    
    (record, constEntCategory) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            // testAllocationVendor();
            testEntCategoryVendor();
        }

        const testEntCategoryVendor = () => {
            let abc = constEntCategory.getDataEntityCategoryWithType(2);
            log.error("abc", abc.length);
        }

        const testAllocationVendor = () => {
            let rec = record.load({
                type: "custompurchase_scv_purchase_request",
                id: "5364",
                isDynamic: true,
            });
            let arrItem = [
                {
                   item_id: "899",
                   plan_qty: 120000,
                   total_qty: 120000,
                   arrVendor: [
                      {
                         internalid: "70",
                         quantity: 30000
                      },
                      {
                         internalid: "115",
                         quantity: 50000
                      },
                      {
                         internalid: "73",
                         quantity: 40000
                      }
                   ]
                },
                {
                   item_id: "55",
                   plan_qty: 350000,
                   total_qty: 350000,
                   arrVendor: [
                      {
                         internalid: "1011",
                         quantity: 150000
                      },
                      {
                         internalid: "1010",
                         quantity: 100000
                      },
                      {
                         internalid: "115",
                         quantity: 100000
                      }
                   ]
                },
                {
                   item_id: "941",
                   plan_qty: 200000,
                   total_qty: 200000,
                   arrVendor: [
                      {
                         internalid: "1011",
                         quantity: 100000
                      },
                      {
                         internalid: "73",
                         quantity: 100000
                      }
                   ]
                }
            ]
            let objData = hanldeDataAllocateEntity(rec, arrItem);
            log.error("arrRemove", objData.arrRemove);
            log.error("arrInsert", objData.arrInsert);
        }

        const hanldeDataAllocateEntity = (rec, result) => {
            let arrRemove = [], arrInsert = [];
            
            let sublistId = "item";
            let lc = rec.getLineCount(sublistId);

            let objCount = {};
            for(let i = 0; i < lc; i++) {
                let item = rec.getSublistValue(sublistId, "item", i);
                let vendor = rec.getSublistValue(sublistId, "custcol_scv_vendor", i);
                let plan_qty = rec.getSublistValue(sublistId, "custcol_scv_plan_qty", i) * 1;

                if(objCount[item] === undefined) {
                    objCount[item] = 0;
                }
                
                let obj_find_result = result.find(e => e.item_id == item);
                if(!!obj_find_result && !vendor && plan_qty > 0) {
                    objCount[item]++;
                    
                    if(objCount[item] === 1) {
                        let arrCopy = getDataLineItemCopy(rec, sublistId, obj_find_result.arrVendor, i);
                        arrInsert = [...arrInsert, ...arrCopy];
                    }
                    arrRemove.push(i);
                }
            }
            return { 
                arrRemove: arrRemove.reverse(), 
                arrInsert: arrInsert 
            };
        }

        const getDataLineItemCopy = (rec, sublistId, arrVendor, line) => {
            let arrResult = [];
            let arrFieldsCopy = [
                'item', 'vendorname', 'custcol_scv_tc_item_code', 'description', 'department', 
                'class', 'quantity'
            ];

            for(let objVendor of arrVendor) {
                let obj = {};
                for(let fieldId of arrFieldsCopy) {
                    obj[fieldId] = rec.getSublistValue(sublistId, fieldId, line);
                }
                obj.custcol_scv_vendor = objVendor.internalid;
                obj.custcol_scv_plan_qty = objVendor.quantity;
                arrResult.push(obj);
            }
            return arrResult;
        }

        return {onRequest}

    });
