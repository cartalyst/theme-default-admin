<aside class="sidebar" data-sidebar>

	<div class="sidebar__brand">

		<figure>
			<a href="{{ url()->toAdmin('/') }}">
				<img src="{{ Asset::getUrl('platform/img/ornery-octopus.svg') }}" alt="Profile Image">
				<figcaption>@setting('platform.app.title')<span>@setting('platform-foundation.release_name')</span></figcaption>
			</a>
		</figure>

	</div>

	<nav class="navigation navigation--sidebar">

		@nav('admin', 0, 'menu menu--sidebar', admin_uri(), 'partials/navigation/sidebar')

	</nav>

	<div class="sidebar__copyright">

		@setting('platform.app.copyright')

	</div>

</aside>
