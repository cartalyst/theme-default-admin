@if ( ! empty(Alert::all('form')))
<div class="alert alert-danger">
	<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>

	Check the form below for errors.
</div>
@endif

@foreach ($alerts = Alert::except(['form']) as $alert)

	<div class="alert alert-{{ $alert->class }}">
		<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>

		{{ $alert->message }}
	</div>

@endforeach
