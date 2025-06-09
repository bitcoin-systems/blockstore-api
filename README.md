# Blockstore api to store blocks and transaction of ethereum, bitcoin chains
This project is built using deno v2 and kv store without using any dependencies

# Project setup

```
deno run --allow-net --unstable-kv --allow-env main.ts
```

# API's

Dynamic api routing

- Get /api/{collection}
- Post /api/{collection}
- Delete /api/{collection}/