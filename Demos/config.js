/**
 * SuiteScript module
 *
 * @module N/config
 * @NApiVersion 2.x
 */
define([], function () {
    /**
     * @namespace config
     */
    var config = {};

    /**
     * Load a configuration object with a specific type
     * @governance 10 units
     * @restriction Server SuiteScript only
     *
     * @param {Object} options
     * @param {string} options.type one of the Type values
     * @param {boolean} options.isDynamic load record in dynamic or deferred dynamic mode
     * @return {Record}
     *
     * @throws {SuiteScriptError} INVALID_RCRD_TYPE Thrown if an invalid record type was provided.
     *
     * @since 2015.2
     */
    config.load = function (options) { };

    /**
     * Enum configuration type values.
     * @readonly
     * @enum {string}
     * @since 2015.2
     */
    function configType() {
        this.USER_PREFERENCES = 'userpreferences';
        this.COMPANY_INFORMATION = 'companyinformation';
        this.COMPANY_PREFERENCES = 'companypreferences';
        this.ACCOUNTING_PREFERENCES = 'accountingpreferences';
        this.MANUFACTURING_PREFERENCES = 'manufacturingpreferences';
        this.ACCOUNTING_PERIODS = 'accountingperiods';
        this.TAX_PERIODS = 'taxperiods';
        this.FEATURES = 'companyfeatures';
        this.TIME_POST = 'timepost';
        this.TIME_VOID = 'timevoid';
    }

    config.prototype.Type = new configType();

    /**
     * Primary object used to encapsulate a record object.
     *
     * @protected
     * @alias RawRecord
     *
     * @param {Object} options
     * @param {RecordPayload} options.recordObj (server-generated object holding the full metadata and data for a record type,
     *                                           including all scripting and customization)
     * @param {boolean?} options.noPageInit
     * @param {Object} options.parentLink
     * @returns {RawRecord} client-side record implementation
     * @constructor
     *
     * @since 2015.2
     */
    function Record() {

        /**
         * remove body field data
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if fieldId is missing or undefined
         */
        this.removeField = function (options) { };

        /**
         * return array of names of all body fields, including machine header field and matrix header fields
         * @governance none
         * @return {Array<string>}
         *
         * @since 2015.2
         */
        this.getFields = function () { };

        /**
         * return array of names of all sublists
         * @governance none
         * @return {Array<string>}
         *
         * @since 2015.2
         */
        this.getSublists = function () { };

        /**
         * Returns the value of a field. Gets a numeric value for rate and ratehighprecision fields.
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId The internal ID of a standard or custom body field.
         * @return {(number|Date|string|Array|boolean)}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if fieldId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_API_USAGE if invoked after using setText
         *
         * @since 2015.2
         */
        this.getValue = function (options) { };

        /**
         * set value of the field
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId The internal ID of a standard or custom body field.
         * @param {number|Date|string|Array|boolean} options.value The value to set the field to.
         * @param {boolean} [options.ignoreFieldChange=false] Ignore the field change script
         * @param {boolean} [options.forceSyncSourcing=false] force synchronous sourcing
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if fieldId is missing or undefined
         *
         * @since 2015.2
         */
        this.setValue = function (options) { };

        /**
         * set value of the field by text representation
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId The internal ID of a standard or custom body field.
         * @param {string} options.text ----- The text or texts to change the field value to.
         *    If the field type is multiselect: - This parameter accepts an array of string values. - This parameter accepts a
         *     null value. Passing in null deselects all currentlsy selected values. If the field type is not multiselect: this
         *     parameter accepts only a single string value.
         * @param {boolean} [options.ignoreFieldChange=false] ignore field change script and slaving event if set to true
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if fieldId is missing or undefined
         *
         * @since 2015.2
         */
        this.setText = function (options) { };

        /**
         * return the line number for the first occurrence of a field value in a sublist and return -1 if not found
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId The internal ID of the sublist.
         * @param {string} options.fieldId
         * @param {(number|Date|string|Array|boolean)} options.value
         * @return {number}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or field is missing
         *
         * @since 2015.2
         */
        this.findSublistLineWithValue = function (options) { };

        /**
         * return value of a sublist field
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @return {(number|Date|string|Array|boolean)}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId, fieldId, or line is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id, field id, or line number
         * @throws {SuiteScriptError} SSS_INVALID_API_USAGE if invoked after using setSublistText
         *
         * @since 2015.2
         */
        this.getSublistValue = function (options) { };

        /**
         * set the value of a sublist field (available for deferred dynamic only)
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @param {(number|Date|string|Array|boolean)} options.value
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId, fieldId, or line is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id, field id, or line number
         *
         * @since 2015.2
         */
        this.setSublistValue = function (options) { };

        /**
         * set the value of a sublist field in text representation (available for deferred dynamic only)
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @param {string} options.text
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId, fieldId, or line is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id, field id, or line number
         *
         * @since 2015.2
         */
        this.setSublistText = function (options) { };

        /**
         * return line count of sublist
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {number}
         *
         * @since 2015.2
         */
        this.getLineCount = function (options) { };

        /**
         * insert a sublist line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {number} options.line
         * @param {string} options.beforeLineInstanceId
         * @param {boolean} [ignoreRecalc=false] options.ignoreRecalc ignore recalc scripting
         * @return {Line} [new line object]
         * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS if both line and beforeLineInstanceId are provided
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or both line and beforeLineInstanceId
         *     are missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if sublistId or line index is invalid or if machine is not
         *     editable or before exists and before is an instanceId that does not point to a line in the sublist.
         *
         * @since 2015.2
         */
        this.insertLine = function (options) { };

        /**
         * Move one line to desired location.
         * You can address both lines either by Line Instance IDs or both by Indexes.
         * Order of all other lines is preserved.
         * Line indexes between original and final position are shifted by one.
         * @param {Object|string} options (sublistId)
         * @param {string} options.sublistId
         * @param {number} options.from (0-based index)
         * @param {number} options.to (0-based index)
         * @param {string} options.fromInstanceId (line instance ID)
         * @param {string} options.toInstanceId (line instance ID)
         * @param {number} from (0-based index)
         * @param {number} to (0-based index)
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId, from or to is missing
         * @throws {SuiteScriptError} SSS_SUBLIST_DOESNT_SUPPORT_MOVING_LINES if machine doesn't support line moving
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if sublistId or line indexes are invalid
         */
        this.moveLine = function (options) { };

        /**
         * Commits and copies the currently selected line into a new line, which will be the new selected line.
         *
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if sublistId is invalid or not editable
         */
        this.copyLine = function (options) { };

        /**
         * remove a sublist line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {number} options.line
         * @param {string} options.lineInstanceId
         * @param {boolean} [options.ignoreRecalc=false] options.ignoreRecalc ignore recalc scripting
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS if both line and lineInstanceId are provided
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or both line and lineInstanceId are
         *     missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if sublistId or line index is invalid or if machine is not
         *     editable
         *
         * @since 2015.2
         */
        this.removeLine = function (options) { };

        /**
         * select a new line at the end of sublist
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Line} [new line object]
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id or sublist is not editable
         * @restriction only available in dynamic record
         *
         * @since 2015.2
         */
        this.selectNewLine = function (options) { };

        /**
         * cancel the current selected line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if sublistId is invalid or if machine is not editable
         * @restriction only available in dynamic record
         *
         * @since 2015.2
         */
        this.cancelLine = function (options) { };

        /**
         * commit the current selected line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id
         * @restriction only available in dynamic record
         *
         * @since 2015.2
         */
        this.commitLine = function (options) { };

        /**
         * return value of a sublist field on the current selected sublist line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @return {(number|Date|string|Array|boolean)}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id or field id
         * @restriction only available in dynamic record
         *
         * @since 2015.2
         */
        this.getCurrentSublistValue = function (options) { };

        /**
         * set the value for field in the current selected line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {(number|Date|string|Array|boolean)} options.value
         * @param {boolean} [options.ignoreFieldChange=false] ignore field change script and slaving event if set to true
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @throws {SuiteScriptError} A_SCRIPT_IS_ATTEMPTING_TO_EDIT_THE_1_SUBLIST_THIS_SUBLIST_IS_CURRENTLY_IN_READONLY_MODE_AND_CANNOT_BE_EDITED_CALL_YOUR_NETSUITE_ADMINISTRATOR_TO_DISABLE_THIS_SCRIPT_IF_YOU_NEED_TO_SUBMIT_THIS_RECORD
         *     if user tries to edit readonly sublist field
         *
         * @since 2015.2
         */
        this.setCurrentSublistValue = function (options) { };

        /**
         * set the value for field in the current selected line by text representation
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {(number|Date|string|Array|boolean)} options.text
         * @param {boolean} [options.ignoreFieldChange=false] ignore field change script and slaving event if set to true
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @throws {SuiteScriptError} A_SCRIPT_IS_ATTEMPTING_TO_EDIT_THE_1_SUBLIST_THIS_SUBLIST_IS_CURRENTLY_IN_READONLY_MODE_AND_CANNOT_BE_EDITED_CALL_YOUR_NETSUITE_ADMINISTRATOR_TO_DISABLE_THIS_SCRIPT_IF_YOU_NEED_TO_SUBMIT_THIS_RECORD
         *     if user tries to edit readonly sublist field
         * @restriction only available in dynamic record
         *
         * @since 2015.2
         */
        this.setCurrentSublistText = function (options) { };

        /**
         * save record updates to the system
         * @governance 20 units for transactions, 4 for custom records, 10 for all other records
         *
         * @param {Object} options
         * @param {boolean} [options.enableSourcing=false] enable sourcing during record update
         * @param {boolean} [options.ignoreMandatoryFields=false] ignore mandatory field during record submission
         * @return {number} id of submitted record
         *
         * @since 2015.2
         */
        this.save = function (options) { };
        this.save.promise = function (options) { };

        /**
         * return a value indicating if the field has a subrecord
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {boolean}
         *
         * @since 2015.2
         */
        this.hasSubrecord = function (options) { };

        /**
         * get the subrecord for the associated field
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {Subrecord} [client-side subrecord implementation]
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.fieldId is missing or undefined
         * @throws {SuiteScriptError} FIELD_1_IS_NOT_A_SUBRECORD_FIELD if field is not a subrecord field
         * @throws {SuiteScriptError} FIELD_1_IS_DISABLED_YOU_CANNOT_APPLY_SUBRECORD_OPERATION_ON_THIS_FIELD if field is disable
         *
         * @since 2015.2
         */
        this.getSubrecord = function (options) { };

        /**
         * remove the subrecord for the associated field
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {Record} same record, for chaining
         *
         * @since 2015.2
         */
        this.removeSubrecord = function (options) { };

        /**
         * return a value indicating if the associated sublist field has a subrecord
         * @governance 0
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @restriction only available in deferred dynamic record
         * @return {boolean}
         *
         * @since 2015.2
         */
        this.hasSublistSubrecord = function (options) { };

        /**
         * get the subrecord for the associated sublist field
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @restriction only available in deferred dynamic record
         * @return {Subrecord} [client-side subrecord implementation]
         *
         * @since 2015.2
         */
        this.getSublistSubrecord = function (options) { };

        /**
         * remove the subrecord for the associated sublist field
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @restriction only available in deferred dynamic record
         * @return {Record} same record, for chaining
         *
         * @since 2015.2
         */
        this.removeSublistSubrecord = function (options) { };

        /**
         * return a value indicating if the associated sublist field has a subrecord on the current line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @restriction only available in dynamic record
         * @return {boolean}
         *
         * @since 2015.2
         */
        this.hasCurrentSublistSubrecord = function (options) { };

        /**
         * get the subrecord for the associated sublist field on the current line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @restriction only available in dynamic record
         * @return {Subrecord} [client-side subrecord implementation]
         *
         * @since 2015.2
         */
        this.getCurrentSublistSubrecord = function (options) { };

        /**
         * remove the subrecord for the associated sublist field on the current line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @restriction only available in dynamic record
         * @return {Record} same record, for chaining
         *
         * @since 2015.2
         */
        this.removeCurrentSublistSubrecord = function (options) { };

        /**
         * returns the specified sublist
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Sublist} [requested sublist]
         *
         * @since 2015.2
         */
        this.getSublist = function (options) { };

        /**
         * return array of names of all fields in a sublist
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Array}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.sublistId is missing or undefined
         *
         * @since 2015.2
         */
        this.getSublistFields = function (options) { };

        /**
         * return field object from record
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.fieldId is missing or undefined
         *
         * @since 2015.2
         */
        this.getField = function (options) { };

        /**
         * return field object from record's sublist
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @return {Field} [requested field]
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if line number is invalid
         *
         * @since 2015.2
         */
        this.getSublistField = function (options) { };

        /**
         * return field object from record's sublist current line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @restriction only available in dynamic record
         *
         * @since 2015.2
         */
        this.getCurrentSublistField = function (options) { };

        /**
         * set the value for the associated header in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.column the column number for the field
         * @param {string} options.value the value to set it to
         * @param {boolean} [options.ignoreFieldChange] Ignore the field change script (default false)
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {Record} same record, for chaining
         *
         * @since 2015.2
         */
        this.setMatrixHeaderValue = function (options) { };

        /**
         * get the value for the associated header in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.column the column number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {number|Date|string}
         *
         * @since 2015.2
         */
        this.getMatrixHeaderValue = function (options) { };

        /**
         * set the value for the associated field in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.line the line number for the field
         * @param {number} options.column the column number for the field
         * @param {string} options.value the value to set it to
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @restriction only available in deferred dynamic record
         * @return {Record} same record, for chaining
         *
         * @since 2015.2
         */
        this.setMatrixSublistValue = function (options) { };

        /**
         * get the value for the associated field in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.line the line number for the field
         * @param {number} options.column the column number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {number|Date|string}
         *
         * @since 2015.2
         */
        this.getMatrixSublistValue = function (options) { };

        /**
         * get the field for the specified header in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.column the column number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {Field} [requested field]
         *
         * @since 2015.2
         */
        this.getMatrixHeaderField = function (options) { };

        /**
         * get the field for the specified sublist in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.column the column number for the field
         * @param {number} options.line the line number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {Field} [requested field]
         *
         * @since 2015.2
         */
        this.getMatrixSublistField = function (options) { };

        /**
         * returns the line number of the first line that contains the specified value in the specified column of the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.value the column number for the field
         * @param {number} options.column the line number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {number}
         *
         * @since 2015.2
         */
        this.findMatrixSublistLineWithValue = function (options) { };

        /**
         * returns the number of columns for the specified matrix.
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {number}
         *
         * @since 2015.2
         */
        this.getMatrixHeaderCount = function (options) { };

        /**
         * set the value for the line currently selected in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId - the id of sublist in which the matrix is in.
         * @param {string} options.fieldId - the id of the matrix field
         * @param {number} options.column - the column number for the field
         * @param {string} options.value - the value to set it to
         * @param {boolean} options.ignoreFieldChange (optional) - Ignore the field change script (default false)
         * @param {boolean} options.fireSlavingSync (optional) - Flag to perform slaving synchronously (default false)
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @restriction only available in dynamic record
         * @return {Record} same record, for chaining
         *
         * @since 2015.2
         */
        this.setCurrentMatrixSublistValue = function (options) { };

        /**
         * get the value for the line currently selected in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId - the id of sublist in which the matrix is in.
         * @param {string} options.fieldId - the id of the matrix field
         * @param {number} options.column - the column number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @restriction only available in dynamic record
         * @return {number|Date|string}
         *
         * @since 2015.2
         */
        this.getCurrentMatrixSublistValue = function (options) { };

        /**
         * Convert fieldId how is defined in metadata
         * @param {string} fieldId
         * @returns {string}
         */
        this.convertFieldId = function (options) { };
    }

    /**
     * Primary object used to encapsulate a record sublist line object.
     *
     * @protected
     * @alias RawLine
     * @param {Object} options
     * @param {RawRecord} options.unproxiedRecord - Instance of recordDefinition that owns the Line object.
     * @param {string} options.sublistId
     * @param {string} options.lineInstanceId
     * @param {boolean} options.fromBuffer
     * @param {boolean} options.isReadOnly
     * @return {RawLine}
     * @constructor
     */
    function Line() {

        /**
         * Convert fieldId how is defined in metadata
         * @param {string} fieldId
         * @returns {string}
         */
        this.convertFieldId = function (options) { };
    }

    /**
     * Primary object used to encapsulate a record object.
     *
     * @protected
     * @alias RawRecord
     *
     * @param {Object} options
     * @param {RecordPayload} options.recordObj (server-generated object holding the full metadata and data for a record type,
     *                                           including all scripting and customization)
     * @param {boolean?} options.noPageInit
     * @param {Object} options.parentLink
     * @returns {RawRecord} client-side record implementation
     * @constructor
     *
     * @since 2015.2
     */
    function Record() {

        /**
         * remove body field data
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if fieldId is missing or undefined
         */
        this.removeField = function (options) { };

        /**
         * return array of names of all body fields, including machine header field and matrix header fields
         * @governance none
         * @return {Array<string>}
         *
         * @since 2015.2
         */
        this.getFields = function () { };

        /**
         * return array of names of all sublists
         * @governance none
         * @return {Array<string>}
         *
         * @since 2015.2
         */
        this.getSublists = function () { };

        /**
         * Returns the value of a field. Gets a numeric value for rate and ratehighprecision fields.
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId The internal ID of a standard or custom body field.
         * @return {(number|Date|string|Array|boolean)}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if fieldId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_API_USAGE if invoked after using setText
         *
         * @since 2015.2
         */
        this.getValue = function (options) { };

        /**
         * set value of the field
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId The internal ID of a standard or custom body field.
         * @param {number|Date|string|Array|boolean} options.value The value to set the field to.
         * @param {boolean} [options.ignoreFieldChange=false] Ignore the field change script
         * @param {boolean} [options.forceSyncSourcing=false] force synchronous sourcing
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if fieldId is missing or undefined
         *
         * @since 2015.2
         */
        this.setValue = function (options) { };

        /**
         * set value of the field by text representation
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId The internal ID of a standard or custom body field.
         * @param {string} options.text ----- The text or texts to change the field value to.
         *    If the field type is multiselect: - This parameter accepts an array of string values. - This parameter accepts a
         *     null value. Passing in null deselects all currentlsy selected values. If the field type is not multiselect: this
         *     parameter accepts only a single string value.
         * @param {boolean} [options.ignoreFieldChange=false] ignore field change script and slaving event if set to true
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if fieldId is missing or undefined
         *
         * @since 2015.2
         */
        this.setText = function (options) { };

        /**
         * return the line number for the first occurrence of a field value in a sublist and return -1 if not found
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId The internal ID of the sublist.
         * @param {string} options.fieldId
         * @param {(number|Date|string|Array|boolean)} options.value
         * @return {number}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or field is missing
         *
         * @since 2015.2
         */
        this.findSublistLineWithValue = function (options) { };

        /**
         * return value of a sublist field
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @return {(number|Date|string|Array|boolean)}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId, fieldId, or line is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id, field id, or line number
         * @throws {SuiteScriptError} SSS_INVALID_API_USAGE if invoked after using setSublistText
         *
         * @since 2015.2
         */
        this.getSublistValue = function (options) { };

        /**
         * set the value of a sublist field (available for deferred dynamic only)
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @param {(number|Date|string|Array|boolean)} options.value
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId, fieldId, or line is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id, field id, or line number
         *
         * @since 2015.2
         */
        this.setSublistValue = function (options) { };

        /**
         * set the value of a sublist field in text representation (available for deferred dynamic only)
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @param {string} options.text
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId, fieldId, or line is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id, field id, or line number
         *
         * @since 2015.2
         */
        this.setSublistText = function (options) { };

        /**
         * return line count of sublist
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {number}
         *
         * @since 2015.2
         */
        this.getLineCount = function (options) { };

        /**
         * insert a sublist line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {number} options.line
         * @param {string} options.beforeLineInstanceId
         * @param {boolean} [ignoreRecalc=false] options.ignoreRecalc ignore recalc scripting
         * @return {Line} [new line object]
         * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS if both line and beforeLineInstanceId are provided
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or both line and beforeLineInstanceId
         *     are missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if sublistId or line index is invalid or if machine is not
         *     editable or before exists and before is an instanceId that does not point to a line in the sublist.
         *
         * @since 2015.2
         */
        this.insertLine = function (options) { };

        /**
         * Move one line to desired location.
         * You can address both lines either by Line Instance IDs or both by Indexes.
         * Order of all other lines is preserved.
         * Line indexes between original and final position are shifted by one.
         * @param {Object|string} options (sublistId)
         * @param {string} options.sublistId
         * @param {number} options.from (0-based index)
         * @param {number} options.to (0-based index)
         * @param {string} options.fromInstanceId (line instance ID)
         * @param {string} options.toInstanceId (line instance ID)
         * @param {number} from (0-based index)
         * @param {number} to (0-based index)
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId, from or to is missing
         * @throws {SuiteScriptError} SSS_SUBLIST_DOESNT_SUPPORT_MOVING_LINES if machine doesn't support line moving
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if sublistId or line indexes are invalid
         */
        this.moveLine = function (options) { };

        /**
         * Commits and copies the currently selected line into a new line, which will be the new selected line.
         *
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if sublistId is invalid or not editable
         */
        this.copyLine = function (options) { };

        /**
         * remove a sublist line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {number} options.line
         * @param {string} options.lineInstanceId
         * @param {boolean} [options.ignoreRecalc=false] options.ignoreRecalc ignore recalc scripting
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} MUTUALLY_EXCLUSIVE_ARGUMENTS if both line and lineInstanceId are provided
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or both line and lineInstanceId are
         *     missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if sublistId or line index is invalid or if machine is not
         *     editable
         *
         * @since 2015.2
         */
        this.removeLine = function (options) { };

        /**
         * select a new line at the end of sublist
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Line} [new line object]
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id or sublist is not editable
         * @restriction only available in dynamic record
         *
         * @since 2015.2
         */
        this.selectNewLine = function (options) { };

        /**
         * cancel the current selected line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if sublistId is invalid or if machine is not editable
         * @restriction only available in dynamic record
         *
         * @since 2015.2
         */
        this.cancelLine = function (options) { };

        /**
         * commit the current selected line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId is missing or undefined
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id
         * @restriction only available in dynamic record
         *
         * @since 2015.2
         */
        this.commitLine = function (options) { };

        /**
         * return value of a sublist field on the current selected sublist line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @return {(number|Date|string|Array|boolean)}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if invalid sublist id or field id
         * @restriction only available in dynamic record
         *
         * @since 2015.2
         */
        this.getCurrentSublistValue = function (options) { };

        /**
         * set the value for field in the current selected line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {(number|Date|string|Array|boolean)} options.value
         * @param {boolean} [options.ignoreFieldChange=false] ignore field change script and slaving event if set to true
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @throws {SuiteScriptError} A_SCRIPT_IS_ATTEMPTING_TO_EDIT_THE_1_SUBLIST_THIS_SUBLIST_IS_CURRENTLY_IN_READONLY_MODE_AND_CANNOT_BE_EDITED_CALL_YOUR_NETSUITE_ADMINISTRATOR_TO_DISABLE_THIS_SCRIPT_IF_YOU_NEED_TO_SUBMIT_THIS_RECORD
         *     if user tries to edit readonly sublist field
         *
         * @since 2015.2
         */
        this.setCurrentSublistValue = function (options) { };

        /**
         * set the value for field in the current selected line by text representation
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {(number|Date|string|Array|boolean)} options.text
         * @param {boolean} [options.ignoreFieldChange=false] ignore field change script and slaving event if set to true
         * @return {Record} same record, for chaining
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @throws {SuiteScriptError} A_SCRIPT_IS_ATTEMPTING_TO_EDIT_THE_1_SUBLIST_THIS_SUBLIST_IS_CURRENTLY_IN_READONLY_MODE_AND_CANNOT_BE_EDITED_CALL_YOUR_NETSUITE_ADMINISTRATOR_TO_DISABLE_THIS_SCRIPT_IF_YOU_NEED_TO_SUBMIT_THIS_RECORD
         *     if user tries to edit readonly sublist field
         * @restriction only available in dynamic record
         *
         * @since 2015.2
         */
        this.setCurrentSublistText = function (options) { };

        /**
         * save record updates to the system
         * @governance 20 units for transactions, 4 for custom records, 10 for all other records
         *
         * @param {Object} options
         * @param {boolean} [options.enableSourcing=false] enable sourcing during record update
         * @param {boolean} [options.ignoreMandatoryFields=false] ignore mandatory field during record submission
         * @return {number} id of submitted record
         *
         * @since 2015.2
         */
        this.save = function (options) { };
        this.save.promise = function (options) { };

        /**
         * return a value indicating if the field has a subrecord
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {boolean}
         *
         * @since 2015.2
         */
        this.hasSubrecord = function (options) { };

        /**
         * get the subrecord for the associated field
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {Subrecord} [client-side subrecord implementation]
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.fieldId is missing or undefined
         * @throws {SuiteScriptError} FIELD_1_IS_NOT_A_SUBRECORD_FIELD if field is not a subrecord field
         * @throws {SuiteScriptError} FIELD_1_IS_DISABLED_YOU_CANNOT_APPLY_SUBRECORD_OPERATION_ON_THIS_FIELD if field is disable
         *
         * @since 2015.2
         */
        this.getSubrecord = function (options) { };

        /**
         * remove the subrecord for the associated field
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {Record} same record, for chaining
         *
         * @since 2015.2
         */
        this.removeSubrecord = function (options) { };

        /**
         * return a value indicating if the associated sublist field has a subrecord
         * @governance 0
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @restriction only available in deferred dynamic record
         * @return {boolean}
         *
         * @since 2015.2
         */
        this.hasSublistSubrecord = function (options) { };

        /**
         * get the subrecord for the associated sublist field
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @restriction only available in deferred dynamic record
         * @return {Subrecord} [client-side subrecord implementation]
         *
         * @since 2015.2
         */
        this.getSublistSubrecord = function (options) { };

        /**
         * remove the subrecord for the associated sublist field
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @restriction only available in deferred dynamic record
         * @return {Record} same record, for chaining
         *
         * @since 2015.2
         */
        this.removeSublistSubrecord = function (options) { };

        /**
         * return a value indicating if the associated sublist field has a subrecord on the current line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @restriction only available in dynamic record
         * @return {boolean}
         *
         * @since 2015.2
         */
        this.hasCurrentSublistSubrecord = function (options) { };

        /**
         * get the subrecord for the associated sublist field on the current line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @restriction only available in dynamic record
         * @return {Subrecord} [client-side subrecord implementation]
         *
         * @since 2015.2
         */
        this.getCurrentSublistSubrecord = function (options) { };

        /**
         * remove the subrecord for the associated sublist field on the current line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @restriction only available in dynamic record
         * @return {Record} same record, for chaining
         *
         * @since 2015.2
         */
        this.removeCurrentSublistSubrecord = function (options) { };

        /**
         * returns the specified sublist
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Sublist} [requested sublist]
         *
         * @since 2015.2
         */
        this.getSublist = function (options) { };

        /**
         * return array of names of all fields in a sublist
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @return {Array}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.sublistId is missing or undefined
         *
         * @since 2015.2
         */
        this.getSublistFields = function (options) { };

        /**
         * return field object from record
         * @governance none
         * @param {Object} options
         * @param {string} options.fieldId
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.fieldId is missing or undefined
         *
         * @since 2015.2
         */
        this.getField = function (options) { };

        /**
         * return field object from record's sublist
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @param {number} options.line
         * @return {Field} [requested field]
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @throws {SuiteScriptError} SSS_INVALID_SUBLIST_OPERATION if line number is invalid
         *
         * @since 2015.2
         */
        this.getSublistField = function (options) { };

        /**
         * return field object from record's sublist current line
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId
         * @param {string} options.fieldId
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if sublistId or fieldId is missing
         * @restriction only available in dynamic record
         *
         * @since 2015.2
         */
        this.getCurrentSublistField = function (options) { };

        /**
         * set the value for the associated header in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.column the column number for the field
         * @param {string} options.value the value to set it to
         * @param {boolean} [options.ignoreFieldChange] Ignore the field change script (default false)
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {Record} same record, for chaining
         *
         * @since 2015.2
         */
        this.setMatrixHeaderValue = function (options) { };

        /**
         * get the value for the associated header in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.column the column number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {number|Date|string}
         *
         * @since 2015.2
         */
        this.getMatrixHeaderValue = function (options) { };

        /**
         * set the value for the associated field in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.line the line number for the field
         * @param {number} options.column the column number for the field
         * @param {string} options.value the value to set it to
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @restriction only available in deferred dynamic record
         * @return {Record} same record, for chaining
         *
         * @since 2015.2
         */
        this.setMatrixSublistValue = function (options) { };

        /**
         * get the value for the associated field in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.line the line number for the field
         * @param {number} options.column the column number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {number|Date|string}
         *
         * @since 2015.2
         */
        this.getMatrixSublistValue = function (options) { };

        /**
         * get the field for the specified header in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.column the column number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {Field} [requested field]
         *
         * @since 2015.2
         */
        this.getMatrixHeaderField = function (options) { };

        /**
         * get the field for the specified sublist in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.column the column number for the field
         * @param {number} options.line the line number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {Field} [requested field]
         *
         * @since 2015.2
         */
        this.getMatrixSublistField = function (options) { };

        /**
         * returns the line number of the first line that contains the specified value in the specified column of the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @param {number} options.value the column number for the field
         * @param {number} options.column the line number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {number}
         *
         * @since 2015.2
         */
        this.findMatrixSublistLineWithValue = function (options) { };

        /**
         * returns the number of columns for the specified matrix.
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId the id of sublist in which the matrix is in.
         * @param {string} options.fieldId the id of the matrix field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @return {number}
         *
         * @since 2015.2
         */
        this.getMatrixHeaderCount = function (options) { };

        /**
         * set the value for the line currently selected in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId - the id of sublist in which the matrix is in.
         * @param {string} options.fieldId - the id of the matrix field
         * @param {number} options.column - the column number for the field
         * @param {string} options.value - the value to set it to
         * @param {boolean} options.ignoreFieldChange (optional) - Ignore the field change script (default false)
         * @param {boolean} options.fireSlavingSync (optional) - Flag to perform slaving synchronously (default false)
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @restriction only available in dynamic record
         * @return {Record} same record, for chaining
         *
         * @since 2015.2
         */
        this.setCurrentMatrixSublistValue = function (options) { };

        /**
         * get the value for the line currently selected in the matrix
         * @governance none
         * @param {Object} options
         * @param {string} options.sublistId - the id of sublist in which the matrix is in.
         * @param {string} options.fieldId - the id of the matrix field
         * @param {number} options.column - the column number for the field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any required values are missing
         * @restriction only available in dynamic record
         * @return {number|Date|string}
         *
         * @since 2015.2
         */
        this.getCurrentMatrixSublistValue = function (options) { };

        /**
         * Convert fieldId how is defined in metadata
         * @param {string} fieldId
         * @returns {string}
         */
        this.convertFieldId = function (options) { };
    }

    /**
     * Return a new instance of sublist object
     *
     * @alias RawSublist
     *
     * @param {Object} sublist
     * @param {string} sublist.type type of sublist
     * @param {SublistState} sublist.sublistState SublistState
     * @param {Object<string,FieldLevelMetadata>} sublist.sublistFields
    
     * @return {RawSublist}
     * @constructor
     *
     * @since 2015.2
     */
    function Sublist() {

        /**
         * The sublist is changed
         * @type {boolean}
         */
        this.isChanged = undefined;
        /**
         * The sublist is hidden
         * @type {boolean}
         */
        this.isHidden = undefined;
        /**
         * The sublist is display
         * @type {boolean}
         */
        this.isDisplay = undefined;
        /**
         * get column delegate
         * @param {{fieldId:string}|string} options fieldId
         * @returns {RawColumn} rawColumn
         */
        this.getColumn = function (options) { };

        /**
         * get column ids
         * @returns {Array<string>}
         */
        this.getColumns = function () { };

        /**
         * Returns the object type name (sublist.Sublist)
         * @returns {string}
         */
        this.toString = function () { };

        /**
         * JSON.stringify() implementation.
         * @returns {{id: string, type: string, isChanged: boolean, isDisplay: boolean, isMultilineEditable: boolean}}
         */
        this.toJSON = function () { };
    }

    /**
     *
     * @param {string} fieldId
     * @param {FieldLevelMetadata} fieldLevelMetadata
     * @param {SublistState} sublistState
     * @returns {RawColumn}
     * @constructor
     */
    function RawColumn() {

        /**
         * column's label
         * @type {string}
         */
        this.label = undefined;
        /**
         * column's mandatory flag
         * @type {boolean}
         */
        this.isMandatory = undefined;
        /**
         * column's disabled flag
         * @type {boolean}
         */
        this.isDisabled = undefined;
        /**
         * column's display flag
         * @type {boolean}
         */
        this.isDisplay = undefined;
    }

    /**
     * Field - Primary object used to encapsulate a record field object.
     *
     * @alias RecordField
     *
     * @param {FieldObject} params
     *
     * @protected
     * @constructor
     */
    function Field() {
    }

    N.config = config;

    /**
     * @exports N/config
     */
    return config;
});