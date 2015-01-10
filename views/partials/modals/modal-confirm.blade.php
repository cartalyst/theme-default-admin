<div class="modal fade" id="modal-confirm" tabindex="-1" role="dialog" aria-labelledby="model-confirm-label" aria-hidden="true">

	<div class="modal-dialog">

		<div class="modal-content">

			<div class="modal-body text-center">

				<i class="fa fa-warning fa-5x"></i>

				<h4>{{{ trans('common.danger') }}}</h4>

				<p class="lead">{{{ trans('message.delete_record') }}}</p>

			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal">{{{ trans('action.cancel') }}}</button>
				<a href="#" class="btn btn-danger confirm">{{{ trans('action.delete') }}}</a>
			</div>

		</div>

	</div>

</div>
