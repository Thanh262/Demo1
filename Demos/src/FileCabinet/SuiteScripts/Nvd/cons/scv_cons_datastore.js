/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  08 Nov 2024         Huy Pham                Init & create file
 */
define([],
function() {
	const ID = "";
    const TYPE = "";
	const RECORDS = {}

	let dataStore = {};

    const setDataStore = (_key, _dataSource) =>{
        
        if(util.isArray(_dataSource) || util.isObject(_dataSource)){
			dataStore[_key] = JSON.parse(JSON.stringify(_dataSource));
		}else{
            dataStore[_key] = _dataSource;
        }

        return dataStore[_key];
    }

    const getDataStore = (_key) =>{
        return dataStore[_key];
    }


    return {
		ID,
		TYPE,
		RECORDS,
		setDataStore,
        getDataStore
    };
    
});
