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
		Main: {},
		Cache: {}
	};

	/**
	 * Platform URLS
	 */
	Platform.Urls.base = $('meta[name="base_url"]').attr('content');

	/**
	 * Cache Our Common Selectors
	 */
	Platform.Cache.$win   = $(window);
	Platform.Cache.$body  = $(document.body);
	Platform.Cache.$alert = $('.alert');

	/**
	 * Initialize functions
	 */
	Platform.Main.init = function()
	{
		Platform.Main.addListeners();
		Platform.Main.parsley();
	};

	/**
	 * Add Event Listeners
	 */
	Platform.Main.addListeners = function()
	{
		Platform.Cache.$alert.on('click', '.close', Platform.Main.closeAlert);
	};

	/**
	 * Close Alerts
	 */
	Platform.Main.closeAlert = function(event)
	{
		$(event.delegateTarget).slideToggle(function()
		{
			$(this).remove();
		});
	};

	/**
	 * Parsley form validation settings.
	 */
	Platform.Main.parsley = function()
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
	Platform.Main.init();

})(window, document, jQuery);
