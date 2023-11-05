<script lang="ts">
	import { faGithub } from '@fortawesome/free-brands-svg-icons';
	import { AppBar, AppRail, AppRailAnchor, AppShell } from '@skeletonlabs/skeleton';
	import Fa from 'svelte-fa';
	import '../app.css';
	import { faClock, faPlus } from '@fortawesome/free-solid-svg-icons';
	import { page } from '$app/stores';
	import { Toast } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();
</script>

<Toast position="tr" max={1} />

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
				<AppRailAnchor
					href={$page.url.pathname === '/' ? 'javascript:location.reload();' : '/'}
				>
					<svelte:fragment slot="lead"><Fa icon={faPlus} size="1.5x" /></svelte:fragment>
					Fuse
				</AppRailAnchor>
				<AppRailAnchor href="/history">
					<svelte:fragment slot="lead"><Fa icon={faClock} size="1.5x" /></svelte:fragment>
					<span>Fusions <br /> History</span></AppRailAnchor
				>
			</svelte:fragment>
			<svelte:fragment slot="trail">
				<AppRailAnchor
					href="https://github.com/Layendan/fusionfoods"
					target="_blank"
					rel="noopener noreferrer"
					title="GitHub"
				>
					<svelte:fragment slot="lead"><Fa icon={faGithub} size="2x" /></svelte:fragment>
				</AppRailAnchor>
			</svelte:fragment>
		</AppRail>
	</svelte:fragment>
	<!-- --- -->
	<slot />
</AppShell>
