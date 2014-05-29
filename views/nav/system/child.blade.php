<li class="{{ $child->isActive ? 'active' : null }} dropdown{{ $child->hasSubItems ? '-submenu' : null }}">
	<a target="{{ $child->target }}" href="{{ $child->uri }}" data-tooltip data-placement="bottom" data-title="{{{ $child->name }}}"@if ($child->children) id="drop-{{ $child->slug }}" role="button" class="dropdown-toggle" data-toggle="dropdown"@endif>
		<i class="{{ $child->class }}"></i>
		@if ($child->children and ! $child->hasSubItems)
		<b class="caret"></b>
		@endif
	</a>

	@if ($child->children)
		<ul class="dropdown-menu" role="menu" aria-labelledby="drop-{{ $child->slug }}">
		@each('nav/system/child', $child->children, 'child')
		</ul>
	@endif
</li>
