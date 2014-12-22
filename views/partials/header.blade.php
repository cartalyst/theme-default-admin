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


	</div>

</div>
