<ul class="nav nav-pills">

	<li class="dropdown">

		<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">{{ $currentUser->email }} <span class="caret"></span></a>

		<ul class="dropdown-menu" role="menu">
			<li><a href="{{ URL::toAdmin("users/{$currentUser->id}") }}">Profile</a></li>
			<li class="divider"></li>
			<li><a href="{{ URL::to('/logout') }}">Sign Out</a></li>
		</ul>

	</li>

</ul>
