/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  15 Nov 2024         Khanh Tran			    Init, create file
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
		MUA_HANG_THEO_KE_HOACH: {
			ID: 17,
			NAME: "Mua hàng theo kế hoạch"
		},
		XUAT_TIEU_HAO_GC_CO_KHI: {
			ID: 42,
			NAME: "Xuất tiêu hao gia công cơ khí"
		}
	}
    return {
		TYPE: "customrecord_scv_order_type",
		FIELD: FIELD,
		SUBLIST: SUBLIST,
		RECORDS: RECORDS
    };
    
});
