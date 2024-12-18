/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  08 Nov 2024         Huy Pham                Init & create file
 */
define(['N/search'],
function(search) {
	const ID = "";

	const RECORDS = {}

	const createSearchWithFilter = (_records, _filters) => {
		_records.type = _records.type||_records.searchType;
		let resultSearch = search.create(_records);
		let myFilters = resultSearch.filters;

		if(util.isArray(_filters)){
			_filters.forEach(_objFilter => myFilters.push(_objFilter));
		}
		else if(util.isObject(_filters) || typeof(_filters) == "object"){
			myFilters.push(_filters)
		}
		
		return resultSearch;
	}

	const loadSearchWithFilter = (_id, _filters) =>{
		let resultSearch = search.load(_id);
		let myFilters = resultSearch.filters;

		if(util.isArray(_filters)){
			_filters.forEach(_objFilter => myFilters.push(_objFilter));
		}
		else if(util.isObject(_filters) || typeof(_filters) == "object"){
			myFilters.push(_filters)
		}
		
		return resultSearch;
	}

	/**
	 * 
	 * @param {Object} _resultSearchFullPage : search obbject
	 * @param {Object} _params : page, rangePageFetch
	 * @param {function} _funcObjectMappingColumn : 
	 * @returns 
	 */
	const fetchResultSearchPage = (_resultSearchFullPage, _params, _funcObjectMappingColumn) =>{
		_params.rangePageFetch = Number(_params.rangePageFetch||1);
		_params.page = Number(_params.page||0);

		let arrResult = []
		let myColumns = _resultSearchFullPage.searchDefinition.columns;
		let ttlPage = _resultSearchFullPage.pageRanges.length;
		let idxPageFetched = _params.page;
		let maxPageFetch = _params.page + _params.rangePageFetch;
		for(let i = _params.page; i < _resultSearchFullPage.pageRanges.length; i++){
			if(i >= maxPageFetch){
				break;
			}
			idxPageFetched = i;
			let currentPage = _resultSearchFullPage.fetch({index : (i)}).data;
			for(var idx = 0; idx < currentPage.length; idx++){
				var objCurPage = currentPage[idx];
				var objRes = _funcObjectMappingColumn(objCurPage, myColumns);

				arrResult.push(objRes);
			}
		}

		return {arrResult: arrResult, info: {page: idxPageFetched, ttlPage: ttlPage, rangePageFetch: _params.rangePageFetch}};
	}

	const fetchResultSearchAllPage = (_resultSearchFullPage, _funcObjectMappingColumn) =>{
		let myColumns = _resultSearchFullPage.searchDefinition.columns;
		let arrResult = [];
		for(var idxPage = 0; idxPage < _resultSearchFullPage.pageRanges.length; idxPage++){
			var currentPage = _resultSearchFullPage.fetch({index : idxPage}).data;
			for(var i = 0; i < currentPage.length; i++){
				let objCurPage = currentPage[i];

				let objRes = _funcObjectMappingColumn(objCurPage, myColumns);

				arrResult.push(objRes);
			}
		}

		return arrResult;
	}

	const fetchResultSearchRun = (_resultSearch, _funcObjectMappingColumn) =>{
		let myColumns = _resultSearch.columns;
		let resultSearch = _resultSearch.run().getRange(0, 1000);
		let arrResult = [];
		for(var i = 0; i < resultSearch.length; i++){
			let objCurPage = resultSearch[i];

			let objRes = _funcObjectMappingColumn(objCurPage, myColumns);

			arrResult.push(objRes);
		}

		return arrResult;
	}

	const fetchResultSearchRunEach = (_resultSearch, _funcObjectMappingColumn) =>{
		let myColumns = _resultSearch.columns;
		let arrResult = [];

		_resultSearch.run().each(function(objCurPage){
			let objRes = _funcObjectMappingColumn(objCurPage, myColumns);
			arrResult.push(objRes);
			return true;
		});
		
		return arrResult;
	}

	const replaceValueNoneByKey = (_objRes, _arrKey = []) =>{
		if(_arrKey.length == 0){
			_arrKey = Object.keys(_objRes);
		}

		for(let i = 0; i < _arrKey.length; i++){
			let keyId = _arrKey[i];
			if(!keyId) continue;

			if(!!_objRes[keyId] &&  typeof(_objRes[keyId]) == "string"){
				_objRes[keyId] = _objRes[keyId].replace("- None -", "")
			}
		}
	}

	const getObjResultFromSearchByKey = (_objSearch, _myColumns, _arrKey) =>{
		let objRes = {};

		for(let i = 0; i < _arrKey.length; i++){
			let keyId = _arrKey[i];
			if(!keyId) continue;

			objRes[keyId] = _objSearch.getValue(_myColumns[i]);

			var temp_display = _objSearch.getText(_myColumns[i]);
			if(isContainValue(temp_display)){
				objRes[keyId + "_display"] = temp_display;
			}
		}
		
		return objRes;
	}

	const getObjResultFromSearchWithLabel = (_objSearch, _myColumns) =>{
		let arrColKey = getDataKeyByColumnSearch(_myColumns);

		let objRes = getObjResultFromSearchByKey(_objSearch, _myColumns, arrColKey);
		
		return objRes;
	}

	const getDataKeyByColumnSearch = (_myColumns) =>{
		let arrColKey = [];

		for(let i = 0; i < _myColumns.length; i++){
			let eleColumn = _myColumns[i];

			let keyId = formatStringToKeyID(eleColumn.label);

			let idxColKey_find = arrColKey.findIndex(_key => _key == keyId);
			if(idxColKey_find == -1){
				arrColKey.push(keyId)
			}else{
				keyId = keyId + "_" + i;
				arrColKey.push(keyId)
			}
		}

		return arrColKey;
	}
	
	const getDataLookupFields = (_type, _id, _columns) =>{
		let arrColumns = [];
		if(util.isArray(_columns)){
			arrColumns = _columns;
		}else{
			arrColumns.push(_columns)
		}

		let objRes = {};
		if(!!_id){
			objRes = search.lookupFields({type: _type, id: _id, columns: arrColumns});
		}

		return objRes;
	}

	function isContainValue(value) {
		var isContain = false;
		if(value != undefined && value != null && value !== '') {
			if(util.isArray(value)) {
				if(value.length > 0) {
					isContain = true;
				}
			} else {
				isContain = true;
			}
		}
		return isContain;
	}

	const formatStringToKeyID = (_strInput) => {
		return removeAccents(_strInput.toLowerCase().replaceAll(" ","")/* .replace(/[^a-zA-Z0-9 ]/g, '') */)
	}

	function removeAccents(str) {
		var AccentsMap = [
			"aàảãáạăằẳẵắặâầẩẫấậ",
			"AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
			"dđ", "DĐ",
			"eèẻẽéẹêềểễếệ",
			"EÈẺẼÉẸÊỀỂỄẾỆ",
			"iìỉĩíị",
			"IÌỈĨÍỊ",
			"oòỏõóọôồổỗốộơờởỡớợ",
			"OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
			"uùủũúụưừửữứự",
			"UÙỦŨÚỤƯỪỬỮỨỰ",
			"yỳỷỹýỵ",
			"YỲỶỸÝỴ"
		];
		for (var i=0; i<AccentsMap.length; i++) {
			var re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
			var char = AccentsMap[i][0];
			str = str.replace(re, char);
		}
		return str.trim();
	}

    return {
		ID: ID,
		TYPE: "",
		RECORDS: RECORDS,
		createSearchWithFilter,
		loadSearchWithFilter,
		fetchResultSearchPage,
		fetchResultSearchAllPage,
		fetchResultSearchRun,
		fetchResultSearchRunEach,
		replaceValueNoneByKey,
		getObjResultFromSearchByKey,
		getObjResultFromSearchWithLabel,
		getDataKeyByColumnSearch,
		getDataLookupFields,
		formatStringToKeyID
    };
    
});
