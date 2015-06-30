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
			@setting('platform.app.title')
		@show
	</title>
	<meta name="description" content="@yield('meta-description')">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="base_url" content="{{ url('/') }}">
	<meta name="csrf-token" content="{{ csrf_token() }}">

	{{-- Queue assets --}}
	{{ Asset::queue('bootstrap', 'bootstrap/css/bootstrap.min.css') }}
	{{ Asset::queue('font-awesome', 'font-awesome/css/font-awesome.min.css', 'bootstrap') }}
	{{ Asset::queue('metis-menu', 'metis-menu/css/metisMenu.min.css', 'font-awesome') }}
	{{ Asset::queue('perfect-scrollbar', 'perfect-scrollbar/css/perfect-scrollbar.css', 'metis-menu') }}
	{{ Asset::queue('style', 'platform/scss/style.scss', 'perfect-scrollbar') }}

	{{ Asset::queue('pace', 'pace/js/pace.min.js') }}
	{{ Asset::queue('modernizr', 'modernizr/js/modernizr.js', 'pace') }}
	{{ Asset::queue('jquery', 'jquery/js/jquery.js', 'modernizr') }}
	{{ Asset::queue('bootstrap', 'bootstrap/js/bootstrap.min.js', 'jquery') }}
	{{ Asset::queue('perfect-scrollbar', 'perfect-scrollbar/js/perfect-scrollbar.min.js', 'bootstrap') }}
	{{ Asset::queue('metis-menu', 'metis-menu/js/metisMenu.min.js', 'perfect-scrollbar') }}
	{{ Asset::queue('platform', 'platform/js/platform.js', 'metis-menu') }}

	<!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
	<!--[if lt IE 9]>
	<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
	<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->

	<link rel="shortcut icon" href="{{ Asset::getUrl('platform/img/favicon.png') }}">

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



	<section class="base">

		{{-- Sidebar --}}
		@include('partials/sidebar')

		{{-- Page --}}
		<main class="page">

			<div class="cover"><span>{{{ trans('message.loading') }}} <i class="fa fa-refresh fa-spin"></i></span></div>

			{{-- Alerts --}}
			@include('partials/alerts')

			{{-- Page Header --}}
			<header class="page__header container-fluid clearfix">
				@include('partials/header')
			</header>

			{{-- Page content --}}
			<div class="page__content container-fluid">
				@yield('page')
			</div>

		</main>

	</section>

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
