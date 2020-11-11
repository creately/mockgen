# Mock Generator

Generates mock classes!

## Usage
```mockgen --src sourceFilePath --out outputFilePath sourceFile```

example:
```mockgen --src ./apps/proton/src --out ./apps/proton/test/spec ./apps/proton/src/project/project-collab-locator.svc.ts```


## Useful shortcuts

```
alias mg-n="mockgen --src ./apps/nucleus/src --out ./apps/nucleus/test/spec"
alias mg-p="mockgen --src ./apps/proton/src --out ./apps/proton/test/spec"
alias mg-fcore="mockgen --src ./libs/flux-core/src --out ./libs/flux-core/test"
alias mg-fconn="mockgen --src ./libs/flux-connection/src --out ./libs/flux-connection/test"
alias mg-fdiag="mockgen --src ./libs/flux-diagram/src --out ./libs/flux-diagram/test"
alias mg-fdc="mockgen --src ./libs/flux-diagram-composer/src --out ./libs/flux-diagram-composer/test"
alias mg-fstore="mockgen --src ./libs/flux-store/src --out ./libs/flux-store/test"
alias mg-fsub="mockgen --src ./libs/flux-subscription/src --out ./libs/flux-subscription/test"
alias mg-fuser="mockgen --src ./libs/flux-user/src --out ./libs/flux-user/test"
```

Then you can use
```
mg-n sourceFilePath
```

Example:
```
mg-n ./apps/nucleus/src/editor/view/left-sidebar/folder-panel/folder-panel.cmp.ts
```
