<script lang="ts">
	import { faGithub } from '@fortawesome/free-brands-svg-icons';
	import { AppBar, AppRail, AppRailAnchor, AppShell } from '@skeletonlabs/skeleton';
	import Fa from 'svelte-fa';
	import '../app.css';
</script>

<AppShell>
	<svelte:fragment slot="header">
		<AppBar slotDefault="place-self-center" class="h1 font-bold">
			<svelte:fragment slot="lead">
				<img src="/logo.png" alt="logo" class="w-12 h-12" />
			</svelte:fragment>
			FusionFoods
		</AppBar>
	</svelte:fragment>
	<!-- --- -->
	<svelte:fragment slot="sidebarLeft">
		<AppRail>
			<svelte:fragment slot="lead">
				<AppRailAnchor href="javascript:location.reload();">
					New <br /> Recipes
				</AppRailAnchor>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<AppRailAnchor href="/" target="_blank" rel="noopener noreferrer" title="GitHub">
					<svelte:fragment slot="lead"><Fa icon={faGithub} size="2x" /></svelte:fragment>
				</AppRailAnchor>
			</svelte:fragment>
		</AppRail>
	</svelte:fragment>
	<!-- --- -->
	<slot />
</AppShell>
