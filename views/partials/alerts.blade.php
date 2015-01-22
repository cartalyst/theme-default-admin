@if (Alert::whereArea('form')->get())

<div data-alert class="alert-box alert-bar alert-effect-slidetop alert-type-danger alert-show">
	<div class="alert-box-inner">
	<span class="icon"><i class="fa fa-warning"></i></span>
		<p>Check the form below for errors.</p>
	</div>
	<span class="alert-close"><i class="fa fa-times-circle-o"></i></span>
</div>

@endif

@foreach (Alert::whereNotArea('form')->get() as $alert)

<div data-alert class="alert-box alert-bar alert-effect-slidetop alert-type-{{ $alert->class }} alert-show">
	<div class="alert-box-inner">
	<span class="icon"><i class="fa fa-info"></i></span>
		<p>{{ $alert->message }}</p>
	</div>
	<span class="alert-close"><i class="fa fa-times-circle-o"></i></span>
</div>

@endforeach
