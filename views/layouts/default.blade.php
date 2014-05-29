<!DOCTYPE html>
<!--[if lt IE 7]>      <html class="no-js lt-ie9 lt-ie8 lt-ie7"> <![endif]-->
<!--[if IE 7]>         <html class="no-js lt-ie9 lt-ie8"> <![endif]-->
<!--[if IE 8]>         <html class="no-js lt-ie9"> <![endif]-->
<!--[if gt IE 8]><!--> <html class="no-js"> <!--<![endif]-->
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
		<title>
			@section('title')
			{{ Config::get('platform.site.title') }}
			@show
		</title>
		<meta name="description" content="@yield('meta-description')">
		<meta name="viewport" content="width=device-width">
		<meta name="base_url" content="{{ URL::to('/') }}">

		{{-- Queue assets --}}
		{{ Asset::queue('style', 'platform/less/style.less') }}

		{{ Asset::queue('modernizr', 'modernizr/js/modernizr.js') }}
		{{ Asset::queue('jquery', 'jquery/js/jquery.js') }}
		{{ Asset::queue('bootstrap.alert', 'bootstrap/js/alert.js', 'jquery') }}
		{{ Asset::queue('bootstrap.collapse', 'bootstrap/js/collapse.js', 'jquery') }}
		{{ Asset::queue('bootstrap.dropdown', 'bootstrap/js/dropdown.js', 'jquery') }}
		{{ Asset::queue('bootstrap.modal', 'bootstrap/js/modal.js', 'jquery') }}
		{{ Asset::queue('bootstrap.tooltip', 'bootstrap/js/tooltip.js', 'jquery') }}
		{{ Asset::queue('bootstrap.popover', 'bootstrap/js/popover.js', 'bootstrap.tooltip') }}
		{{ Asset::queue('scripts', 'platform/js/scripts.js', 'jquery') }}

		{{-- HTML5 shim, for IE6-8 support of HTML5 elements --}}
		<!--[if lt IE 9]>
			<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->

		<link rel="shortcut icon" href="{{ Asset::getUrl('platform/img/favicon.png') }}">
		<link rel="apple-touch-icon-precomposed" sizes="144x144" href="{{ Asset::getUrl('platform/img/apple-touch-icon-144x144-precomposed.png') }}">
		<link rel="apple-touch-icon-precomposed" sizes="114x114" href="{{ Asset::getUrl('platform/img/apple-touch-icon-114x114-precomposed.png') }}">
		<link rel="apple-touch-icon-precomposed" sizes="72x72" href="{{ Asset::getUrl('platform/img/apple-touch-icon-72x72-precomposed.png') }}">
		<link rel="apple-touch-icon-precomposed" href="{{ Asset::getUrl('platform/img/apple-touch-icon-precomposed.png') }}">

		{{-- Compiled styles --}}
		@foreach (Asset::getCompiledStyles() as $style)
			<link href="{{ $style }}" rel="stylesheet">
		@endforeach

		{{-- Call custom inline styles --}}
		@section('styles')
		@show
	</head>

	<body>

		<!--[if lt IE 7]>
		<p class="chromeframe">You are using an outdated browser. <a href="http://browsehappy.com/">Upgrade your browser today</a> or <a href="http://www.google.com/chromeframe/?redirect=true">install Google Chrome Frame</a> to better experience this site.</p>
		<![endif]-->

		<div id="wrap">

			<nav class="navbar navbar-default navbar-static-top" role="navigation">
				<div class="container">

					<!-- Brand and toggle get grouped for better mobile display -->
					<div class="navbar-header">
						<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
							<span class="sr-only">Toggle navigation</span>
							<span class="icon-bar"></span>
							<span class="icon-bar"></span>
							<span class="icon-bar"></span>
						</button>
						<a class="navbar-brand" href="{{ URL::toAdmin('/') }}">
							<img class="brand-sm" src="{{ Asset::getUrl('platform/img/brand-sm.png') }}" alt="Cartalyst LLC" />
							@setting('platform.site.title')
						</a>
					</div>

					<!-- Collect the nav links, forms, and other content for toggling -->
					<div class="collapse navbar-collapse navbar-ex1-collapse">
						@widget('platform/menus::nav.show', array('admin', 0, 'nav navbar-nav', admin_uri()))

						@widget('platform/menus::nav.show', array('system', 0, 'nav navbar-nav navbar-right', null, 'nav/system'))
					</div>

				</div>
			</nav>

			<div class="container">

				{{-- Notifications --}}
				@include('partials/notifications')

				{{-- Page content --}}
				@section('content')
				@show

			</div>

		</div>

		{{-- Footer --}}
		@include('partials/footer')

		{{-- Modals --}}
		@include('partials/modals')

		{{-- Compiled scripts --}}
		@foreach (Asset::getCompiledScripts() as $script)
			<script src="{{ $script }}"></script>
		@endforeach

		{{-- Call custom inline scripts --}}
		@section('scripts')
		@show

	</body>
</html>
