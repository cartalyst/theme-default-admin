<li class="item {{ $child->isActive ? 'active' : null }} {{ $child->children ? 'dropdown' : null }}">
	<a target="{{ $child->target }}" href="{{ $child->uri }}" role="button">
		<i class="{{ $child->class }}"></i>
		<span>{{ $child->name }}</span>

		@if ($child->children)
		<span class="fa-item-icon"></span>
		@endif

	</a>

	@if ($child->children)
		<ul class="collapse" role="menu" aria-labelledby="drop-{{ $child->slug }}">
		@each('partials/navigation/sidebar-child', $child->children, 'child')
		</ul>
	@endif
</li>
