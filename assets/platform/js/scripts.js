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

$(function()
{
	// Activate tooltips
	$('.tip, .tooltip, [data-tooltip], [data-toggle="tooltip"]').tooltip();

	// Activate popovers
	$('.popover, [data-popover], [data-toggle="popover"]').popover({
		trigger : 'hover'
	});

	// Activate modal windows
	$(document).on('click', '[data-modal], [data-toggle="modal"]', function(e)
	{
		e.preventDefault();

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
	});

	$.ajaxSetup({
		headers: {
			'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
		}
	});

	$('[data-action-delete]').on('click', function(e)
	{
		e.preventDefault();

		var $form = $(this).parents('form:first');

		if (action = $(this).data('action-delete'))
		{
			$form.attr('action', action);
		}

		$form.append('<input type="hidden" name="_method" value="delete">').submit();
	});

	if ($.fn.redactor)
	{
		// Instantiate the editor
		$('.redactor').redactor({
			toolbarFixed: true,
			minHeight: 200,
			buttonSource: true,

		});
	}

});
