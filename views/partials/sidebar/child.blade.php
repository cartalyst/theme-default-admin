<li class="sidebar-nav-item {{ $child->isActive ? 'active' : null }}">
	<a target="{{ $child->target }}" href="{{ $child->uri }}" role="button">
		<i class="sidebar-nav-item-icon {{ $child->class }}"></i>
		<span>{{ $child->name }}</span>
		@if ($child->children and ! $child->hasSubItems)
		<b class="caret"></b>
		@endif
	</a>

	@if ($child->children)
		<ul class="collapse" role="menu" aria-labelledby="drop-{{ $child->slug }}">
		@each('partials/sidebar/child', $child->children, 'child')
		</ul>
	@endif
</li>
