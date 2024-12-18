/**
 * SuiteScript module
 *
 * @module N/runtime
 * @suiteScriptVersion 2.x
 *
 */
define([], function () {
    /**
     * @namespace runtime
     */
    var runtime = {};

    /**
     * Returns a runtime.User object that represents the properties and preferences for the user currently executing the script.
     * Use this method to get session objects for the current user session. If you want to get properties for the script or session, use runtime.getCurrentScript() or runtime.getCurrentSession() instead.
     * @governance none
     * @return {User}
     *
     * @since 2015.2
     */
    runtime.getCurrentUser = function () { };

    /**
     * Returns a runtime.Script object that represents the currently executing script.
     * Use this method to get properties and parameters of the currently executing script and script deployment. If you want to get properties for the session or user, use runtime.getCurrentSession() or runtime.getCurrentUser() instead.
     * @governance none
     * @return {Script}
     *
     * @since 2015.2
     */
    runtime.getCurrentScript = function () { };

    /**
     * Returns a runtime.Session object that represents the user session for the currently executing script.
     * Use this method to get session objects for the current user session. If you want to get properties for the script or user, use runtime.getCurrentScript() or runtime.getCurrentUser() instead.
     * @governance none
     * @return {Session}
     *
     * @since 2015.2
     */
    runtime.getCurrentSession = function () { };

    /**
     * Use this method to determine if a particular feature is enabled in a NetSuite account.
     * @governance none
     * @param {Object} options
     * @param {string} options.feature id of the feature
     * @return {boolean}
     * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when feature argument is missing
     * @throws {SuiteScriptError} WRONG_PARAMETER_TYPE when feature is not string
     *
     * @since 2015.2
     */
    runtime.isFeatureInEffect = function (options) { };

    /**
     * The number of scheduled script queues available in the current account.
     * @name Runtime#queueCount
     * @type {number}
     * @readonly
     *
     * @since 2015.2
     */
    runtime.queueCount = undefined;
    /**
     * The number of processors available to the current account.
     * @name Runtime#processorCount
     * @type {number}
     * @readonly
     *
     * @since 2018.1
     */
    runtime.processorCount = undefined;
    /**
     * The version of NetSuite the current account is runnning.
     *
     * @name Runtime#version
     * @type {string}
     * @readonly
     *
     * @since 2015.2
     */
    runtime.version = undefined;
    /**
     * The account ID for the current user.
     * @name Runtime#accountId
     * @type {string}
     * @readonly
     *
     * @since 2015.2
     */
    runtime.accountId = undefined;
    /**
     * The country for the current company
     * @name Runtime#country
     * @type {string}
     * @readonly
     *
     * @since 2020.2
     */
    runtime.country = undefined;
    /**
     * The current environment in which the script is executing. This property uses values from the runtime.EnvType enum.
     * @name Runtime#envType
     * @type {string}
     * @readonly
     *
     * @since 2015.2
     */
    runtime.envType = undefined;
    /**
     * The trigger of the current script. This property uses values from the runtime.ContextType enum.
     * @name Runtime#executionContext
     * @type {string}
     * @readonly
     *
     * @since 2015.2
     */
    runtime.executionContext = undefined;
    /**
     * JSON.stringify() implementation.
     * @governance none
     * @return {Object}
     *
     * @since 2015.2
     */
    runtime.toJSON = function () { };

    /**
     * Returns the object type name
     * @governance none
     * @return {string}
     *
     * @since 2015.2
     */
    runtime.toString = function () { };

    /**
     * Holds all possible environment types that the current script can execute in. This is the type for the runtime.envType property.
     * @enum {string}
     * @readonly
     */
    function runtimeEnvType() {
        this.SANDBOX = 'SANDBOX';
        this.PRODUCTION = 'PRODUCTION';
        this.BETA = 'BETA';
        this.INTERNAL = 'INTERNAL';
    }

    runtime.prototype.EnvType = new runtimeEnvType();

    /**
     * Holds the context values for script triggers. This is the type for the runtime.executionContext property.
     * @name runtime#ContextType
     * @type {Object}
     * @readonly
     *
     * @since 2015.2
     */
    runtime.ContextType = undefined;
    /**
     * Holds the user permission level for a specific permission ID. User.gerPermission(options) returns a value from this enum.
     * @enum {number}
     * @readonly
     */
    function runtimePermission() {
        this.FULL = 4.0;
        this.EDIT = 3.0;
        this.CREATE = 2.0;
        this.VIEW = 1.0;
        this.NONE = 0.0;
    }

    runtime.prototype.Permission = new runtimePermission();

    /**
     * @class Script
     * @classdesc Class for retrieving information about currently running script
     * @protected
     * @constructor
     *
     * @since 2015.2
     */
    function Script() {

        /**
         * The script logging level for the currently executing script. Returns one of the following values: DEBUG, AUDIT, ERROR, EMERGENCY.
         * @name Script#logLevel
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.logLevel = undefined;
        /**
         * The script ID for the currently executing script.
         * @name Script#id
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * The current script's runtime version
         * @name Script#apiVersion
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.apiVersion = undefined;
        /**
         * The deployment ID for the script deployment on the currently executing script.
         * @name Script#deploymentId
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.deploymentId = undefined;
        /**
         * An array of bundle IDs for the bundles that include the currently executing script.
         * @name Script#bundleIds
         * @type {Array<string>}
         * @readonly
         *
         * @since 2015.2
         */
        this.bundleIds = undefined;
        /**
         * Returns the number of usage units remaining for the currently executing script.
         * @governance none
         * @return {number}
         *
         * @since 2015.2
         */
        this.getRemainingUsage = function () { };

        /**
         * Returns the value of a script parameter for the currently executing script.
         * @governance none
         * @param {Object} options
         * @param {string} options.name The name of the parameter
         * @return {number|Date|string|boolean}
         *
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name argument is missing
         * @throws {SuiteScriptError} WRONG_PARAMETER_NAME when name is not string
         *
         * @since 2015.2
         */
        this.getParameter = function (options) { };

        /**
         * The percent complete specified for the current scheduled script execution. This value appears in the % Complete  column on the Scheduled Script Status page. This value can be set or retrieved.
         * @name Script#percentComplete
         * @type {number}
         * @throws {SuiteScriptError} SSS_OPERATION_UNAVAILABLE Thrown if the currently executing script is not a scheduled script.
         *
         * @since 2015.2
         */
        this.percentComplete = undefined;
        /**
         * JSON.stringify() implementation.
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };

        /**
         * Returns the object type name
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };
    }

    /**
     * @class Session
     * @classdesc Class representing current session
     * @protected
     * @constructor
     */
    function Session() {

        /**
         * Returns the user-defined session object value associated with a session object key. Both the session object value and associated key are defined using Session.set(options). If the key does not exist, this method returns null.
         * @governance none
         * @param {Object} options
         * @param {string} options.name The key used to store the session object
         * @return {string}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name argument is missing
         *
         * @since 2015.2
         */
        this['get'] = function (options) { };

        /**
         * Add or set the value of a user-defined session object for the current user.
         * @governance none
         * @param {Object} options
         * @param {string} options.name The key used to store the session object
         * @param {string} options.value The value to associate with this key in the user's session
         * @return {void}
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name argument is missing
         *
         * @since 2015.2
         */
        this['set'] = function (options) { };

        /**
         * Checks if the session has been verified by two-factor authentication.
         * @governance none
         * @restriction Server SuiteScript only
         * @restriction SuiteBanking team's apps only
         * @return {boolean}
         * @throws {SuiteScriptError} NOT_ENOUGH_PERMISSIONS when accessed from Non-SuiteBanking SuiteApps
         *
         * @since 2023.1
         */
        this.wasTfaChallenged = function () { };

        /**
         * JSON.stringify() implementation.
         * @governance none
         * @return {Object}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };

        /**
         * Returns the object type name
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };
    }

    /**
     * @class User
     * @classdesc Class representing current user
     * @protected
     * @constructor
     */
    function User() {

        /**
         * The email address of the current user. To use this property, the email field on the user employee record must contain an email address.
         * @name User#email
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.email = undefined;
        /**
         * The name of the current user.
         * @name User#name
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.name = undefined;
        /**
         * The internal ID of the location of the current user.
         * @name User#location
         * @type {number}
         * @readonly
         *
         * @since 2015.2
         */
        this.location = undefined;
        /**
         * The internal ID of the department for the current user.
         * @name User#department
         * @type {number}
         * @readonly
         *
         * @since 2015.2
         */
        this.department = undefined;
        /**
         * The internal ID of the role for the current user.
         * @name User#role
         * @type {number}
         * @readonly
         *
         * @since 2015.2
         */
        this.role = undefined;
        /**
         * The string value of the center type, or role center, for the current user.
         * @name User#roleCenter  The string value of the logged in user's center - for example, SALES, ACCOUNTING, CLASSIC.
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.roleCenter = undefined;
        /**
         * The custom scriptId of the role for the current user. You can use this value instead of User.role.
         * @name User#roleId
         * @type {string}
         * @readonly
         *
         * @since 2015.2
         */
        this.roleId = undefined;
        /**
         * The internal ID of the current user.
         * @name User#id
         * @type {number}
         * @readonly
         *
         * @since 2015.2
         */
        this.id = undefined;
        /**
         * The internal ID of the currently logged-in contact. If no logged-in entity or other entity than contact is logged in, then 0 is returned
         * @name User#contact
         * @type {number}
         * @readonly
         *
         * @since 2019.1
         */
        this.contact = undefined;
        /**
         * The internal ID of the subsidiary for the current user.
         * @name User#subsidiary
         * @type {number}
         * @readonly
         *
         * @since 2015.2
         */
        this.subsidiary = undefined;
        /**
         * Get a user's permission level for a given permission, which is a value from runtime.Permission enum
         * @governance none
         * @param {Object} options
         * @param {string} options.name The internal ID of a permission
         * @return {number} one value of the Permission
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name argument is missing
         *
         * @since 2015.2
         */
        this.getPermission = function (options) { };

        /**
         * Returns the value set for a NetSuite preference. Currently only General Preferences and Accounting Preferences are exposed in SuiteScript.
         * @governance none
         * @param {Object} options
         * @param {string} name The internal ID of the preference
         * @return {string} The value of a NetSuite preference for the current user
         * @throws {SuiteScriptError} SSS_MISSING_REQD_ARGUMENT when name argument is missing
         *
         * @since 2015.2
         *
         */
        this.getPreference = function (options) { };

        /**
         * get JSON format of the object
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toJSON = function () { };

        /**
         * Returns stringified representation of this SuiteScriptError
         * @governance none
         * @return {string}
         *
         * @since 2015.2
         */
        this.toString = function () { };
    }

    N.runtime = runtime;

    /**
     * @exports N/runtime
     */
    return runtime;
});