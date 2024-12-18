define(['N/search','N/record', 'N/render', 'N/file'],
(search, record, render, file) => {

	const initTemplateRender = (_templateId) => {
		let tmplRender = render.create();
		if (isNaN(_templateId)) {
			tmplRender.setTemplateByScriptId(_templateId);
		} else {
			tmplRender.setTemplateById(_templateId);
		}

        tmplRender.addCustomDataSource({
			format: render.DataSource.OBJECT,
			alias: "libPdf",
			data: {
				font: {
					times: getUrlFile('../font/times/times_src.ttf'),
					times_bold: getUrlFile('../font/times/times_bold.ttf'),
					times_italic: getUrlFile('../font/times/times_italic.ttf'),
					times_bolditalic: getUrlFile('../font/times/times_italic_bold.ttf'),
				},
				css: getContentsFile('../css/scv_pdf_print.css'),
				rowcol100: getRowWithNumColumn(100),
				rowcol50: getRowWithNumColumn(50),
			}
		});

		return tmplRender;
	}
	const addCustomStyle = (_render) => {
		_render.addCustomDataSource({
			format: render.DataSource.OBJECT,
			alias: "libPdf",
			data: {
				font: {
					times: getUrlFile('../font/times/times_src.ttf'),
					times_bold: getUrlFile('../font/times/times_bold.ttf'),
					times_italic: getUrlFile('../font/times/times_italic.ttf'),
					times_bolditalic: getUrlFile('../font/times/times_italic_bold.ttf'),
				},
				css: getContentsFile('../css/scv_pdf_print.css'),
				rowcol100: getRowWithNumColumn(100),
				rowcol50: getRowWithNumColumn(50),
			}
		});
	}
	const getRowWithNumColumn = (_numCol) => {
		let width_percent = 100/_numCol;
		let contents = "<tr height='0%'>";
		for(let i = 0; i < _numCol; i++){
			contents += "<td width='" + width_percent + "%'></td>"
		}
		contents += "</tr>";

		return contents;
	}

	const getContentsFile = (_fileId) => {
		return file.load({id: _fileId}).getContents();
	}

	const getUrlFile = (_fileId) => {
		return file.load({id: _fileId}).url;
	}

	const formatNumber = (_num) => {
		let parts = _num.toString().split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
		return parts.join(",");
	}

	const formatNumberWithObject = (_inputObj) => {
		Object.keys(_inputObj).forEach(ele => {
			if(!!_inputObj[ele] && !isNaN(_inputObj[ele])){
				_inputObj[ele] = formatNumber(_inputObj[ele]);
			}
		});

		return _inputObj;
	}

	const renderTemplateWithXml = (printfile) => {
		try {
			let xmlPdfPath = `../xml/pdf/${printfile}.xml`;
			let xmlString = getContentsFile(xmlPdfPath);

			let tmplRender = render.create();

			tmplRender.addCustomDataSource({
				format: render.DataSource.OBJECT,
				alias: "libPdf",
				data: {
					font: {
						times: getUrlFile('../font/times/times_src.ttf'),
						times_bold: getUrlFile('../font/times/times_bold.ttf'),
						times_italic: getUrlFile('../font/times/times_italic.ttf'),
						times_bolditalic: getUrlFile('../font/times/times_italic_bold.ttf'),
					},
					css: getContentsFile('../css/scv_pdf_print.css')
				}
			});

			tmplRender.templateContent = xmlString;

			return tmplRender;
		} catch (err) {
			throw err.message;
		}
	}

	const createImageBySubsidiary = (logoId, _height, _width) => {
		let tagImg = generateTagImageHtml(logoId, _height, _width);
		return tagImg;
	}

	const generateTagImageHtml = (_logoId, _orgWidth, _orgHeight, _expectedWidth) =>{
		let srcLogo = getUrlFile(_logoId);
		let image = `<img src="${unReTextXML(srcLogo)}" alt="view" style="width: ${_orgWidth}px; height: ${_orgHeight}px;" />`;
		return image;
	}

	function unReTextXML(text) {
		var cus_name = text
		if(!!text && typeof text === "string") {
			cus_name = cus_name.replace(/&/gi, '&amp;');
			cus_name = cus_name.replace(/>/gi, "&gt;");
			cus_name = cus_name.replace(/</gi, "&lt;");
			cus_name = cus_name.replace(/'/g, "&apos;");
			cus_name = cus_name.replace(/"/g, "&quot;");
		}
		return cus_name;
	}


	const roundNumber = (_number, _precision = 2) => {
		let precision = Math.pow(10, _precision);
		return Math.round(_number * precision) / precision;
	}

    return {
		initTemplateRender: initTemplateRender,
		formatNumber: formatNumber,
		formatNumberWithObject: formatNumberWithObject,
		addCustomStyle: addCustomStyle,
		renderTemplateWithXml: renderTemplateWithXml,
		createImageBySubsidiary: createImageBySubsidiary
	};

});
