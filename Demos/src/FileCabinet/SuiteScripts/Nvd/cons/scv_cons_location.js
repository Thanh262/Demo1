/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  25 Nov 2024         Huy Pham			    Init, create file
 */
define(['N/query', 'N/runtime',
	'./scv_cons_search'
],
function(query, runtime,
	constSearch
	) {
	const FIELD = {
		ID: "id",
		INACTIVE: "isinactive",
		NAME: "name"
	}

	const SUBLIST = {
		
	}

	const RECORDS = {
		
	}

	const getInfoLocationById = (_locationsId) => {
		if(!_locationsId) return [];

		var resultSQL = query.runSuiteQL({
			query: `SELECT id, name, fullname, mainaddress, BUILTIN.DF(mainaddress) as mainaddress_display
			FROM location
			where id IN (${_locationsId.toString()})
			order by id asc`
		});
		return resultSQL.asMappedResults();
	}

	/*
	LOTNUMBEREDINVENTORY
	INVENTORY
	INVENTORYCOUNT
	INVENTORYSTATUS
	SERIALIZEDINVENTORY
	ADVBINSERIALLOTMGMT
	ADVINVENTORYMGMT
	BINMANAGEMENT
	*/
	const isInventory = () =>{
		let isValid = true;
		try{
			//in server
			isValid = runtime.isFeatureInEffect({feature:'INVENTORY'})
		}catch(err){
			//in Client
			isValid = _dynamicData.reflet.features.INVENTORY == 'INVENTORY' ? true : false;
		}

		return isValid;
	}

	const isLotNumberInventory = () =>{
		let isValid = true;
		try{
			//in server
			isValid = runtime.isFeatureInEffect({feature:'LOTNUMBEREDINVENTORY'})
		}catch(err){
			//in Client
			isValid = _dynamicData.reflet.features.LOTNUMBEREDINVENTORY == 'LOTNUMBEREDINVENTORY' ? true : false;
		}

		return isValid;
	}

	const isBinManagement = () =>{
		let isValid = true;
		try{
			//in server
			isValid = runtime.isFeatureInEffect({feature:'BINMANAGEMENT'})
		}catch(err){
			//in Client
			isValid = _dynamicData.reflet.features.BINMANAGEMENT == 'BINMANAGEMENT' ? true : false;
		}

		return isValid;
	}

	const getDataSource = (_filters) => {
		let resultSearch =  constSearch.createSearchWithFilter({
			type: "location",
			filters:
			[
				["isinactive","is","F"]
			],
			columns:
			[
				"internalid",
				"name", "subsidiary"
			]
		}, _filters);
		
		let arrResult = constSearch.fetchResultSearchRunEach(resultSearch, function(_objTmpl, _column){
			let objResTmpl = constSearch.getObjResultFromSearchByKey(_objTmpl, _column, [
				"internalid",
				"name", "subsidiary"
			]);

			return objResTmpl;
		});
		
		return arrResult;
	}

    return {
		TYPE: "location",
		FIELD: FIELD,
		SUBLIST: SUBLIST,
		RECORDS: RECORDS,
		getInfoLocationById,
		isInventory,
		isLotNumberInventory,
		isBinManagement,
		getDataSource
    };
    
});
