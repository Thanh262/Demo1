/**
 * @NApiVersion 2.1
 */
define([],
    
    () => {
        
        const CmmsScbdType = {
            HANG_THANG: '4'
        }
        
        const CmmsScbdStatus = {
            DANG_THU_HIEN: '3',
            THUE_NGOAI: '102',
            HOAN_THANH: '103',
            DA_DUYET: '109'
        }
        
        const InventoryStatus = {
            MOI_CHO_KIEM_TRA: '1',
            MOI_DAT_CHAT_LUONG: '4',
            DA_HONG: '10'
        }
        
        const CmmsRecordType = {
            CHI_TIET_MAY: 'customrecord_scv_cmms_equipment',
            ORDER_TYPE: 'customrecord_scv_order_type',
            PURCHASE_REQUEST: 'custompurchase_scv_purchase_request',
            SUA_CHUA_BAO_DUONG: 'customrecord_scv_cmms_workorder',
            
            KE_HOACH_BAO_DUONG: 'customrecord_scv_cmms_maintenanceplan_h'
        }
        
        const CmmsPrType = {
            NOI_DIA: '2'
        }
        
        const Department = {
            PHONG_XUAT_NHAP_KHAU: '8'
        }
        
        const Entity = {
            DEFAULT_PURCHASE_REQUEST: '146' //NCC_Default
        }
        
        const Item = {
            THUE_NGOAI_SUA_CHUA_MAY_MOC_THIET_BI: '83'
        }
        
        const CmmsOrderType = {
            VAT_TU_SUA_CHUA_BAO_DUONG: '39'
        }
        
        const CmmsSublistId = {
            CHI_TIET_MAY_DINH_MUC: 'recmachcustrecord_scv_cmms_bom_equipment',
            
            ITEM: 'item',
            INVENTORY: 'inventory',
            INVENTORY_ASSIGNMENT: 'inventoryassignment',
            
            SCBD_DU_TOAN: 'recmachcustrecord_scv_cmms_bg_wo',
            SCBD_NHAN_CONG: 'recmachcustrecord_scv_cmms_lb_cmmswo',
            SCBD_THUE_NGOAI: 'recmachcustrecord_scv_cmms_os_wo',
            
            KHBD_CHI_TIET: 'recmachcustrecord_scv_cmms_mp_plan_l'
        }
        
        const CmmsCharToSplit = {
            SEMICOLON: ';'
        }
        
        const getDateNow = (gmt) => {
            let now = new Date();
            let strDate = now.toString();
            let pSign = strDate.substring(28,29);
            let pGmt = strDate.substring(29,31);
            let hourToAdd = gmt;
            if(pSign === '-') {
                hourToAdd = hourToAdd + 1 * pGmt;
            } else {
                hourToAdd = hourToAdd - 1 * pGmt;
            }
            return new Date(now.getTime() + (hourToAdd * 3600000));
        }
        
        const clearSelectBin = (currentRecord, sublistIdResult, lineCountResult) => {
            for(let i = 0; i < lineCountResult; i++) {
                let fieldBin = currentRecord.getSublistField({sublistId: sublistIdResult, fieldId: 'custpage_binnumber', line: i});
                fieldBin.removeSelectOption({value : null});
            }
        }
        
        const clearSelectFields = (currentRecord, sublistIdResult, lineCountResult, listFieldsId) => {
            for(let i = 0; i < lineCountResult; i++) {
                for(let fieldId of listFieldsId) {
                    let fieldSelect = currentRecord.getSublistField({sublistId: sublistIdResult, fieldId: fieldId, line: i});
                    fieldSelect.removeSelectOption({value : null});
                }
            }
        }
        
        const toggleFieldUseBins = (currentRecord, sublistIdResult, locationUserBins) => {
            let lineCountResult = currentRecord.getLineCount(sublistIdResult);
            for(let i = 0; i < lineCountResult; i++) {
                let fieldSearialLot = currentRecord.getSublistField({sublistId: sublistIdResult, fieldId: 'receiptinventorynumber', line: i})
                    || currentRecord.getSublistField({sublistId: sublistIdResult, fieldId: 'custpage_issueinventorynumber', line: i});
                let fieldBin = currentRecord.getSublistField({sublistId: sublistIdResult, fieldId: 'custpage_binnumber', line: i});
                let islotitem = currentRecord.getSublistValue({sublistId: sublistIdResult, fieldId: 'islotitem', line: i});
                let usebins = currentRecord.getSublistValue({sublistId: sublistIdResult, fieldId: 'usebins', line: i});
                fieldSearialLot.isDisabled = islotitem !== 'true';
                fieldBin.isDisabled = usebins !== 'true' || !locationUserBins;
            }
        }
        
        const getItemAvailable = (objParams, lrp) => {
            let listItemAvailable = [];
            if(objParams.location) {
                let params = [objParams.location, ...objParams.items];
                let inItems = objParams.items.map(() => '?').join(',');
                let sqlItemAvailable = `
                    select ib.item, ib.inventorystatus, BUILTIN.DF(ib.inventorystatus) inventorystatus_display, ib.inventorynumber , BUILTIN.DF(ib.inventorynumber) inventorynumber_display,
                        ib.quantityavailable, ib.binnumber, BUILTIN.DF(ib.binnumber) binnumber_display, ib.location
                    from inventorybalance ib
                    where ib.location = ? and ib.item in (${inItems})
                `;
                
                lrp.doSearchSqlAll(listItemAvailable, sqlItemAvailable, params);
                return listItemAvailable;
            }
            
        }
        
        return {CmmsScbdType, CmmsScbdStatus, InventoryStatus, CmmsRecordType, CmmsPrType, Department, Entity, Item, CmmsOrderType,
            CmmsSublistId, CmmsCharToSplit,
            getDateNow, clearSelectBin, clearSelectFields, toggleFieldUseBins, getItemAvailable
        }
        
    });
