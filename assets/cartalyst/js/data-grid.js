/*
 * Part of the Data Grid package.
 *
 * NOTICE OF LICENSE
 *
 * Licensed under the Cartalyst PSL License.
 *
 * This source file is subject to the Cartalyst PSL License that is
 * bundled with this package in the LICENSE file.
 *
 * @package    Data Grid
 * @version    5.0.1
 * @author     Cartalyst LLC
 * @license    Cartalyst PSL
 * @copyright  (c) 2011-2019, Cartalyst LLC
 * @link       https://cartalyst.com
 */

!function(global) {
  'use strict';

  /**
   * Creates a new DataGridManager.
   *
   * @param {Object} options
   * @return void
   */
  function DataGridManager(options) {
    this.defaults = {

      url: {
        hash: true,
        semantic: false,
        base: '',
      },

    };

    this.grids = [];
    this.opt = _.assign(this.defaults);
    this.currentHash = null;

    _.each(_.keys(options), _.bind(function(key) {
      this.opt[key] = _.defaults(options[key], this.defaults[key]);
    }, this));

    this._checkDependencies();

    this.backbone = Backbone.noConflict();

    _.defer(_.bind(this._init, this));
  }

  /**
   * Initializes the DataGridManager.
   *
   * @return {DataGridManager}
   */
  DataGridManager.prototype._init =
  function _init() {
    _.defer(_.bind(function() {
      this
        ._initRouter()
        ._initGrids();
    }, this));

    return this;
  };

  /**
   * Initializes the backbone router.
   *
   * @return {DataGridManager}
   */
  DataGridManager.prototype._initRouter =
  function _initRouter() {
    var routerOptions = {};
    var Router = this.backbone.Router.extend({
      routes: {
        '*path': 'defaultRoute',
      },

      defaultRoute: _.bind(this._updateGrids, this),
    });

    if (this.opt.url.semantic) {
      routerOptions = {
        root: this.opt.url.base,
        pushState: true,
      };
    }

    this.router = new Router();

    this.backbone.history.start(routerOptions);

    return this;
  };

  /**
   * Updates data grids.
   *
   * @return {DataGridManager}
   */
  DataGridManager.prototype._updateGrids =
  function _updateGrids() {
    var hash = this.backbone.history.getFragment();
    var keys = [];
    var separateRoutes = [];
    var untouchedGrids = [];
    var updatedGrids = [];
    var routes;

    _.each(this.grids, function(grid) {
      keys.push(grid.key);
    });

    if (this.grids.length > 1) {
      var regex = new RegExp(keys.join('\\/|') + '\\/');
      routes = _.compact(hash.split(regex));
      for (var i = routes.length - 1; i >= 0; i--) {
        routes[i] = keys[i] + '/' + routes[i];
      }
    } else {
      routes = [hash];
    }

    _.each(routes, function(route) {
      separateRoutes.push(_.compact(route.split('/')));
    });

    if (this.grids.length === 1) {
      this.grids[0]
        .reset()
        .applyFromRoute(separateRoutes[0])
        .refresh();
    } else {
      _.each(this.grids, function(grid) {
        if (_.isEmpty(separateRoutes)) {
            grid.reset();
            grid.applyDefaults();
            grid.refresh();

            updatedGrids.push(grid);
        } else {
            _.each(separateRoutes, function(route) {
              if (route[0] === grid.key) {
                grid
                  .reset()
                  .applyFromRoute(route)
                  .refresh();

                updatedGrids.push(grid);
              }
            });
        }
      });

      untouchedGrids = _.difference(this.grids, updatedGrids);

      _.each(untouchedGrids, function(grid) {
        grid.reset();
        grid.applyDefaults();
        grid.refresh();
      }, this);
    }

    return this;
  };

  /**
   * Initializes the data grids.
   *
   * @return {DataGridManager}
   */
  DataGridManager.prototype._initGrids =
  function _initGrids() {
    var _this = this;

    _.each(this.grids, function(grid) {
      $(grid).on('dg:hashchange', function(event) {
        _this._updateHash(event);
      });
    });

    return this;
  };

  /**
   * Updates the hash fragment.
   *
   * @return {DataGridManager}
   */
  DataGridManager.prototype._updateHash =
  function _updateHash(event) {
    var hashParts = [];
    var hash;
    var finalHash;

    event.preventDefault();

    if (! this.opt.url.hash) {
      return;
    }

    _.each(this.grids, function(grid) {
      hash = grid.buildHash();

      if (hash !== grid._getBaseHash()) {
        hashParts.push(hash);
      }
    });

    finalHash = hashParts.join('/');

    if (finalHash !== this.currentHash) {
      this.backbone.history.navigate(finalHash, {trigger: false});
    }

    this.currentHash = finalHash;

    return this;
  };

  /**
   * Ensures dependencies are available.
   *
   * @return {DataGridManager}
   */
  DataGridManager.prototype._checkDependencies =
  function _checkDependencies() {
    if (typeof _ === 'undefined') {
      throw new Error('Underscore is not defined. ' +
        'DataGrid Requires UnderscoreJS v1.6.0 or later to run!');
    }

    if (typeof Backbone === 'undefined') {
      throw new Error('DataGrid Requires Backbone.js v1.0.0 or later to run!');
    }

    return this;
  };

  /**
   * Registers and creates a new data grid.
   *
   * @param {String} name
   * @param {Object} options
   * @return {DataGrid}
   */
  DataGridManager.prototype.create =
  function create(name, options) {
    var newGrid = new DataGrid(name, options, this);

    this.grids.push(newGrid);

    return newGrid;
  };

  /**
   * Creates a new DataGrid.
   *
   * @param {String} name
   * @param {Object} options
   * @return {DataGrid}
   */
  function DataGrid(name, options, manager) {
    this.manager = manager;

    this.originalDefaults = {
      source: null,

      prefetched: false,

      pagination: {
        method: 'single',
        threshold: null,
        throttle: null,
        scroll: null,
        infiniteScroll: false,
        scrollOffset: undefined,
      },

      cssClasses: {
        ascClass: 'asc',
        descClass: 'desc',
        appliedFilter: 'selected',
        activeLayout: 'active',
      },

      sorting: {
        column: undefined,
        direction: undefined,
        multicolumn: true,
        delimiter: ','
      },

      delimiter: {
        query: ';',
        expression: ':',
      },

      templateSettings: {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g,
      },

      filters: {},

      search: {
        live: true,
        timeout: 600,
      },

      loader: {
        element: undefined,
        showEffect: 'fadeIn',
        hideEffect: 'fadeOut',
        duration: 200,
      },

      formats: {
        timestamp: 'YYYY-MM-DD HH:mm:ss',
        serverDate: 'YYYY-MM-DD',
        clientDate: 'MMM DD, YYYY',
      },

      callback: undefined,
    };

    this.availableFilters = {
      term: new TermFilter(this),
      range: new RangeFilter(this),
      search: new SearchFilter(this),
      live: new LiveFilter(this),
    };

    this.defaults = _.cloneDeep(this.originalDefaults);
    this.key = name;
    this.$body = $(document.body);
    this.grid = this._getGridSelector();

    // Options
    this.opt = _.assign(this.defaults);

    _.each(_.keys(options), _.bind(function(key) {
      if (key === 'layouts') {
        this.opt[key] = options[key];
      } else {
        this.opt[key] = _.defaults(options[key], this.defaults[key]);
      }
    }, this));

    this.defaults.pagination = _.cloneDeep(this.opt.pagination);
    this.originalDefaults.pagination = _.cloneDeep(this.defaults.pagination);

    var $source = this._getEl(this._getSelector('source'));
    var source = $source.data('grid-source');

    if ($source.length && !_.isEmpty(source)) {
      this.opt.source = source;
    }

    this.appliedFilters = [];
    this.sorts = [];
    this.initial = true;
    this.response = null;
    this.searchActive = false;
    this.currentUri = null;
    this.searchTimeout = null;

    this.pagination = {
      pageIndex: 1,
      pages: null,
      total: null,
      filtered: null,
      baseThrottle: this.opt.pagination.throttle,
    };

    _.defer(_.bind(this._init, this));

    return this;
  }

  /**
   * Initializes Data Grid.
   *
   * @return {DataGrid}
   */
  DataGrid.prototype._init =
  function _init() {
    this
      ._initLayouts()
      ._listeners();

    return this;
  };

  /**
   * Initializes layouts.
   *
   * @return {DataGrid}
   */
  DataGrid.prototype._initLayouts =
  function _initLayouts() {
    var layouts = this._getEl(this._getSelector('layout'));
    var layoutName;

    _.assign(_.templateSettings, this.opt.templateSettings);

    this.layouts = {};
    this.baseLayouts = {};

    _.each(layouts, _.bind(function(layout) {
      layoutName = $(layout).data('grid-layout');

      this.baseLayouts[layoutName] = layoutName;
    }, this));

    this._setLayouts(this.baseLayouts);

    return this;
  };

   /**
   * Resets layouts.
   *
   * @return {DataGrid}
   */
  DataGrid.prototype._resetLayouts =
  function _resetLayouts() {
    _.each(_.keys(this.layouts), _.bind(function(key) {
      this.layouts[key].layout.html('');
    }, this));

    return this;
  };

  /**
   * Sets data grid layouts.
   *
   * @param {Object} options
   * @return {DataGrid}
   */
  DataGrid.prototype._setLayouts =
  function _setLayouts(options) {
    _.each(options, _.bind(function(template, name) {
        this.setLayout(name, template, false);
    }, this));

    return this;
  };

  /**
   * Sets data grid layout.
   *
   * @param {String} name
   * @param {String} template
   * @param {Boolean} render
   * @return {DataGrid}
   */
  DataGrid.prototype.setLayout =
  function setLayout(name, template, render) {
    render = render === undefined ? true : false;
    var layouts = {};
    var $layout;
    var $template;

    layouts[name] = template;
    this.baseLayouts[name] = template;

    _.each(_.keys(layouts), _.bind(function(key) {
      if (_.isNull(layouts[key])) {
        delete this.layouts[key];
        return;
      }

      $layout = this._getEl(this._getSelector('layout', name));
      $template = this._getEl(
        this._getSelector('template', layouts[key])
      );

      if ($layout && $template) {
        this.layouts[key] = {
          layout: $layout,
          template: _.template($template.html()),
          action: $template.data('grid-action') || 'html'
        };
      }

    }, this));

    if (render) {
      this._render();
    }

    return this;
  };

  /**
   * jQuery.on wrapper for dg:event callbacks.
   *
   * @param {Event} event
   * @param {Object} callback
   * @return {DataGrid}
   */
  DataGrid.prototype.on =
  function on(event, callback) {
    if (_.isObject(event)) {
      this._callbackListeners(event);
    } else {
      this._bindCallback(event, callback);
    }

    return this;
  };

  /**
   * Applies info based on route.
   *
   * @param {Array} route
   * @return {DataGrid}
   */
  DataGrid.prototype.applyFromRoute =
  function applyFromRoute(route) {
    var parsedRoute = route;
    var lastItem;
    var str;

    lastItem = parsedRoute[(parsedRoute.length - 1)];

    if (/^threshold/g.test(lastItem)) {
      this._extractThresholdFromRoute(lastItem);

      parsedRoute = parsedRoute.splice(0, (parsedRoute.length - 1));

      lastItem = parsedRoute[(parsedRoute.length - 1)];
    }

    if (/^throttle/g.test(lastItem)) {
      this._extractThrottleFromRoute(lastItem);

      parsedRoute = parsedRoute.splice(0, (parsedRoute.length - 1));

      lastItem = parsedRoute[(parsedRoute.length - 1)];
    }

    if (/^layout/g.test(lastItem)) {
      this._extractLayoutFromRoute(lastItem);

      parsedRoute = parsedRoute.splice(0, (parsedRoute.length - 1));

      lastItem = parsedRoute[(parsedRoute.length - 1)];
    }

    if (/^page/g.test(lastItem)) {
      this._extractPageFromRoute(lastItem);

      parsedRoute = parsedRoute.splice(0, (parsedRoute.length - 1));

      lastItem = parsedRoute[(parsedRoute.length - 1)];
    } else {
      this.pagination.pageIndex = 1;
    }

    if ((/desc$/g.test(lastItem)) || (/asc$/g.test(lastItem))) {
      this._extractSortsFromRoute(lastItem);

      // Remove sort from parsedRoute
      parsedRoute = parsedRoute.splice(0, (parsedRoute.length - 1));

      lastItem = parsedRoute[(parsedRoute.length - 1)];
    } else if (this.opt.sorting.column && this.opt.sorting.direction) {
      str = this.opt.sorting.column +
        this.opt.delimiter.expression +
        this.opt.sorting.direction;

      this._extractSortsFromRoute(str);
    }

    this._extractFiltersFromRoute(parsedRoute);

    return this;
  };

  /**
   * Binds single callback.
   *
   * @param {Event} event
   * @param {Object} callback
   * @return void
   */
  DataGrid.prototype._bindCallback =
  function _bindCallback(event, callback) {
    $(this).on(event, _.bind(function() {
      callback.apply(this, _.tail(arguments));
    }, this));
  };

  /**
   * Initializes filter event listeners.
   *
   * @return {DataGrid}
   */
  DataGrid.prototype._initFilters =
  function _initFilters() {
    _.each(_.keys(this.availableFilters), _.bind(function(type) {
      this.availableFilters[type].init();
    }, this));

    return this;
  };

  /**
   * Initializes custom event listeners.
   *
   * @return void
   */
  DataGrid.prototype._callbackListeners =
  function _callbackListeners(events) {
    if (_.isEmpty(events)) {
      return;
    }

    _.each(_.keys(events), _.bind(function(event) {
      this._bindCallback(event, events[event]);
    }, this));
  };

  /**
   * Adds listeners.
   *
   * @return void
   */
  DataGrid.prototype._listeners =
  function _listeners() {
    var offset;
    var throttled;
    var page;

    $(this).on('dg:update', _.bind(this._fetchResults, this));

    this._initFilters()
      ._callbackListeners(this.opt.events);

    this.$body.on('click',
      this._getGlobalResetSelector(), _.bind(this._onGlobalReset, this)
    );

    this.$body.on('click',
      this._getResetFilterSelector(), _.bind(this._onFilterUnapply, this)
    );

    this.$body.on('click',
      this._getResetGroupSelector(), _.bind(this._onGroupFilterUnapply, this)
    );

    this.$body.on('click',
      this._getPlainSortSelector(), _.bind(this._onSort, this)
    );

    this.$body.on('click',
      this._getSelector('page'), _.bind(this._onPaginate, this)
    );

    this.$body.on('click',
      this._getSelector('throttle'), _.bind(this._onThrottle, this)
    );

    this.$body.on('click',
      this._getSelector('download'), _.bind(this._onDownload, this)
    );

    this.$body.on('click',
      this._getSelector('switch-layout'), _.bind(this._onLayoutChange, this)
    );

    if (
      this.opt.pagination.infiniteScroll &&
      this.opt.pagination.method === 'infinite'
    ) {
      offset = this.opt.pagination.scrollOffset || 400;

      throttled = _.throttle(_.bind(function() {
        if (
          $(window).scrollTop() >=
            $(document).height() - $(window).height() - offset
        ) {
          page = this.pagination.pageIndex + 1;

          if (page <= this.response.pages) {
            this.goToPage(page);

            this.refresh();
          }
        }
      }, this), 800);

      $(window).scroll(throttled);
    }
  };

  /**
   * Handles global resets.
   *
   * @param {Event} event
   * @return void
   */
  DataGrid.prototype._onGlobalReset =
  function _onGlobalReset(event) {
    event.preventDefault();

    this.reset();

    this.refresh();
  };

  /**
   * Handles applied filter removal.
   *
   * @param {Event} event
   * @return void
   */
  DataGrid.prototype._onFilterUnapply =
  function _onFilterUnapply(event) {
    var $applied = $(event.currentTarget);
    var name = $applied.data('grid-reset-filter');
    var $filter = this._getEl(this._getSelector('filter', name));

    event.preventDefault();

    if ($filter.prop('tagName') === 'OPTION') {
      $filter.closest('select').val(
        $filter.closest('select').find('option:first').val()
      );
    }

    this.removeFilter(name);
    this.refresh();
  };

  /**
   * Handles applied group filters removal.
   *
   * @param {Event} event
   * @return void
   */
  DataGrid.prototype._onGroupFilterUnapply =
  function _onGroupFilterUnapply(event) {
    var $applied = $(event.currentTarget);
    var name = $applied.data('grid-reset-group');

    event.preventDefault();
    event.stopPropagation();

    if (! name) {
      $applied = $applied.parents('[data-grid-group]');
      name = $applied.data('grid-group');
    }

    this._removeGroupFilters(name);
    this._resetLayouts();
    this.refresh();
  };

  /**
   * Handles sort click.
   *
   * @param {Event} event
   * @return void
   */
  DataGrid.prototype._onSort =
  function _onSort(event) {
    var $elem = $(event.currentTarget);

    event.preventDefault();

    this._extractSortsFromClick($elem, event.shiftKey);

    this.refresh();
  };

  /**
   * Handles page click.
   *
   * @param {Event} event
   * @return void
   */
  DataGrid.prototype._onPaginate =
  function _onPaginate(event) {
    var $page = $(event.currentTarget);

    $(this).trigger('dg:switching', {grid: this, page: $page});

    event.preventDefault();

    this.applyScroll()
      ._handlePageChange($page);

    $(this).trigger('dg:switched', {grid: this, page: $page});
  };

  /**
   * Handles throttle click.
   *
   * @param {Event} event
   * @return void
   */
  DataGrid.prototype._onThrottle =
  function _onThrottle(event) {
    event.preventDefault();

    this.opt.pagination.throttle += this.pagination.baseThrottle;

    this.refresh();
  };

  /**
   * Handles download.
   *
   * @param {Event} event
   * @return void
   */
  DataGrid.prototype._onDownload =
  function _onDownload(event) {
    var type = $(event.currentTarget).data('grid-download');

    event.preventDefault();

    document.location = this.opt.source + '?' + this._buildAjaxURI(type);
  };

  /**
   * Handles layout switching.
   *
   * @param {Event} event
   * @return void
   */
  DataGrid.prototype._onLayoutChange =
  function _onLayoutChange(event) {
    var $el = $(event.currentTarget);
    var layout = $el.data('grid-switch-layout');

    this._getEl(this._getSelector('switch-layout')).removeClass(this.opt.cssClasses.activeLayout);

    $el.addClass(this.opt.cssClasses.activeLayout);

    layout = layout.split(':');

    this.setLayout(layout[0], layout[1]);
  };

  /**
   * Applies a filter.
   *
   * @param {Object} filter
   * @return {DataGrid|null}
   */
  DataGrid.prototype.applyFilter =
  function applyFilter(filter) {
    if (this._isFilterApplied(filter)) {
      return;
    }

    $(this).trigger('dg:applying', {filter: filter});

    this.appliedFilters.push(filter);

    $(this).trigger('dg:applied', {filter: filter});

    return this;
  };

  /**
   * Initialize default filters and sorts.
   *
   * @return void
   */
  DataGrid.prototype.applyDefaults =
  function applyDefaults() {
    var $filter;
    var $sort;
    var sorts;
    var sort;
    var direction;
    var type;
    var filterInfo;

    // Default filter elements
    _.each(this._getEl(this._getSelector('filter-default')),
      _.bind(function(filter) {
        $filter = this._getEl(filter);

        type = $filter.data('grid-type') || 'term';

        this.availableFilters[type]._extractFromElement($filter, false);
      }, this)
    );

    // Default filter presets
    _.each(_.keys(this.opt.filters), _.bind(function(name) {
      if (this.opt.filters[name].isDefault) {
        $filter = this._getEl(this._getSelector('filter', name));

        type = this.opt.filters[name].type || 'term';

        if ($filter.length) {
          this.availableFilters[type]._extractFromElement($filter, false);
        } else {
          filterInfo = {
            name: name
          };

          filterInfo = _.extend(filterInfo, this.opt.filters[name]);

          this.applyFilter(filterInfo);
        }
      }
    }, this));

    // Default sorts
    $sort = this._getEl(this._getSelector('sort-default'));

    if ($sort.length) {
      sort = $sort.data('grid-sort');
      sorts = sort.split(':');
      direction = ! _.isUndefined(sorts[1]) ? sorts[1] : 'asc';

      this.sorts.push({
        column: sorts[0],
        direction: direction
      });
    }
  };

  /**
   * Removes a filter by name.
   *
   * @param {String} name
   * @return void
   */
  DataGrid.prototype.removeFilter =
  function removeFilter(name) {
    var filter = _.find(this.appliedFilters, {name: name});

    if (! filter) {
      return;
    }

    $(this).trigger('dg:removing', {filter: filter});

    this.appliedFilters = _.reject(
      this.appliedFilters, function(query) {
        return query.name === name;
      }
    );

    if (this.opt.pagination.method === 'infinite') {
      this._resetLayouts();
    }

    this.goToPage(1);

    $(this).trigger('dg:removed', {filter: filter});
  };

  /**
   * Remove filters by their group name.
   *
   * @param {String} group
   * @return void
   */
  DataGrid.prototype._removeGroupFilters =
  function _removeGroupFilters(group) {
    var $group = $('[data-grid-group="' + group + '"]');

    if (! $group.length) {
      return;
    }

    $(this).trigger('dg:removing_group', {group: group});

    _.each($group.find('[data-grid-filter]'), _.bind(function(filter) {
      $(filter).removeClass(this.opt.cssClasses.appliedFilter);

      this.removeFilter($(filter).data('grid-filter'));
    }, this));

    $(this).trigger('dg:removed_group', {group: $group});
  };

  /**
   * Handles the page change from the pagination.
   *
   * @param {Object} $el
   * @return {DataGrid}
   */
  DataGrid.prototype._handlePageChange =
  function _handlePageChange($el) {
    var page = $el.data('grid-page');

    if (this.opt.pagination.method === 'infinite') {
      $el.data('grid-page', ++page);
    }

    this.goToPage(page);

    this.refresh();

    return this;
  };

  /**
   * Navigates to the given page.
   *
   * @param  {Number} page
   * @return {DataGrid}
   */
  DataGrid.prototype.goToPage =
  function goToPage(page) {
    var pageNumber = parseInt(page, 10);

    this.pagination.pageIndex = isNaN(pageNumber) ? 1 : page;

    return this;
  };

  /**
   * Sets the sort direction on the given element.
   *
   * @param  {Array} sorts
   * @return void
   */
  DataGrid.prototype._setSortDirection =
  function _setSortDirection(sorts) {
    var grid = this.grid;
    var ascClass = this.opt.cssClasses.ascClass;
    var descClass = this.opt.cssClasses.descClass;
    var remove;
    var add;

    // Remove all classes from other sorts
    $(this._getPlainSortSelector())
      .removeClass(ascClass)
      .removeClass(descClass);

    _.each(sorts, _.bind(function(sort) {
      remove = sort.direction === 'asc' ? descClass : ascClass;
      add = sort.direction === 'asc' ? ascClass : descClass;

      $('[data-grid-sort^="' + sort.column + '"]' + grid + ',' +
        grid + ' [data-grid-sort^="' + sort.column + '"]'
      ).removeClass(remove).addClass(add);
    }, this));
  };

  /**
   * Resets group filters before applying new ones.
   *
   * @param {Object} $el
   * @return void
   */
  DataGrid.prototype.resetBeforeApply =
  function resetBeforeApply($filter) {
    var $resetFilter = $filter.parents('[data-grid-reset-filter]');
    var $resetGroup = $filter.parents('[data-grid-reset-group]');
    var $group;
    var group;

    if (this.opt.pagination.method === 'infinite') {
      this._resetLayouts();
    }

    if ($filter.closest('[data-grid-reset]').length) {
      this.reset();
      return;
    }

    if (! _.isEmpty($filter.data('grid-reset-filter'))) {
      this.removeFilter($filter.data('grid-reset-filter'));
    } else if (
      ! _.isUndefined($filter.data('grid-reset-filter')) &&
      !_.isUndefined($filter.data('grid-search'))
    ) {
      _.each(
        _.filter(
          this.appliedFilters, {type: 'search'}
        ),
        _.bind(function(filter) {
          this.removeFilter(filter.name);
        }, this)
      );
    }

    if (! _.isEmpty($filter.data('grid-reset-group'))) {
      this._removeGroupFilters($filter.data('grid-reset-group'));
    }

    if (! _.isEmpty($resetFilter.data('grid-reset-filter'))) {
      this.removeFilter($resetFilter.data('grid-reset-filter'));
    }

    if ($resetGroup.length) {
      if (! _.isEmpty($resetGroup.data('grid-reset-group'))) {
        this._removeGroupFilters($resetGroup.data('grid-reset-group'));
      } else {
        $group = $filter.closest('[data-grid-group]');
        group = $group.data('grid-group');

        this._removeGroupFilters(group);
      }
    }
  };

  /**
   * Determines whether a filter is already applied or not.
   *
   * @param {Object} filter
   * @return {Boolean}
   */
  DataGrid.prototype._isFilterApplied =
  function _isFilterApplied(filter) {
    return _.isObject(_.find(this.appliedFilters, {name: filter.name}));
  };

  /**
   * Trims the given value.
   *
   * @param {String} value
   * @return {String}
   */
  DataGrid.prototype._cleanup =
  function _cleanup(value) {
    return $.trim(value);
  };

  /**
   * Extracts sorts from clicked element.
   *
   * @param {Object} $el
   * @param {Boolean} multi
   * @return void
   */
  DataGrid.prototype._extractSortsFromClick =
  function _extractSortsFromClick($el, multi) {
    var isMulti = multi && this.opt.sorting.multicolumn;
    var opt = this.opt;
    var sortArray = $el.data('grid-sort').split(':');
    var column = _.trim(sortArray[0]);
    var direction = _.trim(sortArray[1]) || 'asc';
    var sort = _.find(this.sorts, {column: column});

    if (! column) {
      return;
    }

    // Reset page for infinite grids
    if (opt.pagination.method === 'infinite') {
      this._resetLayouts();

      this.goToPage(1);
    }

    $(this).trigger('dg:sorting', {sort: sort});

    if (! sort) {
      sort = {
        column: column,
        direction: direction
      };

      if (isMulti) {
        this.sorts.push(sort);
      } else {
        this.sorts = [sort];
      }
    } else {
      if (
        opt.sorting.column === column &&
        sort.direction === opt.sorting.direction ||
        sort.direction === direction
      ) {
        sort.direction = (sort.direction === 'asc') ? 'desc' : 'asc';

        if (! isMulti) {
          this.sorts = [sort];
        }
      } else {
        this.sorts = _.reject(
          this.sorts, function(oldSort) {
            return oldSort.column === sort.column;
          }
        );
      }
    }

    $(this).trigger('dg:sorted', {sort: this.sorts});
  };

  /**
   * Parses sort expressions.
   *
   * @param {String} sortRaw
   * @return {Array}
   */
  DataGrid.prototype._parseSort =
  function _parseSort(sortRaw) {
    return _.compact(
      _.map(
        sortRaw.split(this.opt.delimiter.query),
        _.bind(function(expression) {
          var sort = expression.split(this.opt.delimiter.expression);

          if (_.isEmpty(_.trim(sort))) {
            return;
          }

          return {
            column: _.trim(sort[0]),
            direction: _.trim(sort[1]) || 'asc',
          };
        }, this)
      )
    );
  };

  /**
   * Sets sorts.
   *
   * @param {Array} sorts
   * @return void
   */
  DataGrid.prototype.setSort =
  function setSort(sorts) {
    this.sorts = (! _.isEmpty(sorts)) ? sorts : [];
  };

  /**
   * Extracts filters from route.
   *
   * @param {Array} routes
   * @return void
   */
  DataGrid.prototype._extractFiltersFromRoute =
  function _extractFiltersFromRoute(routes) {
    var extracted = false;
    var type;

    this.appliedFilters = [];

    _.each(routes, _.bind(function(fragment) {
      for (type in _.invert(_.keys(this.availableFilters))) {
        if (_.has(this.availableFilters, type)) {
          extracted =
            this.availableFilters[type].extractFromRoute(fragment) ||
            false;
        }

        if (extracted) {
          break;
        }
      }
    }, this));
  };

  /**
   * Extracts sorts from route.
   *
   * @param {String} sortRoute
   * @return void
   */
  DataGrid.prototype._extractSortsFromRoute =
  function _extractSortsFromRoute(sortRoute) {
    var sorts = sortRoute.split(this.opt.sorting.delimiter);
    var newSort;

    _.each(sorts, _.bind(function(sort) {
      newSort = sort.split(this.opt.delimiter.expression);

      this.sorts = _.reject(
        this.sorts, function(query) {
          return query.column === newSort[0];
        }
      );

      this.sorts.push({
        column: _.trim(newSort[0]),
        direction: _.trim(newSort[1]),
      });
    }, this));
  };

  /**
   * Extracts the current page from the route.
   *
   * @param {String} page
   * @return void
   */
  DataGrid.prototype._extractPageFromRoute =
  function _extractPageFromRoute(page) {
    var pageArray = page.split(this.opt.delimiter.expression);

    if (_.isEmpty(pageArray[1]) || pageArray[1] <= 0) {
      this.pagination.pageIndex = 1;
    } else {
      this.pagination.pageIndex = parseInt(pageArray[1], 10);
    }
  };

  /**
   * Extracts threshold from route.
   *
   * @param {String} threshold
   * @return void
   */
  DataGrid.prototype._extractThresholdFromRoute =
  function _extractThresholdFromRoute(threshold) {
    var extractedThreshold = threshold.split(this.opt.delimiter.expression)[1];

    this.setThreshold(extractedThreshold);
  };

  /**
   * Extracts throttle from route.
   *
   * @param {String} throttle
   * @return void
   */
  DataGrid.prototype._extractThrottleFromRoute =
  function _extractThrottleFromRoute(throttle) {
    var extractedThrottle = throttle.split(this.opt.delimiter.expression)[1];

    this.setThrottle(extractedThrottle);
  };

  /**
   * Extracts layout from route.
   *
   * @param {@string} layout
   * @return void
   */
  DataGrid.prototype._extractLayoutFromRoute =
  function _extractLayoutFromRoute(layout) {
    var _this = this;
    var layouts = layout.substr(7).split(',');
    var layoutParts;

    this._getEl(this._getSelector('switch-layout')).removeClass(this.opt.cssClasses.activeLayout);

    _.each(layouts, _.bind(function(layout) {
      _this._getEl(_this._getSelector('switch-layout', layout)).addClass(_this.opt.cssClasses.activeLayout);

      layoutParts = layout.split(this.opt.delimiter.expression);

      _this.setLayout(layoutParts[0], layoutParts[1], false);
    }, this));
  };

  /**
   * Build filter fragment.
   *
   * @return {String}
   */
  DataGrid.prototype._buildFilterFragment =
  function _buildFilterFragment() {
    return _.flatten(_.map(this.appliedFilters, _.bind(function(index) {
      if (_.has(this.availableFilters, index.type)) {
        return this.availableFilters[index.type].buildFragment(index);
      }
    }, this)));
  };

  /**
   * Build filter fragment.
   *
   * @return {String}
   */
  DataGrid.prototype.buildDefaultFilterFragment =
  function buildDefaultFilterFragment() {
    return _.flatten(_.map(this.appliedFilters, _.bind(function(index) {
      if (_.has(this.availableFilters, index.type)) {
        return this.availableFilters[index.type].buildFragment(index);
      }
    }, this)));
  };

  /**
   * Build sort fragment.
   *
   * @return {String}
   */
  DataGrid.prototype._buildSortFragment =
  function _buildSortFragment() {
    var delimiter = this.opt.delimiter.expression;

    var sorts = _.compact(_.map(this.sorts, _.bind(function(sort) {
      if (
        (sort.column !== this.opt.sorting.column ||
        sort.direction !== this.opt.sorting.direction)
      ) {
        return sort.column + delimiter + sort.direction;
      }
    }, this)));

    if (sorts.length) {
      return sorts.join(this.opt.sorting.delimiter);
    }
  };

  /**
   * Build page fragment.
   *
   * @return {String}
   */
  DataGrid.prototype._buildPageFragment =
  function _buildPageFragment() {
    if (
      this.pagination.pageIndex > 1 &&
      this.opt.pagination.method !== 'infinite'
    ) {
      return 'page' +
        this.opt.delimiter.expression +
        this.pagination.pageIndex;
    }
  };

  /**
   * Build layout fragment.
   *
   * @return {String}
   */
  DataGrid.prototype._buildLayoutFragment =
  function _buildLayoutFragment() {
    var fragments = [];

    // Skip layouts for infinite grids
    if (this.opt.pagination.method === 'infinite') {
      return;
    }

    _.each(this.baseLayouts, _.bind(function(layout, key) {
      if (key !== layout) {
        fragments.push(key + this.opt.delimiter.expression + layout);
      }
    }, this));

    if (! _.isEmpty(fragments)) {
      return 'layout' + this.opt.delimiter.expression + fragments.join(',');
    }
  };

  /**
   * Build throttle fragment.
   *
   * @return {String}
   */
  DataGrid.prototype._buildThrottleFragment =
  function _buildThrottleFragment() {
    if (! this.opt.pagination.throttle) {
      return;
    }

    if (
      this.defaults.pagination.throttle !== this.opt.pagination.throttle
    ) {
      return 'throttle' +
        this.opt.delimiter.expression +
        this.opt.pagination.throttle;
    }
  };

  /**
   * Build threshold fragment.
   *
   * @return {String}
   */
  DataGrid.prototype._buildThresholdFragment =
  function _buildThresholdFragment() {
    if (! this.opt.pagination.threshold) {
      return;
    }

    if (
      this.defaults.pagination.threshold !== this.opt.pagination.threshold
    ) {
      return 'threshold' +
        this.opt.delimiter.expression +
        this.opt.pagination.threshold;
    }
  };

  /**
   * Grabs all the results from the server.
   *
   * @return void
   */
  DataGrid.prototype._fetchResults =
  function _fetchResults(force) {
    force = force !== undefined ? force : false;

    var _this = this;
    var uri = this._buildAjaxURI();

    // Only render if the ajax uri hasn't changed. (layout changes)
    if (this.currentUri === uri && force !== true) {
      this._render();
    } else {
      $(this).trigger('dg:fetching', {grid: this});

      this._showLoader();

      $.ajax({
        url: this.opt.source,
        dataType: 'json',
        data: uri,
      })
        .done(function(data) {
          _this.response = data;

          _this._render();
        })
        .fail(_.bind(this._renderFailed, this));
    }

    this.currentUri = uri;
  };

  /**
   * Handles ajax response rendering
   *
   * @param {Object} response
   * @return void
   */
  DataGrid.prototype._render =
  function _render(response) {
    response = response !== undefined ? response : this.response;

    this.initial = false;
    var active;
    var layout;
    var data;
    var action;

    if (this.pagination.pageIndex > response.pages) {
      this.pagination.pageIndex = response.pages;

      this.refresh();

      return false;
    }

    _.each(_.keys(this.layouts), _.bind(function(key) {
      active = _.isUndefined(
        this.layouts[key].layout.data('grid-layout-disabled')
      );

      if (! active) {
        return;
      }

      layout = this.layouts[key].layout;

      data = this.layouts[key].template({grid: this, response: response, pagination: this.buildPagination(response)});
      action = this.layouts[key].action === 'update' ?
        'html' : this.layouts[key].action;

      // Render template
      layout[action](data);

      // Trigger layout event
      layout.trigger('dg:layout_rendered');
    }, this));

    this._setSortDirection(response.sort);

    this._hideLoader();

    this.searchActive = false;

    $(this).trigger('dg:hashchange');

    this.callback();

    $(this).trigger('dg:fetched', {response: response});
  };

  /**
   * Handles ajax failure response.
   *
   * @param {Object} jqXHR
   * @param {String} textStatus
   * @param {Object} errorThrown
   * @return void
   */
  DataGrid.prototype._renderFailed =
  function _renderFailed(jqXHR, textStatus, errorThrown) {
    console.error('fetchResults ' + jqXHR.status, errorThrown);

    this.searchActive = false;
  };

  /**
   * Builds the hash fragment.
   *
   * @return {String}
   */
  DataGrid.prototype.buildHash =
  function buildHash() {
    var base = _.compact(_.flatten([
      this._buildFilterFragment(),
      this._buildSortFragment(),
      this._buildPageFragment(),
      this._buildLayoutFragment(),
      this._buildThrottleFragment(),
      this._buildThresholdFragment()
    ])).join('/');

    var hash = this._getBaseHash() + base;

    return hash;
  };

  /**
   * Builds the ajax uri.
   *
   * @param {String} download
   * @return {String}
   */
  DataGrid.prototype._buildAjaxURI =
  function _buildAjaxURI(download) {
    var params = {
      filters: [],
      page: this.pagination.pageIndex,
      method: this.opt.pagination.method,
    };

    if (this.opt.pagination.threshold) {
      params.threshold = this.opt.pagination.threshold ?
        this.opt.pagination.threshold : this.defaults.pagination.threshold;
    }

    if (this.opt.pagination.throttle) {
      params.throttle = this.opt.pagination.throttle ?
        this.opt.pagination.throttle : this.defaults.pagination.throttle;
    }

    _.each(this.appliedFilters, _.bind(function(filter) {
      if (_.has(this.availableFilters, filter.type)) {
        params.filters = _.flatten(
          params.filters.concat(
            this.availableFilters[filter.type].buildParams(filter)
          )
        );
      }
    }, this));

    if (! _.isEmpty(this.sorts)) {
      params.sort = _.map(this.sorts, _.bind(function(sort) {
        return {
          column: sort.column,
          direction: sort.direction,
        };
      }, this));
    }

    if (download) {
      params.download = download;
    }

    return $.param(params);
  };

  /**
   * Builds the pagination.
   *
   * @param {Object} json
   * @return {Object}
   */
  DataGrid.prototype.buildPagination =
  function buildPagination(json) {
    var page = json.page;
    var next = json.nextPage;
    var prev = json.previousPage;
    var total = json.pages;

    switch (this.opt.pagination.method) {
    case 'single':
    case 'group':
      return this._buildRegularPagination(page, next, prev, total);
    case 'infinite':
      return this._buildInfinitePagination(page, next, total);
    }
  };

  /**
   * Builds regular pagination.
   *
   * @param {Number} page
   * @param {Number} next
   * @param {Number} prev
   * @param {Number} total
   * @return {Object}
   */
  DataGrid.prototype._buildRegularPagination =
  function _buildRegularPagination(page, next, prev, total) {
    var perPage = this._calculatePagination();
    var pageLimit;
    var pageStart;

    if (this.response.threshold > this.response.filtered) {
      pageLimit = this.response.filtered;
    } else if (this.pagination.pageIndex === 1) {
      pageLimit = perPage > this.response.filtered ?
        this.response.filtered : perPage;
    } else {
      pageLimit =
        this.response.total < (perPage * this.pagination.pageIndex) ?
        this.response.filtered : (perPage * this.pagination.pageIndex);
    }

    if (perPage === 0) {
      pageStart = 0;
    } else {
      if (this.pagination.pageIndex === 1) {
        if (this.response.filtered > 0) {
          pageStart = 1;
        } else {
          pageStart = 0;
        }
      } else {
        pageStart = perPage * (this.pagination.pageIndex - 1) + 1;
      }
    }

    return {
      pageStart: pageStart,
      pageLimit: pageLimit,
      nextPage: next,
      previousPage: prev,
      page: page,
      pages: total,
      total: this.response.total,
      filtered: this.response.filtered,
      throttle: this.opt.pagination.throttle ?
        this.opt.pagination.throttle : this.defaults.pagination.throttle,
      threshold: this.opt.pagination.threshold ?
        this.opt.pagination.threshold : this.defaults.pagination.threshold,
      perPage: perPage,
    };
  };

  /**
   * Builds the infinite pagination.
   *
   * @param {Number} page
   * @param {Number} next
   * @param {Number} total
   * @return {Object}
   */
  DataGrid.prototype._buildInfinitePagination =
  function _buildInfinitePagination(page, next, total) {
    return (! next) ? null : {
      page: page,
      total: total,
      infinite: true,
    };
  };

  /**
   * Calculate results per page.
   *
   * @return {Number}
   */
  DataGrid.prototype._calculatePagination =
  function _calculatePagination() {
    switch (this.response.method) {
    case 'single':
    case 'infinite':
      return this.response.throttle ?
        this.response.throttle : this.defaults.pagination.throttle;
    case 'group':
      return Math.ceil(
        this.response.filtered / (
          this.response.throttle ?
            this.response.throttle : this.defaults.pagination.throttle
        )
      );
    }
  };

  /**
   * Shows the loading bar.
   *
   * @return void
   */
  DataGrid.prototype._showLoader =
  function _showLoader() {
    var effect = this.opt.loader.showEffect;
    var duration = this.opt.loader.duration;
    var $loader = this._getEl(this._getLoaderSelector());

    if (! $loader.length) {
      return;
    }

    $loader.finish()[effect]({
      duration: duration,
    });
  };

  /**
   * Hides the loading bar.
   *
   * @return void
   */
  DataGrid.prototype._hideLoader =
  function _hideLoader() {
    var effect = this.opt.loader.hideEffect;
    var duration = this.opt.loader.duration;
    var $loader = this._getEl(this._getLoaderSelector());

    if (! $loader.length) {
      return;
    }

    $loader.finish()[effect]({
      duration: duration,
    });
  };

  /**
   * Resets Data Grid.
   *
   * @return {DataGrid}
   */
  DataGrid.prototype.reset =
  function reset() {
    var $search = $(this._getSearchSelector());
    var $sort = this._getEl(this._getSelector('sort'));
    var $group = this._getEl(this._getSelector('group', null, 'select'));
    var sort;

    $(this).trigger('dg:resetting');

    // Elements
    $sort.removeClass(this.opt.cssClasses.ascClass)
      .removeClass(this.opt.cssClasses.ascClass);
    $search.find('input').val('');
    $search.find('select').prop('selectedIndex', 0);
    $group.find(':eq(0)').prop('selected', true);

    // Defaults
    this.defaults = _.cloneDeep(this.originalDefaults);
    this.opt.pagination = _.clone(this.originalDefaults.pagination);

    // Filters
    this.appliedFilters = [];

    // Sort
    this.sorts = [];

    if (this.opt.sorting.column) {
      sort = this.opt.sorting.column +
        this.opt.delimiter.expression +
        this.opt.sorting.direction;

      this._extractSortsFromRoute(sort);
    }

    // Layout
    this._initLayouts();

    // Reset infinite layouts
    if (this.opt.pagination.method === 'infinite') {
      this._resetLayouts();
    }

    // Pagination
    this.pagination.pageIndex = 1;

    $(this).trigger('dg:reset');

    return this;
  };

  /**
   * Refreshes Data Grid
   *
   * @return {DataGrid}
   */
  DataGrid.prototype.refresh =
  function refresh(force) {
    this._fetchResults(force);

    return this;
  };

  /**
   * Returns the grids base hash.
   *
   * @return {String}
   */
  DataGrid.prototype._getBaseHash =
  function _getBaseHash() {
    if (this.manager.grids.length === 1) {
      return '';
    }

    return this.key + '/';
  };

  /**
   * Returns an element from the dom.
   *
   * @param {String} selector
   * @return {Object}
   */
  DataGrid.prototype._getEl =
  function _getEl(selector) {
    return this.$body.find(selector);
  };

  /**
   * Returns the data grid element selector.
   *
   * @return {String}
   */
  DataGrid.prototype._getGridSelector =
  function _getGridSelector() {
      return '[data-grid="' + this.key + '"]';
    };

  /**
   * Returns the element selector based
   * on type, value, prefix and postfix.
   *
   * @param {String} type
   * @param {String} value
   * @param {String} prefix
   * @param {String} postfix
   * @return {String}
   */
  DataGrid.prototype._getSelector =
  function _getSelector(type, value, prefix, postfix) {
    var gridSelector = this._getGridSelector();
    var selector = '';

    if (! _.isUndefined(prefix) && ! _.isNull(prefix)) {
      selector += prefix;
    }

    selector += '[data-grid';

    if (! _.isUndefined(type) && ! _.isNull(type)) {
      selector += '-' + type;
    }

    if (! _.isUndefined(value) && ! _.isNull(value)) {
      selector += '="' + value + '"';
    }

    selector += ']';

    if (! _.isUndefined(postfix) && ! _.isNull(postfix)) {
      selector += postfix;
    }

    return selector + gridSelector + ',' +
      gridSelector + ' ' + selector;
  };

  /**
   * Returns the data grid global reset selector.
   *
   * @return {String}
   */
  DataGrid.prototype._getGlobalResetSelector =
  function _getGlobalResetSelector() {
    return this._getSelector(
      'reset', null, null, ':not([data-grid-filter]):not([data-grid-group])'
    );
  };

  /**
   * Returns the data grid filter reset selector.
   *
   * @return {String}
   */
  DataGrid.prototype._getResetFilterSelector =
  function _getResetFilterSelector() {
    return this._getSelector('reset-filter', null, null, ':not(form)');
  };

  /**
   * Returns the data grid filter group reset selector.
   *
   * @return {String}
   */
  DataGrid.prototype._getResetGroupSelector =
  function _getResetGroupSelector() {
    return this._getSelector('reset-group', null, null, ':not([data-grid-group][data-grid-reset-group])');
  };

  /**
   * Returns the data grid sort selector.
   *
   * @return {String}
   */
  DataGrid.prototype._getPlainSortSelector =
  function _getPlainSortSelector() {
    return this._getSelector('sort', null, null, ':not([data-grid-filter])');
  };

  /**
   * Returns the data grid term selector.
   *
   * @return {String}
   */
  DataGrid.prototype._getTermSelector =
  function _getTermSelector() {
    return this._getSelector(
      'filter', null, null, ':not([data-grid-type="range"])'
    );
  };

  /**
   * Returns the data grid loader selector.
   *
   * @return {String}
   */
  DataGrid.prototype._getLoaderSelector =
  function _getLoaderSelector() {
    var gridSelector = this._getGridSelector();
    var loader = this.opt.loader.element;

    return gridSelector + loader + ',' + gridSelector + ' ' + loader;
  };

  /**
   * Returns the data grid search selector.
   *
   * @param {String} value
   * @return {String}
   */
  DataGrid.prototype._getSearchSelector =
  function _getSearchSelector(value) {
    var gridSelector = this._getGridSelector();
    var selector = '[data-grid-search]' + gridSelector;

    if (value) {
      selector += ' option[value=' + value + ']';
    }

    selector += ',' + gridSelector + ' ' + '[data-grid-search]';

    if (value) {
      selector += ' option[value=' + value + ']';
    }

    return selector;
  };

  /**
   * Returns the data grid range filter selector.
   *
   * @param {String} filter
   * @param {String} type
   * @return {String}
   */
  DataGrid.prototype._getRangeFilterSelector =
  function _getRangeFilterSelector(filter, type) {
    var gridSelector = this._getGridSelector();

    return '[data-grid-filter="' + filter + '"]' +
      '[data-grid-range="' + type + '"]' +
      gridSelector + ',' +
      gridSelector + ' ' +
      '[data-grid-filter="' + filter + '"]' +
      '[data-grid-range="' + type + '"]';
  };

  /**
   * Data grid callback.
   *
   * @return {DataGrid}
   */
  DataGrid.prototype.callback =
  function callback() {
    var _callback = this.opt.callback;

    if (_.isFunction(_callback)) {
      _callback.call(this);
    }

    return this;
  };

  /**
   * Applies the scroll feature animation.
   *
   * @return {DataGrid}
   */
  DataGrid.prototype.applyScroll =
  function applyScroll() {
    var scroll = this.opt.pagination.scroll;

    if (_.isFunction(scroll)) {
      scroll();
    } else if (scroll) {
      $(document.body).animate({
        scrollTop: $(scroll).offset().top
      }, 200);
    }

    return this;
  };

  /**
   * Check for operators.
   *
   * @return {Boolean}
   */
  DataGrid.prototype._checkOperator =
  function _checkOperator(value) {
    return />|<|!=|=|<=|>=|<>/.test(value);
  };

  /**
   * Sets the scroll value.
   *
   * @param  element  string
   * @return void
   */
  DataGrid.prototype.setScroll =
  function setScroll(element) {
    this.opt.pagination.scroll = element;
  };

  /**
   * Returns the throttle.
   *
   * @return {Number}
   */
  DataGrid.prototype.getThrottle =
  function getThrottle() {
    return this.opt.pagination.throttle;
  };

  /**
   * Sets the throttle.
   *
   * @param  value  int
   * @return void
   */
  DataGrid.prototype.setThrottle =
  function setThrottle(value) {
    this.opt.pagination.throttle = parseInt(value, 10);
  };

  /**
   * Returns the threshold.
   *
   * @return {Number}
   */
  DataGrid.prototype.getThreshold =
  function getThreshold() {
    return this.opt.pagination.threshold;
  };

  /**
   * Sets the threshold.
   *
   * @param  value  int
   * @return void
   */
  DataGrid.prototype.setThreshold =
  function setThreshold(value) {
    this.opt.pagination.threshold = parseInt(value, 10);
  };

  /**
   * Creates a new TermFilter.
   *
   * @param {DataGrid} grid
   * @return void
   */
  function TermFilter(grid) {
    this.grid = grid;
  }

  /**
   * Initializes the TermFilter.
   *
   * @return void
   */
  TermFilter.prototype.init = function init() {
    this._listeners();
  };

  /**
   * Adds listeners.
   *
   * @return void
   */
  TermFilter.prototype._listeners =
  function _listeners() {
    this.grid.$body.on('click',
      this.grid._getTermSelector(),
      _.bind(this._onFilter, this)
    );

    this.grid.$body.on('change',
      this.grid._getSelector('group', null, 'select'),
      _.bind(this._onSelectFilter, this)
    );
  };

  /**
   * Extracts filter data from a url fragment.
   *
   * @param {String} fragment
   * @return void
   */
  TermFilter.prototype.extractFromRoute =
  function extractFromRoute(fragment) {
    var $filter = this.grid._getEl(this.grid._getSelector('filter', fragment));
    var filterInfo;

    // Set the matching option if we're dealing with a select
    if ($filter[0] !== undefined && $filter[0].nodeName === 'OPTION') {
      $filter.parent().val($filter.val());
    }

    if (! _.has(this.grid.opt.filters, fragment) && ! $filter.length) {
      return;
    } else if (_.has(this.grid.opt.filters, fragment) && ! $filter.length) {
      filterInfo = {
        name: fragment
      };

      filterInfo = _.extend(filterInfo, this.grid.opt.filters[fragment]);

      this.grid.applyFilter(filterInfo);

      return;
    }

    this._extractFromElement($filter, false);

    return true;
  };

  /**
   * Builds url fragment from filter data.
   *
   * @param {TermFilter} filter
   * @return {String}
   */
  TermFilter.prototype.buildFragment =
  function buildFragment(filter) {
    return filter.name;
  };

  /**
   * Builds ajax request params from filter data.
   *
   * @param {TermFilter} filter
   * @return {Object}
   */
  TermFilter.prototype.buildParams =
  function buildParams(filter) {
    return _.map(filter.query, _.bind(function(query) {
      var queryString = {};

      if (query.operator) {
        queryString[query.column] = '|' +
          query.operator + this.grid._cleanup(query.value) +
          '|';
      } else {
        queryString[query.column] = this.grid._cleanup(query.value);
      }

      return queryString;
    }, this));
  };

  /**
   * Extracts filters from element.
   *
   * @param {Object} $filter
   * @param {Boolean} refresh
   * @return void
   */
  TermFilter.prototype._extractFromElement =
  function _extractFromElement($filter, refresh) {
    refresh = refresh !== undefined ? refresh : true;
    var sort = $filter.data('grid-sort');
    var filter = $filter.data('grid-filter');
    var resetGroup = $filter.data('grid-reset-group');

    if (! _.isEmpty(sort)) {
      this.grid.setSort(this.grid._parseSort(sort));
    }

    if (filter) {
      this.grid.removeFilter(filter);
      this.grid.resetBeforeApply($filter);
      this._apply($filter);
    } else if (! _.isUndefined(resetGroup)) {
      this.grid.resetBeforeApply($filter);
    }

    $filter.addClass(this.grid.opt.cssClasses.appliedFilter);

    if (refresh) {
      this.grid.goToPage(1);

      this.grid.refresh();
    }
  };

  /**
   * Handles filter click.
   *
   * @param {Event} event
   * @return void
   */
  TermFilter.prototype._onFilter =
  function _onFilter(event) {
    var $filter = $(event.currentTarget);
    var type = $filter.data('grid-type') || 'term';

    event.preventDefault();

    if (type !== 'term') {
      return;
    }

    this.grid.applyScroll();

    this._extractFromElement($filter);
  };

  /**
   * Handles select filter change.
   *
   * @param {Event} event
   * @return void
   */
  TermFilter.prototype._onSelectFilter =
  function _onSelectFilter(event) {
    var $select = $(event.currentTarget);
    var $filter = $select.find(':selected');
    var type = $filter.data('grid-type') || 'term';

    if (type !== 'term') {
      return;
    }

    this.grid.applyScroll();

    this._extractFromElement($filter);
  };

  /**
   * Applies a term filter.
   *
   * @param {Object} filter
   * @return void
   */
  TermFilter.prototype._apply =
  function _apply($filter) {
    var filter = $filter.data('grid-filter');
    var label = $filter.data('grid-label') || '';
    var query = $filter.data('grid-query') || '';
    var filterInfo = {
      name: filter,
      type: 'term',
      label: label
    };

    if (_.has(this.grid.opt.filters, filter)) {
      filterInfo = _.extend(filterInfo, this.grid.opt.filters[filter]);
    } else {
      if (query.length) {
        filterInfo.query = this._parseQuery(query);
      }
    }

    this.grid.applyFilter(filterInfo);
  };

  /**
   * Parses query strings.
   *
   * @param {String} queryRaw
   * @return {Object}
   */
  TermFilter.prototype._parseQuery =
  function _parseQuery(queryRaw) {
    return _.compact(
      _.map(
        queryRaw.split(this.grid.opt.delimiter.query),
        _.bind(function(expression) {
          var query;
          var queryInfo;

          if (_.isEmpty(expression)) {
            return;
          }

          query = _.trim(expression).split(this.grid.opt.delimiter.expression);

          if (query.length === 3) {
            queryInfo = {
              column: query[0],
              value: this.grid._cleanup(query[2]),
              operator: this.grid._checkOperator(query[1]) ? query[1] : null,
            };
          } else if (query.length === 2) {
            queryInfo = {
              column: query[0],
              value: this.grid._cleanup(query[1]),
            };
          }

          return queryInfo;
        }, this)
      )
    );
  };

  /**
   * Creates a new RangeFilter.
   *
   * @param {DataGrid} grid
   * @return void
   */
  function RangeFilter(grid) {
    this.grid = grid;
  }

  /**
   * Initializes the RangeFilter.
   *
   * @return void
   */
  RangeFilter.prototype.init = function init() {
    this._listeners();
  };

  /**
   * Adds listeners.
   *
   * @return void
   */
  RangeFilter.prototype._listeners =
  function _listeners() {
    var rangeSelector = this.grid._getSelector('type', 'range');

    this.grid.$body.on('click',
      rangeSelector,
      _.bind(this._onRange, this)
    );

    this.grid.$body.on('change',
      rangeSelector,
      _.bind(this._onRangeChange, this)
    );
  };

  /**
   * Extracts filter data from a url fragment.
   *
   * @param {String} fragment
   * @return void
   */
  RangeFilter.prototype.extractFromRoute =
  function extractFromRoute(fragment) {
    var delimiter = this.grid.opt.delimiter.expression;
    var query = fragment.split(delimiter);
    var name = query[0];
    var $filter = this.grid._getEl(this.grid._getSelector('filter', name));
    var type = $filter.data('grid-type');
    var range = $filter.data('grid-range');
    var date = $filter.data('grid-date');
    var queryFrom = query[1];
    var queryTo = query[2];
    var serverDateFormat = $filter.data('grid-server-date-format');
    var clientDateFormat = $filter.data('grid-client-date-format');
    var isDate;
    var $from;
    var $to;

    if (! $filter.length || type !== 'range') {
      return;
    }

    if (_.isUndefined(range)) {
      $filter.data(
        'grid-query', name + delimiter + queryFrom + delimiter + queryTo
      );
    } else {
      $from = this.grid._getEl(
        this.grid._getRangeFilterSelector(name, 'start')
      );
      $to = this.grid._getEl(
        this.grid._getRangeFilterSelector(name, 'end')
      );

      isDate = _.isUndefined(date) ? null : true;
      serverDateFormat = _.isNull(serverDateFormat) ?
        null : this.grid.opt.formats.serverDate;
      clientDateFormat = _.isNull(clientDateFormat) ?
        null : this.grid.opt.formats.clientDate;

      if (serverDateFormat && moment && isDate) {
        queryFrom = moment(queryFrom, serverDateFormat)
          .format(clientDateFormat);

        queryTo = moment(queryTo, serverDateFormat)
          .format(clientDateFormat);
      }

      if ($from.is(':input')) {
        $from.val(queryFrom);
      } else {
        $from.find(':input:first').val(queryFrom);
      }

      if ($to.is(':input')) {
        $to.val(queryTo);
      } else {
        $to.find(':input:first').val(queryTo);
      }
    }

    this._extractFromElement($filter, false);

    return true;
  };

  /**
   * Builds url fragment from filter data.
   *
   * @param {RangeFilter} filter
   * @return {String}
   */
  RangeFilter.prototype.buildFragment =
  function buildFragment(filter) {
    var delimiter = this.grid.opt.delimiter.expression;

    return filter.name +
      delimiter +
      filter.query.from +
      delimiter +
      filter.query.to;
  };

  /**
   * Builds ajax request params from filter data.
   *
   * @param {RangeFilter} filter
   * @return {Object}
   */
  RangeFilter.prototype.buildParams =
  function buildParams(filter) {
    var query = filter.query;
    var queryString = {};

    queryString[query.column] = '|>=' + query.from + '|<=' + query.to + '|';

    return queryString;
  };

  /**
   * Handles range clicks.
   *
   * @param {Event} event
   * @return void
   */
  RangeFilter.prototype._onRange =
  function _onRange(event) {
    var $filter = $(event.currentTarget);
    var type = $filter.data('grid-type') || 'range';

    event.preventDefault();

    if (type !== 'range' || !_.isUndefined($filter.data('grid-range'))) {
      return;
    }

    this._extractFromElement($filter);
  };

  /**
   * Handles range changes.
   *
   * @param {Event} event
   * @return void
   */
  RangeFilter.prototype._onRangeChange =
  function _onRangeChange(event) {
    var $filter = $(event.currentTarget);
    var type = $filter.data('grid-type');

    event.preventDefault();

    if (type !== 'range') {
      return;
    }

    this._extractFromElement($filter);
  };

  /**
   * Extracts range filters from element.
   *
   * @param {Object} $filter
   * @param {Boolean} refresh
   * @return void
   */
  RangeFilter.prototype._extractFromElement =
  function _extractFromElement($filter, refresh) {
    refresh = refresh !== undefined ? refresh : true;
    var name = $filter.data('grid-filter');
    var label = $filter.data('grid-label');
    var sort = $filter.data('grid-sort');
    var date = $filter.data('grid-date');
    var serverDate = $filter.data('grid-server-date-format');
    var clientDate = $filter.data('grid-client-date-format');
    var range = $filter.data('grid-range');
    var delimiter = this.grid.opt.delimiter.expression;
    var isDate = _.isUndefined(date) ? null : true;
    var serverDateFormat = _.isNull(serverDate) ?
      null : this.grid.opt.formats.serverDate;
    var clientDateFormat = _.isNull(clientDate) ?
      null : this.grid.opt.formats.clientDate;
    var query = $filter.data('grid-query');
    var filter;
    var column;
    var $from;
    var queryFrom;
    var $to;
    var queryTo;

    if (_.isUndefined(range)) {
      query = query.split(delimiter);
      column = query[0];
      queryFrom = query[1];
      queryTo = query[2];
    } else {
      $from = this.grid._getEl(
        this.grid._getRangeFilterSelector(name, 'start')
      );
      $to = this.grid._getEl(
        this.grid._getRangeFilterSelector(name, 'end')
      );
      column = $from.data('grid-query').split(delimiter)[0];
      queryFrom = $from.is(':input') ?
        $from.val() : $from.find(':input:first').val() ||
        $from.data('grid-query').split(delimiter)[1];
      queryTo = $to.is(':input') ?
        $to.val() : $to.find(':input:first').val() ||
        $to.data('grid-query').split(delimiter)[1];
    }

    if (_.isEmpty(queryFrom) || _.isEmpty(queryTo)) {
      return;
    }

    this.grid.removeFilter(name);

    this.grid.resetBeforeApply($filter);

    if (! _.isEmpty(sort)) {
      this.grid.setSort(this._parseSort(sort));
    }

    if (serverDateFormat && moment && isDate) {
      queryFrom = moment(queryFrom, clientDateFormat).format(serverDateFormat);

      queryTo = moment(queryTo, clientDateFormat).format(serverDateFormat);
    }

    filter = {
      name: name,
      type: 'range',
      label: label,
      query: {
        column: column,
        from: queryFrom,
        to: queryTo,
      },
    };

    this.grid.applyFilter(filter);

    $filter.addClass(this.grid.opt.cssClasses.appliedFilter);

    if (refresh) {
      this.grid.goToPage(1);

      this.grid.refresh();
    }
  };

  /**
   * Creates a new SearchFilter.
   *
   * @param {DataGrid} grid
   * @return void
   */
  function SearchFilter(grid) {
    this.grid = grid;
  }

  /**
   * Initializes the SearchFilter.
   *
   * @return void
   */
  SearchFilter.prototype.init = function init() {
    this._listeners();
  };

  /**
   * Adds listeners.
   *
   * @return void
   */
  SearchFilter.prototype._listeners =
  function _listeners() {
    this.grid.$body.on('submit',
      this.grid._getSearchSelector(),
      _.bind(this._onSearch, this)
    );
  };

  /**
   * Extracts filter data from a url fragment.
   *
   * @param {String} fragment
   * @return void
   */
  SearchFilter.prototype.extractFromRoute =
  function extractFromRoute(fragment) {
    var route = fragment.split(this.grid.opt.delimiter.expression);
    var $option = this.grid._getEl(this.grid._getSearchSelector(route[0]));
    var filter;

    if (route[0] !== 'all' && ! $option.length) {
      return;
    }

    if (route.length === 3) {
      filter = {
        name: 'search:' + route[0] + ':' +
          route[2].toLowerCase(),
        type: 'search',
        query: {
          column: route[0],
          value: this.grid._cleanup(route[2]),
          operator: route[1],
        },
      };
    } else {
      filter = {
        name: 'search:' + route[0] + ':' +
          route[1].toLowerCase(),
        type: 'search',
        query: {
          column: route[0],
          value: this.grid._cleanup(route[1]),
        },
      };
    }

    this.grid.applyFilter(filter);

    return true;
  };

  /**
   * Builds url fragment from filter data.
   *
   * @param {SearchFilter} filter
   * @return {String}
   */
  SearchFilter.prototype.buildFragment =
  function buildFragment(filter) {
    return filter.query.column +
      this.grid.opt.delimiter.expression +
      filter.query.value;
  };

  /**
   * Builds ajax request params from filter data.
   *
   * @param {SearchFilter} filter
   * @return {Object}
   */
  SearchFilter.prototype.buildParams =
  function buildParams(filter) {
    var query = filter.query;
    var queryString = {};

    if (query.column === 'all') {
      queryString = (query.operator) ?
        '|' + query.operator + this.grid._cleanup(query.value) + '|' :
        this.grid._cleanup(query.value);
    } else {
      queryString[query.column] = (query.operator) ?
        '|' + query.operator + this.grid._cleanup(query.value) + '|' :
        this.grid._cleanup(query.value);
    }

    return queryString;
  };

  /**
   * Handles search form submission.
   *
   * @param {Event} event
   * @return void
   */
  SearchFilter.prototype._onSearch =
  function _onSearch(event) {
    var $form = $(event.currentTarget);

    event.preventDefault();

    this._extractFromElement($form);
  };

  /**
   * Extracts filters from search form.
   *
   * @param {Object} $form
   * @return void
   */
  SearchFilter.prototype._extractFromElement =
  function _extractFromElement($form) {
    var $input = $form.find('input');
    var $select = $form.find('select:not([data-grid-group])');
    var column = $select.val() || 'all';
    var value = $.trim($input.val());
    var operator = $form.data('grid-operator');
    var filter;

    this.grid.searchActive = true;

    clearTimeout(this.grid.searchTimeout);

    if (! value.length) {
      return;
    }

    if ($select.length) {
      $select.prop('selectedIndex', 0);
    }

    // Remove live search filter
    this.grid.appliedFilters = _.reject(
      this.grid.appliedFilters, function(query) {
        return query.type === 'live';
      }
    );

    filter = {
      name: 'search:' + column + ':' +
        value.toLowerCase(),
      type: 'search',
      query: {
        column: column,
        value: this.grid._cleanup(value),
        operator: operator,
      },
    };

    $input.val('').data('old', '');

    this.grid.resetBeforeApply($form);

    if (! _.isEmpty($form.data('grid-sort'))) {
      this.grid.setSort(this._parseSort($form.data('grid-sort')));
    }

    this.grid.applyFilter(filter);

    this.grid.goToPage(1);

    this.grid.refresh();
  };

  /**
   * Creates a new LiveFilter.
   *
   * @param {DataGrid} grid
   * @return void
   */
  function LiveFilter(grid) {
    this.grid = grid;
  }

  /**
   * Initializes the LiveFilter.
   *
   * @return void
   */
  LiveFilter.prototype.init = function init() {
    this._listeners();
  };

  /**
   * Adds listeners.
   *
   * @return void
   */
  LiveFilter.prototype._listeners =
  function _listeners() {
    if (this.grid.opt.search.live) {
      this.grid.$body.on('keyup',
        this.grid._getSearchSelector(),
        _.bind(this._onLiveSearch, this)
      );
    }
  };

  /**
   * Extracts filter data from a url fragment.
   *
   * @param {String} fragment
   * @return void
   */
  LiveFilter.prototype.extractFromRoute =
  function extractFromRoute() {

  };

  /**
   * Builds url fragment from filter data.
   *
   * @param {LiveFilter} filter
   * @return {String}
   */
  LiveFilter.prototype.buildFragment =
  function buildFragment() {

  };

  /**
   * Builds ajax request params from filter data.
   *
   * @param {LiveFilter} filter
   * @return {Object}
   */
  LiveFilter.prototype.buildParams =
  function buildParams(filter) {
    return this.grid.availableFilters.search.buildParams(filter);
  };

  /**
   * Handles live search.
   *
   * @param {Event} event
   * @return void
   */
  LiveFilter.prototype._onLiveSearch =
  function _onLiveSearch(event) {
    var elem = $(event.currentTarget);

    if (event.keyCode === 13) {
      return;
    }

    event.preventDefault();

    this._extractFromElement(elem);
  };

  /**
   * Applies live search filter.
   *
   * @param {Object} $form
   * @return void
   */
  LiveFilter.prototype._extractFromElement =
  function _extractFromElement($form) {
    if (this.grid.searchActive) {
      return;
    }

    clearTimeout(this.grid.searchTimeout);

    this.grid.searchTimeout = setTimeout(_.bind(function($formEl) {
      var $input = $formEl.find('input');
      var $select = $formEl.find('select:not([data-grid-group])');
      var column = $select.val() || 'all';
      var value = $.trim($input.val());
      var old = $input.data('old');
      var operator = $formEl.data('operator');
      var filter;

      if (this.grid.opt.pagination.method === 'infinite') {
        this.grid._resetLayouts();
      }

      if (old) {
        this.grid.appliedFilters = _.reject(
          this.grid.appliedFilters, function(query) {
            return query.type === 'live';
          }
        );

        if (! value.length) {
          this.grid.goToPage(1);

          this.grid.refresh();

          return;
        }
      }

      filter = {
        name: 'live',
        type: 'live',
        query: {
          column: column,
          value: this.grid._cleanup(value),
          operator: operator,
        },
      };

      $input.data('old', value);

      this.grid.applyFilter(filter);

      this.grid.goToPage(1);

      this.grid.refresh();
    }, this, $form), this.grid.opt.search.timeout);
  };

  var previousDataGridManager = global.DataGridManager;

  DataGridManager.noConflict =
  function noConflict() {
    global.DataGridManager = previousDataGridManager;

    return DataGridManager;
  };

  global.DataGridManager = DataGridManager;

  var previousDataGrid = global.DataGrid;

  DataGrid.noConflict =
  function noConflict() {
    global.DataGrid = previousDataGrid;

    return DataGrid;
  };

  global.DataGrid = DataGrid;

  var previousTermFilter = global.TermFilter;

  TermFilter.noConflict =
  function noConflict() {
    global.TermFilter = previousTermFilter;

    return TermFilter;
  };

  global.TermFilter = TermFilter;

  var previousRangeFilter = global.RangeFilter;

  RangeFilter.noConflict =
  function noConflict() {
    global.RangeFilter = previousRangeFilter;

    return RangeFilter;
  };

  global.RangeFilter = RangeFilter;

  var previousSearchFilter = global.SearchFilter;

  SearchFilter.noConflict =
  function noConflict() {
    global.SearchFilter = previousSearchFilter;

    return SearchFilter;
  };

  global.SearchFilter = SearchFilter;

  var previousLiveFilter = global.LiveFilter;

  LiveFilter.noConflict =
  function noConflict() {
    global.LiveFilter = previousLiveFilter;

    return LiveFilter;
  };

  global.LiveFilter = LiveFilter;
}(this);
