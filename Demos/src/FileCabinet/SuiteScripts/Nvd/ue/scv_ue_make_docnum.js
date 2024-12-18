/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/record'],

    (search, record) => {
        const objCustomRecordType = {
            SALES_CONTRACT: 'customrecord_scv_sales_contract'
        };

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {
            switch (scriptContext.newRecord.type) {
                case record.Type.EMPLOYEE:
                    beforeLoadEmployee(scriptContext);
                    break;
                case objCustomRecordType.SALES_CONTRACT:
                    beforeLoadSalesContract(scriptContext);
                    break;
            }
        }

        function beforeLoadSalesContract(scriptContext) {
            const trigType = scriptContext.type;
            let newRecord = scriptContext.newRecord;
            if (['create', 'copy', 'edit'].indexOf(trigType) !== -1) {
                let form = scriptContext.form;
                form.getField('name').updateDisplayType({displayType: 'disabled'});
                if (trigType !== 'edit') {
                    newRecord.setValue({fieldId: 'name', value: 'TO BE GENERATED'});
                }
            }
        }

        function beforeLoadEmployee(scriptContext) {
            const trigType = scriptContext.type;
            let newRecord = scriptContext.newRecord;
            if (['create', 'copy', 'edit'].indexOf(trigType) !== -1) {
                newRecord.setValue('autoname', false);
                let form = scriptContext.form;
                form.getField('autoname')?.updateDisplayType({displayType: 'hidden'});
                form.getField('entityid').updateDisplayType({displayType: 'disabled'});
                if (trigType !== 'edit') {
                    newRecord.setValue({fieldId: 'entityid', value: 'TO BE GENERATED'});
                }
            }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {
            switch (scriptContext.newRecord.type) {
                case record.Type.EMPLOYEE:
                    setGenerateName(scriptContext);
                    break;
                case objCustomRecordType.SALES_CONTRACT:
                    setGenerateName(scriptContext);
                    break;
            }
        }


        function setGenerateName(scriptContext) {
            const trigType = scriptContext.type;
            if (scriptContext.newRecord.id != '397') {
                if (trigType !== 'create') return;
            }
            let newRecord = scriptContext.newRecord;
            let options = getOptions(newRecord);
            const oldDocNum = newRecord.getValue(options.fieldNameId);
            if ((oldDocNum === '' || oldDocNum === null || oldDocNum?.toUpperCase() === 'TO BE GENERATED')) {
                const maxNumber = findMaxNumber(options);
                const docNum = getDocNum({
                    maxNumber: maxNumber,
                    prefix: options.prefix,
                    delimiter: options.delimiter,
                    suffix: options.suffix,
                    recordType: newRecord.type,
                    digit: options.digit
                });
                newRecord.setValue(options.fieldNameId, docNum);
            }
        }

        /**
         * Des : Get document number
         * @param options
         * @returns {*}
         */
        function getDocNum(options) {
            const maxNumberStr = options.maxNumber.toString().padStart(options.digit, '0');
            switch (options.recordType) {
                case record.Type.EMPLOYEE:
                    return options.prefix + options.delimiter + maxNumberStr + options.suffix;
                    break;
                case objCustomRecordType.SALES_CONTRACT:
                    return maxNumberStr + options.suffix;
                    break;
            }
        }

        function findMaxNumber(options) {
            let filters = [];
            if (!!options?.addFilter && Array.isArray(options.addFilter) && options.addFilter.length) {
                filters = filters.concat(options.addFilter);
            } else {
                filters = filters.concat([search.createFilter({
                    name: 'formulatext',
                    formula: `SUBSTR({${options.fieldNameId}}, 1, ${options.prefix.length + options.delimiter.length})`,
                    operator: 'is',
                    values: options.prefix + options.delimiter
                })]);
            }
            let c = [];
            if (Array.isArray(options.addColumn) && options.addColumn.length) {
                c = c.concat(options.addColumn);
            } else {
                c.push({
                    name: 'formulanumeric',
                    formula: `SUBSTR(SUBSTR({${options.fieldNameId}}, 1, INSTR({${options.fieldNameId}}, '_') -1 ), ${options.prefix.length + options.delimiter.length + 1})`,
                    summary: 'MAX'
                });
            }
            let searchObj = search.create({type: options.recordType, filters: filters, columns: c});
            let searchResults = searchObj.run().getRange(0, 1);
            let maxNumber = 1;
            if (searchResults.length) maxNumber = (+searchResults[0].getValue(c[0]) || 0) + 1;
            return maxNumber;
        }

        function getOptions(curRec) {
            let options = {
                recordType: curRec.type,
                prefix: '',
                digit: 3,
                fieldNameId: '',
                prefixNumber: 0,
                delimiter: '',
                suffix: '',
                addFilter: []
            };
            switch (curRec.type) {
                case record.Type.EMPLOYEE:
                    setDataConfigEmployee(curRec, options);
                    break;
                case objCustomRecordType.SALES_CONTRACT:
                    setDataConfigSalesContract(curRec, options);
                    break;
            }
            return options;
        }

        function setDataConfigSalesContract(curRec, options) {
            options.fieldNameId = 'name';
            options.digit = 2;
            let dateSC = curRec.getValue('custrecord_scv_sc_date');
            let customerId = curRec.getValue('custrecord_scv_sc_cus');
            let year = '', codeCustomer = '';
            const stringStatic = '/VD-';
            if (dateSC) year = dateSC.getFullYear().toString();
            if (customerId) {
                codeCustomer = search.lookupFields({
                    type: 'customer',
                    id: customerId,
                    columns: ['custentity_scv_short_code']
                })?.custentity_scv_short_code || '';
            }
            let suffix = stringStatic + codeCustomer + '/' + year;
            options.prefix = '';
            options.delimiter = '';
            options.suffix = suffix;
            options.addFilter = [
                // search.createFilter({
                //     name: 'formulatext',
                //     formula: `SUBSTR({${options.fieldNameId}}, INSTR({${options.fieldNameId}}, '/', 1))`,
                //     operator: 'is',
                //     values: options.suffix
                // }),
                search.createFilter({
                    name: 'formulatext',
                    formula: `TO_CHAR({custrecord_scv_sc_date}, 'YYYY')`,
                    operator: 'is',
                    values: year
                })
            ];
            options.addColumn = [
                search.createColumn({
                    name: 'formulanumeric',
                    formula: `SUBSTR({${options.fieldNameId}}, 1, INSTR({${options.fieldNameId}}, '/', 1) -1)`,
                    summary: 'MAX'
                })
            ];
        }

        function setDataConfigEmployee(curRec, options) {
            let prefix = '', suffix = '';
            options.fieldNameId = 'entityid';
            const subId = curRec.getValue('subsidiary');
            const subCode = search.lookupFields({
                type: 'subsidiary',
                id: subId,
                columns: ['custrecord_scv_sub_code']
            })?.custrecord_scv_sub_code || '';
            if (subCode) prefix += subCode;
            const hireDate = curRec.getValue('hiredate');
            if (hireDate) prefix += hireDate.getFullYear().toString().substring(2, 4);
            const firstName = curRec.getValue('firstname');
            const departmentId = curRec.getValue('department');
            const codeDepartment = search.lookupFields({
                type: 'department',
                id: departmentId,
                columns: ['custrecord_scv_dep_short_name']
            })?.custrecord_scv_dep_short_name || '';
            suffix += '_' + codeDepartment;
            suffix += '_' + firstName;
            options.prefix = prefix;
            options.delimiter = '';
            options.suffix = suffix;
            options.addFilter = [
                search.createFilter({name: 'subsidiary', operator: 'anyof', values: subId}),
                search.createFilter({
                    name: 'formulatext',
                    formula: `SUBSTR({${options.fieldNameId}}, 1, ${options.prefix.length + options.delimiter.length})`,
                    operator: 'is',
                    values: options.prefix + options.delimiter
                })
            ];
        }

        return {
            beforeLoad,
            beforeSubmit,
        }

    });
