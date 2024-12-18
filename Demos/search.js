/**
 * SuiteScript search common module
 * Load the search module to create and run on-demand or saved searches and analyze and iterate through the search results.
 *
 * @module N/search
 * @suiteScriptVersion 2.x
 *
 */
define([], function () {
    /**
     * @namespace search
     */
    var search = {};

    /**
     * Creates a new search and returns it as a search.Search object.
     * The search can be modified and run as an on demand search with Search.run(), without saving it. Alternatively,
     * calling Search.save() will save the search to the database, so it can be reused later in the UI or loaded with search.load(options).
     * @governance none
     * @param {Object} options  the options object
     * @param {string} options.type  The search type that you want to base the search on. Use the search.Type enum for this argument.
     * @param {Filter|Array<Filter>|Array<Object>} [options.filters] A single search.Filter object, an array of search.Filter objects, a search filter expression, or an array of search filter expressions.
     * @param {Array<Object>} [options.filterExpression] Search filter expression for the search as an array of expression objects.
     * @param {Column|Array<Column>|Array<Object>} [options.columns] A single search.Column object or array of search.Column objects.
     * @param {string} [options.packageId] The application ID for this search.
     * @param {Setting|Array<Setting>|Array<Object>} [options.settings] Search settings for this search as a single search.Setting object or an array of search.Setting objects. Search settings let you specify search parameters that are typically available only in the UI. See Search.settings.
     * @param {string} [options.title] The name for a saved search. The title property is required to save a search with Search.save().
     * @param {string} [options.id] Script ID for a saved search. If you do not set the saved search ID, NetSuite generates one for you. See Search.id.
     * @param {boolean} [options.isPublic] Set to true to make the search public. Otherwise, set to false. If you do not set this parameter, it defaults to false.
     * @return {Search}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_FILTER_EXPR The options.filters parameter is not a valid search filter, filter array, or filter expression.
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_COLUMN The options.columns parameter is not a valid column, string, or column or string array.
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING An unknown search parameter name is provided.
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING_VALUE An unsupported value is set for the provided search parameter name.
     *
     * @since 2015.2
     */
    search.create = function (options) { };
    search.create.promise = function (options) { };

    /**
     * Loads an existing saved search and returns it as a search.Search. The saved search could have been created using the UI or created with search.create(options) and Search.save().
     * @governance 5 units
     * @param {Object} options  the options object
     * @param {string} options.id Internal ID or script ID of a saved search. The script ID starts with customsearch. See Search.id.
     * @param {string} [options.type] The search type of the saved search to load. Use a value from the search.Type enum for this parameter. Required if the saved search to load uses a standalone search type, optional otherwise.
     * @return {Search}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
     * @throws {SuiteScriptError} INVALID_SEARCH Cannot find saved search with the saved search ID from options.id parameter.
     *
     * @since 2015.2
     */
    search.load = function (options) { };
    search.load.promise = function (options) { };

    /**
     * Deletes an existing saved search. The saved search could have been created using the UI or created with search.create(options) and Search.save().
     * @governance 5 units
     * @param {Object} options the options object
     * @param {string} options.id Internal ID or script ID of a saved search. The script ID starts with customsearch. See Search.id.
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
     * @throws {SuiteScriptError} INVALID_SEARCH Cannot find saved search with the saved search ID from options.id parameter.
     * @return {void}
     *
     * @since 2015.2
     */
    search['delete'] = function (options) { };
    search['delete'].promise = function (options) { };



    /**
     * Performs a search for duplicate records based on the account's duplicate detection configuration.
     * @governance 10 units
     * @param {Object} options  the options object
     * @param {string} options.type The search type that you want to check for duplicates. Use the search.Type enum for this parameter.
     * @param {Object} [options.fields] A set of key/value pairs used to detect duplicates. The keys are internal ID names of the fields used to detect duplicates.
     * @param {number} [options.id] Internal ID of an existing record.
     * @return {Array<Result>}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
     *
     * @since 2015.2
     */
    search.duplicates = function (options) { };
    search.duplicates.promise = function (options) { };

    /**
     * Performs a global search against a single keyword or multiple keywords.
     * @governance 10 units
     * @param {Object} options  the options object
     * @param {string} options.keywords Global search keywords string or expression.
     * @return {Array<Result>}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
     *
     * @since 2015.2
     */
    search.global = function (options) { };
    search.global.promise = function (options) { };

    /**
     * Performs a search for one or more body fields on a record.
     * @governance 1 unit
     * @param {Object} options  the options object
     * @param {string} options.type The search type that you want to check for duplicates. Use the search.Type enum for this parameter.
     * @param {string} options.id Internal ID for the record, for example 777 or 87.
     * @param {string|Array<string>} options.columns Array of column/field names to look up, or a single column/field name. The columns parameter can also be set to reference joined fields.
     * @return {Object}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_COLUMN The options.columns parameter is not a valid column, string, or column or string array.
     *
     * @since 2015.2
     */
    search.lookupFields = function (options) { };
    search.lookupFields.promise = function (options) { };

    /**
     * Creates a new search column as a search.Column object.
     * @governance none
     * @param {Object} options  the options object
     * @param {string} options.name  Name of the search column.
     * @param {string} [options.join]  Join ID for the search column.
     * @param {string} [options.summary] Summary type for the column.
     * @param {string} [options.formula] Formula used for the column.
     * @param {string} [options.function] Special function for the search column.
     * @param {string} [options.label] Label for the search column.
     * @param {string} [options.sort] The sort order of the column.
     * @return {Column} the created column object
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_COLUMN_SUM The options.summary parameter is not a valid search summary type.
     * @throws {SuiteScriptError} INVALID_SRCH_FUNCTN An unknown function is provided.
     *
     * @since 2015.2
     */
    search.createColumn = function (options) { };

    /**
     * Creates a new search filter as a search.Filter object.
     * @governance none
     * @param {Object} options  the options object
     * @param {string} options.name  Name or internal ID of the search field.
     * @param {string} [options.join] Join ID for the search filter.
     * @param {string} options.operator Operator used for the search filter. Use the search.Operator enum.
     * @param {string|Date|Number|boolean|Array<string>|Array<Date>|Array<Number>} [options.values] Values to be used as filter parameters.
     * @param {string} [options.formula] Formula used for this filter
     * @param {Summary} [options.summary] Summary type for the search filter.
     * @return {Filter} the created filter object
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required parameter is missing.
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_OPERATOR Options.summary parameter is not a valid search summary type.
     * @throws {SuiteScriptError} INVALID_SRCH_SUMMARY_TYP Options.operator parameter is not a valid operator type.
     *
     * @since 2015.2
     */
    search.createFilter = function (options) { };

    /**
     * Creates a new search setting and returns it as a search.Setting object.
     * @governance none
     * @param {Object} options  the options object
     * @param {string} options.name The name of the search parameter to set
     * @param {string} options.value The value of the search parameter.
     * @return {Setting} the created setting object
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT A required parameter is missing.
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING An unknown search parameter name is provided.
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING_VALUE An unsupported value is set for the provided search parameter name.
     *
     * @since 2015.2
     */
    search.createSetting = function (options) { };

    /**
     * Enumeration that holds the values for search operators to use with the search.Filter.
     * @enum {string}
     * @readonly
     */
    function searchOperator() {
        this.AFTER = 'after';
        this.ALLOF = 'allof';
        this.ANY = 'any';
        this.ANYOF = 'anyof';
        this.BEFORE = 'before';
        this.BETWEEN = 'between';
        this.CONTAINS = 'contains';
        this.DOESNOTCONTAIN = 'doesnotcontain';
        this.DOESNOTSTARTWITH = 'doesnotstartwith';
        this.EQUALTO = 'equalto';
        this.GREATERTHAN = 'greaterthan';
        this.GREATERTHANOREQUALTO = 'greaterthanorequalto';
        this.HASKEYWORDS = 'haskeywords';
        this.IS = 'is';
        this.ISEMPTY = 'isempty';
        this.ISNOT = 'isnot';
        this.ISNOTEMPTY = 'isnotempty';
        this.LESSTHAN = 'lessthan';
        this.LESSTHANOREQUALTO = 'lessthanorequalto';
        this.NONEOF = 'noneof';
        this.NOTAFTER = 'notafter';
        this.NOTALLOF = 'notallof';
        this.NOTBEFORE = 'notbefore';
        this.NOTBETWEEN = 'notbetween';
        this.NOTEQUALTO = 'notequalto';
        this.NOTGREATERTHAN = 'notgreaterthan';
        this.NOTGREATERTHANOREQUALTO = 'notgreaterthanorequalto';
        this.NOTLESSTHAN = 'notlessthan';
        this.NOTLESSTHANOREQUALTO = 'notlessthanorequalto';
        this.NOTON = 'noton';
        this.NOTONORAFTER = 'notonorafter';
        this.NOTONORBEFORE = 'notonorbefore';
        this.NOTWITHIN = 'notwithin';
        this.ON = 'on';
        this.ONORAFTER = 'onorafter';
        this.ONORBEFORE = 'onorbefore';
        this.STARTSWITH = 'startswith';
        this.WITHIN = 'within';
    }

    search.prototype.Operator = new searchOperator();

    /**
     * Enumeration that holds the values for summary types used by the Column.summary or Filter.summary properties.
     * @enum {string}
     * @readonly
     */
    function searchSummary() {
        this.GROUP = 'GROUP';
        this.COUNT = 'COUNT';
        this.SUM = 'SUM';
        this.AVG = 'AVG';
        this.MIN = 'MIN';
        this.MAX = 'MAX';
    }

    search.prototype.Summary = new searchSummary();

    /**
     * Enumeration that holds the values for supported sorting directions used with search.createColumn(options).
     * @enum {string}
     * @readonly
     */
    function searchSort() {
        this.ASC = 'ASC';
        this.DESC = 'DESC';
        this.NONE = 'NONE';
    }

    search.prototype.Sort = new searchSort();

    function searchType() {
        this.ACCOUNT = 'account';
        this.ACCOUNTING_BOOK = 'accountingbook';
        this.ACCOUNTING_CONTEXT = 'accountingcontext';
        this.ACCOUNTING_PERIOD = 'accountingperiod';
        this.ADV_INTER_COMPANY_JOURNAL_ENTRY = 'advintercompanyjournalentry';
        this.AMORTIZATION_SCHEDULE = 'amortizationschedule';
        this.AMORTIZATION_TEMPLATE = 'amortizationtemplate';
        this.ASSEMBLY_BUILD = 'assemblybuild';
        this.ASSEMBLY_ITEM = 'assemblyitem';
        this.ASSEMBLY_UNBUILD = 'assemblyunbuild';
        this.BALANCE_TRX_BY_SEGMENTS = 'BalanceTrxBySegments';
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
        this.BULK_OWNERSHIP_TRANSFER = 'bulkownershiptransfer';
        this.BUNDLE_INSTALLATION_SCRIPT = 'bundleinstallationscript';
        this.CALENDAR_EVENT = 'calendarevent';
        this.CAMPAIGN = 'campaign';
        this.CARDHOLDER_AUTHENTICATION = 'CardholderAuthentication';
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
        this.EMPLOYEE_STATUS = 'EmployeeStatus';
        this.EMPLOYEE_TYPE = 'EmployeeType';
        this.ENTITY_ACCOUNT_MAPPING = 'entityaccountmapping';
        this.ESTIMATE = 'estimate';
        this.EXPENSE_AMORTIZATION_EVENT = 'expenseamortizationevent';
        this.EXPENSE_CATEGORY = 'expensecategory';
        this.EXPENSE_PLAN = 'expenseplan';
        this.EXPENSE_REPORT = 'expensereport';
        this.EXPENSE_REPORT_POLICY = 'expensereportpolicy';
        this.FAIR_VALUE_PRICE = 'fairvalueprice';
        this.FINANCIAL_INSTITUTION = 'financialinstitution';
        this.FIXED_AMOUNT_PROJECT_REVENUE_RULE = 'fixedamountprojectrevenuerule';
        this.FOLDER = 'folder';
        this.FULFILLMENT_REQUEST = 'fulfillmentrequest';
        this.GENERIC_RESOURCE = 'genericresource';
        this.GIFT_CERTIFICATE = 'giftcertificate';
        this.GIFT_CERTIFICATE_ITEM = 'giftcertificateitem';
        this.GL_NUMBERING_SEQUENCE = 'glnumberingsequence';
        this.GLOBAL_ACCOUNT_MAPPING = 'globalaccountmapping';
        this.GLOBAL_INVENTORY_RELATIONSHIP = 'globalinventoryrelationship';
        this.GOAL = 'goal';
        this.IMPORTED_EMPLOYEE_EXPENSE = 'importedemployeeexpense';
        this.INBOUND_SHIPMENT = 'inboundshipment';
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
        this.ORDER_TYPE = 'ordertype';
        this.OTHER_CHARGE_ITEM = 'otherchargeitem';
        this.OTHER_NAME = 'othername';
        this.OTHER_NAME_CATEGORY = 'othernamecategory';
        this.PARTNER = 'partner';
        this.PARTNER_CATEGORY = 'partnercategory';
        this.PAYCHECK = 'paycheck';
        this.PAYCHECK_JOURNAL = 'paycheckjournal';
        this.PAYMENT_ITEM = 'paymentitem';
        this.PAYMENT_METHOD = 'paymentmethod';
        this.PAYROLL_ITEM = 'payrollitem';
        this.PCT_COMPLETE_PROJECT_REVENUE_RULE = 'pctcompleteprojectrevenuerule';
        this.PERFORMANCE_METRIC = 'performancemetric';
        this.PERFORMANCE_REVIEW = 'performancereview';
        this.PERFORMANCE_REVIEW_SCHEDULE = 'performancereviewschedule';
        this.PERIOD_END_JOURNAL = 'periodendjournal';
        this.PHONE_CALL = 'phonecall';
        this.PICK_STRATEGY = 'pickstrategy';
        this.PICK_TASK = 'picktask';
        this.PLANNED_ORDER = 'plannedorder';
        this.PLANNING_ITEM_CATEGORY = 'planningitemcategory';
        this.PLANNING_ITEM_GROUP = 'planningitemgroup';
        this.PLANNING_RULE_GROUP = 'planningrulegroup';
        this.PLANNING_VIEW = 'planningview';
        this.PORTLET = 'portlet';
        this.PRICE_BOOK = 'pricebook';
        this.PRICE_LEVEL = 'pricelevel';
        this.PRICE_PLAN = 'priceplan';
        this.PRICING_GROUP = 'pricinggroup';
        this.PROJECT_EXPENSE_TYPE = 'projectexpensetype';
        this.PROJECT_IC_CHARGE_REQUEST = 'ProjectIcChargeRequest';
        this.PROJECT_TASK = 'projecttask';
        this.PROJECT_TEMPLATE = 'projecttemplate';
        this.PROMOTION_CODE = 'promotioncode';
        this.PROSPECT = 'prospect';
        this.PURCHASE_CONTRACT = 'purchasecontract';
        this.PURCHASE_ORDER = 'purchaseorder';
        this.PURCHASE_REQUISITION = 'purchaserequisition';
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
        this.SUBTOTAL_ITEM = 'subtotalitem';
        this.SUITELET = 'suitelet';
        this.SUPPLY_CHAIN_SNAPSHOT = 'supplychainsnapshot';
        this.SUPPLY_CHANGE_ORDER = 'supplychangeorder';
        this.SUPPLY_PLAN_DEFINITION = 'supplyplandefinition';
        this.SUPPORT_CASE = 'supportcase';
        this.TASK = 'task';
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
        this.RECENT_RECORD = 'RecentRecord';
        this.ROLE = 'Role';
        this.SAVED_SEARCH = 'SavedSearch';
        this.SHOPPING_CART = 'ShoppingCart';
        this.STATE = 'State';
        this.SUITE_SCRIPT_DETAIL = 'SuiteScriptDetail';
        this.SUPPLY_CHAIN_SNAPSHOT_DETAILS = 'SupplyChainSnapshotDetails';
        this.S_C_M_PREDICTED_RISKS = 'SCMPredictedRisks';
        this.S_C_M_PREDICTION_TRAIN_HISTORY = 'SCMPredictionTrainHistory';
        this.S_C_M_PREDICTION_TRAIN_W_Q_STATUS = 'SCMPredictionTrainWQStatus';
        this.SYSTEM_NOTE = 'SystemNote';
        this.TAX_DETAIL = 'TaxDetail';
        this.TIMESHEET_APPROVAL = 'TimesheetApproval';
        this.INVENTORY_DEMAND = 'InventoryDemand';
        this.ALLOC_RECOMMENDATION_DEMAND = 'AllocRecommendationDemand';
        this.UBER = 'Uber';
        this.RES_ALLOCATION_TIME_OFF_CONFLICT = 'ResAllocationTimeOffConflict';
        this.COM_SEARCH_ONE_WAY_SYN = 'ComSearchOneWaySyn';
        this.COM_SEARCH_GROUP_SYN = 'ComSearchGroupSyn';
        this.COM_SEARCH_BOOST_TYPE = 'ComSearchBoostType';
        this.COM_SEARCH_BOOST = 'ComSearchBoost';
        this.PROMISING_SETUP = 'PromisingSetup';
        this.SUBSCRIPTION_LINE_REVISION = 'SubscriptionLineRevision';
        this.SUBSCRIPTION_RENEWAL_HISTORY = 'SubscriptionRenewalHistory';
        this.AGGR_FIN_DAT = 'AggrFinDat';
        this.CURRENCY_EXCHANGE_RATE = 'CurrencyExchangeRate';
        this.BALANCING_RESULT = 'BalancingResult';
        this.BALANCING_TRANSACTION = 'BalancingTransaction';
        this.BALANCING_DETAIL = 'BalancingDetail';
        this.BILLING_ACCOUNT_BILL_CYCLE = 'BillingAccountBillCycle';
        this.BILLING_ACCOUNT_BILL_REQUEST = 'BillingAccountBillRequest';
        this.BIN_ITEM_BALANCE = 'BinItemBalance';
        this.AUTHENTICATE_DEVICE_INPUT = 'AuthenticateDeviceInput';
        this.CHALLENGE_SHOPPER_INPUT = 'ChallengeShopperInput';
        this.DELETED_RECORD = 'DeletedRecord';
        this.EMPLOYEE_PAYROLL_ITEM = 'EmployeePayrollItem';
        this.END_TO_END_TIME = 'EndToEndTime';
        this.EXPENSE_AMORT_PLAN_AND_SCHEDULE = 'ExpenseAmortPlanAndSchedule';
        this.REV_REC_PLAN_AND_SCHEDULE = 'RevRecPlanAndSchedule';
        this.GL_LINES_AUDIT_LOG = 'GlLinesAuditLog';
        this.INSTALLMENT = 'Installment';
        this.INVENTORY_BALANCE = 'InventoryBalance';
        this.INVENTORY_NUMBER_BIN = 'InventoryNumberBin';
        this.INVENTORY_NUMBER_ITEM = 'InventoryNumberItem';
        this.INVENTORY_STATUS_LOCATION = 'InventoryStatusLocation';
        this.ALLOC_RECOMMENDATION_DETAIL = 'AllocRecommendationDetail';
        this.INVT_NUMBER_ITEM_BALANCE = 'InvtNumberItemBalance';
        this.ITEM_BIN_NUMBER = 'ItemBinNumber';
        this.LABOR_CATEGORY = 'LaborCategory';
        this.LABOR_COST_CARD = 'LaborCostCard';
        this.LABOR_COST_CARD_ITEM = 'LaborCostCardItem';
        this.LABOR_COST_CARD_SEGMENT = 'LaborCostCardSegment';
        this.LABOR_COST_ELEMENT = 'LaborCostElement';
        this.CARDHOLDER_AUTHENTICATION_EVENT = 'CardholderAuthenticationEvent';
        this.PAYMENT_EVENT = 'PaymentEvent';
        this.PAYMENT_INSTRUMENT = 'PaymentInstrument';
        this.PAYMENT_OPTION = 'PaymentOption';
        this.PAYMENT_RESULT_PREVIEW = 'PaymentResultPreview';
        this.PAYROLL_SETUP = 'PayrollSetup';
        this.PERMISSION = 'Permission';
        this.PLANNING_ENGINE_MESSAGE = 'PlanningEngineMessage';
        this.PLANNING_ENGINE_PEGGING = 'PlanningEnginePegging';
        this.PLANNING_ENGINE_RESULT = 'PlanningEngineResult';
        this.PLANNING_REPOSITORY_ALLOCATION = 'PlanningRepositoryAllocation';
        this.PLANNING_REPOSITORY_BOM_EDGE = 'PlanningRepositoryBomEdge';
        this.PLANNING_REPOSITORY_ITEM_LOCATION = 'PlanningRepositoryItemLocation';
        this.PLANNING_REPOSITORY_SOURCE = 'PlanningRepositorySource';
        this.GATEWAY_NOTIFICATION = 'GatewayNotification';
        this.PRICING = 'Pricing';
        this.TIME_APPROVAL = 'TimeApproval';
        this.COMMERCE_SEARCH_ACTIVITY_DATA = 'CommerceSearchActivityData';
        this.RECEIVED_VENDOR_BILL = 'ReceivedVendorBill';
        this.COMM_AN_SESSION = 'CommAnSession';
        this.ENTITY = 'entity';
        this.ACTIVITY = 'activity';
        this.ITEM = 'item';
        this.TRANSACTION = 'transaction';
    }

    search.prototype.Type = new searchType();

    /**
     * Return a new instance of search.Search object.
     *
     * @classDescription Encapsulates a NetSuite search.
     * @constructor
     * @param {string} typeOrJavaSearch (optional)  the record type you are searching
     * @param {number} id  the internal ID of the search
     * @param {Array<Filter>} [filters] a single filter object or an array of filters used to
     *     filter the search
     * @param {Array<Column>|Array<string>} [columns]  columns to be returned from the search
     * @return {Search}
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_FILTER when provided filters contain a different type than search.Filter
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_COLUMN when provided columns contain a different type than search.Column
     *     or string
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING when provided filters contain a different type than search.Setting
     *
     * @since 2015.2
     */
    function Search() {

        /**
         * Internal ID name of the record type on which a search is based.
         * @name Search#searchType
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.searchType = undefined;
        /**
         * Internal ID of the search.
         * @name Search#searchId
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.searchId = undefined;
        /**
         * Filters for the search as an array of Filter objects.
         * @name Search#filters
         * @type {Array<Filter>}
         * @throws {SuiteScriptError} SSS_INVALID_SRCH_FILTER Invalid value for search filter type.
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE When any filter to assign is of invalid type
         *
         * @since 2015.2
         */
        this.filters = undefined;
        /**
         * Use filter expressions as a shortcut to create filters (search.Filter).
         * @name Search#filterExpression
         * @type {Array<Object>}
         * @throws {SuiteScriptError} SSS_INVALID_SRCH_FILTER_EXPR The options.filters parameter is not a valid search filter, filter array, or filter expression.
         * @throws {SuiteScriptError} SSS_INVALID_SRCH_FILTER Invalid value for search filter type.
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE When filterExpression contains a member with invalid type
         *
         * @since 2015.2
         */
        this.filterExpression = undefined;
        /**
         * Columns to return for this search as an array of search.Column objects or a string array of column names.
         * @name Search#columns
         * @type {Array<Column>|Array<string>}
         * @throws {SuiteScriptError} SSS_INVALID_SRCH_COLUMN when setting value of different type than search.Column or string
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE When any column to assign is of invalid type
         *
         * @since 2015.2
         */
        this.columns = undefined;
        /**
         * Search settings for this search as an array of search.Setting objects or a string array of column names.
         * @name Search#settings
         * @type {Array<Setting>|Array<string>} (setter accepts also a single search.Setting or string)
         * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING An unknown search parameter name is provided.
         * @throws {SuiteScriptError} SSS_INVALID_SRCH_SETTING_VALUE An unsupported value is set for the provided search parameter name.
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE When any setting to assign is of invalid type
         *
         * @since 2018.2
         */
        this.settings = undefined;
        /**
         * Title for a saved search. Use this property to set the title for a search before you save it for the first time.
         * @name Search#title
         * @type {string}
         *
         * @since 2015.2
         */
        this.title = undefined;
        /**
         * Script ID for a saved search, starting with customsearch. If you do not set this property and then save the search, NetSuite generates a script ID for you.
         * @name Search#id
         * @type {string}
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * The application ID for this search.
         * @name Search#package
         * @type {string}
         *
         * @since 2019.2
         */
        this.packageId = undefined;
        /**
         * Value is true if the search is public, or false if it is not. By default, all searches created through search.create(options) are private.
         * @name Search#isPublic
         * @type {boolean}
         *
         * @since 2015.2
         */
        this.isPublic = undefined;
        /**
         * Saves a search created by search.create(options) or loaded with search.load(options). Returns the internal ID of the saved search.
         * @governance 5 units
         * @return {number} the internal search ID of the saved search
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT Required Search.title property not set on search.Search.
         * @throws {SuiteScriptError} NAME_ALREADY_IN_USE The Search.title property on search.Search is not unique.
         * @throws {SuiteScriptError} SSS_DUPLICATE_SEARCH_SCRIPT_ID The Search.id property on search.Search is not unique.
         *
         * @since 2015.2
         */
        this.save = function (options) { };
        this.save.promise = function (options) { };

        /**
         * Runs an on-demand search created with search.create(options) or a search loaded with search.load(options), returning the results as a search.ResultSet.
         * @governance none
         * @return {ResultSet} the result set object
         *
         * @since 2015.2
         */
        this.run = function () { };

        /**
         * Runs the current search and returns summary information about paginated results. Calling this method does not give you the result set or save the search.
         * @governance none
         * @return {SearchPagedData} PagedData object that allows user to page through the search result
         *
         * @since 2016.1
         */
        this.runPaged = function (options) { };
        this.runPaged.promise = function (options) { };

        /**
         * Returns the object type name (search.Search)
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    /**
     * Return a new instance of search.Filter object.
     *
     * @classDescription Encapsulates a search filter used in a search.
     * @protected
     * @constructor
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT if a required parameter is missing
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_OPERATOR if an unknown operator is provided
     *
     * @since 2015.2
     */
    function Filter() {

        /**
         * Name or internal ID of the search field as a string.
         * @name Filter#name
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.name = undefined;
        /**
         * Join ID for the search filter as a string.
         * @name Filter#join
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.join = undefined;
        /**
         * Operator used for the search filter.
         * @name Filter#operator
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.operator = undefined;
        /**
         * Summary type for the search filter.
         * @name Filter#summary
         * @type {string}
         * @throws {SuiteScriptError} SSS_INVALID_SRCH_FILTER_SUM when setting invalid summary type
         *
         * @since 2015.2
         */
        this.summary = undefined;
        /**
         * Formula used by the search filter.
         * @name Filter#formula
         * @type {string}
         *
         * @since 2015.2
         */
        this.formula = undefined;
        /**
         * Returns the object type name (search.Filter)
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    /**
     * Return a new instance of search.ResultSet object.
     *
     * @classDescription Encapsulation of a search result set.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function ResultSet() {

        /**
         * List of columns contained in this result set.
         * @name ResultSet#columns
         * @type {Array<Column>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.columns = undefined;
        /**
         * Retrieve a slice of the search result set. Only 1000 results can be returned at a time. If there are fewer results
         * available than requested, then the array will be truncated.
         * @governance 10 units
         * @param {Object} options  the options object
         * @param {number} options.start  the index number of the first result to return, inclusive
         * @param {number} options.end  the index number of the last result to return, exclusive
         * @return {Array<Result>} the requested slice of the search result set
         *
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when start or end parameters are missing
         *
         * @since 2015.2
         */
        this.getRange = function (options) { };

        /**
         * Calls the developer-defined callback function for every result in this set. The result set processed by each()
         * may have maximum 4000 rows. The callback function has the following signature: boolean callback(result.Result
         * result); If the return value of the callback is false, the iteration over results is stopped, otherwise it
         * continues. Note that the work done in the context of the callback function counts towards the governance of the
         * script that called it.
         * @governance 10 units
         * @param {Function} callback  the function called for each result in the result set
         * @return {void}
         * @since 2015.2
         */
        this.each = function (options) { };

        /**
         * Returns the object type name (search.ResultSet)
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    /**
     * Return a new instance of search.Column object.
     *
     * @classDescription Encapsulates a single search column in a search.Search. Use the methods and properties available to the Column object to get or set Column properties.
     * @protected
     * @constructor
     * @throws {SuiteScriptError} SSS_INVALID_SRCH_COLUMN_SUM if an unknown summary type is provided
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name parameter is missing
     *
     * @since 2015.2
     */
    function Column() {

        /**
         * The name of the search column.
         * @name Column#name
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.name = undefined;
        /**
         * The join ID for this search column.
         * @name Column#join
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.join = undefined;
        /**
         * The summary type for this search column.
         * @name Column#summary
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.summary = undefined;
        /**
         * The formula used for this search column.
         * @name Column#formula
         * @type {string}
         *
         * @since 2015.2
         */
        this.formula = undefined;
        /**
         * The label used for this search column.
         * @name Column#label
         * @type {string}
         *
         * @since 2015.2
         */
        this.label = undefined;
        /**
         * The function used in this search column.
         * @name Column#function
         * @type {string}
         * @throws {SuiteScriptError} INVALID_SRCH_FUNCTN Unknown function is set.
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE When assigning unsupported function is attempted
         *
         * @since 2015.2
         */
        this['function'] = undefined;
        /**
         * The sort direction for this search column. Use values from the Sort enum.
         * @name Column#sort
         * @type {string}
         * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE When assigning unsupported direction is attempted
         * @since 2015.2
         */
        this.sort = undefined;
        /**
         * Returns the search column for which the minimal or maximal value should be found when returning the search.Column
         * value. For example, can be set to find the most recent or earliest date, or the largest or smallest amount for a
         * record, and then the search.Column value for that record is returned. Can only be used when summary type is MIN
         * or MAX.
         * @governance none
         * @param {Object} options  the options object
         * @param {string} options.name The name of the search column for which the minimal or maximal value should be found.
         * @param {string} options.join The join id for the search column.
         * @return {Column} this search column
         *
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name or join parameter is missing
         *
         * @since 2015.2
         */
        this.setWhenOrderedBy = function (options) { };

        /**
         * Returns the object type name (search.Column)
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    /**
     * Return a new instance of search.Result object.
     *
     * @classDescription Encapsulation of a search result.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Result() {

        /**
         * Record type of the result.
         * @name Result#recordType
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.recordType = undefined;
        /**
         * Record internal ID of the result.
         * @name Result#id
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * List of columns contained in this result.
         * @name Result#columns
         * @type {Array<Column>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.columns = undefined;
        /**
         * Returns the value of a specified search return column. The column may be specified in two ways:
         * 1) by providing a search.Column object
         * 2) by providing name, join and summary parameters
         * @governance none
         * @param {Column} column  The search result column from which to return a value.
         * - or -
         * @param {Object} options  the options object
         * @param {string} options.name  The search return column name.
         * @param {string} [options.join] optional The join id for this search return column.
         * @param {Summary} [options.summary]  The summary type for this column.
         * @param {string} [options.func] Special function for the search column.
         * @return {string} string value of the search result column
         *
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name parameter is missing
         *
         * @since 2015.2
         */
        this.getValue = function (options) { };

        /**
         * Returns the UI display name (i.e. the text value) of a specified search return column.
         * Note that this method is supported on select, image and document fields only.
         * The column may be specified in two ways:
         * 1) by providing a search.Column object
         * 2) by providing name, join and summary parameters
         * @governance none
         * @param {Column} column  The search result column from which to return a value.
         * - or -
         * @param {Object} options  the options object
         * @param {string} options.name  The search return column name.
         * @param {string} [options.join] optional The join id for this search return column.
         * @param {Summary} [options.summary]  The summary type for this column.
         * @param {string} [options.func] Special function for the search column.
         * @return {string} UI display name (text value) of the search result column
         *
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name parameter is missing
         *
         * @since 2015.2
         */
        this.getText = function (options) { };

        /**
         * Returns the object type name (search.Result)
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance 0
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };
    }

    /**
     * @class SearchPagedData
     * @classdesc Holds metadata for a paginated query.
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function SearchPagedData() {

        /**
         * Maximum number of entries per page. Possible values are 5 - 1000 entries per page.
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.pageSize = undefined;
        /**
         * The total number of results when Search.runPaged(options) was executed.
         * @type {number}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         */
        this.count = undefined;
        /**
         * The collection of SearchPageRange objects that divide the entire result set into smaller groups.
         * @type {Array<SearchPageRange>}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2015.2
         */
        this.pageRanges = undefined;
    }

    /**
     * @class SearchPageRange
     * @classDescription Defines the page range to contain the result set
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function SearchPageRange() {

        /**
         * @governance none
         * @return {number}
         *
         * @since 2015.2
         */
        this.getIndex = function () { };

        /**
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.getCompoundKey = function () { };

        /**
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.getCompoundLabel = function () { };
    }

    /**
     * Return a new instance of search.Setting object.
     *
     * @class Setting
     * @classDescription Defines a search setting.
     * @protected
     * @constructor
     *
     * @since 2018.2
     */
    function Setting() {

        /**
         * The name of the search parameter.
         * @name Setting#name
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.2
         */
        this.name = undefined;
        /**
         * The value of the search parameter.
         * @name Setting#value
         * @type {string}
         * @readonly
         * @throws {SuiteScriptError} READ_ONLY when setting the property is attempted
         *
         * @since 2018.2
         */
        this.value = undefined;
        /**
         * Returns the object type name (search.Setting)
         * @governance none
         * @return {string}
         *
         * @since 2018.2
         */
        this.toString = function () { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {Object}
         *
         * @since 2018.2
         */
        this.toJSON = function () { };
    }

    N.search = search;

    /**
     * @exports N/search
     */
    return search;
});