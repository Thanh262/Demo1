/**
 * Nội dung:
 * =======================================================================================
 *  Date                Author                  Description
 *  14 Nov 2024			Khanh Tran				Init. Create file
 */
define(['N/search'],
function(search) {
	const ID = "customsearch_scv_pr_remaining_po";

	const getDataSource = (filters) =>{
		let resultSearch = search.load(ID);
		let myFilters = resultSearch.filters;
		let myColumns = resultSearch.columns;

		if(util.isArray(filters)){
			filters.forEach(_objFilter => myFilters.push(_objFilter));
		}
		else if(util.isObject(filters) || typeof(filters) == "object"){
			myFilters.push(filters)
		}
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});
		let arrResult = [];
        for(let i = 0; i < resultSearch.pageRanges.length; i++){
            let currentPage = resultSearch.fetch({index : i}).data;
            for(let idx = 0; idx < currentPage.length; idx++){
                let obj = {};  
                obj.pr_id = currentPage[idx].id;
                obj.subsidiary_id = currentPage[idx].getValue(myColumns[0]);
                obj.subsidiary = currentPage[idx].getText(myColumns[0]);
                obj.ngay_yeu_cau = currentPage[idx].getValue(myColumns[1]);      
                obj.so_yeu_cau = currentPage[idx].getValue(myColumns[2]);
                obj.vendor = currentPage[idx].getValue(myColumns[3]);
                obj.item_id = currentPage[idx].getValue(myColumns[4]);
                obj.item = currentPage[idx].getText(myColumns[4]);
                obj.units_id = currentPage[idx].getValue(myColumns[15]);
                obj.units = currentPage[idx].getValue(myColumns[5]);
                obj.qty = currentPage[idx].getValue(myColumns[6]) * 1;
                obj.rate = currentPage[idx].getValue(myColumns[7]) * 1;
                obj.amt = currentPage[idx].getValue(myColumns[8]) * 1;
                obj.ngay_can_hang = currentPage[idx].getValue(myColumns[9]);
                obj.nhom_hang_id = currentPage[idx].getValue(myColumns[10]);
                obj.nhom_hang = currentPage[idx].getText(myColumns[10]);
                obj.order_type = currentPage[idx].getValue(myColumns[12]);          
                obj.ghi_chu = currentPage[idx].getValue(myColumns[16]);
                obj.ori_lineid = currentPage[idx].getValue(myColumns[18]);
                obj.unit_conversion_rate = currentPage[idx].getValue(myColumns[19]) * 1;
                arrResult.push(obj);
            }
        }
		return arrResult;
	}

    return {
		ID: ID,
		TYPE: "transaction",
		getDataSource: getDataSource
    };
    
});
