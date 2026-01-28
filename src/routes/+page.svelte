<script>

    import {BlocksInterface} from "$lib/common/BlocksInterface.js";
    import {BAction} from "$lib/common/button/BAction.ts";
    import {BlocksButton} from "$lib";


    const blocks = BlocksInterface.getInstance();
    blocks?.addTags('hey');
    blocks?.gotoBlock('test');
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<BlocksButton label="local test on"
              primaryAction={BAction.SetProperty('test', 'lala')}
/>
<BlocksButton label="local test off"
              primaryAction={BAction.SetProperty('test', false)}
/>
<BlocksButton label="local test toggle"
              primaryAction={BAction.ToggleProperty('test', true, false)}
              secondaryActions={[BAction.ToggleProperty('Realm.Test_realm.variable.test_bool', false, true)]}
/>

<BlocksButton label="local test toggle"
              primaryAction={BAction.SetProperty('num', '11')}
/>
&nbsp;
<BlocksButton label="realm test on"
              primaryAction={BAction.SetProperty('Realm.Test_realm.variable.test_bool', true)}
/>
<BlocksButton label="realm test off"
              primaryAction={BAction.SetProperty('Realm.Test_realm.variable.test_bool', false)}
/>
