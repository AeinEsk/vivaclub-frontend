# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from "eslint-plugin-react";

export default tseslint.config({
  // Set the react version
  settings: { react: { version: "18.3" } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs["jsx-runtime"].rules,
  },
});
```

# Project's Packages Version

## Yarn

Yarn Version: 1.22.22

## Node

Node Version: 20.15.0



aws ecr get-login-password --region ap-southeast-2 --profile viva-club | docker login --username AWS --password-stdin 717650803246.dkr.ecr.ap-southeast-2.amazonaws.com
docker build -t frontend .
docker tag frontend:latest 717650803246.dkr.ecr.ap-southeast-2.amazonaws.com/frontend:latest

docker push 717650803246.dkr.ecr.ap-southeast-2.amazonaws.com/frontend:latest

__________________________________________
docker build -t backend .
docker tag backend:latest 717650803246.dkr.ecr.ap-southeast-2.amazonaws.com/backend:latest

docker push 717650803246.dkr.ecr.ap-southeast-2.amazonaws.com/backend:latest


--------------------
WHen logging in for the first time the orange stripe should say complete your onboarding - Currently says error
Draw field in create a draw needs to be text- currently its numbers only
Currentcy AUD should be default
Image should be optional in draws
TimeZone should be Australia/AEDT and Australia/AWDT
When publishing a draw create a pop up saying the draw cant be edited after creation only canceled - with all entries being refunded if canceled. 
Add question marks next to fields so we can explain what they do on hover
in memebership draw - change bi-weekly to fortnightly 
Package name should be relabeled as club name when creating club memeberships 
tier highlights in package creation should be allowed to be empty 
Please add example text inside tier the text boxes for reference. 
the error message if the price is null should be improved. currently says nan if the field is left empty 
Accumulated entries should be able to be zero
Can we pass in the validated email to stripe during checkout 
When ticket purchase is complete, write a better message to say transaction is complete, please check your inbox/spam folder for your entry tickets. Good luck!

In the landing page after signing in on top of the first table write Single Draw - if you need one off single draw create a draw here.  club memebership - for recurring club mmeberhip create a draw here

in the share link for club memebership the text in the card should say, next draw in


Adding paypal to the payments 

Clubs menu in the main page currently has a share to option but draws dont. 

currently for club memberships i get no tickets coming in also what is the time the draw will be on? its not clear from the frontend not the purchasers perspective

in the mobile view of the tables can you adjust the length of the table so there is no scroll


can you switch the hamburger menue and the user profile icon


For draw links Add a link at the bottom for terms and conditions 
In hamburger menue add links to:
Add links to how it works in the menue, 
Add links to club examples in the menue
Add links to terms and conditions
Add a link for FAQ. 

Add a how it works link to the UI in front of draw and create club memebership. 
