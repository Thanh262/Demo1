/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  05 Dec 2024         Huy Pham                Init & create file
 */
define(['N/search',
	'./scv_cons_search.js'
],
function(search,
	constSearch
) {
	const ID = "customsearch_scv_inv_on_hand_pending";
	const TYPE = "inventorybalance";

	const RECORDS = {
		type: "inventorybalance",
		filters:
		[
			["onhand","notequalto","0"], 
			"AND", 
			["status","anyof","1","3","8"]
		],
		columns:
		[
			search.createColumn({
				name: "internalid",
				join: "item",
				summary: "GROUP",
				label: "Component ID"
			}),
			search.createColumn({
				name: "item",
				summary: "GROUP",
				label: "Item"
			}),
			search.createColumn({
				name: "subsidiary",
				join: "location",
				summary: "GROUP",
				label: "Subsidiary"
			}),
			search.createColumn({
				name: "onhand",
				summary: "SUM",
				label: "Số lượng tồn kho"
			}),
			search.createColumn({
				name: "formulanumeric",
				summary: "SUM",
				formula: "nvl({invnumcommitted},0)",
				label: "Số lượng hàng giữ"
			}),
			search.createColumn({
				name: "formulanumeric",
				summary: "SUM",
				formula: "{onhand} - nvl({invnumcommitted},0)",
				label: "Số lượng khả dụng CXL"
			})
		]
	}

	const getDataSource = (_filters) =>{
		let resultSearch = constSearch.createSearchWithFilter(RECORDS, _filters);
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let arrResult = constSearch.fetchResultSearchAllPage(resultSearch, function(_obj, _column){
			return getObjResultFromSearch(_obj, _column);
		});

		return arrResult;
	}

	const getDataSourceFetchPage = (_filters, _params) =>{
		let resultSearch = constSearch.createSearchWithFilter(RECORDS, _filters);
		
		resultSearch = resultSearch.runPaged({pageSize: 1000});

		let objRes = constSearch.fetchResultSearchPage(resultSearch, _params, function(_obj, _column){
			return getObjResultFromSearch(_obj, _column);
		})

		return objRes;
	}

	const getObjResultFromSearch = (_objSearch, _myColumns) =>{
		let objRes = constSearch.getObjResultFromSearchByKey(_objSearch, _myColumns,[
			"item_id",
			"item",
			"subsidiary",
			"onhand",
			"invnumcommitted",
			"qty_available"
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
