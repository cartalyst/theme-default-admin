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

	/**
	 * Platform URLS
	 */
	Platform.Urls.base = $('meta[name="base_url"]').attr('content');

	/**
	 * Ajax Setup
	 */
	$.ajaxSetup({
		headers: {
			'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
		}
	});

	/**
	 * Cache Our Common Selectors
	 */
	Platform.Cache.$win   = $(window);
	Platform.Cache.$body  = $(document.body);
	Platform.Cache.$alert = $('.alert');

	/**
	 * Initialize functions
	 */
	Platform.App.init = function()
	{
		Platform.App.addListeners();
		Platform.App.tooltips();
		Platform.App.popovers();
		Platform.App.parsley();
		if ($.fn.redactor)
		{
			Platform.App.redactor();
		}
	};

	/**
	 * Add Event Listeners
	 */
	Platform.App.addListeners = function()
	{
		Platform.Cache.$alert.on('click', '.close', Platform.App.handleAlerts);
		Platform.Cache.$body.on('click', '[data-modal], [data-toggle="modal"]', Platform.App.handleModals);
		Platform.Cache.$body.on('click', '[data-action-delete]', Platform.App.handleDeletes);
	};

	/**
	 * Handle Alerts
	 */
	Platform.App.handleAlerts = function(event)
	{
		$(event.delegateTarget).slideToggle(function()
		{
			$(this).remove();
		});
	};

	/**
	 * Handle Bootstrap Modals
	 */
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

	/**
	 * Initialize Bootstrap Modals
	 */
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

	/**
	 * Initialize Bootstrap Tooltips
	 */
	Platform.App.tooltips = function ()
	{
		$('.tip, .tooltip, [data-tooltip], [data-toggle="tooltip"]').tooltip({container: 'body'});
	}

	/**
	 * Initialize Bootstrap Popovers
	 */
	Platform.App.popovers = function ()
	{
		$('.popover, [data-popover], [data-toggle="popover"]').popover({
			trigger : 'hover'
		});
	}

	/**
	 * Initialize Redactor
	 */
	Platform.App.redactor = function ()
	{

		$('.redactor').redactor({
			toolbarFixed: true,
			minHeight: 200,
			buttonSource: true,
		});
	}

	/**
	 * Initialize Parsley Validation
	 */
	Platform.App.parsley = function()
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

	/**
	 * Job done, lets run.
	 */
	Platform.App.init();

})(window, document, jQuery);
