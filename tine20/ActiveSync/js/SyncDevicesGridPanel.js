/*
 * Tine 2.0
 * 
 * @package     ActiveSync
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Stefanie Stamer <s.stamer@metaways.de>
 * @copyright   Copyright (c) 2015-2017 Metaways Infosystems GmbH (http://www.metaways.de)
 *
 */
 
Ext.ns('Tine.ActiveSync');

/**
 * @namespace Tine.ActiveSync
 * @class     Tine.ActiveSync.SyncDevicesGridPanel
 * @extends   Tine.widgets.grid.GridPanel
 * SyncDevicess Grid Panel <br>
 * 
 * @author      Cornelius Weiss <c.weiss@metaways.de>
 */
Tine.ActiveSync.SyncDevicesGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
    /**
     * @cfg
     */
    recordClass: Tine.ActiveSync.Model.SyncDevice,
    recordProxy: Tine.ActiveSync.syncdevicesBackend,
    defaultSortInfo: {field: 'deviceid', direction: 'ASC'},
    evalGrants: false,
    gridConfig: {
        autoExpandColumn: 'deviceid'
    },
    allowCreateNew: false,
    asAdminModule: false,
    
    /**
     * initComponent
     */
    initComponent: function() {
        this.app = Tine.Tinebase.appMgr.get('ActiveSync');
        this.gridConfig.cm = this.getColumnModel();
        this.contextMenuItems = this.getAdditionalCtxItems();
        Tine.ActiveSync.SyncDevicesGridPanel.superclass.initComponent.call(this);
    },
    
    /**
     * returns column model
     * 
     * @return Ext.grid.ColumnModel
     * @private
     */
    getColumnModel: function() {
        return new Ext.grid.ColumnModel({
            defaults: {
                sortable: true,
                hidden: true,
                resizable: true
            },
            columns: this.getColumns()
        });
    },
    
    /**
     * returns columns
     * @private
     * @return Array
     */
    getColumns: function() {
        const columns = [
            { header: this.app.i18n._('ID'),             id: 'id',                hidden: true,  width: 50},
            { header: this.app.i18n._('Device ID'),      id: 'deviceid',          hidden: false, width: 200},
            { header: this.app.i18n._('Device Type'),    id: 'devicetype',        hidden: false, width: 120},
            { header: this.app.i18n._('Owned by'),       id: 'owner_id',          hidden: false, width: 150,  renderer: Tine.Tinebase.common.usernameRenderer},
            { header: this.app.i18n._('Policy'),         id: 'policy_id',         hidden: false, width: 200},
            { header: this.app.i18n._('ActiveSync Version'), id: 'acsversion',    hidden: false, width: 100},
            { header: this.app.i18n._('User agent'),     id: 'useragent',         hidden: true,  width: 200},
            { header: this.app.i18n._('Model'),          id: 'model',             hidden: false, width: 200},
            { header: this.app.i18n._('IMEI'),           id: 'imei',              hidden: true,  width: 200},
            { header: this.app.i18n._('Friendly Name'),  id: 'friendlyname',      hidden: false, width: 200},
            { header: this.app.i18n._('Operating System'), id: 'os',              hidden: false, width: 200},
            { header: this.app.i18n._('OS Language'),    id: 'oslanguage',        hidden: true,  width: 200},
            { header: this.app.i18n._('Phone Number'),   id: 'phonenumber',       hidden: false, width: 200},
            { header: this.app.i18n._('Ping Lifetime'),  id: 'pinglifetime',      hidden: true,  width: 200},
            //{ header: this.app.i18n._('Ping Folder'),    id: 'pingfolder',      hidden: false, width: 200},
            { header: this.app.i18n._('Remote Wipe'),    id: 'remotewipe',        hidden: false, width: 100},
            { header: this.app.i18n._('Calendar Filter'), id: 'calendarfilter_id', hidden: true,  width: 200},
            { header: this.app.i18n._('Contacts Filter'), id: 'contactsfilter_id', hidden: true,  width: 200},
            { header: this.app.i18n._('E-mail Filter'),  id: 'emailfilter_id',    hidden: true,  width: 200},
            { header: this.app.i18n._('Tasks Filter'),   id: 'tasksfilter_id',    hidden: true,  width: 200},
            { header: this.app.i18n._('Last Ping'),      id: 'lastping',          hidden: false, width: 200, renderer: Tine.Tinebase.common.dateTimeRenderer},
            { header: this.app.i18n._('Monitor Last Ping'), id: 'monitor_lastping', hidden: false, width: 100}
        ];
        return columns;
    },

    /**
     * getAdditionalCtxItems
     *
     * @returns {Array}
     */
    getAdditionalCtxItems: function() {
        if (!this.app.getRegistry().get('config')['disableremotereset'].value) {
            this.actionRemoteResetDevices = new Ext.Action({
                text: this.app.i18n._('Remote Device Reset'),
                disabled: !Tine.Tinebase.common.hasRight('RESET DEVICES', 'ActiveSync'),
                scope: this,
                handler: this.onRemoteResetDevices,
                iconCls: 'action_wipeDevice',
            });

            return [this.actionRemoteResetDevices];
        }
        return null;
    },

    /**
     * onRemoteResetDevices
     */
    onRemoteResetDevices: function() {
        Ext.MessageBox.confirm(
            this.app.i18n._('Please confirm'),
            this.app.i18n._('Do you really want to wipe the selected devices? All personal data will be removed and the device will be reset to factory settings!'),
            function(button) {
                if (button == 'yes') {

                    var selectedRows = this.grid.getSelectionModel().getSelections(),
                        ids = [];
                    for (var i = 0; i < selectedRows.length; ++i) {
                        ids.push(selectedRows[i].id);
                    }

                    Ext.Ajax.request({
                        params: {
                            method: 'ActiveSync.remoteResetDevices',
                            ids: ids
                        },
                        scope: this,
                        success: function () {
                            this.loadGridData();
                        },
                        failure: function (exception) {
                            this.loadGridData();
                            Tine.Tinebase.ExceptionHandler.handleRequestException(exception);
                        }
                    });
                }
            },
            this
        );
    },

    /**
     * initialises filter toolbar
     */
    initFilterPanel: function() {
        this.filterToolbar = new Tine.widgets.grid.FilterToolbar({
            filterModels: [
                {label: this.app.i18n._('Quicksearch'),     field: 'query',    operators: ['contains']},
                {label: this.app.i18n._('Device ID'),       field: 'deviceid', operators: ['contains']},
                {label: this.app.i18n._('Owned by'),           field: 'owner_id', valueType: 'user'}
            ],
            defaultFilter: 'query',
            /*filters: [
                {field: 'deviceid', operator: 'equals', value: 'shared'}
            ],*/
            plugins: [
                new Tine.widgets.grid.FilterToolbarQuickFilterPlugin()
            ]
        });
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);
    },
    
    initLayout: function() {
        this.supr().initLayout.call(this);
        
        if (! this.asAdminModule) {
            this.items.push({
                region : 'north',
                height : 55,
                border : false,
                items  : this.actionToolbar
            });
        }
    }
});
