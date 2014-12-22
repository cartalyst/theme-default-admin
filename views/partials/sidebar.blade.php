<aside class="sidebar" data-sidebar>

	<div class="sidebar__brand">

		<figure>
			<a href="{{ url()->toAdmin('/') }}">
				<img src="{{ Asset::getUrl('platform/img/ornery-octopus.svg') }}" alt="Profile Image">
				<figcaption>@setting('platform.site.title')<span>@setting('platform/foundation::release_name')</span></figcaption>
			</a>
		</figure>

	</div>

	<nav class="navigation navigation--sidebar">

		@widget('platform/menus::nav.show', array('admin', 0, 'menu menu--sidebar', admin_uri(), 'partials/navigation/sidebar'))

	</nav>

	<div class="sidebar__copyright">

		@content('company-copyright')

	</div>

</aside>
