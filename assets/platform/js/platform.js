/**
 * Part of the Platform application.
 *
 * NOTICE OF LICENSE
 *
 * Licensed under the Cartalyst PSL License.
 *
 * This source file is subject to the Cartalyst PSL License that is
 * bundled with this package in the license.txt file.
 *
 * @package    Platform
 * @version    2.0.0
 * @author     Cartalyst LLC
 * @license    Cartalyst PSL
 * @copyright  (c) 2011-2014, Cartalyst LLC
 * @link       http://cartalyst.com
 */

var Platform;

;(function(window, document, $, undefined)
{

	'use strict';

	Platform = Platform || {
		Urls: {},
		App: {},
		Cache: {}
	};

	// Platform Base URL
	Platform.Urls.base = $('meta[name="base_url"]').attr('content');

	// CSRF on AJAX requests
	$.ajaxSetup({
		headers: {
			'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
		}
	});

	// Cache common selectors
	Platform.Cache.$win   = $(window);
	Platform.Cache.$body  = $(document.body);
	Platform.Cache.$alert = $('[data-alert]');

	// Initialize functions
	Platform.App.init = function()
	{

		Platform.App.initMenu();
		Platform.App.initSidebar();
		Platform.App.initValidation();
		Platform.App.initTooltips();
		Platform.App.initPopovers();

		if ($.fn.redactor)
		{
			Platform.App.initRedactor();
		}

		Platform.App.listen();
	};

	// Add Listeners
	Platform.App.listen = function()
	{

		Platform.Cache.$alert.on('click', '.alert-close', Platform.App.handleAlerts);
		Platform.Cache.$body.on('click', '.toggle-sidebar', Platform.App.handleSidebarToggle);
		Platform.Cache.$body.on('click', '[data-modal], [data-toggle="modal"]', Platform.App.handleModals);
		Platform.Cache.$body.on('click', '[data-action-delete]', Platform.App.handleDeletes);

	};

	// Handle Alerts
	Platform.App.handleAlerts = function(event)
	{

		$(event.delegateTarget).slideToggle(function()
		{
			$(this).remove();
		});

	};

	// Handle Bootstrap Modals
	Platform.App.handleModals = function (event)
	{

		event.preventDefault();

		// Get the modal target
		var target = $(this).data('target');

		// Is this modal target a confirmation?
		if (target === 'modal-confirm')
		{
			$('#modal-confirm .confirm').attr('href', $(this).attr('href'));

			$('#modal-confirm').modal({
				show: true,
				remote: false
			});

			return false;
		}

	}

	// Handle deletes: show confirmation modal.
	Platform.App.handleDeletes = function (event)
	{

		event.preventDefault();

		var $form = $(this).parents('form:first');

		if (action = $(this).data('action-delete'))
		{
			$form.attr('action', action);
		}

		$form.append('<input type="hidden" name="_method" value="delete">').submit();

	}

	// Handle sidebar toggle
	Platform.App.handleSidebarToggle = function (event)
	{

		event.preventDefault();

		$(".base").toggleClass("base--collapse");

	}

	// Initialize Menu: https://github.com/onokumus/metisMenu
	Platform.App.initMenu = function ()
	{

		$('.menu--sidebar').metisMenu({});

	}

	// Initialize sidebar: http://noraesae.github.io/perfect-scrollbar
	Platform.App.initSidebar = function ()
	{

		$('.sidebar').perfectScrollbar();

	}

	// Initialize Bootstrap Tooltips
	Platform.App.initTooltips = function ()
	{

		$('.tip, .tooltip, [data-tooltip], [data-toggle="tooltip"]').tooltip({container: 'body'});

	}

	// Initialize Bootstrap Popovers
	Platform.App.initPopovers = function ()
	{

		$('.popover, [data-popover], [data-toggle="popover"]').popover({
			trigger : 'hover'
		});

	}

	// Initialize Redactor: http://imperavi.com/redactor
	Platform.App.initRedactor = function ()
	{

		$('.redactor').redactor({
			toolbarFixed: true,
			minHeight: 200,
			buttonSource: true,
		});

	}

	// Initialize validation: http://parsleyjs.org
	Platform.App.initValidation = function()
	{

		window.ParsleyConfig =
		{
			errorClass: 'has-error',
			successClass: 'has-success',
			classHandler: function (ParsleyField)
			{
				return ParsleyField.$element.parents('.form-group');
			},
			errorsContainer: function (ParsleyField)
			{
				return ParsleyField.$element.parents('.form-group');
			},
			errorsWrapper: '<span class=\"parsley-help-block\"></span>',
			errorTemplate: '<div></div>'
		};

		if ($('[data-parsley-validate]').length > 0)
	 	{
			$(document).ready(function()
			{
				$.listen('parsley:field:success', function(Field)
				{
					Field.$element.siblings('.help-block').show();
				});

				$.listen('parsley:field:error', function(Field)
				{
					Field.$element.siblings('.help-block').hide();
				});
			});
		}

	};

	// Job done, lets run.
	Platform.App.init();

})(window, document, jQuery);
