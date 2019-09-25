<aside class="sidebar" data-sidebar>

	<div class="sidebar__brand">

		<figure>
			<a href="{{ url()->toAdmin('/') }}">
				<img src="{{ Asset::getUrl('platform/img/release-mascot.svg') }}" alt="Platform">
				<figcaption>@setting('platform.config.app.title')<span>@setting('platform.foundation.config.release_name')</span></figcaption>
			</a>
		</figure>

	</div>

	<nav class="navigation navigation--sidebar">

		@nav('admin', 0, 'menu menu--sidebar', admin_uri(), 'partials/navigation/sidebar')

	</nav>

	<div class="sidebar__copyright">

		@setting('platform.config.app.copyright')

	</div>

</aside>
