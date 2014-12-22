<div class="modal fade" id="modal-confirm" tabindex="-1" role="dialog" aria-labelledby="model-confirm-label" aria-hidden="true">

	<div class="modal-dialog">

		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
				<h4 class="modal-title">{{{ trans('general.warning') }}}</h4>
			</div>

			<div class="modal-body">

				{{{ trans('general.delete_record') }}}

			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">{{{ trans('button.cancel') }}}</button>
				<a href="#" class="btn btn-danger confirm">{{{ trans('button.delete') }}}</a>
			</div>

		</div>

	</div>

</div>
