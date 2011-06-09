/*
 * Tine 2.0
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Martin Jatho <m.jatho@metaways.de>
 * @copyright   Copyright (c) 2007-2011 Metaways Infosystems GmbH (http://www.metaways.de)
 */
Ext.ns('Tine.Filemanager');

/**
 * File grid panel
 * 
 * @namespace   Tine.Filemanager
 * @class       Tine.Filemanager.FileGridPanel
 * @extends     Tine.widgets.grid.GridPanel
 * 
 * <p>File Grid Panel</p>
 * <p><pre>
 * </pre></p>
 * 
 * @license     http://www.gnu.org/licenses/agpl.html AGPL Version 3
 * @author      Martin Jatho <m.jatho@metaways.de>
 * @copyright   Copyright (c) 2007-2008 Metaways Infosystems GmbH (http://www.metaways.de)
 * 
 * @param       {Object} config
 * @constructor
 * Create a new Tine.Filemanager.FileGridPanel
 */
Tine.Filemanager.FileGridPanel = Ext.extend(Tine.widgets.grid.GridPanel, {
    /**
     * record class
     * @cfg {Tine.Filemanager.Model.File} recordClass
     */
    recordClass: Tine.Filemanager.Model.File,
    
    /**
     * eval grants
     * @cfg {Boolean} evalGrants
     */
    evalGrants: true,
    
    /**
     * grid specific
     * @private
     */
    defaultSortInfo: {field: 'name', direction: 'DESC'},
    gridConfig: {
        autoExpandColumn: 'name',
        enableDragDrop: true,
        ddGroup: 'fileDDGroup'
    },
     
    /**
     * inits this cmp
     * @private
     */
    initComponent: function() {
        this.recordProxy = Tine.Filemanager.recordBackend;
        this.id = this.id + Ext.id();
        
        this.gridConfig.cm = this.getColumnModel();
        this.filterToolbar = this.filterToolbar || this.getFilterToolbar();
//        this.actionToolbar = this.getActionToolbar()
                
        this.plugins = this.plugins || [];
        this.plugins.push(this.filterToolbar);
        this.plugins.push({
            ptype: 'ux.browseplugin',
            multiple: true,
            handler: function(e) {alert("grid handler");}
        });
        
        Tine.Filemanager.FileGridPanel.superclass.initComponent.call(this);
    },
    
    /**
     * returns cm
     * 
     * @return Ext.grid.ColumnModel
     * @private
     * 
     * TODO    add more columns
     */
    getColumnModel: function(){
        return new Ext.grid.ColumnModel({ 
            defaults: {
                sortable: true,
                resizable: true
            },
            columns: [{
                id: 'name',
                header: this.app.i18n._("Name"),
                width: 100,
                sortable: true,
                dataIndex: 'name'
            },{
                id: 'size',
                header: this.app.i18n._("Size"),
                width: 50,
                sortable: true,
                dataIndex: 'size'
            },{
                id: 'contenttype',
                header: this.app.i18n._("Contenttype"),
                width: 50,
                sortable: true,
                dataIndex: 'contenttype'
            },{
                id: 'description',
                header: this.app.i18n._("Description"),
                width: 100,
                sortable: true,
                dataIndex: 'description'
            },{
                id: 'revision',
                header: this.app.i18n._("Revision"),
                width: 50,
                sortable: true,
                dataIndex: 'revision'
            },{
                id: 'creation_time',
                header: this.app.i18n._("Creation Time"),
                width: 50,
                sortable: true,
                dataIndex: 'creation_time'
            },{
                id: 'created_by',
                header: this.app.i18n._("Created By"),
                width: 50,
                sortable: true,
                dataIndex: 'created_by'
            },{
                id: 'last_modified_time',
                header: this.app.i18n._("Last Modified Time"),
                width: 50,
                sortable: true,
                dataIndex: 'last_modified_time'
            },{
                id: 'last_modified_by',
                header: this.app.i18n._("Last Modified By"),
                width: 50,
                sortable: true,
                dataIndex: 'last_modified_by'
            }
            ]
        });
    },
    
    /**
     * status column renderer
     * @param {string} value
     * @return {string}
     */
    statusRenderer: function(value) {
        return this.app.i18n._hidden(value);
    },
    
    /**
     * return additional tb items
     * @private
     */
    getToolbarItems: function(){
    	
        this.action_showClosedToggle = new Tine.widgets.grid.FilterButton({
            text: this.app.i18n._('Show closed'),
            iconCls: 'action_showArchived',
            field: 'showClosed'
        });
        
        
        return [
            
            new Ext.Toolbar.Separator(),
            this.action_showClosedToggle
            
        ];
    },
    
    
    /**
     * returns add action
     * 
     * @return {Object} add action config
     */
    getAddAction: function () {
        return {
        	requiredGrant: 'addGrant',
            actionType: 'add',
            text: this.app.i18n._('Upload'),
            handler: function(){ alert("Upload Button Drop"); },
            scope: this,
            plugins: [{
                ptype: 'ux.browseplugin',
                multiple: true
            }],
            iconCls: this.app.appName + 'IconCls'            
        };
    },
    
    /**
     * init actions with actionToolbar, contextMenu and actionUpdater
     * 
     * @private
     */
    initActions: function() {

        this.action_upload = new Ext.Action(this.getAddAction());

        this.action_createFolder = new Ext.Action({
            requiredGrant: 'readGrant',
            actionType: 'reply',
            text: this.app.i18n._('Create Folder'),
            handler: function(){ alert("Create Folder"); },
            iconCls: 'action_create_folder'
//            disabled: true
        });

        this.action_goUpFolder = new Ext.Action({
            requiredGrant: 'readGrant',
            actionType: 'goUpFolder',
            text: this.app.i18n._('Folder Up'),
            handler: function(){ alert("Folder Up"); },
            iconCls: 'action_filemanager_folder_up'
//            disabled: true
        });

        this.action_save = new Ext.Action({
            requiredGrant: 'readGrant',
            actionType: 'saveLocaly',
            text: this.app.i18n._('Save locally'),
            handler: function(){ alert("Save locally"); },
            iconCls: 'action_filemanager_save_all'
//            disabled: true
        });
             
        this.action_deleteRecord = new Ext.Action({
            requiredGrant: 'deleteGrant',
            allowMultiple: true,
            singularText: this.app.i18n._('Delete'),
            pluralText: this.app.i18n._('Delete'),
            translationObject: this.i18nDeleteActionText ? this.app.i18n : Tine.Tinebase.translation,
            text: this.app.i18n._('Delete'),
            handler: function(){ alert("Delete"); },
//            disabled: true,
            iconCls: 'action_delete',
            scope: this
        });
        
        this.actionUpdater.addActions([
            this.action_upload,
            this.action_deleteRecord,
            this.action_createFolder,
            this.action_goUpFolder,
            this.action_save
        ]);
        
        this.contextMenu = new Ext.menu.Menu({
            items: [
                this.action_createFolder,
                this.action_goUpFolder,
                this.action_save,
                this.action_deleteRecord
            ]
        });
    },
    
    /**
     * get action toolbar
     * 
     * @return {Ext.Toolbar}
     */
    getActionToolbar: function() {
        if (! this.actionToolbar) {
            this.actionToolbar = new Ext.Toolbar({
                defaults: {height: 55},
                items: [{
                    xtype: 'buttongroup',
                    columns: 8,
                    items: [
                        Ext.apply(new Ext.SplitButton(this.action_upload), {
                            scale: 'medium',
                            rowspan: 2,
                            iconAlign: 'top',
                            arrowAlign:'right',
                            menu: new Ext.menu.Menu({
                                items: [],
                                plugins: [{
                                    ptype: 'ux.itemregistry',
                                    key:   'Tine.widgets.grid.GridPanel.addButton'
                                }]
                            })
                        }),
                        Ext.apply(new Ext.Button(this.action_deleteRecord), {
                            scale: 'medium',
                            rowspan: 2,
                            iconAlign: 'top'
                        }),
                        Ext.apply(new Ext.Button(this.action_createFolder), {
                            scale: 'medium',
                            rowspan: 2,
                            iconAlign: 'top'
                        }),
                        Ext.apply(new Ext.Button(this.action_goUpFolder), {
                            scale: 'medium',
                            rowspan: 2,
                            iconAlign: 'top'
                        }),
                        Ext.apply(new Ext.Button(this.action_save), {
                            scale: 'medium',
                            rowspan: 2,
                            iconAlign: 'top'
                        })
                 ]
                }, this.getActionToolbarItems()]
            });
            
            if (this.filterToolbar && typeof this.filterToolbar.getQuickFilterField == 'function') {
                this.actionToolbar.add('->', this.filterToolbar.getQuickFilterField());
            }
        }
        
        return this.actionToolbar;
    }
    

});
