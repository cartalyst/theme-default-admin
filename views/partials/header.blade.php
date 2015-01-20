<nav class="navigation navigation--header pull-left">

	<ul class="nav nav-pills">

		<li>
			<a class="toggle-sidebar" data-tooltip="" data-placement="right" data-title="Sidebar" data-original-title="" title="">
				<i class="fa fa-bars"></i>
			</a>
		</li>

	</ul>

</nav>

<nav class="navigation navigation--header pull-right">

	@nav('system', 0, 'nav nav-pills', '', 'partials/navigation/system')

</nav>

<nav class="navigation navigation--account pull-right">

	<ul class="nav nav-pills">
		<li class="dropdown">

			<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false"><i class="fa fa-user visible-xs-inline"></i> <span class="hidden-xs">{{ $currentUser->email }}</span> <span class="caret"></span></a>

			<ul class="dropdown-menu" role="menu">
				<li><a href="{{ url()->toAdmin("users/{$currentUser->id}") }}">Profile</a></li>
				<li class="divider"></li>
				<li><a href="{{ url()->to('/logout') }}">Sign Out</a></li>
			</ul>

		</li>
	</ul>

</nav>
