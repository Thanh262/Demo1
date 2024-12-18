/**
 * Nội dung: 
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  05 Dec 2024         Phu Pham			    Init, create file
 */
define([],
    function() {
        const FIELD = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        }
    
        const SUBLIST = {
            
        }
    
        const RECORDS = {
            GIA_CONG_CO_KHI: {
                ID: 6,
                NAME: "Gia công cơ khí"
            },
        }
        return {
            TYPE: "customrecord_scv_work_order_type",
            FIELD: FIELD,
            RECORDS: RECORDS
        };
        
    });