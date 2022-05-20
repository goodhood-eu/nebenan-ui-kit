nebenan-ui-kit
==============

Basic Nebenan.de UI kit

# Usage

## With sass

- First import global css

```scss
// global.scss
@import "nebenan-ui-kit/styles";
```

- Import in css modules to access variables and mixins
 
```scss
// my_component.module.scss
@import "nebenan-ui-kit";

.button {
  color: $color-base-00;
}
```

## With postcss

- First import global css

```postcss
// global.pcss
@import "nebenan-ui-kit/styles.css";
```

- Import config in css modules to access variables

```postcss
// my_component.module.pcss
@import "nebenan-ui-kit/config";

.button { 
  color: $color-base-00;
}
```



# Icons

**IMPORTANT**: The `nebenan-ui-kit` icon-font is deprecated. Use [`@goodhood/icons`](https://github.com/goodhood-eu/goodhood/tree/master/packages/icons) instead.

- You want to add a new icon?
  - Add it to [`@goodhood/icons`](https://github.com/goodhood-eu/goodhood/tree/master/packages/icons)
- You want to change an icon?
  - Add the updated one to [`@goodhood/icons`](https://github.com/goodhood-eu/goodhood/tree/master/packages/icons) 
  - Migrate usages of this icon to [`@goodhood/icons`](https://github.com/goodhood-eu/goodhood/tree/master/packages/icons)

## Add new icons to iconfont

- Place svg under `/.source/svgs/`
- Run `npx fontellizr`
- Update `preview/icons.pug`
- DONE
