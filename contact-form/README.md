# apetito.meinapetito.templates.client.vue3sspa
## Usage

> npx @apetito/create-vue3-sspa \<Name der App> \<Font Awesome Api Key>


## Accessing environment variables

```
import env from './utils/env'
data() {
    return {
      variable1: env.VUE_APP_SOME_SETTING,
    }
};
```

Do not use process.env, because values in process.env can not be overriden by environment variables

## Overriding environment variables

In order to override .env-Values with environment variables at runtime, create an entry in the ```_environmentVariables.js``` file for the value in question.

.env
```
VUE_APP_SOME_OTHER_SETTING=Hello production other
```

_env.js
```
const environmentVariables = {
    VUE_APP_SOME_OTHER_SETTING: '$VUE_APP_SOME_OTHER_SETTING',
}
```

Then create an environment variable matching the name of the value, i. e. ```VUE_APP_SOME_OTHER_SETTING```, for example by using docker:

```
docker run -it -p 8080:80 -e VUE_APP_SOME_OTHER_SETTING='Overriden by env var' --rm myimage
```