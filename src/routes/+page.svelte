<script>

    import {BlocksInterface} from "$lib/common/BlocksInterface.js";
    import {BAction} from "$lib/common/button/BAction.js";
    import BlocksButton from "$lib/components/BlocksButton.svelte";


    const blocks = BlocksInterface.getInstance();
    blocks?.addTags('hey');
    blocks?.gotoBlock('test');

    let test = blocks?.getParamStore('test');
    let num = blocks?.getParamStore('num');
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

<BlocksButton label="local num 11"
              primaryAction={BAction.SetProperty('num', 11)}
/>
&nbsp;
<BlocksButton label="realm test on"
              primaryAction={BAction.SetProperty('Realm.Test_realm.variable.test_bool', true)}
/>
<BlocksButton label="realm test off"
              primaryAction={BAction.SetProperty('Realm.Test_realm.variable.test_bool', false)}
/>

<div>{$test} {$num}</div>

<BlocksButton label="tag: 1 of 1-3"
              primaryAction={BAction.SetTags('one', 'one, two, three')}
/>
<BlocksButton label="tag: 2 of 1-3"
              primaryAction={BAction.SetTags('two', 'one, two, three')}
/>
<BlocksButton label="tag: 2,3 of 1-3"
              primaryAction={BAction.SetTags('two, three', 'one, two, three')}
/>
<BlocksButton label="tag: hey"
              primaryAction={BAction.ToggleTags('hey')}
/>
<BlocksButton label="tag: you"
              primaryAction={BAction.ToggleTags('you')}
/>
<BlocksButton label="tag: h, y"
              primaryAction={BAction.ToggleTags('you, hey')}
/>

<BlocksButton label="goto block 0"
              primaryAction={BAction.GoToLocalBlock('/0/0')}
/>
<BlocksButton label="goto block 1"
              primaryAction={BAction.GoToLocalBlock('/0/1')}
/>

<BlocksButton label="Block A"
              primaryAction={BAction.SetProperty('Spot.x_test_samB.block', 'Test/test_scroll_etc')}
/>

<BlocksButton label="Block B"
              primaryAction={BAction.SetProperty('Spot.x_test_samB.block', 'Test/test_scroll_etc_5')}
/>


