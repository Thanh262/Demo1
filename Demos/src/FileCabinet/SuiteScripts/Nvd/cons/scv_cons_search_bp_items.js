/**
 * Nội dung:
 * =======================================================================================
 *  Date                Author                  Description
 *  19 Nov 2024			Khanh Tran				Init. Create file
 */
define(['N/search'],
function(search) {
	const ID = "customsearch_scv_bp_items";

	const getDataSource = async (filters) =>{
		let resultSearch = await search.load.promise(ID);
		let myFilters = resultSearch.filters;
		let myColumns = resultSearch.columns;

		if(util.isArray(filters)){
			filters.forEach(_objFilter => myFilters.push(_objFilter));
		}
		else if(util.isObject(filters) || typeof(filters) == "object"){
			myFilters.push(filters)
		}
		
		resultSearch = await resultSearch.runPaged.promise({pageSize: 1000});
		let arrResult = [];
        for(let i = 0; i < resultSearch.pageRanges.length; i++){
            let currentPage = await resultSearch.fetch.promise({ index: i });
            currentPage = currentPage.data;
            for(let idx = 0; idx < currentPage.length; idx++){
                let obj = {};  
                obj.item = currentPage[idx].getValue(myColumns[1]);   
                obj.ma_mau = currentPage[idx].getValue(myColumns[4]);
                obj.key_mapping = currentPage[idx].getValue(myColumns[5]);
                // obj.ori_lineid = currentPage[idx].getValue(myColumns[2]);
                // obj.item = currentPage[idx].getValue(myColumns[4]);
             
                // obj.key_mapping = currentPage[idx].getValue(myColumns[6]);
                // obj.item_parent_id = currentPage[idx].getValue(myColumns[7]);
                // obj.item_parent_adding = currentPage[idx].getValue(myColumns[8]);
                // obj.conversion_rate = currentPage[idx].getValue(myColumns[9]) * 1;
                // obj.itemid_currency = currentPage[idx].getValue(myColumns[10]);
                // obj.parentid_currency = currentPage[idx].getValue(myColumns[11]);
                arrResult.push(obj);
            }
        }
		return arrResult;
	}

    return {
		ID: ID,
		TYPE: "item",
		getDataSource: getDataSource
    };
    
});
