/**
 * Nội dung: 
 * =======================================================================================
 *  Date                Author                  Description
 *  08 Nov 2024         Huy Pham                Init & create file
 */
define(['N/record',
    './scv_cons_datastore.js',
],
function(record,
    constDataStore
) {
	const ID = "";

	const RECORDS = {}

	let currentRecord = null;

    const loadRecord = (_type, _internalId) =>{
        currentRecord = record.load({type: _type, id: _internalId, isDynamic: true});

        return currentRecord;
    }

    const setCurrentRecord = (_curRec) =>{
        currentRecord = _curRec;

        return currentRecord;
    }

    const getCurrentRecord = () =>{
        return currentRecord;
    }

    const saveCurrentRecord = () => {
        return currentRecord.save({enableSourcing: false, ignoreMandatoryFields: true});
    }

    const getTotalOfFieldsSublist = (_curRec, _sublistId, _fields) =>{
		if(!_fields.toString()) return 0;

		let isDynamic = _curRec.isDynamic;
		let idxCurrentLine = (isDynamic == "T" || isDynamic == true) ? _curRec.getCurrentSublistIndex(_sublistId) : -1;
		let objRes = {};
		let arrFields = (typeof(_fields) == "string") ? [_fields] : _fields;//string OR array
		let sizeSublist = _curRec.getLineCount(_sublistId);
		for(let i = 0; i < arrFields.length; i++){
			let fieldId = arrFields[i];

			let val_current_field = (idxCurrentLine > -1) ? _curRec.getCurrentSublistValue(_sublistId, fieldId) * 1 : 0;

			objRes[fieldId] = val_current_field;

			for(let j = 0; j < sizeSublist; j++){

				if(idxCurrentLine == j) continue;

				objRes[fieldId] += _curRec.getSublistValue(_sublistId, fieldId, j) * 1;
			}
		}

		return arrFields.length == 1 ? objRes[arrFields[0]] : objRes;
	}

    const recalcSyncBalanaceAllocation = (_arrResult, _totalExpected, _totalActual, _propEle, _roundPrecision) =>{
        if(_totalExpected == _totalActual) return _arrResult;

        let totalDiff = _totalExpected - _totalActual;
        totalDiff = Math.round(totalDiff * _roundPrecision)/_roundPrecision;
        for(let i = _arrResult.length - 1; i >= 0; i--){
            let objRes = _arrResult[i];

            let tempValue = objRes[_propEle] + totalDiff;
            if(tempValue >= 0){
                objRes[_propEle] = tempValue;
                totalDiff = 0;
                break;
            }else{
                objRes[_propEle] = 0;
                totalDiff = totalDiff - objRes[_propEle]
            }
        }

        return _arrResult;
    }

	const initLoadField = (_field, _lookup, _hasNull) =>{
        if(!_field) return;

        _lookup.displayExpr = _lookup.displayExpr??'name';
        _lookup.valueExpr = _lookup.valueExpr??'id';
        _lookup.data = _lookup.data??[];
        
        try{
            initLoadFieldServer(_field, _lookup, _hasNull)
        }catch(err){
            initLoadFieldClient(_field, _lookup, _hasNull)
        }
    }

    const initLoadFieldServer = (_field, _lookup, _hasNull) =>{
        if(!_field) return;

        _lookup.displayExpr = _lookup.displayExpr??'name';
        _lookup.valueExpr = _lookup.valueExpr??'id';
        _lookup.data = _lookup.data??[];

        if(_hasNull){
            _field.addSelectOption({value : "", text : ""});
        }
        let arrData = _lookup.data;
        for(let i = 0; i < arrData.length; i++){
            let objData = arrData[i];

            _field.addSelectOption({value : objData[_lookup.valueExpr], text : objData[_lookup.displayExpr]});
        }
    }

    const initLoadFieldClient = (_field, _lookup, _hasNull) =>{
        if(!_field) return;
        
        _lookup.displayExpr = _lookup.displayExpr??'name';
        _lookup.valueExpr = _lookup.valueExpr??'id';
        _lookup.data = _lookup.data??[];

        _field.removeSelectOption({value: null});
        if(_hasNull){
            _field.insertSelectOption({value : "", text : ""});
        }
        let arrData = _lookup.data;
        for(let i = 0; i < arrData.length; i++){
            let objData = arrData[i];

            _field.insertSelectOption({value : objData[_lookup.valueExpr], text : objData[_lookup.displayExpr]});
        }
    }

    const initQuickFindFieldSelect = (_curRec, _fieldId, _lookup, _clearOption) =>{
        let fsFieldId = _fieldId + "_fs";
        let searchFieldId = _fieldId + "_search";

        _lookup.displayExpr = _lookup.displayExpr??'name';
        _lookup.valueExpr = _lookup.valueExpr??'id';
        _lookup.pageSize = _lookup.pageSize??100;
        _lookup.page = _lookup.page||1;
        _lookup.data = _lookup.data??[];
        _lookup.reInsertOption = _lookup.reInsertOption??true;

        constDataStore.setDataStore(_fieldId, _lookup);
        
        let field = _curRec.getField(_fieldId);

        if(_clearOption){
            field.removeSelectOption({value: null});
        }
        else if(_lookup.reInsertOption){
            setTimeout(() => initLoadFieldClient(field, _lookup), 100);
        }

        if(jQuery("#" + searchFieldId).length == 0){
            jQuery("#" + fsFieldId).append(getContentsWidgetSearch(searchFieldId));
        }

        jQuery("#" + searchFieldId).off("click");
        jQuery("#" + searchFieldId).on( "click", function(){
            clickQuickFindFieldSelect(_curRec, _fieldId, _lookup, _clearOption);
            
            let isMulti = _curRec.getField(_fieldId).type == "multiselect" ? true : false;

            if(!isMulti) return;

            let valueMulti = _curRec.getValue(_fieldId);
            if(!valueMulti.toString()) return;

            let arrData = _lookup.data||[];
            if(arrData.length == 0) return;

            let displayExpr = _lookup.displayExpr??'name';
            let valueExpr = _lookup.valueExpr??'id';

            let arrValue = valueMulti.toString().split(",");
            for(let i = 0; i < arrValue.length; i++){
                let objDataOrg = arrData.find(e => e[valueExpr] == arrValue[i]);
                if(!!objDataOrg){
                    addContentsSearchUirTooltipMulti_ListSelect(objDataOrg[valueExpr], objDataOrg[displayExpr]);
                }
            }
        });
    }

    const clickQuickFindFieldSelect = (_curRec, _fieldId, _lookup, _clearOption) => {
        let fsLabelUirFieldId = _fieldId + "_fs_lbl_uir_label";

        let field = _curRec.getField(_fieldId);

        setCurrentRecord(_curRec);
        
        let isMulti = field.type == "multiselect" ? true : false;

        let contentsTooltip = getContentsSearchUirTooltip(_curRec, _fieldId, _lookup, _clearOption);

        uir_autoCloseTooltip(jQuery("#" + fsLabelUirFieldId), contentsTooltip, {alignment: 0, width: isMulti ? 650 : 450});

        jQuery("#btnSearchId").off("click");
        jQuery("#btnSearchId").on( "click", clickSearchOfQuickSearch);

        jQuery("#pageSearchId").off("change");
        jQuery("#pageSearchId").on( "change", changePageOfQuickSearch);

        jQuery("#inputSearchId").off("keydown");
        jQuery("#inputSearchId").on( "keydown", keyDownSearchOfQuickSearch);

        jQuery("#btnSearchId").off("click");
        jQuery("#btnSearchId").on( "click", clickSearchOfQuickSearch);
        
        jQuery(".scv-list-data-row-col").off("click");
        jQuery(".scv-list-data-row-col").on( "click", clickSelectedOptionOfQuickSearch);

        if(isMulti){
            jQuery("#multisel_complete #tdbody_update #update").off("click");
            jQuery("#multisel_complete #tdbody_update #update").on( "click", clickUpdateOfQuickSearch);

            jQuery("#multisel_complete #tdbody_cancel #cancel").off("click");
            jQuery("#multisel_complete #tdbody_cancel #cancel").on( "click", function(){close();});
        }
    }

    const keyDownSearchOfQuickSearch = (event) =>{
        if (event.key == 'Enter' || event.key == 'Tab') {
            if(event.key == 'Tab'){
                event.preventDefault();
            }
            clickSearchOfQuickSearch();
        }
    }

    const clickSearchOfQuickSearch = () =>{
        let valueSearch = jQuery("#inputSearchId").val();
        let fieldId = jQuery("#popup_outerdiv").attr("scv-fieldid");
        let lookupOfField =  {...constDataStore.getDataStore(fieldId)};
        lookupOfField.keySearch = valueSearch;
        constDataStore.setDataStore(fieldId, lookupOfField);

        let curRec = getCurrentRecord();
        let isClearOption = jQuery("#popup_outerdiv").attr("scv-clearoption") == "T" ? true : false;
        lookupOfField.data = getDataQuickSearchByKeySearch(lookupOfField);

        let isMulti = curRec.getField(fieldId).type == "multiselect" ? true : false;

        let arrDataSelected = [];
        if(isMulti){
            arrDataSelected = getDataSelectedOptionOfQuickSearch();
        }

        close();

        clickQuickFindFieldSelect(curRec, fieldId, lookupOfField, isClearOption);

        if(arrDataSelected.length > 0){
            for(let i = 0; i < arrDataSelected.length; i++){
                addContentsSearchUirTooltipMulti_ListSelect(arrDataSelected[i].value, arrDataSelected[i].text);
            }
        }
    }

    const getDataQuickSearchByKeySearch = (_lookup) =>{
        let valueSearch = (_lookup.keySearch||"").toString().toLowerCase();
        if(!valueSearch) return _lookup.data;

        let displayExpr = _lookup.displayExpr;
        let arrDatatOrg = _lookup.data;

        let arrResult = arrDatatOrg.filter(function(objResOrg){
            let nameOrg = objResOrg[displayExpr].toString().toLowerCase();
            if(nameOrg.indexOf(valueSearch) == -1){
                return false;
            }
            return true;
        });

        return arrResult;
    }

    const changePageOfQuickSearch = () => {
        let fieldId = jQuery("#popup_outerdiv").attr("scv-fieldid");
        let idxPage = jQuery("#pageSearchId").val() * 1;
        let lookupOfField =  {...constDataStore.getDataStore(fieldId)};
        lookupOfField.page = idxPage;
        lookupOfField.data = getDataQuickSearchByKeySearch(lookupOfField);

        let curRec = getCurrentRecord();
        let isClearOption = jQuery("#popup_outerdiv").attr("scv-clearoption") == "T" ? true : false;

        let isMulti = curRec.getField(fieldId).type == "multiselect" ? true : false;

        let arrDataSelected = [];
        if(isMulti){
            arrDataSelected = getDataSelectedOptionOfQuickSearch();
        }

        close();

        clickQuickFindFieldSelect(curRec, fieldId, lookupOfField, isClearOption);

        
        if(arrDataSelected.length > 0){
            for(let i = 0; i < arrDataSelected.length; i++){
                addContentsSearchUirTooltipMulti_ListSelect(arrDataSelected[i].value, arrDataSelected[i].text);
            }
        }
    }

    const clickSelectedOptionOfQuickSearch = (e) =>{
        let value = e.currentTarget.getAttribute("scv-data-value");
        let text = e.currentTarget.getAttribute("scv-data-text");
        let isClearOption = jQuery("#popup_outerdiv").attr("scv-clearoption");
        let fieldId = jQuery("#popup_outerdiv").attr("scv-fieldid");

        let curRec = getCurrentRecord();

        let field = curRec.getField(fieldId);
        let isMulti = field.type == "multiselect" ? true : false;
        
        if(isMulti){
            addContentsSearchUirTooltipMulti_ListSelect(value, text);
        }
        else{
            if(isClearOption == "T"){
                field.removeSelectOption({value: null});
                field.insertSelectOption({value: "", text: ""});
                field.insertSelectOption({value : value, text: text});
            }
            curRec.setValue(fieldId, value);

            close();
        }
    }

    const clickUnSelectedOptionOfQuickSearch = (e) =>{
        let value = e.currentTarget.getAttribute("scv-data-value");
        let text = e.currentTarget.getAttribute("scv-data-text");

        removeContentsSearchUirTooltipMulti_ListSelect(value, text);
    }

    const clickUpdateOfQuickSearch = (e) =>{
        let isClearOption = jQuery("#popup_outerdiv").attr("scv-clearoption");
        let fieldId = jQuery("#popup_outerdiv").attr("scv-fieldid");

        let arrDataSelected = getDataSelectedOptionOfQuickSearch();

        let curRec = getCurrentRecord();

        let field = curRec.getField(fieldId);
        if(isClearOption == "T"){
            field.removeSelectOption({value: null});

            for(let i = 0; i < arrDataSelected.length; i++){
                let objSelected = arrDataSelected[i];
                field.insertSelectOption({value: objSelected.value, text: objSelected.text});
            }
        }

        let value = arrDataSelected.map(e => e.value);

        curRec.setValue(fieldId, value);

        close();
    }

    const getDataSelectedOptionOfQuickSearch = () =>{
        let arrLine = jQuery("#popup_select_list>table>tbody>tr");
        let arrResult = [];
        
        for(let i = 0; i < arrLine.length; i++){
            let value = arrLine[i].getAttribute("scv-data-value")||"";
            if(!value.toString()) continue;

            arrResult.push({
                value: value,
                text: arrLine[i].getAttribute("scv-data-text"),
            })
        }

        return arrResult;
    }

    const getContentsWidgetSearch = (_searchFieldId) =>{
        return `
        <span class="uir-field-widget">
            <a data-helperbuttontype="list" id="${_searchFieldId}" tabindex="-1" class="uir-helper-button uir-no-link smalltextul fwmultisel field_widget" title="Search" href="#" ></a>
        </span>`;
    }

    const getContentsSearchUirTooltip = (_curRec, _fieldId, _lookup, _clearOption) =>{
        let isMulti = _curRec.getField(_fieldId).type == "multiselect" ? true : false;

        let contentsRowFilter = getContentsSearchUirTooltip_Filter(_curRec, _fieldId, _lookup);

        let contentsListData = ``;
        let contentsBottomButton = ``;
        if(isMulti){
            contentsListData = getContentsSearchUirTooltipMulti_ListDatat(_curRec, _fieldId, _lookup);
            //contentsBottomButton = getContentsSearchUirTooltip_BottomButton(_curRec, _fieldId, _lookup);
        }
        else{
            contentsListData = getContentsSearchUirTooltip_ListDatat(_curRec, _fieldId, _lookup);
        }

        let contentsOuter = `
            <table class="uir-popup-shuttle-table" cellpadding="0" cellspacing="0" style="height:100%; width: 100%; border-style:solid; border-width:1px; border-color: #999999 #999999 #CCCCCC #999999" role="presentation">
                <tbody>
                    <tr><td>${contentsRowFilter}</td></tr>
                    <tr><td><div class="uir-popup-select-content" width="100%" style="background-color:white; padding: 0px">${contentsListData}</div></td></tr>
                </tbody>
            </table>
        `;

        return `
        <div id="popup_outerdiv" style="heiht: 100%; width: 100%;" scv-fieldid="${_fieldId}" scv-clearoption="${_clearOption ? "T" : "F"}">
            <table cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; height: 100%">
                <tbody>
                    <tr>
                        <td style="border:1px solid #000000;">
                            <div style="height:100%; border-style:solid; border-width:1px; border-color: #EEEEEE #CCCCCC #CCCCCC #EEEEEE\">
                                <div style="height:100%; border-style:solid; border-width:1px; border-color: #FFFFFF #EFEFEF #EFEFEF #FFFFFF; background-color:#EFEFEF;">
                                    <table id="popup_outer_table" cellpadding="0" cellspacing="0" border="0" style="height:100%; width: 100%" role="presentation">
                                        <tbody><tr><td>${contentsOuter}</td></tr></tbody>
                                    </table>
                                </div>
                            </div>
                        </td>
                    </tr>
                    ${contentsBottomButton}
                </tbody>
            </table>
        </div>
        `;
    }

    const getContentsSearchUirTooltip_Filter = (_curRec, _fieldId, _lookup) =>{
        let contents = ``;

        let displayExpr = _lookup.displayExpr??'name';
        let valueExpr = _lookup.valueExpr??'id';
        let pageSize = _lookup.pageSize??100;
        let page = _lookup.page||1;
        let arrDataSource = _lookup.data;
        let keySearch = _lookup.keySearch||"";

        let countPage = Math.ceil(arrDataSource.length/pageSize);
        for(let i = 0; i < countPage; i++){
            let idxFrom = i * pageSize;
            let idxTo = (i + 1) * pageSize - 1;
            if(idxTo >= arrDataSource.length){
                idxTo = arrDataSource.length - 1;
            }
    
            let nameFrom =  arrDataSource[idxFrom][displayExpr];
            let nameTo = arrDataSource[idxTo][displayExpr];
    
            if(nameFrom.length > 20){
                nameFrom = nameFrom.substring(0,20) + "...";
            }
            if(nameTo.length > 20){
                nameTo = nameTo.substring(0,20) + "...";
            }
    
            let selected = "";
            if((i + 1) == page){
                selected = "selected";
            }
    
            let nameOfPage = "(" + (i + 1) + ") " + nameFrom + " ~ " + nameTo;
    
            contents += `
                <option value="${i + 1}" ${selected}>${nameOfPage}</option>
            `;
    
            for(let j = idxFrom; j <= idxTo; j++){
                let objRes = arrDataSource[j];
                objRes.page = i;
            }
        }
        

        return `
        <div id="segment_fields" class="uir-filter-area popupsegment">
            <div>
                <select id="pageSearchId" name="psls" class="input uir-input-dropdown-native" style="width: 100%">
                    ${contents}
                </select>
            </div>
            <div>
                <table cellpadding="0" cellspacing="0" width="100%">
                    <tbody>
                        <tr>
                            <td>
                                <input type="text" id="inputSearchId" class="input uir-input-text" placeholder="Type &amp; tab..." value="${keySearch}" onkeydown="" style="width: 100%">
                            </td>
                            <td>
                                <table id="tbl_Search" cellpadding="0" cellspacing="0" border="0" class="uir-button" style="margin-right:6px;cursor:hand;" role="presentation">
                                    <tbody>
                                        <tr id="tr_Search" class="tabBnt">
                                            <td id="tdleftcap_Search"><img src="/images/nav/ns_x.gif" class="bntLT" border="0" height="50%" width="10" alt="">
                                                <img src="/images/nav/ns_x.gif" class="bntLB" border="0" height="50%" width="10" alt="">
                                            </td>
                                            <td id="tdbody_Search" height="20" valign="top" nowrap="" class="bntBgB">
                                                <input type="button" style="" class="rndbuttoninpt bntBgT " value="Search" data-nsps-type="button" data-nsps-label="Search" id="btnSearchId" name="Search">
                                            </td>
                                            <td id="tdrightcap_Search">
                                                <img src="/images/nav/ns_x.gif" height="50%" class="bntRT" border="0" width="10" alt="">
                                                <img src="/images/nav/ns_x.gif" height="50%" class="bntRB" border="0" width="10" alt="">
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        `;
    }

    const getContentsSearchUirTooltip_ListDatat = (_curRec, _fieldId, _lookup) =>{
        let contents = ``;

        let displayExpr = _lookup.displayExpr??'name';
        let valueExpr = _lookup.valueExpr??'id';
        let pageSize = _lookup.pageSize??100;
        let page = _lookup.page||1;
        let arrDataSource = _lookup.data;

        let countPage = Math.ceil(arrDataSource.length/pageSize);
        for(let i = 0; i < countPage; i++){
            if((i + 1) != page) continue;
    
            let idxFrom = i * pageSize;
            let idxTo = (i + 1) * pageSize - 1;
            if(idxTo >= arrDataSource.length){
                idxTo = arrDataSource.length - 1;
            }
    
            for(let j = idxFrom; j <= idxTo; j++){
                let objRes = arrDataSource[j];
    
                let value = objRes[valueExpr];
                let display = objRes[displayExpr];
    
                contents += `
                    <tr valign="top" uir-multiselect-id="${value}">
                        <td class="text scv-list-data-row-col" align="right" valign="top" width="14px" nowrap="" scv-data-value="${value}" scv-data-text="${display}">
                            <a href="javascript:void(0)">
                                <img class="uir-popup-add-icon" src="/images/x.gif" border="0" height="13" width="13" alt="">
                            </a>
                        </td>
                        <td class="text scv-list-data-row-col" valign="top" scv-data-value="${value}" scv-data-text="${display}">
                            <a class="smalltextnolink uir-no-link" href="javascript:void(0)">
                            ${display}
                            </a>
                        </td>
                    </tr>
                `;
            }
        }
        

        return `
        <div id="inner_popup_div" data-multiple="false" width="100%" style="vertical-align:top; overflow:auto; background-color:white;">
            <table border="0" cellpadding="2" cellspacing="1" style="width:100%;" role="presentation">
                <tbody>
                    ${contents}
                </tbody>
            </table>
        </div>
        `;
    }

    const getContentsSearchUirTooltipMulti_ListDatat = (_curRec, _fieldId, _lookup) =>{
        let contents = ``;

        let displayExpr = _lookup.displayExpr??'name';
        let valueExpr = _lookup.valueExpr??'id';
        let pageSize = _lookup.pageSize??100;
        let page = _lookup.page||1;
        let arrDataSource = _lookup.data;

        let countPage = Math.ceil(arrDataSource.length/pageSize);
        for(let i = 0; i < countPage; i++){
            if((i + 1) != page) continue;
    
            let idxFrom = i * pageSize;
            let idxTo = (i + 1) * pageSize - 1;
            if(idxTo >= arrDataSource.length){
                idxTo = arrDataSource.length - 1;
            }
    
            for(let j = idxFrom; j <= idxTo; j++){
                let objRes = arrDataSource[j];
    
                let value = objRes[valueExpr];
                let display = objRes[displayExpr];
    
                contents += `
                    <tr valign="top" uir-multiselect-id="${value}">
                        <td class="text scv-list-data-row-col" align="right" valign="top" width="14px" nowrap="" scv-data-value="${value}" scv-data-text="${display}">
                            <a href="javascript:void(0)">
                                <img class="uir-popup-add-icon" src="/images/x.gif" border="0" height="13" width="13" alt="">
                            </a>
                        </td>
                        <td class="text scv-list-data-row-col" valign="top" scv-data-value="${value}" scv-data-text="${display}">
                            <a class="smalltextnolink uir-no-link" href="javascript:void(0)">
                            ${display}
                            </a>
                        </td>
                    </tr>
                `;
            }
        }
        
        let contentsBottomButton = getContentsSearchUirTooltip_BottomButton(_curRec, _fieldId, _lookup);
        return `
        <div>
            <table style="width: 100%; margin-top: 15px">
                <tbody>
                    <tr class="text">
                        <td id="lower_header_label" width="50%" align="left">
                            <font style="color:#666666">Click Selection to Add</font>
                        </td>
                        <td align="left" width="50%">
                            <font style="color:#666666; margin-left: 10px">Current Selections</font>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <div class="uir-popup-select-content" width="100%" style="background-color:white; padding: 0px">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" role="presentation">
                                    <tbody>
                                        <tr class="uir-shuttle-panes-tr">
                                            <td width="50%">
                                                <div id="inner_popup_div" data-multiple="false" width="100%" style="vertical-align:top; overflow:auto; background-color:white; ">
                                                    <table border="0" cellpadding="2" cellspacing="1" style="width:100%;" role="presentation">
                                                        <tbody>
                                                        ${contents}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                            <td width="50%" valign="top">
                                                <div id="popup_select_list" width="100%" valign="top" style="overflow: auto; background-color: white; overflow: auto; background-color: white; height: 250px;">
                                                    <table border="0" cellpadding="2" cellspacing="1" style="width:100%;" role="presentation">
                                                        <tbody>
                                                            <tr class="noselections" id="idLineNoSelect">
                                                                <td class="textctr">No Selections Made</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>${contentsBottomButton}</td>
                    </tr>
                    
                </tbody>
            </table>
        </div>
        `;
    }

    const getContentsSearchUirTooltip_BottomButton = (_curRec, _fieldId, _lookup) =>{
        return `
        <form name="multisel_complete" id="multisel_complete">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tbody>
                    <tr>
                        <td align="left">
                            <table cellpadding="0" cellspacing="0" border="0">
                                <tbody>
                                    <tr>
                                        <td>
                                            <table id="tbl_update" cellpadding="0" cellspacing="0" border="0" class="uir-button" style="margin-right:6px;cursor:hand;" role="presentation">
                                                <tbody>
                                                    <tr id="tr_update" class="pgBntG pgBntB">
                                                        <td id="tdleftcap_update"><img src="/images/nav/ns_x.gif" class="bntLT" border="0" height="50%" width="3" alt="">
                                                            <img src="/images/nav/ns_x.gif" class="bntLB" border="0" height="50%" width="3" alt="">
                                                        </td>
                                                        <td id="tdbody_update" height="20" valign="top" nowrap="" class="bntBgB">
                                                            <input type="button" style="" class="rndbuttoninpt bntBgT " value="Done" data-nsps-type="button" data-nsps-label="Done" id="update" name="update">
                                                        </td>
                                                        <td id="tdrightcap_update">
                                                            <img src="/images/nav/ns_x.gif" height="50%" class="bntRT" border="0" width="3" alt="">
                                                            <img src="/images/nav/ns_x.gif" height="50%" class="bntRB" border="0" width="3" alt="">
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                        <td>
                                            <table id="tbl_cancel" cellpadding="0" cellspacing="0" border="0" class="uir-button" style="margin-right:6px;cursor:hand;" role="presentation">
                                                <tbody>
                                                    <tr id="tr_cancel" class="tabBnt">
                                                        <td id="tdleftcap_cancel"><img src="/images/nav/ns_x.gif" class="bntLT" border="0" height="50%" width="10" alt="">
                                                            <img src="/images/nav/ns_x.gif" class="bntLB" border="0" height="50%" width="10" alt="">
                                                        </td>
                                                        <td id="tdbody_cancel" height="20" valign="top" nowrap="" class="bntBgB">
                                                            <input type="button" style="" class="rndbuttoninpt bntBgT " value="Cancel" data-nsps-type="button" data-nsps-label="Cancel" id="cancel" name="cancel"">
                                                        </td>
                                                        <td id="tdrightcap_cancel">
                                                            <img src="/images/nav/ns_x.gif" height="50%" class="bntRT" border="0" width="10" alt="">
                                                            <img src="/images/nav/ns_x.gif" height="50%" class="bntRB" border="0" width="10" alt="">
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>
        `;
    }

    const addContentsSearchUirTooltipMulti_ListSelect = (_value, _text) =>{
        if(jQuery(`#popup_select_list>table>tbody>tr[scv-data-value='${_value}']`).length > 0){
            return;
        }

        if(jQuery("#idLineNoSelect").length > 0){
            jQuery("#idLineNoSelect").remove();
        }
        
        let contentsAdd = `
            <tr class="multiselecttr" scv-data-value="${_value}" scv-data-text="${_text}">
                <td class="text scv-selected-list-data-row-col" scv-data-value="${_value}" scv-data-text="${_text}" style="width: 14px; vertical-align: middle;">
                    <a href="javascript:void(0)">
                        <img class="uir-popup-x-icon" border="0" height="13" width="13" src="/images/x.gif">
                    </a>
                </td>
                <td class="text">${_text}</td>
            </tr>
        `;
        jQuery("#popup_select_list>table>tbody").append(contentsAdd);

        jQuery(".scv-selected-list-data-row-col").off("click");
        jQuery(".scv-selected-list-data-row-col").on( "click", clickUnSelectedOptionOfQuickSearch);
    }

    const removeContentsSearchUirTooltipMulti_ListSelect = (_value) =>{

        jQuery(`#popup_select_list>table>tbody>tr[scv-data-value='${_value}']`).remove();

        if(jQuery("#popup_select_list>table>tbody>tr").length == 0){
            let contentsNoSelection = `
            <tr class="noselections" id="idLineNoSelect">
                <td class="textctr">No Selections Made</td>
            </tr>`;

            jQuery("#popup_select_list>table>tbody").append(contentsNoSelection);
        }
    }

    return {
		ID: ID,
		TYPE: "",
		RECORDS: RECORDS,
		loadRecord,
        setCurrentRecord,
		getCurrentRecord,
		saveCurrentRecord,
        getTotalOfFieldsSublist,
        recalcSyncBalanaceAllocation,
		initLoadField,
        initLoadFieldServer,
        initLoadFieldClient,
        initQuickFindFieldSelect
    };
    
});
