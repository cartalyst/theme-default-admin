<nav class="navbar navbar-default" role="navigation">
	<div class="container">

		<!-- Brand and toggle get grouped for better mobile display -->
		<div class="navbar-header">
			<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-ex1-collapse">
				<span class="sr-only">Toggle navigation</span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</button>
			<a class="navbar-brand" href="{{ url()->toAdmin('/') }}">
				@setting('platform.site.title')
			</a>
		</div>

		<!-- Collect the nav links, forms, and other content for toggling -->
		<div class="collapse navbar-collapse navbar-ex1-collapse">
			@widget('platform/menus::nav.show', array('system', 0, 'nav navbar-nav navbar-right', null, 'nav/system'))
		</div>

	</div>
</nav>
