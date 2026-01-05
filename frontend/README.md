# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Configuración por ambientes (Strapi)

El frontend lee variables de entorno en tiempo de *build* con prefijo `REACT_APP_`. Se añadieron:

- `REACT_APP_STRAPI_URL`
- `REACT_APP_STRAPI_TOKEN`

### Local
1. Copia `.env.example` a `.env.development` (o `.env.local`) y ajusta los valores.
2. Ejecuta `npm start` y CRA tomará esas variables automáticamente.

### Build con GitHub Actions hacia Azure App Service
1. Define secretos por ambiente en GitHub (`STRAPI_URL_DEV`, `STRAPI_TOKEN_DEV`, etc.).
2. En el job de build, exporta esas variables antes de `npm run build`, por ejemplo:

```yaml
env:
  REACT_APP_STRAPI_URL: ${{ secrets.STRAPI_URL_DEV }}
  REACT_APP_STRAPI_TOKEN: ${{ secrets.STRAPI_TOKEN_DEV }}

steps:
  - uses: actions/checkout@v4
  - uses: actions/setup-node@v4
    with:
      node-version: 20
  - run: npm ci
  - run: npm run build
  - uses: azure/webapps-deploy@v3
    with:
      app-name: <nombre-app-service>
      package: build
```
3. Repite con otros secretos para staging/prod (usando variables de entorno distintas por workflow o por environment).

### Build dentro de Azure App Service
Si el build se hace en App Service, agrega las mismas claves en **Configuration > Application settings** (`REACT_APP_STRAPI_URL`, `REACT_APP_STRAPI_TOKEN`) para que `npm run build` las tome allí.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
