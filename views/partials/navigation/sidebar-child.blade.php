<li class="item {{ $child->isActive ? 'active' : null }} {{ $child->children ? 'off' : null }}">
	<a target="{{ $child->target }}" href="{{ $child->uri }}" role="button">
		<i class="{{ $child->class }}"></i>
		<span>{{ $child->name }}</span>
		@if ($child->children and ! $child->hasSubItems)
		<i class="fa fa-caret-down"></i>
		@endif
	</a>

	@if ($child->children)
		<ul class="collapse" role="menu" aria-labelledby="drop-{{ $child->slug }}">
		@each('partials/navigation/sidebar-child', $child->children, 'child')
		</ul>
	@endif
</li>
