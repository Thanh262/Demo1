/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  08 Nov 2024         Huy Pham                Init & create file, move from Adv, from mr.Việt(https://app.clickup.com/t/86cx0fvqd)
 */
define(['N/query',
    './scv_cons_record.js'
],
    function(query,
        constRecord
    ) {
        const TYPE = "customrecord_scv_import";
        const FIELD = {
            ID: "id",
            INACTIVE: "isinactive",
            NAME: "name"
        }
    
        const SUBLIST = {
            
        }
    
        const RECORDS = {
        }

        const getDataSourceByCriteriaQuery = (_objDataFilter) => {
            let query_where = `WHERE isinactive = 'F' `;

            if(!!_objDataFilter.custrecord_scv_import_rectype?.toString()){
                query_where += ` AND custrecord_scv_import_rectype = '${_objDataFilter.custrecord_scv_import_rectype.toString()}' `
            }else{
                return [];
            }

            var resultQuery = query.runSuiteQL({
                query: `SELECT custrecord_scv_import_rectype, id, name
                FROM customrecord_scv_import
                ${query_where}`
            });
    
            let arrResult = resultQuery.asMappedResults();
            
            return arrResult;
        }

        const initLoadFieldByCriteriaQuery = (_field, _objDataFilter, _hasNull = true) =>{
            let arrResult = getDataSourceByCriteriaQuery(_objDataFilter);
    
            _field.removeSelectOption({value : null});
            constRecord.initLoadField(_field, {data: arrResult}, _hasNull);
    
            return arrResult;
        }
    
        return {
            TYPE,
            FIELD,
            SUBLIST,
            RECORDS,
            getDataSourceByCriteriaQuery,
            initLoadFieldByCriteriaQuery
        };
        
    });
    