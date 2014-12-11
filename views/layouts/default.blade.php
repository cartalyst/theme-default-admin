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
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="base_url" content="{{ url('/') }}">
	<meta name="csrf-token" content="{{ csrf_token() }}">

	{{-- Queue assets --}}
	{{ Asset::queue('bootstrap', 'bootstrap/css/bootstrap.min.css') }}
	{{ Asset::queue('font-awesome', 'font-awesome/css/font-awesome.min.css') }}
	{{ Asset::queue('metisMenu', 'onokumus/css/metisMenu.min.css') }}
	{{ Asset::queue('style', 'platform/scss/style.scss') }}

	{{ Asset::queue('modernizr', 'modernizr/js/modernizr.js') }}
	{{ Asset::queue('jquery', 'jquery/js/jquery.js') }}
	{{ Asset::queue('bootstrap', 'bootstrap/js/bootstrap.min.js', 'jquery') }}

	{{ Asset::queue('platform', 'platform/js/platform.js', 'jquery') }}
	{{ Asset::queue('scripts', 'platform/js/scripts.js', 'jquery') }}

	{{ Asset::queue('metisMenu', 'onokumus/js/metisMenu.min.js', 'bootstrap') }}

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

		<div class="base">

			<aside class="sidebar">
				<nav class="sidebar-nav">
					@widget('platform/menus::nav.show', array('admin', 0, 'navigation', admin_uri(), 'partials/sidebar'))
				</nav>
			</aside>

			<!-- Page -->
			<div class="page">

				<!-- alerts -->
				<div class="alerts">
					@include('partials/alerts')
				</div>

				<!-- Page Content-->
				<div class="page__content container">
					@yield('content')
				</div>

			</div>

		</div>

		{{-- Modals --}}
		@include('partials/modals')

		{{-- Compiled scripts --}}
		@foreach (Asset::getCompiledScripts() as $script)
		<script src="{{ $script }}"></script>
		@endforeach

		{{-- Call custom inline scripts --}}
		@section('scripts')
		@show

		<script>
			$(document).ready(function() {
				$('.navigation').metisMenu({});
			});

			$(function(){
				$('.toggle-menu').click(function(e){
					e.preventDefault();
					$('.sidebar').toggleClass('toggled');
				});
			});
		</script>

	</body>
	</html>
