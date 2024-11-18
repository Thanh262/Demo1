/**
 * SuiteScript module
 *
 * @module N/ui/serverWidget
 * @suiteScriptVersion 2.x
 *
 */
define([], function () {
    /**
     * @namespace serverWidget
     */
    var serverWidget = {};

    /**
     * Instantiate an assistant object (specifying the title, and whether to hide the menu)
     * @restriction Server SuiteScript only
     * @param {Object} options
     * @param {string} options.title The title of the assistant. This title appears at the top of all assistant pages.
     * @param {boolean} [options.hideNavBar] Indicates whether to hide the navigation bar menu. By default, set to false. The header appears in the top-right corner on the assistant. If set to true, the header on the assistant is hidden from view.
     * @return {Assistant}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when title parameter is missing
     * @since 2015.2
     */
    serverWidget.createAssistant = function (options) { };

    /**
     * Instantiate a form object (specifying the title, and whether to hide the menu)
     * @restriction Server SuiteScript only
     * @param {Object} options
     * @param {string} options.title The title of the form.
     * @param {boolean} [options.hideNavBar] Indicates whether to hide the navigation bar menu. By default, set to false. The header appears in the top-right corner on the form. If set to true, the header on the form is hidden from view.
     * @return {Form}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when title parameter is missing
     * @since 2015.2
     */
    serverWidget.createForm = function (options) { };

    /**
     * Instantiate a List object (specifying the title, and whether to hide the navigation bar)
     * @restriction Server SuiteScript only
     * @param {Object} options
     * @param {string} options.title The title of the list.
     * @param {boolean} [options.hideNavBar] Indicates whether to hide the navigation bar menu. By default, set to false. The header appears in the top-right corner on the list. If set to true, the header on the list is hidden from view.
     * @return {List}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when title parameter is missing
     * @since 2015.2
     */
    serverWidget.createList = function (options) { };

    /**
     * Enumeration that holds the values for supported field types. This enum is used to set the value of the type parameter when Form.addField(options) is called.
     *
     * Consider the following as you work with these field types:
     * The FILE field type is available only for Suitelets and will appear on the main tab of the Suitelet page. FILE fields cannot be added to tabs, subtabs, sublists, or field groups and are not allowed on existing pages.
     * The INLINEHTML and RICHTEXT field types are not supported with Sublist.addField(options).
     * The IMAGE field type is available only for fields that appear on list/staticlist sublists. You cannot specify an IMAGE field on a form.
     * The MULTISELECT field type is not supported by SuiteScript 2.0 Suitelets.
     * Radio buttons that are inside one container are exclusive. The method addField on form has an optional parameter container. For an example, see FieldGroup.label.
     * @enum {string}
     * @readonly
     */
    function serverWidgetFieldType() {
        this.CHECKBOX = 'CHECKBOX';
        this.CURRENCY = 'CURRENCY';
        this.DATE = 'DATE';
        this.DATETIME = 'DATETIME';
        this.DATETIMETZ = 'DATETIMETZ';
        this.EMAIL = 'EMAIL';
        this.FILE = 'FILE';
        this.FLOAT = 'FLOAT';
        this.HELP = 'HELP';
        this.IMAGE = 'IMAGE';
        this.INLINEHTML = 'INLINEHTML';
        this.INTEGER = 'INTEGER';
        this.LABEL = 'LABEL';
        this.LONGTEXT = 'LONGTEXT';
        this.MULTISELECT = 'MULTISELECT';
        this.PASSWORD = 'PASSWORD';
        this.PERCENT = 'PERCENT';
        this.PHONE = 'PHONE';
        this.RADIO = 'RADIO';
        this.RICHTEXT = 'RICHTEXT';
        this.SELECT = 'SELECT';
        this.TEXTAREA = 'TEXTAREA';
        this.TEXT = 'TEXT';
        this.TIMEOFDAY = 'TIMEOFDAY';
        this.URL = 'URL';
    }

    serverWidget.prototype.FieldType = new serverWidgetFieldType();

    /**
     * Enumeration that holds the string values for supported page link types on a form. This enum is used to set the value of the type parameter when Form.addPageLink(options) is called.
     * BREADCRUMB - Link appears on the top-left corner after the system bread crumbs
     * CROSSLINK - Link appears on the top-right corner.
     * @enum {string}
     * @readonly
     *
     */
    function serverWidgetFormPageLinkType() {
        this.BREADCRUMB = 'BREADCRUMB';
        this.CROSSLINK = 'CROSSLINK';
    }

    serverWidget.prototype.FormPageLinkType = new serverWidgetFormPageLinkType();

    /**
     * Enumeration that holds the string values for valid sublist types. This enum is used to define the type parameter when Form.addSublist(options) is called.
     * INLINEEDITOR and EDITOR:
     * These types of sublists are both fully editable. The only difference between these types is their appearance in the UI:
     *
     * With an inline editor sublist, a new line is displayed at the bottom of the list after existing lines. To add a line, a user working in the UI clicks inside the new line and adds a value to each column as appropriate. Examples of this style include the Item sublist on the sales order record and the Expense sublist on the expense report record.
     * With an editor sublist, a user in the UI adds a new line by working with fields that are displayed above the existing sublist lines. This style is not common on standard NetSuite record types.
     *
     * LIST: This type of sublist has a fixed number of lines. You can update an existing line, but you cannot add lines to it.
     *
     * To make a field within a LIST type sublist editable, use Field.updateDisplayType(options) and the enum serverWidget.FieldDisplayType to update the field display type to ENTRY.
     * STATICLIST: This type of sublist is read-only. It cannot be edited in the UI, and it is not available for scripting.
     * @enum {string}
     * @readonly
     */
    function serverWidgetSublistType() {
        this.EDITOR = 'EDITOR';
        this.INLINEEDITOR = 'INLINEEDITOR';
        this.LIST = 'LIST';
        this.STATICLIST = 'STATICLIST';
    }

    serverWidget.prototype.SublistType = new serverWidgetSublistType();

    /**
     * Enumeration that holds the string values for supported field break types. This enum is used to set the value of the breakType parameter when Field.updateBreakType(options) is called.
     * NONE: This is the default value for field break type.
     * STARTCOL: This value moves the field into a new column. Additionally, it disables automatic field balancing if set on any field.
     * STARTROW: This value places a field located outside of a field group on a new row. This value only works on fields with a Field Layout Type set to OUTSIDE, OUTSIDEABOVE or OUTSIDEBELOW. For more information, see serverWidget.FieldLayoutType and Field.updateLayoutType(options).
     * @enum {string}
     * @readonly
     */
    function serverWidgetFieldBreakType() {
        this.NONE = 'NONE';
        this.STARTCOL = 'STARTCOL';
        this.STARTROW = 'STARTROW';
    }

    serverWidget.prototype.FieldBreakType = new serverWidgetFieldBreakType();

    /**
     * Enumeration that holds the string values for the supported types of field layouts. This enum is used to set the value of the layoutType parameter when Field.updateLayoutType(options) is called.
     * STARTROW: This value makes the field appear first in a horizontally aligned field group in the normal field layout.
     * MIDROW: This value makes the field appear in the middle of a horizontally aligned field group in the normal field layout.
     * ENDROW: This value makes the field appear last in a horizontally aligned field group in the normal field layout.
     * OUTSIDE:	This value makes the field appear outside (above or below based on form default) the normal field layout area.
     * OUTSIDEBELOW: This value makes the field appear below the normal field layout area. Using this allows you to position a field below a field group.
     * OUTSIDEABOVE: This value makes the field appear above the normal field layout area. Using this allows you to position a field above a field group.
     * NORMAL: This value makes the fields appear in its default position.
     * @enum {string}
     * @readonly
     */
    function serverWidgetFieldLayoutType() {
        this.NORMAL = 'NORMAL';
        this.OUTSIDE = 'OUTSIDE';
        this.OUTSIDEBELOW = 'OUTSIDEBELOW';
        this.OUTSIDEABOVE = 'OUTSIDEABOVE';
        this.STARTROW = 'STARTROW';
        this.MIDROW = 'MIDROW';
        this.ENDROW = 'ENDROW';
    }

    serverWidget.prototype.FieldLayoutType = new serverWidgetFieldLayoutType();

    /**
     * Enumeration that holds the string values for supported field display types. This enum is used to set the value of the displayType parameter when Field.updateDisplayType(options) is called.
     * DISABLED: Prevents a user from changing the field
     * ENTRY: The sublist field appears as a data entry input field (for a select field without a checkbox)
     * HIDDEN: The field on the form is hidden.
     * INLINE: The field appears as inline text
     * NORMAL: The field appears as a normal input field (for non-sublist fields)
     * READONLY: The field is disabled but it is still selectable and scrollable (for textarea fields)
     * @enum {string}
     * @readonly
     */
    function serverWidgetFieldDisplayType() {
        this.NORMAL = 'NORMAL';
        this.HIDDEN = 'HIDDEN';
        this.READONLY = 'READONLY';
        this.DISABLED = 'DISABLED';
        this.ENTRY = 'ENTRY';
        this.INLINE = 'INLINE';
        this.NODISPLAY = 'NODISPLAY';
    }

    serverWidget.prototype.FieldDisplayType = new serverWidgetFieldDisplayType();

    /**
     * Enumeration that holds the string values for supported sublist display types. This enum is used to set the value of the Sublist.displayType property.
     * @enum {string}
     * @readonly
     */
    function serverWidgetSublistDisplayType() {
        this.NORMAL = 'NORMAL';
        this.HIDDEN = 'HIDDEN';
        this.NODISPLAY = 'NODISPLAY';
    }

    serverWidget.prototype.SublistDisplayType = new serverWidgetSublistDisplayType();

    /**
     * Enumeration that holds the string values for supported justification layouts. This enum is used to set the value of the align parameter when List.addColumn(options) is called.
     * @enum {string}
     * @readonly
     */
    function serverWidgetLayoutJustification() {
        this.CENTER = 'CENTER';
        this.LEFT = 'LEFT';
        this.RIGHT = 'RIGHT';
    }

    serverWidget.prototype.LayoutJustification = new serverWidgetLayoutJustification();

    /**
     * Enumeration that holds the string values for supported list styles. This enum is used to set the value of the List.style property.
     * @enum {string}
     * @readonly
     */
    function serverWidgetListStyle() {
        this.GRID = 'grid';
        this.REPORT = 'report';
        this.PLAIN = 'plain';
        this.NORMAL = 'normal';
    }

    serverWidget.prototype.ListStyle = new serverWidgetListStyle();

    /**
     * Holds the string values for submit actions performed by the user. This enum is used to set the value of the Assistant.getLastAction().
     * After a finish action is submitted, by default, the text “Congratulations! You have completed the <assistant title>” appears on the finish page.
     * In a non-sequential process (steps are unordered), jump is used to move to the user’s last action.
     * @enum {string}
     * @readonly
     */
    function serverWidgetAssistantSubmitAction() {
        this.NEXT = 'next';
        this.BACK = 'back';
        this.CANCEL = 'cancel';
        this.FINISH = 'finish';
        this.JUMP = 'jump';
    }

    serverWidget.prototype.AssistantSubmitAction = new serverWidgetAssistantSubmitAction();

    /**
     *
     * You can add a new tab or subtab to a form using one of the following methods:
     * Form.addSubtab(options)
     * Form.addTab(options)
     * Form.insertSubtab(options)
     * Form.insertTab(options)
     *
     * @class Tab
     * @classdesc Encapsulates a tab or subtab on a serverWidget.Form object.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Tab() {

        /**
         * The label of the Tab
         * @name Tab#label
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * The Tab's field help
         * @name Tab#helpText
         * @type {string}
         *
         * @since 2015.2
         */
        this.helpText = undefined;
        /**
         * Returns the object type name
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    /**
     * To add a sublist, use Assistant.addSublist(options) or Form.addSublist(options).
     *
     * @class Sublist
     * @classdesc Encalsulates a Sublist in a Form or a serverWidget.Assistant
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Sublist() {

        /**
         * The label of the sublist
         * @name Sublist#label
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * The number of lines in the Sublist.
         * @name Sublist#lineCount
         * @type {number}
         * @readonly
         *
         * @since 2015.2
         */
        this.lineCount = undefined;
        /**
         * Set an id of a field that is to have unique values accross the rows in the sublist
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The id of the field to use as a unique field
         * @return {Sublist}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.updateUniqueFieldId = function (options) { };

        /**
         * Id of a field designated as a totalling column, which is used to calculate and display a running total for the sublist
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The id of the field to use as a total field
         * @return {Sublist}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.updateTotallingFieldId = function (options) { };

        /**
         * Display type of the sublist.  Possible values are in serverWidget.SublistDisplayType enum
         * @name Sublist#displayType
         * @type {string}
         *
         * @since 2015.2
         */
        this.displayType = undefined;
        /**
         * Inline help text to this sublist.
         * @name Sublist#helpText
         * @type {string}
         *
         * @since 2015.2
         */
        this.helpText = undefined;
        /**
         * Adds a button to the sublist
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id the script id of button
         * @param {string} options.label the label of button
         * @param {string} [options.functionName] The function name to be triggered on a button click.
         * @return {Button}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id or label parameter is missing
         *
         * @since 2015.2
         */
        this.addButton = function (options) { };

        /**
         * Gets a field value on a sublist.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The internal ID of the field.
         * @param {number} options.line The line number for this field.
         * @throws {SuiteScriptError} YOU_CANNOT_CALL_1_METHOD_ON_SUBRECORD_FIELD_SUBLIST_2_FIELD_3 When trying to access a subrecord field
         * @return {string}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id or line parameter is missing
         *
         * @since 2015.2
         */
        this.getSublistValue = function (options) { };

        /**
         * Set the value of a field on the list
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id   id of the field to set
         * @param {number} options.line line number
         * @param {string} options.value value to set on the field
         * @return {void}
         * @throws {SuiteScriptError} YOU_CANNOT_CALL_1_METHOD_ON_SUBRECORD_FIELD_SUBLIST_2_FIELD_3 When trying to access a subrecord field
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.setSublistValue = function (options) { };

        /**
         * Adds a Refresh button to the sublist.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Button}
         *
         * @since 2015.2
         */
        this.addRefreshButton = function () { };

        /**
         * Adds a "Mark All" and an "Unmark All" button to a sublist.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Array<Button>}
         *
         * @since 2015.2
         */
        this.addMarkAllButtons = function () { };

        /**
         * Add a field, column, to the Sublist
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id    id of the field to add
         * @param {string} options.label the UI label for the field
         * @param {string} options.type  the type for this field. Use the serverWidget.FieldType enum to set this value. The INLINEHTML and RICHTEXT values are not supported with this method. The MULTISELECT value is not supported for SuiteScript 2.0 Suitelets.
         * @param {string} [options.source] The internalId or scriptId of the source list for this field. Use this parameter if you are adding a select (List/Record) type of field.
         * @param {string} [options.container] Used to specify either a tab or a field group
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id, label or type parameter is missing
         *
         * @since 2015.2
         */
        this.addField = function (options) { };

        /**
         * Gets field from sublist
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id    id of the field to get
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getField = function (options) { };

        /**
         * Returns the object type name
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    /**
     * A field group is a collection of fields that can be displayed in a one or two column format. Assign a field to a field group in order to label, hide or collapse a group of fields.
     *
     * @class FieldGroup
     * @classdesc Encapsulate a field group on an Assistant or a Form objects.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function FieldGroup() {

        /**
         * Indicates whether the field group can be collapsed.
         * The default value is false, which means the field group displays as a static group that cannot be opened or closed.
         * If set to true, the field group can be collapsed.
         * Only supported for fields on serverWidget.createAssistant(options) objects.
         * @name FieldGroup#isCollapsible
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isCollapsible = undefined;
        /**
         * Indicates whether field group is collapsed or expanded.
         * The default value is false, which means that when the page loads, the field group will not appear collapsed.
         * If set to true, the field group is collapsed.
         * Only supported for fields on serverWidget.createAssistant(options) objects.
         * @name FieldGroup#isCollapsed
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isCollapsed = undefined;
        /**
         * Indicates whether the field group border is hidden.
         * If set to false, a border around the field group is displayed.
         * The default value is false.
         * @name FieldGroup#isBorderHidden
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isBorderHidden = undefined;
        /**
         * Indicates whether the fields in this group display in a single column
         * The default value is false
         * @name Field#isSingleColumn
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isSingleColumn = undefined;
        /**
         * The label of the field group
         * @name FieldGroup#label
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * Returns the object type name
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    /**
     * To add a Field object, use Assistant.addField(options), Form.addField(options), or Sublist.addField(options).
     *
     *
     * @class Field
     * @classdesc Encapsulates a body or sublist field. Use fields to record or display information specific to your needs.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Field() {

        /**
         * The internal id of the field.
         * @name Field#id
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * The type of the field.
         * @name Field#FieldType
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.type = undefined;
        /**
         * Updates the break type of the field. Set this value using the FieldBreakType enum.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.breakType The new break type of the field.
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when breakType parameter is missing
         *
         * @since 2015.2
         */
        this.updateBreakType = function (options) { };

        /**
         * Updates the layout type for the field.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {FieldLayoutType} options.layoutType The new layout type of the field. Set this value using the FieldLayoutType enum.
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when layoutType parameter is missing
         * @since 2015.2
         */
        this.updateLayoutType = function (options) { };

        /**
         * The text displayed for a link in place of the URL.
         * This property is only supported on scripted fields created using the N/ui/serverWidget Module.
         * @name Field#linkText
         * @type {string}
         *
         * @since 2015.2
         */
        this.linkText = undefined;
        /**
         * The maximum length, in characters, of the field (only valid for text, rich text, long text, and textarea fields).
         * This property is only supported on scripted fields created using the N/ui/serverWidget Module.
         * @name Field#maxLength
         * @type {number}
         *
         * @since 2015.2
         */
        this.maxLength = undefined;
        /**
         * Indicates whether the field is mandatory or optional.
         * If set to true, then the field is defined as mandatory.
         * The default value is false.
         * This property is only supported on scripted fields created using the N/ui/serverWidget Module.
         * @name Field#isMandatory
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isMandatory = undefined;
        /**
         * The alias for the field. By default the alias is the field id
         * This property is only supported on scripted fields created using the N/ui/serverWidget Module.
         * @name Field#alias
         * @type {string}
         *
         * @since 2015.2
         */
        this.alias = undefined;
        /**
         * The default value of the field
         * @name Field#defaultValue
         * @type {string}
         *
         * @since 2015.2
         */
        this.defaultValue = undefined;
        /**
         * Sets the height and width for the field. Only supported on multi-selects,
         * long text, rich text, and fields that get rendered as INPUT (type=text) fields.
         * This API is not supported on rich text and list/record fields.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {number} options.height The new height of the field.
         * @param {number} options.width The new width of the field.
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when height or width parameter is missing
         *
         * @since 2015.2
         */
        this.updateDisplaySize = function (options) { };

        /**
         * Updates the display type for the field.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {number} options.displayType The new display type of the field. Set this value using the serverWidget.FieldDisplayType enum.
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when displayType parameter is missing
         *
         * @since 2015.2
         */
        this.updateDisplayType = function (options) { };

        /**
         * If Rich Text Editing is enabled, you can use this property to set the height of the rich text field (in pixels). The minimum value is 100 pixels and the maximum value is 500 pixels.
         * @name Field#richTextHeight
         * @type {number}
         *
         * @since 2015.2
         */
        this.richTextHeight = undefined;
        /**
         * If Rich Text Editing is enabled, you can use this property to set the width of the rich text field (in pixels). The minimum value is 250 pixels and the maximum value is 800 pixels.
         * @name Field#richTextWidth
         * @type {number}
         *
         * @since 2015.2
         */
        this.richTextWidth = undefined;
        /**
         * The label of the field
         * There is a 40-character limit for custom field labels.
         * @name Field#label
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * There is a 40-character limit for custom field labels.
         * @name Field#padding
         * @type {number}
         *
         * @since 2015.2
         */
        this.padding = undefined;
        /**
         * Get the select options for a field
         * The internal ID and label of the options for a select field as name/value pairs is returned.
         * The first 1,000 available options are returned (at maximum).
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} [options.filter] A search string to filter the select options that are returned.
         * @param {string} [options.filteroperator]  Supported operators are contains | is | startswith. If not specified, defaults to the contains operator
         * @return {Array<Object>}
         *
         * @since 2015.2
         */
        this.getSelectOptions = function (options) { };

        /**
         * Set help text for a field
         * When the field label is clicked, a popup displays the help text defined using this method.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.help The help text for the field
         * @param {boolean} [options.showInlineForAssistant] This means that field help will appear only in a field help popup box when the field label is clicked. The default value is false, which means the field help appears in a popup when the field label is clicked and does not appear inline.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when help parameter is missing
         * @throws {SuiteScriptError} SSS_INVALID_TYPE_ARG when help parameter is not string
         * @since 2015.2
         */
        this.setHelpText = function (options) { };

        /**
         * Help text for the field
         * @name Field#helpText
         * @type {string}
         *
         * @since 2019.2
         */
        this.helpText = undefined;
        /**
         * Adds the select options that appears in the dropdown of a field.
         * After you create a select or multi-select field that is sourced from a record or list, you cannot add additional values with Field.addSelectOption(options). The select values are determined by the source record or list.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.value The internal id of the option
         * @param {string} options.text  The display text for this option
         * @param {boolean} [options.isSelected] If set to true, this option is selected by default in the UI. The default value for this parameter is false.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when value or text parameter is missing
         *
         * @since 2015.2
         */
        this.addSelectOption = function (options) { };

        /**
         * Returns the object type name
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    /**
     * To add a button, use Form.addButton(options) or Sublist.addButton(options). When adding a button to a record or form, consider using a beforeLoad user event script.
     * Custom buttons only appear during Edit mode. On records, custom buttons appear to the left of the printer icon.
     *
     * @class Button
     * @classdesc Encapsulates button that appears in a UI object.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Button() {

        /**
         * Indicates whether a button is grayed-out and disabled.
         * The default value is false.
         * If set to true, the button appears grayed-out in the and cannot be clicked.
         * @name Button#isDisabled
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isDisabled = undefined;
        /**
         * The label of the button
         * You can use this property to rename a button based on context, for example to re-label a button for particular users that are viewing a page.
         * @name Button#label
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * Indicates whether the button is hidden in the UI.
         * The default value is false, which means the button is visible.
         * If set to true, the button is not visible in the UI.
         * @name Button#isHidden
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isHidden = undefined;
        /**
         * Returns the object type name
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    /**
     * Create a step by calling Assistant.addStep(options).
     *
     * @class AssistantStep
     * @classdesc Encapsulates a step within a custom NetSuite assistant.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function AssistantStep() {

        /**
         * The internal id of the step.
         * @name AssistantStep#id
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * The label of the step
         * @name AssistantStep#label
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * The index of this step as a number
         * A sequence of assistant steps starts at 1.
         * @name AssistantStep#stepNumber
         * @type {number}
         *
         * @since 2015.2
         */
        this.stepNumber = undefined;
        /**
         * Help text for the step
         * @name AssistantStep#helpText
         * @type {string}
         *
         * @since 2015.2
         */
        this.helpText = undefined;
        /**
         * Gets the IDs for all the sublist fields (line items) in a step
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.group  The internal id of the sublist
         * @return {Array<string>}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when group parameter is missing
         *
         * @since 2015.2
         */
        this.getSublistFieldIds = function (options) { };

        /**
         * Gets the IDs for all the sublists submitted in a step.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Array<string>}
         *
         * @since 2015.2
         */
        this.getSubmittedSublistIds = function () { };

        /**
         * Gets the IDs for all the fields in a step.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Array<string>}
         *
         * @since 2015.2
         */
        this.getFieldIds = function () { };

        /**
         * Gets the IDs for all the fields in a step.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id Internal id for the field
         * @return {string|Array<string>}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getValue = function (options) { };

        /**
         * Gets the number of lines on a sublist in a step. If the sublist does not exist, -1 is returned.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.group internal Id of the sublist
         * @return {number}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when group parameter is missing
         *
         * @since 2015.2
         */
        this.getLineCount = function (options) { };

        /**
         * Gets the current value of a sublist field (line item) in a step.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.group Internal id of the sublist
         * @param {string} options.id Internal id of the field
         * @param {string} options.line line number
         * @return {string}
         *
         * @since 2015.2
         */
        this.getSublistValue = function (options) { };

        /**
         * Returns the object type name
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    /**
     *
     * @class {Assistant}
     * @classdesc Encapsulates a scriptable, multi-step NetSuite assistant. An assistant contains a series of step that a user must complete to accomplish a larger goal. An assistant can be sequential, or non-sequential and include optional steps. Each page of the assistant is defined by a step.
     * @constructor
     * @protected
     *
     * @since 2015.2
     */
    function Assistant() {

        /**
         * The current step of the assistant
         * You can set any step as the current step.
         * @name Assistant#currentStep
         * @type {AssistantStep}
         *
         * @since 2015.2
         */
        this.currentStep = undefined;
        /**
         * Error message text for the current step. If you choose, you can use HTML tags to format the message.
         * @name Assistant#errorHtml
         * @type {string}
         *
         * @since 2015.2
         */
        this.errorHtml = undefined;
        /**
         * The text to display after the assistant finishes. To trigger display of the completion message, call Assistant.isFinished().
         * @name Assistant#finishedHtml
         * @type {string}
         *
         * @since 2015.2
         */
        this.finishedHtml = undefined;
        /**
         * Indicates whether assistant steps are displayed with numbers.
         * By default, the value is false, which means that steps are numbered.
         * If set to true, the assistant does not use step numbers.
         * To change step ordering, set Assistant.isNotOrdered.
         * @name Assistant#hideStepNumber
         * @type {boolean}
         *
         * @since 2015
         */
        this.hideStepNumber = undefined;
        /**
         * Indicates whether steps must be completed in a particular sequence. If steps are ordered, users must complete the current step before proceeding to the next step.
         * The default value is false, which means the steps are ordered.  Ordered steps appear vertically in the left panel of the assistant.
         * If set to true, steps can be completed in any order. In the UI, unordered steps appear horizontally and below the assistant title.
         * @name Assistant#isNotOrdered
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isNotOrdered = undefined;
        /**
         * The title for the assistant. The title appears at the top of all assistant pages.
         * This value overrides the title specified in serverWidget.createAssistant(options).
         * @name Assistant#title
         * @type {string}
         *
         * @since 2015.2
         */
        this.title = undefined;
        /**
         * Indicates whether to show or hide the Add to Shortcuts link that appears in the top-right corner of an assistant page.
         * By default, the value is false, which means the Add to Shortcuts link is visible in the UI.
         * If set to true, the Add To Shortcuts link is not visible on an Assistant page.
         * @name Assistant#hideAddToShortcutsLink
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.hideAddToShortcutsLink = undefined;
        /**
         * Sets the default values of an array of fields that are specific to the assistant.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {Array<Object>} options.values Array of name/value pairs that map field names to field values.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when values parameter is missing
         *
         * @since 2015.2
         */
        this.updateDefaultValues = function (options) { };

        /**
         * The file cabinet ID of client script file to be used in this assistant
         * @name Assistant#clientScriptFileId
         * @type {number}
         * @throws {SuiteScriptError} PROPERTY_VALUE_CONFLICT When clientScriptModulePath property was set beforehand
         * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE if given file id is not a string nor a number
         *
         * @since 2015.2
         */
        this.clientScriptFileId = undefined;
        /**
         * The file path of client script file to be used in this assistant
         * @name Assistant#clientScriptModulePath
         * @type {string}
         * @throws {SuiteScriptError} PROPERTY_VALUE_CONFLICT When clientScriptFileId property was set beforehand
         * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE if given file id is not a string
         *
         * @since 2015.2
         */
        this.clientScriptModulePath = undefined;
        /**
         * Sets the splash screen for an assistant page.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.title Title of the splash screen
         * @param {string} options.text1 Text of the splash scheen
         * @param {string} [options.text2] Text for a second column on the splash screen, if desired.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when title or text1 parameter is missing
         *
         * @since 2015.2
         */
        this.setSplash = function (options) { };

        /**
         * Gets a Field object from its id
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id Internal id for the field
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getField = function (options) { };

        /**
         * Gets a FieldGroup  object from its id
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id Id of the field group
         * @return {FieldGroup}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getFieldGroup = function (options) { };

        /**
         * Gets the name of last action taken by the user
         * To identify the step that the last action came from, use Assistant.getLastStep().
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.getLastAction = function () { };

        /**
         * Gets the step the last submitted action came from
         * @restriction Server SuiteScript only
         * @governance none
         * @return {AssistantStep}
         *
         * @since 2015.2
         */
        this.getLastStep = function () { };

        /**
         * Gets next logical step corresponding to the user's last submitted action
         * If you need information about the last step, use Assistant.getLastStep() before you use this method.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {AssistantStep}
         *
         * @since 2015.2
         */
        this.getNextStep = function () { };

        /**
         * Gets the number of steps
         * @restriction Server SuiteScript only
         * @governance none
         * @return {number}
         *
         * @since 2015.2
         */
        this.getStepCount = function () { };

        /**
         * Indicates whether an assistant has an error message set for the current step. It returns true if Assistant.errorHtml contains a value, false otherwise.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {boolean}
         *
         * @since 2015.2
         */
        this.hasErrorHtml = function () { };

        /**
         * Indicates whether all steps in an assistant are completed.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {boolean}
         *
         * @since 2015.2
         */
        this.isFinished = function () { };

        /**
         * Returns the step object in an assistant from its internal ID.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The internal ID of the step.
         * @return {AssistantStep}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getStep = function (options) { };

        /**
         * Gets a Sublist  object from its id
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id  Id for the sublist
         * @return {Sublist}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getSublist = function (options) { };

        /**
         * Adds a step to an assistant. Steps define each page of the assistant.
         * Use Assistant.isNotOrdered to control if the steps must be completed sequentially or in no specific order.
         * If you want to create help text for the step, you can use AssistantStep.helpText on the object returned.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id  Id for the step
         * @param {string} options.label UI label for the step
         * @return {AssistantStep}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id or label parameter is missing
         *
         * @since 2015.2
         */
        this.addStep = function (options) { };

        /**
         * Adds a field to an assistant. Use fields to record or display information specific to your needs.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id  Id for the field
         * @param {string} options.label Label for the field
         * @param {string} options.type  Type for the field. Use the serverWidget.FieldType enum to set this value.
         * @param {string} [options.source] The internalId or scriptId of the source list for this field. Use this parameter if you are adding a select (List/Record) or multi-select type of field.
         * For radio fields only, the source parameter is not an optional parameter, it must contain the radio button's unique internal ID. The id parameter contains the ID that identifies all the radio buttons of the same group.
         * @param {string} [options.container]  Id for the field group of tab to place the field in
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id, label or type parameter is missing
         *
         * @since 2015.2
         */
        this.addField = function (options) { };

        /**
         * Adds a field group to the assistant. A field group is a collection of fields that can be displayed in a one or two column format. Assign a field to a field group in order to label, hide or collapse a group of fields.
         * By default, the field group is collapsible and appears expanded on the assistant page. To change this behavior, set the FieldGroup.isCollapsed and FieldGroup.isCollapsible properties.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id  Id for the field group
         * @param {string} options.label UI label for the field group
         * @return {FieldGroup}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id or label parameter is missing
         *
         * @since 2015.2
         */
        this.addFieldGroup = function (options) { };

        /**
         * Adds a sublist to the assistant. Only inline editor sublists are added.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id  Id for the sublist
         * @param {string} options.label UI label for the sublist
         * @param {string} options.type The type of sublist to add. Currently, only the INLINEEDITOR sublist type can be added. For more information about this type of sublist, see serverWidget.SublistType.
         * @return {Sublist}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id, label or type parameter is missing
         *
         * @since 2015.2
         */
        this.addSublist = function (options) { };

        /**
         * Gets all ids for fields in the assistant
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Array<string>}
         *
         * @since 2015.2
         */
        this.getFieldIds = function () { };

        /**
         * Gets all field ids in the given assistant field group
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id Id of the field group
         * @return {Array<string>}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getFieldIdsByFieldGroup = function (options) { };

        /**
         * Gets all ids for field groups in the assistant
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Array<string>}
         *
         * @since 2015.2
         */
        this.getFieldGroupIds = function () { };

        /**
         * Gets all ids for sublists in the assistant
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Array<string>}
         *
         * @since 2015.2
         */
        this.getSublistIds = function () { };

        /**
         * Gets all steps in the assistant
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Array<AssistantStep>}
         *
         * @since 2015.2
         */
        this.getSteps = function () { };

        /**
         * Use this method to manage redirects in an assistant. In most cases, an assistant redirects to itself
         * The sendRedirect(response) method is like a wrapper method that performs this redirect. This method
         * also addresses the case in which one assistant redirects to another assistant. In this scenario,
         * the second assistant must return to the first assistant if the user Cancels or the user Finishes.
         * This method, when used in the second assistant, ensures that the user is redirected back to the
         * first assistant.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {ServerResponse} options.response The response that redirects the user.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when response parameter is missing
         *
         * @since 2015.2
         */
        this.sendRedirect = function (options) { };

        /**
         * Returns the object type name
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    /**
     * @class Form
     * @classdesc Primary object used to encapsulate a NetSuite-looking form.
     * After you create a Form object, you can add a variety of scriptable elements to the form including fields, links, buttons, tabs, and sublists.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Form() {

        /**
         * The form title
         * @name Form#title
         * @type {string}
         *
         * @since 2015.2
         */
        this.title = undefined;
        /**
         * This method is called during a beforeLoad UE or a suitelet and the message is later displayed on the client side,
         * once the pageInit script is completed. The method takes either an already created Message object or the options
         * object that would be used for creating the message.
         * User event context can be used to control whether the message is shown on records in view, create, or edit mode (not applicable for Suitelets).
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object|Message} options config object OR the message options object to be displayed in browser, described in N/ui/message: create()
         * @param {Message} options.message the message object to be displayed in browser, described in N/ui/message: create()
         * @return {void}
         * @throws {error.SuiteScriptError} WRONG_PARAMETER_TYPE if supplied options parameter is not an object
         *
         * @since 2018.2
         */
        this.addPageInitMessage = function (options) { };

        /**
         * Adds a button to the ui form
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The script id of button. If you are adding the button to an existing page, the id must be in lowercase, contain no spaces, and include the prefix custpage.
         * @param {string} options.label The label of button
         * @param {string} [options.functionName] The function name to be triggered on a click event.
         * @return {Button}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id or label parameter is missing
         *
         * @since 2015.2
         */
        this.addButton = function (options) { };

        /**
         * Adds a text field that lets you store credentials in NetSuite to be used when invoking services provided by third parties. The GUID generated by this field can be reused multiple times until the script executes again.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The script id of field
         * @param {string} options.label The label of field
         * @param {Array<string>|string} options.restrictToDomains  Domain or list of domains that restricts the destination domains for the credentials, such as 'www.mysite.com'. Credentials cannot be sent to a domain that is not specified here.
         * @param {Array<string>|string} options.restrictToScriptIds  The list of IDs of the scripts where this credential field can be used
         * @param {boolean} [options.restrictToCurrentUser=false] Controls whether the use of this credential is restricted to the same user that originally entered it.
         * By default, the value is false, which means that multiple users can use the credential.
         * @param {string} [options.container]  Id of the form tab where the credential is placed. By default, the field is added to the main section of the form.
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when any required parameter is missing
         *
         * @since 2015.2
         */
        this.addCredentialField = function (options) { };

        /**
         * Adds a secret key field to the form. This key can be used in crypto modules to perform encryption or hashing.
         * The default maximum length for a secret key field is 32 characters. If needed, use the Field.maxLength property to change this value.
         * @restriction Server SuiteScript only
         * @governance none                                       `
         * @param {Object} options
         * @param {string} options.id The script id of field. The id must be in lowercase, contain no spaces, and include the prefix custpage if you are adding the field to an existing page.
         * @param {string} options.label The UI label for the field.
         * @param {Array<string>|string} [options.restrictToScriptIds]  The list of IDs of the scripts where the key can be used.
         * @param {boolean} [options.restrictToCurrentUser=false] Controls whether use of this secret key is restricted to the same user that originally entered the key. By default, the value is false, which means that multiple users can use the key.
         * @param {string} [options.container]  Id of the form tab or group where the key is placed. By default, the field is added to the main section of the form.
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id, label or restrictToScriptIds parameter is missing
         *
         * @since 2015.2
         */
        this.addSecretKeyField = function (options) { };

        /**
         * Adds a field to the form
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id Script id for the field. The id must be in lowercase, contain no spaces, and include the prefix custpage if you are adding the field to an existing page.
         * @param {string} options.label UI label for the field
         * @param {string} options.type  Type of the field. Use the serverWidget.FieldType enum to set the field type.
         * @param {string} [options.source]  The internalId or scriptId of the source list for this field if it is a select (List/Record) or multi-select field
         * @param {string} [options.container]   ID of the field group or tab where to place the field. By default, the field is added to the main section of the form.
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id, label or type parameter is missing
         *
         * @since 2015.2
         */
        this.addField = function (options) { };

        /**
         * Adds a field group to the form
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id the script id for field group
         * @param {string} options.label the label for field group
         * @param {string} [options.tab] ID of the tab where to place the field group. By default, the field group is added to the main section of the form.
         *
         * @return {FieldGroup}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id or label parameter is missing
         *
         * @since 2015.2
         */
        this.addFieldGroup = function (options) { };

        /**
         * Adds a link to the form
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.type The type of link. Use the serverWidget.FormPageLinkType enum to set the value."
         * @param {string} options.title The UI label for the link.
         * @param {string} options.url The URL for the link.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when type, title or url parameter is missing
         *
         * @since 2015.2
         */
        this.addPageLink = function (options) { };

        /**
         * Adds a Sublist to the form
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id  The script id for the sublist. The id must be in lowercase, contain no spaces, and include the prefix custpage if you are adding the sublist to an existing page.
         * @param {string} options.label The ui label for the sublist
         * @param {string} options.type  The type of sublist. Use the serverWidget.SublistType enum to set the value.
         * @param {string} [options.tab] ID of the tab where to add the sublist to. By default, the sublist is added to the main tab.
         * @return {Sublist}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id, label or type parameter is missing
         *
         * @since 2015.2
         */
        this.addSublist = function (options) { };

        /**
         * Adds a Subtab to the form. In order for your subtab to appear on your form, there must be at least one object assigned to the subtab. Otherwise, the subtab will not appear.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id  The script id for the subtab. The id must be in lowercase, contain no spaces. If you are adding the subtab to an existing page, include the prefix custpage.
         * @param {string} options.label The UI label for the subtab
         * @param {string} [options.tab] The tab under which to display this subtab. If empty, it is added to the main tab.
         * @return {Tab}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id or label parameter is missing
         *
         * @since 2015.2
         */
        this.addSubtab = function (options) { };

        /**
         * Adds a Tab to the form
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id  The script id for the Tab. The internal ID must be in lowercase and contain no spaces. If you are adding the tab to an existing page, include the prefix custpage.
         * @param {string} options.label The UI label for the tab
         * @return {Tab}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id or label parameter is missing
         *
         * @since 2015.2
         */
        this.addTab = function (options) { };

        /**
         * Adds a Reset button to the form
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} [options]
         * @param {string} [options.label]  The UI label used for this button. If no label is provided, the label defaults to Reset.
         * @return {Button}
         *
         * @since 2015.2
         */
        this.addResetButton = function (options) { };

        /**
         * Adds a Submit button to the form
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} [options]
         * @param {string} [options.label] The UI label for this button. If no label is provided, the label defaults to Save.
         * @return {Button}
         *
         * @since 2015.2
         */
        this.addSubmitButton = function (options) { };

        /**
         * Gets a Button object from its script id
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The script id of the button. ID must be in lowercase and contain no spaces.
         * @return {Button}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getButton = function (options) { };

        /**
         * Gets a Field object from its script id
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The script id of the field. ID must be in lowercase and contain no spaces.
         * @return {Field}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getField = function (options) { };

        /**
         * Gets a Subtab object from its script id
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id  The script id of the subtab. ID must be in lowercase and contain no spaces.
         * @return {Tab}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getSubtab = function (options) { };

        /**
         * Gets a Subtab object from its script id
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id  The script id for the tab. ID must be in lowercase and contain no spaces.
         * @return {Tab}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getTab = function (options) { };

        /**
         * Returns an array that contains all the tabs in a form.
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Array<Tab>}
         *
         * @since 2015.2
         */
        this.getTabs = function () { };

        /**
         * Gets a Sublist object from its script id
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The script id of the Sublist. ID must be in lowercase and contain no spaces.
         * @return {Sublist}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.getSublist = function (options) { };

        /**
         * Inserts a field before another field
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {Field} options.field The field to insert
         * @param {string} options.nextfield Id of the field before which the field is inserted.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when field or nextfield parameter is missing
         *
         * @since 2015.2
         */
        this.insertField = function (options) { };

        /**
         * Inserts a sublist before another sublist
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {Sublist} options.sublist Sublist to insert
         * @param {string} options.nextsublist Id of the sublist before which the sublist is inserted.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when sublist or nextsublist parameter is missing
         *
         * @since 2015.2
         */
        this.insertSublist = function (options) { };

        /**
         * Inserts a subtab before another subtab
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {Subtab} options.subtab Subtab to insert
         * @param {string} options.nextsub Id of the subtab before which the subtab is inserted.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when subtab or nextsub parameter is missing
         *
         * @since 2015.2
         */
        this.insertSubtab = function (options) { };

        /**
         * Inserts a Tab before another tab
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {Tab} options.tab Tab to insert
         * @param {string} options.nexttab  Id of the tab before which the tab is inserted.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when tab or nexttab parameter is missing
         *
         * @since 2015.2
         */
        this.insertTab = function (options) { };

        /**
         * Removes a button.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id Script id of the button to remove. The ID must be in lowercase and contain no spaces.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id parameter is missing
         *
         * @since 2015.2
         */
        this.removeButton = function (options) { };

        /**
         * Set the default values of many fields at once
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {Array<Object>} options.values Array of name/value pairs that map field names to field values.
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when values parameter is missing
         *
         * @since 2015.2
         */
        this.updateDefaultValues = function (options) { };

        /**
         * The file cabinet ID of client script file to be used in this form.
         * @name Form#clientScriptFileId
         * @type {number}
         * @throws {SuiteScriptError} PROPERTY_VALUE_CONFLICT When clientScriptModulePath property was set beforehand
         *
         * @since 2015.2
         */
        this.clientScriptFileId = undefined;
        /**
         * The file path of client script file to be used in this form.
         * @name Form#clientScriptModulePath
         * @type {string}
         * @throws {SuiteScriptError} PROPERTY_VALUE_CONFLICT When clientScriptFileId property was set beforehand
         *
         * @since 2015.2
         */
        this.clientScriptModulePath = undefined;
        /**
         * Returns the object type name
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    /**
     * @class List
     * @classdesc Primary object used to encapsulate a list page
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function List() {

        /**
         * Sets the display style for this list
         * Possible values are in serverWidget.ListStyle.
         * @name List#style
         * @type {string}
         *
         * @since 2015.2
         */
        this.style = undefined;
        /**
         * List title
         * @name List#title
         * @type {string}
         *
         * @since 2015.2
         */
        this.title = undefined;
        /**
         * Add a Button to the list page
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id The script id for button. The id must be in lowercase, contain no spaces, and include the prefix custpage if you are adding the button to an existing page.
         * @param {string} options.label the ui label of button
         * @param {string} [options.functionName] The function name to call when clicking on this button.
         * @return {Button}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id or label parameter is missing
         *
         * @since 2015.2
         */
        this.addButton = function (options) { };

        /**
         * Adds a column to a list page
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.id   The internal id for the column
         * @param {string} options.type  The type for the column
         * @param {string} options.label  The ui label for the column
         * @param {string} [options.align] The layout justification for this column. Set this value using the serverWidget.LayoutJustification enum. The default value is left.
         * @return {ListColumn}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when id, label, or type parameter is missing
         *
         * @since 2015.2
         */
        this.addColumn = function (options) { };

        /**
         * Adds a column containing Edit or Edit/View links to the list page.
         * The column is added to the left of a previously existing column.
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {ListColumn} options.column  The Edit/View column is added to the left of this column
         * @param {boolean} [options.showView]  If true then an Edit/View column will be added. Otherwise only an Edit column will be added.
         * @param {string} [options.showHrefCol] - If set, this value must be included in row data provided for the
         * list and will be used to determine whether the URL for this link is clickable
         * @param {string} [options.link] The target of Edit/View link (For example: /app/common/entity/employee.nl). The complete link is formed like this: /app/common/entity/employee.nl?id=123
         * @param {string} [options.linkParam] If set, this value must be included in row data provided for the
         * list and will be appended to link as url parameter (defaults to column). The internal ID of the field in the row data where to take the parameter from.
         * @param {string} [options.linkParamName] Name of the url link parameter (defaults to 'id' if not set)
         * @return {ListColumn}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when any required parameter is missing
         *
         * @since 2015.2
         */
        this.addEditColumn = function (options) { };

        /**
         * Adds a navigation cross-link to the list page
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.type  The type of link to add. The value is set using the FormPageLinkType enum.
         * @param {string} options.title  The UI text displayed in the link
         * @param {string} options.url  The URL used for this link
         * @return {List}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when type, title or url parameter is missing
         *
         * @since 2015.2
         */
        this.addPageLink = function (options) { };

        /**
         * Adds a single row to a list (Array of name/value pairs or search.Result)
         * @restriction Server SuiteScript only
         * @governance none
         *
         * @param {Object} options
         * @param {Object} options.row  Row definition corresponds to a search.Result object or contains name/value pairs containing the values for the corresponding Column object in the list.
         * @return {List}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when row parameter is missing
         *
         * @since 2015.2
         */
        this.addRow = function (options) { };

        /**
         * Adds multiple rows (Array of search.Result or name/value pair Arrays)
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {Array<Object>} options.rows An array of rows that consist of either a search.Result array, or an array of name/value pairs. Each pair should contain the value for the corresponding Column object in the list.
         * @return {List}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when rows parameter is missing
         *
         * @since 2015.2
         */
        this.addRows = function (options) { };

        /**
         * The file cabinet ID of client script file to be used in this list.
         * @name List#clientScriptFileId
         * @type {number}
         * @throws {SuiteScriptError} PROPERTY_VALUE_CONFLICT When clientScriptModulePath property was set beforehand
         *
         * @since 2015.2
         */
        this.clientScriptFileId = undefined;
        /**
         * The file path of client script file to be used in this list.
         * @name List#clientScriptModulePath
         * @type {string}
         * @throws {SuiteScriptError} PROPERTY_VALUE_CONFLICT When clientScriptFileId property was set beforehand
         *
         * @since 2015.2
         */
        this.clientScriptModulePath = undefined;
        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };

        /**
         * Returns the object type name
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };
    }

    /**
     * @class ListColumn
     * @classdesc Encapsulates a list column
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function ListColumn() {

        /**
         * Adds a URL parameter (optionally defined per row) to the list column's URL
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.param  Name for the parameter
         * @param {string} options.value  Value for the parameter
         * @param {boolean} [options.dynamic]  If true, then the parameter value is actually an alias that is calculated per row
         * @return {ListColumn}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when param or value parameter is missing
         *
         * @since 2015.2
         */
        this.addParamToURL = function (options) { };

        /**
         * @name ColumnList#label This list column label.
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * Sets the base URL for the list column
         * @restriction Server SuiteScript only
         * @governance none
         * @param {Object} options
         * @param {string} options.url  The base url or a column in the data source that returs the
         * base url for each row
         * @param {boolean} [options.dynamic] If true, then the URL is actually an alias that is calculated per row
         * @return {ListColumn}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when url parameter is missing
         *
         * @since 2015.2
         */
        this.setURL = function (options) { };

        /**
         * get JSON format of the object
         * @restriction Server SuiteScript only
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };

        /**
         * Returns the object type name
         * @restriction Server SuiteScript only
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };
    }

    var ui = {};
    N.ui = ui;
    ui.serverWidget = serverWidget;

    /**
     * @exports N/ui/serverWidget
     */
    return serverWidget;
});