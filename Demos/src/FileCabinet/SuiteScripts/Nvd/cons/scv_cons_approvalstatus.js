/**
 * Nội dung: 
 * Key:
 * =======================================================================================
 *  Date                Author                  Description
 *  05 Nov 2024         Phu Pham			    Init, create file
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
            APPROVED: {
                ID: 3,
                NAME: "Approved"
            },
            OPEN: {
                ID: 10,
                NAME: "Open"
            },
			REJECTED: {
				ID: 4,
				NAME: "Rejected"
			}
        }
        return {
            TYPE: "customrecord_scv_approval_status",
            FIELD: FIELD,
            SUBLIST: SUBLIST,
            RECORDS: RECORDS
        };
        
    });