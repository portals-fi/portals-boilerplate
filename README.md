This is a [Next.js](https://nextjs.org/) boilerplate app for the [Portals API](https://portals.fi) bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

This app is a simplified version of the [Portals Swap ](https://app.portals.fi/) app and can be freely forked, cloned, or modified to create your own experience powered by the Portals API.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

To update the typescript interfaces run:

```bash
npm run openapi
# or
yarn openapi
```

## Project structure

```bash
├── src
│   ├── api                     # All the interaction with the portals API is done here
│   │   ├── fetcher             # Add here all the new API calls you need
│   │   └──  portals-schema     # Auto generated file by yarn openapi
│   ├── components              # All the app custom components
│   │   └── **/
│   │       ├── *.tsx
│   │       └── *.module.scss
│   ├── hooks                   # App hooks such as useOnScreen to use the IntersectionObserver for endless scroll
│   │   └── *.ts
│   ├── pages                   # All the app routes, this boilerplate only have the default / route, add here new pages.
│   │   ├── _app.tsx
│   │   └── index.tsx
│   ├── store                   # Basic "global" store for this boilerplate, uses the react context api.
│   │   ├── index.tsx
│   │   └── Reducer.ts          # Add new store objects here
│   ├── styles                  # Global and pages/routes styles
│   │   ├── globals.css
│   │   └── *.module.scss
│   ├── types                   # Place to extend typescript interfaces when packages don't provide it (ex: window.ethereum)
│   │   └── *.d.ts
│   ├── utils                   # Util or auxiliary code goes here, ex: map of networks with additional information
│   │   └── *.ts
├── public                      # Default public assets
│   └── favicon.ico
├── node_modules
├── package.json
├── next.config.js              # next app configs
├── next.env.d.ts
├── README.md                   # This readme file
├── tsconfig.json               # Typescript transpiler settings
├── .eslintrc.json              # eslint settings
└── .gitignore
```

## Add a new request to portals

The API endpoints can be found [here](https://docs.portals.fi/docs/api/).

First we need to add a new entry to the end of the `src/api/fetcher.ts` file, lets fetch a list of available networks:

```typescript
export const getNetworksList = fetcher
  .path("/v1/networks") // check the desired path in the api docs
  .method("get") // add here the proper request method
  .create();
```

Now we need to call it in a component, this method returns a Promise that need to be resolved. In this example we are getting a list of balances from the user account.
You can check it in `src/components/SwapButton/index.tsx`:

```typescript
try {
  const inputBalance = await getAccountBalances({
    ownerAddress: "0x...", // The user account address
    networks: ["ethereum"], // The network in use
  });

  dispatch({
    // Save the result in the store to be used later in the ui, This will be explained later in the "Add new structure to the app storage" section
    type: actionTypes.SET_SELECTED_ACCOUNT_BALANCES,
    value: inputBalance.data.balances,
  });
} catch (err) {
  if (err instanceof getAccountBalances.Error) {
    console.error(err.getActualType()); // Do something with the error
  }
}
```

## Add new structure to the app storage

This boilerplate uses the react context api to manage the store, you can use it as is or you can replace it with a more robust solution. In this case we are adding a way to save the account balances to the store.

In the `src/store/Reducer.ts` search for the `IState` interface, and add there the structure, in this example we are adding the selected user balances:

```typescript
export interface IState {
  (...)
  accounts: {
    (...)
    selectedBalances?: components["schemas"]["AccountResponse"]["balances"]; // We can get the structure directly from the src/api/portals-schema.ts
  };
}
```

In the same file, find the initialState variable and add a initial value for the new structure:

```typescript
export const initialState: IState = {
  (...)
  accounts: {
    (...)
    selectedBalances: [], // we are initializing it as an empty array
  },
};
```

Now we need to add the constants to be used as actions when we call the API, in the `actionTypes` enum add:

```typescript
export enum actionTypes {
  (...)
  SET_SELECTED_ACCOUNT_BALANCES = "SET_SELECTED_ACCOUNT_BALANCES",
}
```

and in the type `IAction` add:

```typescript
export type IAction = (...) | {
  type: actionTypes.SET_SELECTED_ACCOUNT_BALANCES;
  value: components["schemas"]["AccountResponse"]["balances"];
};
```

and finally we just need to set the reducer behavior, find the `reducer` constant and add:

```typescript
const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    (...) // other actions
    case actionTypes.SET_SELECTED_ACCOUNT_BALANCES:
    return {
      ...state,
      accounts: {
        ...state.accounts,
        selectedBalances: action.value,
      },
    };
  default:
    return state;
}
```

And it's done, to be able to get or set data from or to this store in a component we just need to use the store hook (`useStore`):

```typescript
const [{ accounts }, dispatch] = useStore(); // this cant be inside any other hook or if condition

console.log(accounts.selectedBalances) // Log all the balances of the selected account

dispatch({ // Save a list of balances to the store
 type: actionTypes.SET_SELECTED_ACCOUNT_BALANCES, // The action we created later in the src/store/Reducer.ts
 value: [...], // list of balances that we get from the portals API
});
```

Now we can check it in the `src/components/SwapButton/index.tsx`.

## Make a real transaction with portals API

We have a full functional example in `src/components/SwapButton/index.tsx`.

```typescript
const resp = await fetchFromPortal({
  network: network.selected,
  sellToken: inputToken.address,
  sellAmount: `${parseFloat(amount) * 10 ** inputToken.decimals}`,
  buyToken: outputToken.address,
  takerAddress: accounts.selected,
  slippagePercentage: 0.005,
  validate: true,
});
setPortalTx(resp.data);
```

Here we are getting the transaction information from the portals API and saving it in a local state, the `fetchFromPortal` implementation can be found in `src/api/fetcher.ts`.

```typescript
const tx = {
  ...portalTx.tx, // Previously saved transaction information from portals API
  value: portalTx.tx.value?.hex, // Getting only the HEX value for compatibility reasons
  gasLimit: portalTx.tx.gasLimit?.hex, // Getting only the HEX value for compatibility reasons
};
// Call to metamask to make the transaction:
const txHash = await window.ethereum?.request<
  components["schemas"]["PortalResponse"]["tx"]
>({ method: "eth_sendTransaction", params: [tx] });
console.log(txHash);
```

Because some parameters receive information in a slight different way than the portals API provides we need to make some adjustments. The metamask API receives the `value` and `gasLimit` as a HEX string, and portals sends an object with two fields, so we need to get only the HEX value.
The second part of the code we just take the transaction information and pass it to the metamask to preform the request.
