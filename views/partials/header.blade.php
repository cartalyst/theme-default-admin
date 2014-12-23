<div class="row">

	<div class="col-xs-6 col-sm-4">

		<nav class="navigation navigation--header pull-left">

			<ul class="nav nav-pills">

				<li>
					<a class="toggle-sidebar" data-tooltip="" data-placement="right" data-title="Sidebar" data-original-title="" title="">
						<i class="fa fa-bars"></i>
					</a>
				</li>

			</ul>

		</nav>

	</div>

	<div class="col-xs-3 col-sm-8">

		<nav class="navigation navigation--header pull-right">

			@widget('platform/menus::nav.show', array('system', 0, 'nav nav-pills', '', 'partials/navigation/system'))

		</nav>

		<nav class="navigation navigation--account pull-right">

			<ul class="nav nav-pills">

				<li class="dropdown">
					<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{{ $currentUser->email }} <span class="caret"></span></a>

					<ul class="dropdown-menu" role="menu">
						<li><a href="{{ URL::toAdmin("users/{$currentUser->id}") }}">Profile</a>

						<li class="divider"></li>
						<li><a href="{{ URL::to('/logout') }}">Sign Out</a>
					</ul>
				</li>

			</ul>

		</nav>

	</div>

</div>
