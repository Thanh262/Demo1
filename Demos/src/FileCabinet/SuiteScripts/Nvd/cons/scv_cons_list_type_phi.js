/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  04 Dec 2024         Phu Pham			    Init, create file
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
		PHI_CAT: {
			ID: 1,
			NAME: "Phí cắt"
		},
		PHI_MOQ: {
			ID: 2,
			NAME: "Phí MOQ"
		}
	}
    return {
		TYPE: "customlist_scv_type_phi",
		FIELD: FIELD,
		RECORDS: RECORDS
    };
    
});
