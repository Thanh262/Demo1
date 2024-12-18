/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  04 Dec 2024         Huy Pham                Init & create file
 */
define([
	'./scv_cons_search.js'
],
function(
	constSearch
) {
	const ID = "customsearch_scv_list_item_stand_lq";
	const TYPE = "customrecord_scv_list_item_standard";

	const RECORDS = {}

	const getDataSource = (_filters) =>{
		let resultSearch = constSearch.loadSearchWithFilter(ID, _filters);
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let arrResult = constSearch.fetchResultSearchAllPage(resultSearch, function(_obj, _column){
			return getObjResultFromSearch(_obj, _column);
		});

		return arrResult;
	}

	const getDataSourceFetchPage = (_filters, _params) =>{
		let resultSearch = constSearch.loadSearchWithFilter(ID, _filters);
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let objRes = constSearch.fetchResultSearchPage(resultSearch, _params, function(_obj, _column){
			return getObjResultFromSearch(_obj, _column);
		})

		return objRes;
	}

	const getObjResultFromSearch = (_objSearch, _myColumns) =>{
		let objRes = constSearch.getObjResultFromSearchByKey(_objSearch, _myColumns,[
			"name",
			"custrecord_scv_list_item_standard_sub",
			"internalid",
			"custrecord_scv_list_item_standard_code",
			"custrecord_scv_list_item_standard_name_internalid",
			"custrecord_scv_list_item_standard_name",
			"custrecord_scv_list_item_standard_uom",
			"custrecord_scv_list_item_standard_group",
			"custrecord_scv_item_lq_kho_item_id",
			"custrecord_scv_item_lq_kho_item",
			"custrecord_scv_item_lq_th_item_id",
			"custrecord_scv_item_lq_th_item",
			"custrecord_scv_predicted_consump_avg",
			"custrecord_scv_plan_numb_days_on_hand"
		]);

		return objRes;
	}

    return {
		ID,
		TYPE,
		RECORDS,
		getDataSource,
		getDataSourceFetchPage
    };
    
});
