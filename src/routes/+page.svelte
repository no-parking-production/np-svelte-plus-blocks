<script>
    import {PropertyButton} from "$lib";
</script>

<h1>Welcome to your library project</h1>
<p>Create your package using @sveltejs/package and preview/showcase your work with SvelteKit</p>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<PropertyButton propertyPath="test" value=true label="local test on" />
<PropertyButton propertyPath="test" value=false label="local test off" />
&nbsp;
<PropertyButton propertyPath="Realm.Test_realm.variable.test_bool.value" value=true label="realm test on" />
<PropertyButton propertyPath="Realm.Test_realm.variable.test_bool.value" value=false label="realm test off" />
