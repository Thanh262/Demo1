/**
 * @NApiVersion 2.1
 */
define(['N/record', './scv_lib_report', '../lib/scv_lib_function'],
    
    (record, lrp, lbf) => {
        
        const createJournalFromITemReceipt = (readRecord) => {
            let related_transaction = readRecord.getValue('custbody_scv_related_transaction');
            let internalidJn = null;
            if(!related_transaction) {
                let recJournal = record.create({type: record.Type.JOURNAL_ENTRY, isDynamic: true});
                setDefaultFromItemReceiptToJournal(readRecord, recJournal, true);
                internalidJn = recJournal.save();
            }
            return internalidJn;
        }
        
        const setDefaultFromItemReceiptToJournal = (readRecord, newRecord, isDynamic) => {
            let newFields = ['subsidiary','location', 'department', 'class', 'trandate', 'postingperiod', 'memo', 'custbody_scv_itr_custom_no', 'custbody_scv_tb_entity_name'];
            let readFields = ['subsidiary', 'location', 'department', 'class', 'trandate', 'postingperiod', 'memo', 'custbody_scv_itr_custom_no', 'entity'];
            lbf.setValue(newRecord, readRecord, newFields, readFields);
            
            let listAccount = searchAccountFlNumber(['33191001', '33312001']);
            let account33191 = listAccount.find(o => o.number === '33191001')?.internalid;
            let account33312 = listAccount.find(o => o.number === '33312001')?.internalid;
            let newSublist = 'line';
            let newSublistFieldsDb = ['account', 'taxcode', 'taxrate1', 'debit', 'credit', 'tax1amt', 'grossamt', 'location'];
            let newSublistFieldsCr = ['account', 'taxcode', 'taxrate1', 'credit','grossamt', 'location'];
            let listTaxcode = searchTaxcode();
            const taxcodeUNDEF = 5;
            const taxrateUNDEF = 0;
            let i = 0;
            
            let inb_tax_code = readRecord.getValue('custbody_scv_vat_import_code');
            let inb_tax_amount = Number(readRecord.getValue('custbody_scv_vat_import'));
            if(inb_tax_code && inb_tax_amount > 0) {
                let objTaxcode = listTaxcode.find(o => o.internalid === inb_tax_code);
                let import_code_rate = Number((objTaxcode?.rate || '0').replace('%', ''));
                let locationline = readRecord.getValue('location');
                let datalineDebit = [account33191, inb_tax_code, import_code_rate, 0, 0, inb_tax_amount, inb_tax_amount, locationline];
                let datalineCredit = [account33312, taxcodeUNDEF, taxrateUNDEF, inb_tax_amount, inb_tax_amount, locationline];
                if(isDynamic) {
                    newRecord.selectNewLine({sublistId: newSublist, line: i});
                    setCurrentSublistValueData(newRecord, newSublist, newSublistFieldsDb, datalineDebit, true);
                    i++;
                    newRecord.commitLine({sublistId: newSublist});
                    setCurrentSublistValueData(newRecord, newSublist, newSublistFieldsCr, datalineCredit, true);
                    i++;
                    newRecord.commitLine({sublistId: newSublist});
                } else {
                    newRecord.insertLine({sublistId: newSublist, line: i});
                    lbf.setSublistValueData(newRecord, newSublist, newSublistFieldsDb, i, datalineDebit);
                    i++;
                    newRecord.insertLine({sublistId: newSublist, line: i});
                    lbf.setSublistValueData(newRecord, newSublist, newSublistFieldsCr, i, datalineCredit);
                    i++;
                }
            }
            
            lbf.setValueData(newRecord, ['custbody_scv_created_transaction', 'currency', 'exchangerate'], [readRecord.id, 1, 1]);
        }
        
        const setCurrentSublistValueData = (newRecord, newSublist, newSublistFields, data, ignoreFieldChange) => {
            let lFields = newSublistFields.length;
            let value;
            for(let i = 0; i < lFields; i++) {
                value = newRecord.getCurrentSublistValue({sublistId: newSublist, fieldId: newSublistFields[i]});
                if(value !== undefined) {
                    value = data[i];
                    newRecord.setCurrentSublistValue({sublistId: newSublist, fieldId: newSublistFields[i], value: value, ignoreFieldChange: ignoreFieldChange});
                }
            }
        }
        
        const searchAccountFlNumber = (arrAccNum) => {
            let listAccount = [];
            let columns = ['internalid', 'number'];
            let arrCol = ['internalid', 'number'];
            let arrFilter = [["formulatext: case when {number} in ('" + arrAccNum.join("','") + "') then '1' else '0' end", 'is', '1'], 'and', ['isinactive', 'is', false]];
            lrp.doSearch('account', listAccount, columns, arrCol, arrFilter);
            return listAccount;
        }
        
        const searchTaxcode = () => {
            let listAccount = [];
            let columns = ['internalid', 'name', 'rate'];
            let arrCol = ['internalid', 'name', 'rate'];
            let arrFilter = [['isinactive', 'is', false]];
            lrp.doSearch('salestaxitem', listAccount, columns, arrCol, arrFilter);
            return listAccount;
        }
        
        return {createJournalFromITemReceipt, setDefaultFromItemReceiptToJournal}

    });
