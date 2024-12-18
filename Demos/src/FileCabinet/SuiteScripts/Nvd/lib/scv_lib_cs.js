define(['N/search', 'N/ui/message', '../cons/scv_cons_css.js'],

(search, message, constCSS) => {
	const isContainValue = (value) => {
		let isContain = false;
		if(value !== undefined && value !== null && value !== '') {
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
	
	const insertSelection = (listFields, t, c, f, isAddNull, valueDefault) => {
		if (listFields != null) {
			let custpageField = null;
			let s = search.create({
	    		type: t,
	    		filters: f,
	    		columns: c
	    	});
			let r = s.runPaged({pageSize : 1000});
	    	let numPage = r.pageRanges.length;
	    	let temp, text, isSelected = false, searchPage, numTemp, tempData;
	    	
    		for(let i in listFields) {
    			custpageField = listFields[i];
    			if(custpageField != null) {
	    			custpageField.removeSelectOption({value : null});
	    			if(isAddNull) {
		    			custpageField.insertSelectOption({ value : '', text : '-----'});
		    		}
	    			if(numPage > 0) {
		    			for(let np = 0; np < numPage; np++) {
		        			searchPage = r.fetch({index : np });
		        			tempData = searchPage.data;
		            		if(isContainValue(tempData)) {
		            			numTemp = tempData.length;
					    		for(let i = 0; i < numTemp; i++) {
					    			temp = tempData[i].getValue(c[0]);
					    			text = tempData[i].getValue(c[1]);
					    			isSelected = valueDefault && (temp === valueDefault);
					    			custpageField.insertSelectOption({value : temp, text : text, isSelected: isSelected});
					    		}
		            		}
		    			}	
	    			}	
    			}
    		}	    	
		}
    }
	
	const insertSelectionFlowListValue = (listFields, isAddNull, valueDefault, listValues) => {
		if (listFields != null) {
			let custpageField = null, isSelected = false;
			
			for(let i in listFields) {
				custpageField = listFields[i];
				if(custpageField != null) {
					custpageField.removeSelectOption({value : null});
					if(isAddNull) {
						custpageField.insertSelectOption({ value : '', text : '-----'});
					}
					if(listValues.length > 0) {
						for(let objValue of listValues) {
							isSelected = valueDefault && (valueDefault === objValue.value);
							custpageField.insertSelectOption({value : objValue.value, text : objValue.text, isSelected: isSelected});
						}
					}
				}
			}
		}
	}
	
	const validateFieldMandatory = (curRec, lstFields) => {
		let isValid = true;
		for(let i = 0; i < lstFields.length; i++){
			let infoField = curRec.getField(lstFields[i]);
			if(!infoField) continue;
			
			if(infoField.isMandatory === true){
				let valueField = curRec.getValue(lstFields[i]);
				if(infoField.type === "multiselect"){
					if(valueField.length > 0 && !isContainValue(valueField[0])){
						isValid = false;
						alert("Please enter value(s) for: " + infoField.label);
						break;
					}
				}
				if(!isContainValue(valueField)){
					isValid = false;
					alert("Please enter value(s) for: " + infoField.label);
					break;
				}
			}
		}

		return isValid;
	}
	
	const showLoadingDialog = (isShow) => {
		let progessElement = "";
		if(isShow) {
			let container = document.getElementById("pageContainer") || document.getElementById("outerwrapper");
			if(!container) return console.error("Not found ElementId");

			loadStyleToHtmlPage(container);
			let mainLoader = document.createElement('div');
			mainLoader.classList.add("scvMainLoader");
			mainLoader.innerHTML = '<span class="scvLoader"></span><span id="idxProgessStatus" class="scvProgessStatus">Processing...</span>';
			
			container.appendChild(mainLoader);
			progessElement = document.querySelector(".scvProgessStatus");
		} else {
			let mainLoader = document.querySelector(".scvMainLoader");
			if(mainLoader) mainLoader.remove();
		}
		return progessElement;
	}

	const loadStyleToHtmlPage = (container) => {
		let addLoading = container.getAttribute("scv-add-loading");
		if(addLoading === "T") return;
		container.setAttribute("scv-add-loading", "T");

		let linkElement = document.createElement('style');
		let textNode = document.createTextNode(constCSS.LOADING);
		linkElement.appendChild(textNode);
		document.head.appendChild(linkElement);
	}
	
	const updateProgessStatus = (_msg) =>{
		jQuery("#idxProgessStatus").html(_msg);
	}
	
	const validateDate = (currentRecord, sonam) => {
		let isValid = true;
		let objFromdate = currentRecord.getValue('custpage_fromdate');
		let objTodate = currentRecord.getValue('custpage_todate');
		if(objFromdate && objTodate) {
			let fromYear = objFromdate.getFullYear();
			let toYear = objTodate.getFullYear();
			let subOfFomtoyear = toYear - fromYear;
			if(sonam && subOfFomtoyear > sonam) {
				isValid = false;
				alert('Bạn chỉ được trong vòng ' + (sonam + 1) + ' năm');
			} else if(subOfFomtoyear < 0) {
				isValid = false;
				alert('ĐẾN NGÀY phải lớn hơn TỪ NGÀY!');
			}
		}
		return isValid;
	}
	
	const updateRowHeight = (worksheet, duan_display, extendNumber, rowNumber, lengRow) =>  {
		const row1 = worksheet.getRow(rowNumber);
		row1.height = calculateRowHeight(duan_display, extendNumber, lengRow);
	}
	
	const calculateRowHeight = (cellValue, extendNumber, lengRow) => {
		const lineHeight = 16.8;
		const numLines = Math.ceil((cellValue.length + extendNumber)/lengRow);
		return lineHeight * numLines;
	}
	
	const getProjectNameForSublist = (currentRecord) => {
		let listProjectText = currentRecord.getText('custpage_project');
		for(let idx in listProjectText) {
			let valueProject = listProjectText[idx];
			listProjectText[idx] = valueProject.substring(0, 31);
		}
		return listProjectText;
	}
	
	const fnValidateFields = (curRec, arrFields) => {
		const lF = arrFields.length;
		for (let i = 0; i < lF; i++) {
			const fld = arrFields[i];
			const objFld = curRec.getField(fld);
			const val = curRec.getValue(fld);
			if (val === null || val === ''|| !val.toString() ) {
				alert('Please fill in ' + objFld.label + ' field');
				return false;
			}
		}
		return true;
	}

	const showMsgError = (_msg, _duration = 10000) =>{
		return message.create({
			title: "Error",
			message: _msg || "Error",
			type: message.Type.ERROR
		}).show({duration: _duration});
	}
	
	const unReText = (text) => {
		let newText = text
		if(isContainValue(text)) {
			newText = newText.replace(/&amp;/gi, '&');
			newText = newText.replace(/&gt;/gi, ">");
			newText = newText.replace(/&lt;/gi, "<");
			newText = newText.replace(/&apos;/g, "'");
			newText = newText.replace(/&quot;/g, "\"");
			newText = newText.replace(//g, "");
		}
		return newText;
	}
	
	const parseBodyDatax3C = (bodyData) => {
		let idx3C = bodyData.indexOf('\x3C!');
		if(idx3C >= 0) {
			bodyData = unReText(bodyData.substring(0, idx3C));
		}
		return bodyData;
	}

	function delay(ms) {
		return new Promise(function (resolve) {
			setTimeout(resolve, ms);
		});
	}
	
    return {
    	isContainValue,
    	insertSelection,
		insertSelectionFlowListValue,
		showLoadingDialog,
		updateProgessStatus,
		validateFieldMandatory,
		validateDate,
		updateRowHeight,
		fnValidateFields,
		getProjectNameForSublist,
		showMsgError,
		parseBodyDatax3C,
		delay
    };
    
});
