/**
 * SuiteScript record common module
 *
 * @module N/record
 * @suiteScriptVersion 2.x
 *
 */
define([], function () {
    /**
     * @namespace record
     */
    var record = {};

    /**
     * Create a new record object based on provided type
     *
     * @governance 10 units for transactions, 2 for custom records, 5 for all other records
     *
     * @param {Object} options
     * @param {string} options.type record type
     * @param {boolean} [options.isDynamic=false] Determines whether the new record is created in dynamic mode.
     * @param {Object} [options.defaultValues] Name-value pairs containing default values of fields in the new record. By default, this value is empty.
     * @return {Record}
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.type is missing
     *
     * @since 2015.2
     */
    record.create = function (options) { };
    record.create.promise = function (options) { };

    /**
     * Load an existing nlobjRecord from the database based on provided type, id
     *
     * @governance 10 units for transactions, 2 for custom records, 5 for all other records
     *
     * @param {Object} options
     * @param {string} options.type The record type.
     * @param {number|string} options.id The internal ID of the existing record instance to be loaded.
     * @param {boolean} [options.isDynamic=false] Determines whether the new record is loaded in dynamic mode.
     * @param {Object} [options.defaultValues] Name-value pairs containing default values of fields in the new record. By default, this value is empty.
     * @return {Record}
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.type or options.id is missing
     *
     * @since 2015.2
     */
    record.load = function (options) { };
    record.load.promise = function (options) { };

    /**
     * Copy a record object based on provided type, id
     *
     * @governance 10 units for transactions, 2 for custom records, 5 for all other records
     *
     * @param {Object} options
     * @param {string} options.type The record type.
     * @param {number|string} options.id The internal ID of the existing record instance being copied.
     * @param {boolean} [options.isDynamic=false] Determines whether the new record is created in dynamic mode.
     * @param {Object} [options.defaultValues] Name-value pairs containing default values of fields in the new record. By default, this value is empty.
     * @return {Record}
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.type or options.id is missing
     *
     * @since 2015.2
     */
    record.copy = function (options) { };
    record.copy.promise = function (options) { };

    /**
     * Transform a record into another type (i.e. salesOrder -> invoice -or- opportunity -> estimate)
     *
     * @governance 10 units for transactions, 2 for custom records, 5 for all other records
     *
     * @param {Object} options
     * @param {string} options.fromType The record type of the existing record instance being transformed.
     * @param {number|string} options.fromId The internal ID of the existing record instance being transformed.
     * @param {string} options.toType The record type of the record returned when the transformation is complete.
     * @param {boolean} [options.isDynamic=false] Determines whether the new record is created in dynamic mode.
     * @param {Object} [options.defaultValues] Name-value pairs containing default values of fields in the new record. By default, this value is empty.
     * @return {Record}
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if options.type or options.id is missing
     *
     * @since 2015.2
     */
    record.transform = function (options) { };
    record.transform.promise = function (options) { };

    /**
     * Delete a record object based on provided type, id and return the id of deleted record
     *
     * @governance 20 units for transactions, 4 for custom records, 10 for all other records
     *
     * @param {Object} options
     * @param {string} options.type The record type.
     * @param {number|string} options.id The internal ID of the existing record instance to be deleted.
     * @return {number} recordId
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if type or id is missing
     *
     * @since 2015.2
     */
    record['delete'] = function (options) { };
    record['delete'].promise = function (options) { };

    /**
     * Updates and submits one or more body fields on an existing record in NetSuite, and returns the internal ID of the parent record. When you use this method, you do not need to load or submit the parent record.
     *
     * @governance 10 units for transactions, 2 for custom records, 5 for all other records
     * @restriction only supported for records and fields where DLE (Direct List Editing) is supported
     *
     * @param {Object} options
     * @param {string} options.type When working with an instance of a standard NetSuite record type, set this value by using the record.Type enum. When working with an instance of a custom record type, set this value by using the custom record type’s string ID.
     * @param {number|string} options.id The internal ID of the existing record instance in NetSuite.
     * @param {Object} options.values The ID-value pairs for each field you want to edit and submit.
     * @param {Object} [options.options] additonal flags for submission
     * @param {boolean} [options.options.enablesourcing=true] enable sourcing during record update
     * @param {boolean} [options.options.ignoreMandatoryFields=false] ignore mandatory field during record submission
     *
     * @return {number} id of submitted record
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if type or id is missing
     *
     * @since 2015.2
     */
    record.submitFields = function (options) { };
    record.submitFields.promise = function (options) { };

    /**
     * Attaches a record to another record.
     *
     * @governance 10 units
     *
     * @param {Object} options
     * @param {Object} options.record record to be attached
     * @param {Object} options.record.type The type of record to attach.
     * @param {number|string} options.record.id The internal ID of the record to attach.
     * @param {Object} options.to The record that the options.record gets attached to.
     * @param {string} options.to.type The record type of the record to attach to.
     * @param {number|string} options.to.id The id of the destination
     * @param {Object} [options.attributes=null] name/value pairs containing attributes
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any of record or to (and their type and id) are missing
     *
     * @since 2015.2
     */
    record.attach = function (options) { };
    record.attach.promise = function (options) { };

    /**
     * detach record from another record
     *
     * @governance 10 units
     *
     * @param {Object} options
     * @param {Object} options.record record to be detached
     * @param {Object} options.record.type The type of record to be detached.
     * @param {number|string} options.record.id The id of the record to be detached
     * @param {Object} options.from The destination record where options.record will be detached from
     * @param {string} options.from.type The type of the destination
     * @param {number|string} options.from.id The id of the destination
     * @param {Object} [options.attributes=null] name/value pairs containing attributes
     *
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if any of record or from (and their type and id) are missing
     *
     * @since 2015.2
     */
    record.detach = function (options) { };
    record.detach.promise = function (options) { };

    function recordType() {
        this.ACCOUNT = 'account';
        this.ACCOUNTING_BOOK = 'accountingbook';
        this.ACCOUNTING_CONTEXT = 'accountingcontext';
        this.ACCOUNTING_PERIOD = 'accountingperiod';
        this.ADV_INTER_COMPANY_JOURNAL_ENTRY = 'advintercompanyjournalentry';
        this.ALLOCATION_SCHEDULE = 'allocationschedule';
        this.AMORTIZATION_SCHEDULE = 'amortizationschedule';
        this.AMORTIZATION_TEMPLATE = 'amortizationtemplate';
        this.ASSEMBLY_BUILD = 'assemblybuild';
        this.ASSEMBLY_ITEM = 'assemblyitem';
        this.ASSEMBLY_UNBUILD = 'assemblyunbuild';
        this.AUTOMATED_CLEARING_HOUSE = 'automatedclearinghouse';
        this.BALANCE_TRX_BY_SEGMENTS = 'balancetrxbysegments';
        this.BILLING_ACCOUNT = 'billingaccount';
        this.BILLING_CLASS = 'billingclass';
        this.BILLING_RATE_CARD = 'billingratecard';
        this.BILLING_REVENUE_EVENT = 'billingrevenueevent';
        this.BILLING_SCHEDULE = 'billingschedule';
        this.BIN = 'bin';
        this.BIN_TRANSFER = 'bintransfer';
        this.BIN_WORKSHEET = 'binworksheet';
        this.BLANKET_PURCHASE_ORDER = 'blanketpurchaseorder';
        this.BOM = 'bom';
        this.BOM_REVISION = 'bomrevision';
        this.BONUS = 'bonus';
        this.BONUS_TYPE = 'bonustype';
        this.BUDGET_EXCHANGE_RATE = 'budgetexchangerate';
        this.BUNDLE_INSTALLATION_SCRIPT = 'bundleinstallationscript';
        this.BULK_OWNERSHIP_TRANSFER = 'bulkownershiptransfer';
        this.CALENDAR_EVENT = 'calendarevent';
        this.CAMPAIGN = 'campaign';
        this.CAMPAIGN_RESPONSE = 'campaignresponse';
        this.CAMPAIGN_TEMPLATE = 'campaigntemplate';
        this.CARDHOLDER_AUTHENTICATION = 'cardholderauthentication';
        this.CASH_REFUND = 'cashrefund';
        this.CASH_SALE = 'cashsale';
        this.CHARGE = 'charge';
        this.CHARGE_RULE = 'chargerule';
        this.CHECK = 'check';
        this.CLASSIFICATION = 'classification';
        this.CLIENT_SCRIPT = 'clientscript';
        this.CMS_CONTENT = 'cmscontent';
        this.CMS_CONTENT_TYPE = 'cmscontenttype';
        this.CMS_PAGE = 'cmspage';
        this.COMMERCE_CATEGORY = 'commercecategory';
        this.COMPETITOR = 'competitor';
        this.CONSOLIDATED_EXCHANGE_RATE = 'consolidatedexchangerate';
        this.CONTACT = 'contact';
        this.CONTACT_CATEGORY = 'contactcategory';
        this.CONTACT_ROLE = 'contactrole';
        this.COST_CATEGORY = 'costcategory';
        this.COUPON_CODE = 'couponcode';
        this.CREDIT_CARD_CHARGE = 'creditcardcharge';
        this.CREDIT_CARD_REFUND = 'creditcardrefund';
        this.CREDIT_MEMO = 'creditmemo';
        this.CURRENCY = 'currency';
        this.CUSTOMER = 'customer';
        this.CUSTOMER_CATEGORY = 'customercategory';
        this.CUSTOMER_DEPOSIT = 'customerdeposit';
        this.CUSTOMER_MESSAGE = 'customermessage';
        this.CUSTOMER_PAYMENT = 'customerpayment';
        this.CUSTOMER_PAYMENT_AUTHORIZATION = 'customerpaymentauthorization';
        this.CUSTOMER_REFUND = 'customerrefund';
        this.CUSTOMER_STATUS = 'customerstatus';
        this.CUSTOMER_SUBSIDIARY_RELATIONSHIP = 'customersubsidiaryrelationship';
        this.CUSTOM_PURCHASE = 'custompurchase';
        this.CUSTOM_RECORD = 'customrecord';
        this.CUSTOM_SALE = 'customsale';
        this.CUSTOM_TRANSACTION = 'customtransaction';
        this.DEPARTMENT = 'department';
        this.DEPOSIT = 'deposit';
        this.DEPOSIT_APPLICATION = 'depositapplication';
        this.DESCRIPTION_ITEM = 'descriptionitem';
        this.DISCOUNT_ITEM = 'discountitem';
        this.DOWNLOAD_ITEM = 'downloaditem';
        this.EMAIL_TEMPLATE = 'emailtemplate';
        this.EMPLOYEE = 'employee';
        this.EMPLOYEE_CHANGE_REQUEST = 'employeechangerequest';
        this.EMPLOYEE_CHANGE_REQUEST_TYPE = 'employeechangerequesttype';
        this.EMPLOYEE_EXPENSE_SOURCE_TYPE = 'employeeexpensesourcetype';
        this.EMPLOYEE_STATUS = 'employeestatus';
        this.EMPLOYEE_TYPE = 'employeetype';
        this.ENTITY_ACCOUNT_MAPPING = 'entityaccountmapping';
        this.ESTIMATE = 'estimate';
        this.EXPENSE_AMORTIZATION_EVENT = 'expenseamortizationevent';
        this.EXPENSE_CATEGORY = 'expensecategory';
        this.EXPENSE_PLAN = 'expenseplan';
        this.EXPENSE_REPORT = 'expensereport';
        this.EXPENSE_REPORT_POLICY = 'expensereportpolicy';
        this.FAIR_VALUE_PRICE = 'fairvalueprice';
        this.FIXED_AMOUNT_PROJECT_REVENUE_RULE = 'fixedamountprojectrevenuerule';
        this.FINANCIAL_INSTITUTION = 'financialinstitution';
        this.FOLDER = 'folder';
        this.FORMAT_PROFILE = 'formatprofile';
        this.FULFILLMENT_REQUEST = 'fulfillmentrequest';
        this.GENERAL_TOKEN = 'generaltoken';
        this.GENERIC_RESOURCE = 'genericresource';
        this.GIFT_CERTIFICATE = 'giftcertificate';
        this.GIFT_CERTIFICATE_ITEM = 'giftcertificateitem';
        this.GL_NUMBERING_SEQUENCE = 'glnumberingsequence';
        this.GLOBAL_ACCOUNT_MAPPING = 'globalaccountmapping';
        this.GLOBAL_INVENTORY_RELATIONSHIP = 'globalinventoryrelationship';
        this.GOAL = 'goal';
        this.IMPORTED_EMPLOYEE_EXPENSE = 'importedemployeeexpense';
        this.INBOUND_SHIPMENT = 'inboundshipment';
        this.INTERCOMP_ALLOCATION_SCHEDULE = 'intercompallocationschedule';
        this.INTER_COMPANY_JOURNAL_ENTRY = 'intercompanyjournalentry';
        this.INTER_COMPANY_TRANSFER_ORDER = 'intercompanytransferorder';
        this.INVENTORY_ADJUSTMENT = 'inventoryadjustment';
        this.INVENTORY_COST_REVALUATION = 'inventorycostrevaluation';
        this.INVENTORY_COUNT = 'inventorycount';
        this.INVENTORY_DETAIL = 'inventorydetail';
        this.INVENTORY_ITEM = 'inventoryitem';
        this.INVENTORY_NUMBER = 'inventorynumber';
        this.INVENTORY_STATUS = 'inventorystatus';
        this.INVENTORY_STATUS_CHANGE = 'inventorystatuschange';
        this.INVENTORY_TRANSFER = 'inventorytransfer';
        this.INVOICE = 'invoice';
        this.INVOICE_GROUP = 'invoicegroup';
        this.ISSUE = 'issue';
        this.ISSUE_PRODUCT = 'issueproduct';
        this.ISSUE_PRODUCT_VERSION = 'issueproductversion';
        this.ITEM_ACCOUNT_MAPPING = 'itemaccountmapping';
        this.ITEM_COLLECTION = 'itemcollection';
        this.ITEM_COLLECTION_ITEM_MAP = 'itemcollectionitemmap';
        this.ITEM_DEMAND_PLAN = 'itemdemandplan';
        this.ITEM_FULFILLMENT = 'itemfulfillment';
        this.ITEM_GROUP = 'itemgroup';
        this.ITEM_LOCATION_CONFIGURATION = 'itemlocationconfiguration';
        this.ITEM_PROCESS_FAMILY = 'itemprocessfamily';
        this.ITEM_PROCESS_GROUP = 'itemprocessgroup';
        this.ITEM_RECEIPT = 'itemreceipt';
        this.ITEM_REVISION = 'itemrevision';
        this.ITEM_SUPPLY_PLAN = 'itemsupplyplan';
        this.JOB = 'job';
        this.JOB_STATUS = 'jobstatus';
        this.JOB_TYPE = 'jobtype';
        this.JOURNAL_ENTRY = 'journalentry';
        this.KIT_ITEM = 'kititem';
        this.LABOR_BASED_PROJECT_REVENUE_RULE = 'laborbasedprojectrevenuerule';
        this.LEAD = 'lead';
        this.LOCATION = 'location';
        this.LOT_NUMBERED_ASSEMBLY_ITEM = 'lotnumberedassemblyitem';
        this.LOT_NUMBERED_INVENTORY_ITEM = 'lotnumberedinventoryitem';
        this.MANUFACTURING_COST_TEMPLATE = 'manufacturingcosttemplate';
        this.MANUFACTURING_OPERATION_TASK = 'manufacturingoperationtask';
        this.MANUFACTURING_ROUTING = 'manufacturingrouting';
        this.MAP_REDUCE_SCRIPT = 'mapreducescript';
        this.MARKUP_ITEM = 'markupitem';
        this.MASSUPDATE_SCRIPT = 'massupdatescript';
        this.MEM_DOC = 'memdoc';
        this.MERCHANDISE_HIERARCHY_LEVEL = 'merchandisehierarchylevel';
        this.MERCHANDISE_HIERARCHY_NODE = 'merchandisehierarchynode';
        this.MERCHANDISE_HIERARCHY_VERSION = 'merchandisehierarchyversion';
        this.MESSAGE = 'message';
        this.MFG_PLANNED_TIME = 'mfgplannedtime';
        this.NEXUS = 'nexus';
        this.NON_INVENTORY_ITEM = 'noninventoryitem';
        this.NOTE = 'note';
        this.NOTE_TYPE = 'notetype';
        this.OPPORTUNITY = 'opportunity';
        this.ORDER_RESERVATION = 'orderreservation';
        this.ORDER_SCHEDULE = 'orderschedule';
        this.ORDER_TYPE = 'ordertype';
        this.OTHER_CHARGE_ITEM = 'otherchargeitem';
        this.OTHER_NAME = 'othername';
        this.OTHER_NAME_CATEGORY = 'othernamecategory';
        this.PARTNER = 'partner';
        this.PARTNER_CATEGORY = 'partnercategory';
        this.PAYCHECK = 'paycheck';
        this.PAYCHECK_JOURNAL = 'paycheckjournal';
        this.PAYMENT_CARD = 'paymentcard';
        this.PAYMENT_CARD_TOKEN = 'paymentcardtoken';
        this.PAYMENT_ITEM = 'paymentitem';
        this.PAYMENT_METHOD = 'paymentmethod';
        this.PAYROLL_ITEM = 'payrollitem';
        this.PERFORMANCE_METRIC = 'performancemetric';
        this.PERFORMANCE_REVIEW = 'performancereview';
        this.PERFORMANCE_REVIEW_SCHEDULE = 'performancereviewschedule';
        this.PERIOD_END_JOURNAL = 'periodendjournal';
        this.PCT_COMPLETE_PROJECT_REVENUE_RULE = 'pctcompleteprojectrevenuerule';
        this.PHONE_CALL = 'phonecall';
        this.PICK_STRATEGY = 'pickstrategy';
        this.PICK_TASK = 'picktask';
        this.PLANNING_ITEM_CATEGORY = 'planningitemcategory';
        this.PLANNING_ITEM_GROUP = 'planningitemgroup';
        this.PLANNING_RULE_GROUP = 'planningrulegroup';
        this.PLANNING_VIEW = 'planningview';
        this.PLANNED_ORDER = 'plannedorder';
        this.PORTLET = 'portlet';
        this.PRICE_BOOK = 'pricebook';
        this.PRICE_LEVEL = 'pricelevel';
        this.PRICE_PLAN = 'priceplan';
        this.PRICING_GROUP = 'pricinggroup';
        this.PROJECT_EXPENSE_TYPE = 'projectexpensetype';
        this.PROJECT_IC_CHARGE_REQUEST = 'projecticchargerequest';
        this.PROJECT_TASK = 'projecttask';
        this.PROJECT_TEMPLATE = 'projecttemplate';
        this.PROMOTION_CODE = 'promotioncode';
        this.PROSPECT = 'prospect';
        this.PURCHASE_CONTRACT = 'purchasecontract';
        this.PURCHASE_ORDER = 'purchaseorder';
        this.PURCHASE_REQUISITION = 'purchaserequisition';
        this.REALLOCATE_ITEM = 'reallocateitem';
        this.RECEIVE_INBOUND_SHIPMENT = 'receiveinboundshipment';
        this.RESOURCE_ALLOCATION = 'resourceallocation';
        this.RESTLET = 'restlet';
        this.RETURN_AUTHORIZATION = 'returnauthorization';
        this.REVENUE_ARRANGEMENT = 'revenuearrangement';
        this.REVENUE_COMMITMENT = 'revenuecommitment';
        this.REVENUE_COMMITMENT_REVERSAL = 'revenuecommitmentreversal';
        this.REVENUE_PLAN = 'revenueplan';
        this.REV_REC_SCHEDULE = 'revrecschedule';
        this.REV_REC_TEMPLATE = 'revrectemplate';
        this.SALES_CHANNEL = 'saleschannel';
        this.SALES_ORDER = 'salesorder';
        this.SALES_ROLE = 'salesrole';
        this.SALES_TAX_ITEM = 'salestaxitem';
        this.SCHEDULED_SCRIPT = 'scheduledscript';
        this.SCHEDULED_SCRIPT_INSTANCE = 'scheduledscriptinstance';
        this.SCRIPT_DEPLOYMENT = 'scriptdeployment';
        this.SERIALIZED_ASSEMBLY_ITEM = 'serializedassemblyitem';
        this.SERIALIZED_INVENTORY_ITEM = 'serializedinventoryitem';
        this.SERVICE_ITEM = 'serviceitem';
        this.SHIP_ITEM = 'shipitem';
        this.SOLUTION = 'solution';
        this.STATISTICAL_JOURNAL_ENTRY = 'statisticaljournalentry';
        this.STORE_PICKUP_FULFILLMENT = 'storepickupfulfillment';
        this.STUDENT_RECORD = 'studentrecord';
        this.SUBSCRIPTION = 'subscription';
        this.SUBSCRIPTION_CHANGE_ORDER = 'subscriptionchangeorder';
        this.SUBSCRIPTION_LINE = 'subscriptionline';
        this.SUBSCRIPTION_PLAN = 'subscriptionplan';
        this.SUBSCRIPTION_TERM = 'subscriptionterm';
        this.SUBSIDIARY = 'subsidiary';
        this.SUBSIDIARY_SETTINGS = 'subsidiarysettings';
        this.SUBTOTAL_ITEM = 'subtotalitem';
        this.SUITELET = 'suitelet';
        this.SUPPLY_CHAIN_SNAPSHOT = 'supplychainsnapshot';
        this.SUPPLY_CHAIN_SNAPSHOT_SIMULATION = 'supplychainsnapshotsimulation';
        this.SUPPLY_CHANGE_ORDER = 'supplychangeorder';
        this.SUPPLY_PLAN_DEFINITION = 'supplyplandefinition';
        this.SUPPORT_CASE = 'supportcase';
        this.TASK = 'task';
        this.TAX_ACCT = 'taxacct';
        this.TAX_GROUP = 'taxgroup';
        this.TAX_PERIOD = 'taxperiod';
        this.TAX_TYPE = 'taxtype';
        this.TERM = 'term';
        this.TIME_BILL = 'timebill';
        this.TIME_ENTRY = 'timeentry';
        this.TIME_OFF_CHANGE = 'timeoffchange';
        this.TIME_OFF_PLAN = 'timeoffplan';
        this.TIME_OFF_REQUEST = 'timeoffrequest';
        this.TIME_OFF_RULE = 'timeoffrule';
        this.TIME_OFF_TYPE = 'timeofftype';
        this.TIME_SHEET = 'timesheet';
        this.TOPIC = 'topic';
        this.TRANSFER_ORDER = 'transferorder';
        this.UNITS_TYPE = 'unitstype';
        this.UNLOCKED_TIME_PERIOD = 'unlockedtimeperiod';
        this.USAGE = 'usage';
        this.USEREVENT_SCRIPT = 'usereventscript';
        this.VENDOR = 'vendor';
        this.VENDOR_BILL = 'vendorbill';
        this.VENDOR_CATEGORY = 'vendorcategory';
        this.VENDOR_CREDIT = 'vendorcredit';
        this.VENDOR_PAYMENT = 'vendorpayment';
        this.VENDOR_PREPAYMENT = 'vendorprepayment';
        this.VENDOR_PREPAYMENT_APPLICATION = 'vendorprepaymentapplication';
        this.VENDOR_RETURN_AUTHORIZATION = 'vendorreturnauthorization';
        this.VENDOR_SUBSIDIARY_RELATIONSHIP = 'vendorsubsidiaryrelationship';
        this.WAVE = 'wave';
        this.WBS = 'wbs';
        this.WEBSITE = 'website';
        this.WORKFLOW_ACTION_SCRIPT = 'workflowactionscript';
        this.WORK_ORDER = 'workorder';
        this.WORK_ORDER_CLOSE = 'workorderclose';
        this.WORK_ORDER_COMPLETION = 'workordercompletion';
        this.WORK_ORDER_ISSUE = 'workorderissue';
        this.WORKPLACE = 'workplace';
        this.ZONE = 'zone';
    }

    record.prototype.Type = new recordType();

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

    N.record = record;

    /**
     * @exports N/record
     */
    return record;
});