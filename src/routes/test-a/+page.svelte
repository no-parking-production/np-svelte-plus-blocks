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


<BlocksButton label="local test on"
              primaryAction={BAction.SetProperty('test', 'lala')}
/>
<BlocksButton label="local test off"
              primaryAction={BAction.SetProperty('test', false)}
/>



&nbsp;
<BlocksButton label="realm test on"
              primaryAction={BAction.SetProperty('Realm.Test_realm.variable.test_bool', true)}
/>
<BlocksButton label="realm test off"
              primaryAction={BAction.SetProperty('Realm.Test_realm.variable.test_bool', false)}
/>

<div>{$test} {$num}</div>




