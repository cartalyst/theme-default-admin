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
		App: {},
		Urls: {},
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
		Platform.App.pace();
		Platform.App.menu();
		Platform.App.sidebar();
		Platform.App.validation();
		Platform.App.tooltips();
		Platform.App.popovers();

		if ($.fn.redactor)
		{
			Platform.App.redactor();
		}

		Platform.App.listen();
	};

	// Add Listeners
	Platform.App.listen = function()
	{
		Platform.Cache.$alert.on('click', '.alert-close', Platform.App.alerts);

		Platform.Cache.$body
			.on('click', '.toggle-sidebar', Platform.App.sidebarToggle)
			.on('click', '[data-action-delete]', Platform.App.deletion)
			.on('click', '[data-modal], [data-toggle="modal"]', Platform.App.modals)
		;
	};

	// Handle Alerts
	Platform.App.alerts = function(event)
	{
		$(event.delegateTarget).slideToggle(function()
		{
			$(this).removeClass('alert-show');
			$(this).addClass('alert-hide');
			$(this).remove();
		});
	};

	// Handle Bootstrap Modals
	Platform.App.modals = function(event, target, callback)
	{
		event.preventDefault();

		// Get the modal target
		var target = target ? target : $(this).data('target');

		// Is this modal target a confirmation?
		if (target === 'modal-confirm')
		{
			if ( ! callback)
			{
				callback = function()
				{
					$('#modal-confirm').modal('hide');
				};
			}

			$('#modal-confirm .confirm')
				.attr('href', $(this).attr('href'))
				.on('click', callback)
			;

			$('#modal-confirm').modal({
				show: true,
				remote: false
			});

			return false;
		}
	}

	// Handle deletion: show confirmation modal.
	Platform.App.deletion = function(event)
	{
		event.preventDefault();

		Platform.App.modals(event, 'modal-confirm', function()
		{
			var $form = $(this).parents('form:first');

			$form.attr('action', $(this).attr('href'));

			$('#modal-confirm').modal('hide');

			$form.append('<input type="hidden" name="_method" value="delete">').submit();
		});
	}

	// Handle sidebar toggle
	Platform.App.sidebarToggle = function(event)
	{
		event.preventDefault();

		$('.base').toggleClass('base--collapse');
	}

	// Initialize Menu: https://github.com/onokumus/metisMenu
	Platform.App.menu = function()
	{
		$('.menu--sidebar').metisMenu({});
	}

	// Initialize sidebar: http://noraesae.github.io/perfect-scrollbar
	Platform.App.sidebar = function()
	{
		$('.sidebar').perfectScrollbar();
	}

	// Initialize Bootstrap Tooltips
	Platform.App.tooltips = function()
	{
		$('.tip, .tooltip, [data-tooltip], [data-toggle="tooltip"]').tooltip({
			container: 'body',
		});
	}

	// Initialize Bootstrap Popovers
	Platform.App.popovers = function()
	{
		$('.popover, [data-popover], [data-toggle="popover"]').popover({
			trigger : 'hover'
		});
	}

	// Initialize pace loading: http://github.hubspot.com/pace/
	Platform.App.pace = function()
	{
		window.paceOptions =
		{
			restartOnPushState: false,
			trackWebSockets: false
		};
	};

	// Initialize Redactor: http://imperavi.com/redactor
	Platform.App.redactor = function()
	{
		$('.redactor').redactor({
			toolbarFixed: true,
			minHeight: 200,
			buttonSource: true,
		});
	}

	// Initialize the form validation
	Platform.App.validation = function()
	{
		window.ParsleyConfig =
		{
			errorClass: 'has-error',
			successClass: 'has-success',
			classHandler: function(Field)
			{
				return Field.$element.parents('.form-group');
			},
			errorsContainer: function(Field)
			{
				return Field.$element.parents('.form-group');
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
					Field.$element.closest('.form-group').find('.help-block').show();
				});

				$.listen('parsley:field:error', function(Field)
				{
					Field.$element.closest('.form-group').find('.help-block').hide();
				});
			});
		}
	};

	// Job done, lets run
	Platform.App.init();

})(window, document, jQuery);
